
import { User, WorkerProfile, Job } from '../types';

const API_BASE = '/api';

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMsg = `API Error: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg += ` - ${data.error}`;
      if (data.details) errorMsg += ` (Details: ${data.details})`;
    } catch {
      // Not JSON or no error field
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Users
  async getUser(id: string): Promise<User | null> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    if (res.status === 404) return null;
    return handleResponse(res);
  },
  
  async saveUser(user: Partial<User> & { id: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    await handleResponse(res);
  },

  // Workers
  async getWorkers(): Promise<(User & WorkerProfile)[]> {
    const res = await fetch(`${API_BASE}/workers`);
    return handleResponse(res);
  },

  async getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
    const res = await fetch(`${API_BASE}/workers/${userId}`);
    return handleResponse(res);
  },

  async saveWorkerProfile(profile: Partial<WorkerProfile> & { userId: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    await handleResponse(res);
  },

  async updateWorkerStatus(userId: string, trustLevel: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workers/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trustLevel }),
    });
    await handleResponse(res);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/jobs`);
    return handleResponse(res);
  },

  async createJob(job: Partial<Job> & { id: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    await handleResponse(res);
  },

  async updateJobStatus(jobId: string, status: string, workerId?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, workerId }),
    });
    await handleResponse(res);
  },

  // Reviews
  async getWorkerReviews(workerId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workers/${workerId}/reviews`);
    return handleResponse(res);
  },

  async createReview(review: { id: string; jobId: string; reviewerId: string; workerId: string; rating: number; comment: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    await handleResponse(res);
  },

  // Messages
  async getMessages(jobId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/messages`);
    return handleResponse(res);
  },

  async sendMessage(message: { id: string; jobId: string; senderId: string; content: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    await handleResponse(res);
  },

  // Vouching
  async vouchForWorker(voucherId: string, workerId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/vouch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherId, workerId }),
    });
    await handleResponse(res);
  },

  // M-Pesa
  async initiateSTKPush(payload: { phone: string; amount: number; jobId?: string; type: string; userId: string }): Promise<{
    ResponseCode: string; CheckoutRequestID: string; checkoutRequestId: string;
    CustomerMessage: string; transactionId: string; mode: string;
  }> {
    const res = await fetch(`${API_BASE}/mpesa/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async checkPaymentStatus(checkoutRequestId: string): Promise<{ status: 'pending' | 'completed' | 'failed' | 'unknown'; mpesaReceipt?: string }> {
    const res = await fetch(`${API_BASE}/mpesa/status/${encodeURIComponent(checkoutRequestId)}`);
    return handleResponse(res);
  },

  async getTransactions(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/users/${userId}/transactions`);
    return handleResponse(res);
  }
};
