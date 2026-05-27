import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

// 1. Mock pg module first, before importing server
vi.mock('pg', () => {
  class MockPool {
    query = async (query: string, values?: any[]) => {
      // This will be handled by neon mock below
      return { rows: [] };
    };
    end = async () => {};
  }
  return {
    Pool: MockPool,
  };
});

// 2. Setup environment variables before importing the app so server.ts configures correctly
process.env.DATABASE_URL = 'postgresql://localhost:5432/fundiconnect_test';
process.env.VERCEL = 'true';
process.env.JWT_SECRET = 'fundiconnect-security-salt-2026-secret';

// 3. Setup internal database store
const db = {
  users: [] as any[],
  worker_profiles: [] as any[],
  jobs: [] as any[],
  reviews: [] as any[],
};

// 3. Mock @neondatabase/serverless so server.ts queries our in-memory tables
vi.mock('@neondatabase/serverless', () => {
  return {
    neon: () => {
      return async (strings: TemplateStringsArray, ...values: any[]) => {
        const query = strings.join('?').toLowerCase();
        // SELECT 1 (Keep-alive / DB Health check)
        if (query.includes('select 1')) {
          return [{ '1': 1 }];
        }

        // Schema information check
        if (query.includes('information_schema.columns')) {
          return [{ data_type: 'text' }];
        }

        // INSERT/UPDATE Users
        if (query.includes('insert into users')) {
          const [id, name, phone, role, location, access_type, password_hash] = values;
          const user = { id, name, phone, role, location, access_type, password_hash };
          const idx = db.users.findIndex(u => u.id === id || u.phone === phone);
          if (idx >= 0) {
            db.users[idx] = { ...db.users[idx], ...user };
          } else {
            db.users.push(user);
          }
          return [];
        }

        // SELECT User by phone (login lookup)
        if (query.includes('select * from users where phone =')) {
          const phone = values[0];
          return db.users.filter(u => u.phone === phone);
        }

        // SELECT User by ID
        if (query.includes('select * from users where id =')) {
          const id = values[0];
          return db.users.filter(u => u.id === id);
        }

        // INSERT/UPDATE Worker Profile
        if (query.includes('insert into worker_profiles')) {
          const [userId, skills, experienceYears, trustLevel, trustScore, availability, bio, lat, lng, completedJobsCount, disputesCount, avgRating, isVouched, registrationPaid] = values;
          const profile = {
            user_id: userId,
            skills: skills || [],
            experience_years: experienceYears,
            trust_level: trustLevel,
            trust_score: trustScore,
            availability,
            bio,
            lat,
            lng,
            completed_jobs_count: completedJobsCount || 0,
            disputes_count: disputesCount || 0,
            avg_rating: avgRating || 5.0,
            is_vouched: isVouched || false,
            registration_paid: registrationPaid || false
          };
          const idx = db.worker_profiles.findIndex(p => p.user_id === userId);
          if (idx >= 0) {
            db.worker_profiles[idx] = { ...db.worker_profiles[idx], ...profile };
          } else {
            db.worker_profiles.push(profile);
          }
          return [];
        }

        // SELECT Worker Profiles with join
        if (query.includes('join worker_profiles')) {
          return db.users
            .filter(u => u.role === 'fundi' || u.role === 'worker')
            .map(u => {
              const p = db.worker_profiles.find(wp => wp.user_id === u.id) || {};
              return { ...u, ...p, user_id: u.id };
            });
        }

        // SELECT individual Worker Profile
        if (query.includes('select * from worker_profiles where user_id =')) {
          const userId = values[0];
          return db.worker_profiles.filter(p => p.user_id === userId);
        }

        // INSERT Job
        if (query.includes('insert into jobs')) {
          const [id, clientId, skill_needed, description, location, lat, lng, urgency, budget, status] = values;
          const job = { id, client_id: clientId, skill_needed, description, location, lat, lng, urgency, budget, status };
          db.jobs.push(job);
          return [];
        }

        // SELECT Jobs order by created_at DESC
        if (query.includes('select * from jobs order by')) {
          return db.jobs;
        }

        // PATCH Job Status (handle both shapes: [status, worker_id, jobId] or [status, jobId])
        if (query.includes('update jobs set status =')) {
          let status: any; let worker_id: any; let jobId: any;
          if (values.length === 3) {
            [status, worker_id, jobId] = values;
          } else if (values.length === 2) {
            [status, jobId] = values;
            worker_id = undefined;
          }
          const job = db.jobs.find(j => j.id === jobId);
          if (job) {
            job.status = status;
            if (worker_id) job.worker_id = worker_id;
            if (status === 'completed') job.completed_at = new Date().toISOString();
          }
          return [];
        }

        // INSERT Review
        if (query.includes('insert into reviews')) {
          const [id, jobId, reviewerId, workerId, rating, comment] = values;
          const review = { id, job_id: jobId, reviewer_id: reviewerId, worker_id: workerId, rating, comment };
          db.reviews.push(review);
          return [];
        }

        // SELECT Average Rating from reviews
        if (query.includes('select avg(rating) from reviews')) {
          const workerId = values[0];
          const workerReviews = db.reviews.filter(r => r.worker_id === workerId);
          const avg = workerReviews.length > 0 
            ? workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length 
            : 5.0;
          return [{ avg }];
        }

        // UPDATE avg rating in worker profile
        if (query.includes('update worker_profiles set avg_rating =')) {
          const [avgAvg, workerId] = values;
          const p = db.worker_profiles.find(wp => wp.user_id === workerId);
          if (p) p.avg_rating = avgAvg;
          return [];
        }

        // SELECT Reviews left for worker
        if (query.includes('from reviews r left join users u')) {
          const workerId = values[0];
          return db.reviews.filter(r => r.worker_id === workerId).map(r => {
            const reviewer = db.users.find(u => u.id === r.reviewer_id);
            return {
              ...r,
              reviewer_name: reviewer ? reviewer.name : 'Client',
              reviewer_photo: reviewer ? reviewer.photo_url : ''
            };
          });
        }

        return [];
      };
    }
  };
});

// Import the real Express app *after* environment sets and mocks have run!
import { app } from '../../server';

describe('FundiConnect — Complete Client-Worker Job Lifecycle Integration', () => {
  let clientToken = '';
  let workerToken = '';
  const clientId = 'user_254711111111';
  const workerId = 'user_254722222222';
  const testJobId = 'job_test_lifecycle_id';
  const testReviewId = 'review_lifecycle_id';

  beforeAll(() => {
    // Reset our mock state tables
    db.users = [];
    db.worker_profiles = [];
    db.jobs = [];
    db.reviews = [];
  });

  it('1. Registers clean client profile securely', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Nancy Akinyi',
        phone: '254711111111',
        password: 'securePassword123!',
        role: 'client',
        location: 'Juja'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    clientToken = res.body.token;

    // Verify user table addition
    expect(db.users.length).toBe(1);
    expect(db.users[0].id).toBe(clientId);
    expect(db.users[0].role).toBe('client');
  });

  it('2. Registers custom skilled worker (Fundi) profile successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Fundi Juma',
        phone: '254722222222',
        password: 'securerPIN100!',
        role: 'fundi',
        location: 'Ruiru'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    workerToken = res.body.token;

    expect(db.users.length).toBe(2);
    expect(db.worker_profiles.length).toBe(1);
  });

  it('3. Client initiates and creates a Plumbing job request via POST /api/jobs', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        id: testJobId,
        clientId: clientId,
        skillNeeded: 'Plumbing',
        description: 'Leaking pipe under the kitchen sink',
        location: 'Ruiru',
        urgency: 'high',
        budget: '2500',
        status: 'open'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(db.jobs.length).toBe(1);
    expect(db.jobs[0].id).toBe(testJobId);
    expect(db.jobs[0].status).toBe('open');
  });

  it('4. Worker retrieves jobs and updates status to "accepted" status through PATCH /api/jobs/:id/status', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${testJobId}/status`)
      .set('Authorization', `Bearer ${workerToken}`)
      .send({
        status: 'accepted',
        workerId: workerId
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // In-memory update check
    expect(db.jobs[0].status).toBe('accepted');
    expect(db.jobs[0].worker_id).toBe(workerId);
  });

  it('5. Client confirms work is finished and marks job as "completed"', async () => {
    const res = await request(app)
      .patch(`/api/jobs/${testJobId}/status`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        status: 'completed',
        workerId: workerId
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(db.jobs[0].status).toBe('completed');
  });

  it('6. Client files a rating review for the worker profile performance and comments', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        id: testReviewId,
        jobId: testJobId,
        reviewerId: clientId,
        workerId: workerId,
        rating: 5,
        comment: 'Juma fixed it perfectly in 15 minutes! Great Plumber.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(db.reviews.length).toBe(1);
    expect(db.reviews[0].rating).toBe(5);
  });

  it('7. Verifies reviews are retrievable for public visitor profiles', async () => {
    const res = await request(app)
      .get(`/api/workers/${workerId}/reviews`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].rating).toBe(5);
    expect(res.body[0].reviewer_name).toBe('Nancy Akinyi');
  });
});
