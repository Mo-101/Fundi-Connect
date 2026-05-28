import express from "express";
import path from "path";
import https from "https";
import { neon } from "@neondatabase/serverless";
import { GoogleGenAI } from "@google/genai";
import { Pool } from "pg";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import multer from "multer";

dotenv.config();

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

if (!aiClient) {
  console.warn("GEMINI_API_KEY not set. AI endpoints will use fallback responses.");
}

type SqlFn = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

// In WSL2, Node.js undici and the @neondatabase/serverless WebSocket driver both
// time out due to MTU fragmentation on the Hyper-V virtual NIC (1280 byte MTU).
// curl / https.request work fine because they use the system OpenSSL stack.
// For local dev we call the Neon HTTP SQL endpoint directly via https.request.
function makeLocalSql(connStr: string): SqlFn {
  const u = new URL(connStr.replace(/^postgres(ql)?:\/\//, "https://"));
  const host = u.hostname;
  return async (strings, ...values) => {
    let i = 0;
    const query = strings.reduce((acc, s) => acc + s + (i < values.length ? `$${++i}` : ""), "");
    const body = JSON.stringify({ query, params: values });
    return new Promise((resolve, reject) => {
      const req = https.request(
        { hostname: host, path: "/sql", method: "POST", rejectUnauthorized: false,
          headers: { "Content-Type": "application/json", "Neon-Connection-String": connStr,
            "Content-Length": Buffer.byteLength(body) } },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => {
            try {
              const data = JSON.parse(Buffer.concat(chunks).toString());
              if (data.message) reject(new Error(data.message));
              else resolve((data.rows ?? []) as Record<string, unknown>[]);
            } catch (e) { reject(e); }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  };
}

function makePgSql(connStr: string): SqlFn {
  const pool = new Pool({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
  });
  return async (strings, ...values) => {
    let i = 0;
    const query = strings.reduce((acc, s) => acc + s + (i < values.length ? `$${++i}` : ""), "");
    const res = await pool.query(query, values);
    return (res.rows ?? []) as Record<string, unknown>[];
  };
}

function isLocalPostgres(connStr: string): boolean {
  const u = new URL(connStr.replace(/^postgres(ql)?:\/\//, "http://"));
  return ["localhost", "127.0.0.1", "::1"].includes(u.hostname);
}

const sql: SqlFn | null = process.env.DATABASE_URL
  ? (process.env.VERCEL
      ? neon(process.env.DATABASE_URL) as unknown as SqlFn
      : (isLocalPostgres(process.env.DATABASE_URL)
          ? makePgSql(process.env.DATABASE_URL)
          : makeLocalSql(process.env.DATABASE_URL)))
  : null;

// ── DB Init ────────────────────────────────────────────────────────────────
// Cached promise so all requests await the same init (no race on cold start)
let dbInitPromise: Promise<void> | null = null;

async function initDb() {
  if (!sql) {
    console.warn("DATABASE_URL not found. Skipping DB initialization.");
    return;
  }
  // Retry up to 4 times — Neon free tier auto-pauses and can take a few seconds to wake
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await sql`SELECT 1`;
      console.log("Database connection successful.");
      break;
    } catch (err) {
      console.error(`Database connection attempt ${attempt} failed:`, err);
      if (attempt === 4) throw err;
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
  try {
    // If users.id is UUID type (old schema), drop and recreate with TEXT.
    // No real data exists yet so this is safe.
    const colType = await sql`
      SELECT data_type FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id'
    `;
    if (colType.length > 0 && colType[0].data_type === 'uuid') {
      console.log('[migrate] users.id is UUID — dropping tables and recreating with TEXT schema');
      await sql`DROP TABLE IF EXISTS vouches CASCADE`;
      await sql`DROP TABLE IF EXISTS donations CASCADE`;
      await sql`DROP TABLE IF EXISTS messages CASCADE`;
      await sql`DROP TABLE IF EXISTS transactions CASCADE`;
      await sql`DROP TABLE IF EXISTS reviews CASCADE`;
      await sql`DROP TABLE IF EXISTS jobs CASCADE`;
      await sql`DROP TABLE IF EXISTS worker_profiles CASCADE`;
      await sql`DROP TABLE IF EXISTS users CASCADE`;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        phone TEXT,
        role TEXT,
        location TEXT,
        access_type TEXT,
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS worker_profiles (
        user_id TEXT PRIMARY KEY,
        skills TEXT[],
        trade_symbol TEXT,
        experience_years INTEGER,
        trust_level TEXT,
        trust_score NUMERIC,
        badges TEXT[],
        completed_jobs_count INTEGER DEFAULT 0,
        disputes_count INTEGER DEFAULT 0,
        avg_rating NUMERIC DEFAULT 0,
        availability TEXT,
        portfolio TEXT[],
        bio TEXT,
        lat NUMERIC,
        lng NUMERIC,
        is_vouched BOOLEAN DEFAULT FALSE,
        registration_paid BOOLEAN DEFAULT FALSE,
        wallet_address TEXT
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        client_id TEXT,
        worker_id TEXT,
        skill_needed TEXT NOT NULL,
        description TEXT,
        location TEXT,
        lat NUMERIC,
        lng NUMERIC,
        urgency TEXT,
        budget TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        reviewer_id TEXT,
        worker_id TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        user_id TEXT,
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        mpesa_receipt TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        sender_id TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id TEXT PRIMARY KEY,
        job_id TEXT,
        user_id TEXT,
        donor_address TEXT,
        amount_kes NUMERIC NOT NULL,
        tx_hash TEXT,
        token_symbol TEXT DEFAULT 'cKES',
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS vouches (
        id SERIAL PRIMARY KEY,
        voucher_id TEXT,
        worker_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(voucher_id, worker_id)
      );
    `;
    try { await sql`ALTER TABLE worker_profiles ADD CONSTRAINT fk_worker_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE jobs ADD CONSTRAINT fk_job_client FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL`; } catch (e) {}
    try { await sql`ALTER TABLE jobs ADD CONSTRAINT fk_job_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL`; } catch (e) {}
    try { await sql`ALTER TABLE reviews ADD CONSTRAINT fk_review_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE reviews ADD CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL`; } catch (e) {}
    try { await sql`ALTER TABLE reviews ADD CONSTRAINT fk_review_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE transactions ADD CONSTRAINT fk_tx_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL`; } catch (e) {}
    try { await sql`ALTER TABLE transactions ADD CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE messages ADD CONSTRAINT fk_msg_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE messages ADD CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL`; } catch (e) {}
    try { await sql`ALTER TABLE vouches ADD CONSTRAINT fk_vouch_voucher FOREIGN KEY (voucher_id) REFERENCES users(id) ON DELETE CASCADE`; } catch (e) {}
    try { await sql`ALTER TABLE vouches ADD CONSTRAINT fk_vouch_worker FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE`; } catch (e) {}
    // Each migration runs independently so one failure doesn't block the rest
    const migrate = async (q: TemplateStringsArray, ...v: unknown[]) => { try { await sql!(q, ...v); } catch (_) {} };
    // id column may be UUID type from old schema — convert to TEXT so user_XXXX IDs work
    await migrate`ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS access_type TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;
    await migrate`ALTER TABLE users ALTER COLUMN name DROP NOT NULL`;
    await migrate`ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`;
    await migrate`ALTER TABLE users ALTER COLUMN role DROP NOT NULL`;
    await migrate`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS disputes_count INTEGER DEFAULT 0`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS is_vouched BOOLEAN DEFAULT FALSE`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS registration_paid BOOLEAN DEFAULT FALSE`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS bio TEXT`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS lat NUMERIC`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS lng NUMERIC`;
    await migrate`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS wallet_address TEXT`;
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

// ── Daraja helpers ─────────────────────────────────────────────────────────
const DARAJA_ENV = process.env.MPESA_ENV || "sandbox";
const DARAJA_BASE = DARAJA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

async function getDarajaToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET not set");
  const creds = Buffer.from(`${key}:${secret}`).toString("base64");
  const resp = await fetch(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  if (!resp.ok) throw new Error(`Daraja token fetch failed: ${resp.status}`);
  const data = await resp.json() as { access_token: string };
  return data.access_token;
}

function formatDarajaPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  return digits;
}

async function darajaStkPush(phone: string, amount: number, reference: string, description: string) {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const callbackUrl = (process.env.MPESA_CALLBACK_URL || process.env.APP_URL || "https://localhost:3000") + "/api/mpesa/callback";
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const token = await getDarajaToken();
  const formattedPhone = formatDarajaPhone(phone);
  const resp = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: reference.substring(0, 12),
      TransactionDesc: description.substring(0, 13),
    }),
  });
  return resp.json() as Promise<{
    ResponseCode: string; ResponseDescription: string;
    MerchantRequestID: string; CheckoutRequestID: string;
    CustomerMessage: string; errorMessage?: string;
  }>;
}

async function darajaStkQuery(checkoutRequestId: string) {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const token = await getDarajaToken();
  const resp = await fetch(`${DARAJA_BASE}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: timestamp, CheckoutRequestID: checkoutRequestId }),
  });
  return resp.json() as Promise<{ ResponseCode: string; ResultCode?: string; ResultDesc?: string; errorMessage?: string }>;
}

const hasDaraja = () =>
  !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET &&
     process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY);

const SAFARICOM_IPS = new Set([
  "196.201.214.200", "196.201.214.206", "196.201.213.114",
  "196.201.214.207", "196.201.214.208", "196.201.213.44",
  "196.201.212.127", "196.201.212.138", "196.201.212.129",
  "196.201.212.136", "196.201.212.74",  "196.201.212.69",
]);

function isSafaricomIP(req: express.Request): boolean {
  const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
  return SAFARICOM_IPS.has(ip);
}

// ── Express app (module-level — exported for Vercel) ───────────────────────
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is initialised before any API handler runs (critical for Vercel cold starts)
app.use("/api", async (_req, _res, next) => {
  if (dbInitPromise) await dbInitPromise;
  next();
});

// Health
app.get("/api/health", async (_req, res) => {
  try {
    if (sql) {
      await sql`SELECT 1`;
      res.json({ status: "ok", db: "connected" });
    } else {
      res.status(503).json({ status: "error", db: "missing_url" });
    }
  } catch (err) {
    res.status(500).json({ status: "error", db: "failed", details: String(err) });
  }
});

// Users
app.get("/api/users/:id", async (req, res) => {
  if (!sql) return res.status(404).json(null);
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${req.params.id}`;
    if (users.length === 0) return res.status(404).json(null);
    const user = users[0];
    res.json({
      id: user.id, name: user.name, phone: user.phone, role: user.role,
      location: user.location, accessType: user.access_type,
      photoUrl: user.photo_url, createdAt: user.created_at
    });
  } catch {
    res.status(404).json(null);
  }
});

app.post("/api/users", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { id, name, phone, role, location, accessType, photoUrl } = req.body;
  try {
    await sql`
      INSERT INTO users (id, name, phone, role, location, access_type, photo_url)
      VALUES (${id}, ${name || null}, ${phone || null}, ${role || null}, ${location || null}, ${accessType || null}, ${photoUrl || null})
      ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, users.name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        role = COALESCE(EXCLUDED.role, users.role),
        location = COALESCE(EXCLUDED.location, users.location),
        access_type = COALESCE(EXCLUDED.access_type, users.access_type),
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url)
    `;
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/users]", msg);
    res.status(500).json({ error: "Database error", detail: msg });
  }
});

// Workers
app.get("/api/workers", async (_req, res) => {
  if (!sql) return res.json([]);
  try {
    const workers = await sql`SELECT u.*, w.* FROM users u JOIN worker_profiles w ON u.id = w.user_id`;
    res.json(workers.map(w => ({
      id: w.id, name: w.name, phone: w.phone, role: w.role, location: w.location,
      accessType: w.access_type, photoUrl: w.photo_url, userId: w.user_id,
      skills: w.skills, trustLevel: w.trust_level, trustScore: w.trust_score,
      badges: w.badges, completedJobsCount: w.completed_jobs_count,
      disputesCount: w.disputes_count, avgRating: w.avg_rating,
      availability: w.availability, bio: w.bio, lat: w.lat, lng: w.lng,
      isVouched: w.is_vouched, registrationPaid: w.registration_paid,
      walletAddress: w.wallet_address
    })));
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

app.post("/api/ai/insight", async (req, res) => {
  const workerData = req.body.workerData;
  if (!workerData || typeof workerData !== "object") {
    return res.status(400).json({ error: "workerData is required" });
  }

  const fallback = "Profile verified via SkillMesh protocol.";
  if (!aiClient) {
    return res.json({ text: fallback });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this Jua Kali worker profile and provide a one-sentence trust insight for a potential client:
Name: ${workerData.name}
Skills: ${workerData.skills?.join(', ')}
Experience: ${workerData.experienceYears} years
Completed Jobs: ${workerData.completedJobsCount}
Average Rating: ${workerData.avgRating}/5
Verified: ${workerData.isVouched ? 'Yes' : 'No'}`,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error("[POST /api/ai/insight] AI error:", err);
    res.status(500).json({ text: fallback });
  }
});

app.post("/api/ai/trades", async (req, res) => {
  const input = req.body.input;
  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "input is required" });
  }

  const fallback = "Plumber, Electrician, Carpenter";
  if (!aiClient) {
    return res.json({ text: fallback });
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `A user is looking for help with: "${input}". List the top 3 relevant Jua Kali trades (e.g., Plumber, Welder, Carpenter) as comma-separated values.`,
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error("[POST /api/ai/trades] AI error:", err);
    res.status(500).json({ text: fallback });
  }
});

app.get("/api/workers/:id", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  try {
    const profiles = await sql`SELECT * FROM worker_profiles WHERE user_id = ${req.params.id}`;
    if (profiles.length === 0) return res.json(null);
    const w = profiles[0];
    res.json({
      userId: w.user_id, skills: w.skills, trustLevel: w.trust_level,
      trustScore: w.trust_score, badges: w.badges,
      completedJobsCount: w.completed_jobs_count, disputesCount: w.disputes_count,
      avgRating: w.avg_rating, availability: w.availability, bio: w.bio,
      lat: w.lat, lng: w.lng, isVouched: w.is_vouched, registrationPaid: w.registration_paid,
      walletAddress: w.wallet_address
    });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/workers", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { userId, skills, experienceYears, trustLevel, trustScore, availability, bio, lat, lng, completedJobsCount, disputesCount, avgRating, isVouched, registrationPaid, walletAddress } = req.body;
  try {
    await sql`
      INSERT INTO worker_profiles (user_id, skills, experience_years, trust_level, trust_score, availability, bio, lat, lng, completed_jobs_count, disputes_count, avg_rating, is_vouched, registration_paid, wallet_address)
      VALUES (${userId}, ${skills || null}, ${experienceYears || 0}, ${trustLevel || 'new'}, ${trustScore || 0}, ${availability || 'available'}, ${bio || null}, ${lat || null}, ${lng || null}, ${completedJobsCount || 0}, ${disputesCount || 0}, ${avgRating || 0}, ${isVouched || false}, ${registrationPaid || false}, ${walletAddress || null})
      ON CONFLICT (user_id) DO UPDATE SET
        skills = COALESCE(EXCLUDED.skills, worker_profiles.skills),
        experience_years = COALESCE(EXCLUDED.experience_years, worker_profiles.experience_years),
        trust_level = COALESCE(EXCLUDED.trust_level, worker_profiles.trust_level),
        trust_score = COALESCE(EXCLUDED.trust_score, worker_profiles.trust_score),
        availability = COALESCE(EXCLUDED.availability, worker_profiles.availability),
        bio = COALESCE(EXCLUDED.bio, worker_profiles.bio),
        lat = COALESCE(EXCLUDED.lat, worker_profiles.lat),
        lng = COALESCE(EXCLUDED.lng, worker_profiles.lng),
        completed_jobs_count = COALESCE(EXCLUDED.completed_jobs_count, worker_profiles.completed_jobs_count),
        disputes_count = COALESCE(EXCLUDED.disputes_count, worker_profiles.disputes_count),
        avg_rating = COALESCE(EXCLUDED.avg_rating, worker_profiles.avg_rating),
        is_vouched = COALESCE(EXCLUDED.is_vouched, worker_profiles.is_vouched),
        registration_paid = COALESCE(EXCLUDED.registration_paid, worker_profiles.registration_paid),
        wallet_address = COALESCE(EXCLUDED.wallet_address, worker_profiles.wallet_address)
    `;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.patch("/api/workers/:id/status", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { trustLevel } = req.body;
  try {
    await sql`
      UPDATE worker_profiles
      SET trust_level = ${trustLevel}, is_vouched = ${trustLevel === 'verified' || trustLevel === 'trusted' || trustLevel === 'master'}
      WHERE user_id = ${req.params.id}
    `;
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Jobs
app.get("/api/jobs", async (_req, res) => {
  if (!sql) return res.json([]);
  try {
    const jobs = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    res.json(jobs.map(j => ({
      id: j.id, clientId: j.client_id, workerId: j.worker_id,
      skillNeeded: j.skill_needed, description: j.description,
      location: j.location, lat: j.lat, lng: j.lng,
      urgency: j.urgency, budget: j.budget, status: j.status,
      createdAt: j.created_at, completedAt: j.completed_at
    })));
  } catch {
    res.json([]);
  }
});

app.post("/api/jobs", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { id, clientId, skillNeeded, description, location, lat, lng, urgency, budget, status } = req.body;
  try {
    await sql`
      INSERT INTO jobs (id, client_id, skill_needed, description, location, lat, lng, urgency, budget, status)
      VALUES (${id}, ${clientId}, ${skillNeeded}, ${description}, ${location}, ${lat}, ${lng}, ${urgency}, ${budget}, ${status || 'open'})
    `;
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Helper function to update job status in the database
export async function updateJobStatusInDb(jobId: string, status: string, workerId?: string) {
  if (!sql) throw new Error("Database not available");
  if (status === 'completed') {
    await sql`UPDATE jobs SET status = ${status}, completed_at = CURRENT_TIMESTAMP WHERE id = ${jobId}`;
    if (workerId) {
      await sql`UPDATE worker_profiles SET completed_jobs_count = completed_jobs_count + 1 WHERE user_id = ${workerId}`;
    }
  } else {
    await sql`UPDATE jobs SET status = ${status}, worker_id = COALESCE(${workerId || null}, worker_id) WHERE id = ${jobId}`;
  }
}

app.patch("/api/jobs/:id/status", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { status, workerId } = req.body;
  try {
    await updateJobStatusInDb(req.params.id, status, workerId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Reviews
app.post("/api/reviews", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { id, jobId, reviewerId, workerId, rating, comment } = req.body;
  try {
    await sql`INSERT INTO reviews (id, job_id, reviewer_id, worker_id, rating, comment) VALUES (${id}, ${jobId}, ${reviewerId}, ${workerId}, ${rating}, ${comment})`;
    await sql`UPDATE worker_profiles SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = ${workerId}) WHERE user_id = ${workerId}`;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/workers/:id/reviews", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  try {
    const reviews = await sql`
      SELECT r.*, u.name as reviewer_name, u.photo_url as reviewer_photo
      FROM reviews r LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE worker_id = ${req.params.id} ORDER BY created_at DESC
    `;
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Messages
app.get("/api/jobs/:id/messages", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  try {
    const messages = await sql`
      SELECT m.*, u.name as sender_name, u.photo_url as sender_photo
      FROM messages m LEFT JOIN users u ON m.sender_id = u.id
      WHERE job_id = ${req.params.id} ORDER BY created_at ASC
    `;
    res.json(messages);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/messages", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { id, jobId, senderId, content } = req.body;
  try {
    await sql`INSERT INTO messages (id, job_id, sender_id, content) VALUES (${id}, ${jobId}, ${senderId}, ${content})`;
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Wallet address (MiniPay)
app.patch("/api/workers/:id/wallet", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { walletAddress } = req.body;
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: "Valid Celo wallet address required (0x...)" });
  }
  try {
    await sql`UPDATE worker_profiles SET wallet_address = ${walletAddress} WHERE user_id = ${req.params.id}`;
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Get fundi wallet for direct Asante Drop — returns wallet address for a specific worker
app.get("/api/workers/:id/wallet", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  try {
    const rows = await sql`SELECT wallet_address FROM worker_profiles WHERE user_id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: "Worker not found" });
    res.json({ walletAddress: rows[0].wallet_address || null });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// Vouching
app.post("/api/vouch", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { voucherId, workerId } = req.body;
  try {
    await sql`INSERT INTO vouches (voucher_id, worker_id) VALUES (${voucherId}, ${workerId}) ON CONFLICT DO NOTHING`;
    const vouchCount = await sql`SELECT count(*) FROM vouches WHERE worker_id = ${workerId}`;
    const count = parseInt(String(vouchCount[0].count));
    await sql`UPDATE worker_profiles SET trust_score = trust_score + 5, is_vouched = ${count >= 3} WHERE user_id = ${workerId}`;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// M-Pesa STK Push
app.post("/api/mpesa/stk-push", async (req, res) => {
  const { phone, amount, jobId, type, userId } = req.body;
  console.log(`[DARAJA] STK Push: ${phone} KES ${amount} (${type})`);
  const transactionId = `tr_${Date.now()}`;
  const reference = "FundiConnect";
  const description = type === "registration" ? "FC Reg KES 100" : "FundiConnect Pay";

  if (hasDaraja()) {
    try {
      const darajaResp = await darajaStkPush(phone, amount, reference, description);
      if (darajaResp.ResponseCode !== "0") {
        console.error("[DARAJA] STK Push rejected:", darajaResp);
        return res.status(400).json({ error: darajaResp.errorMessage || darajaResp.ResponseDescription || "STK Push rejected" });
      }
      if (sql) {
        await sql`INSERT INTO transactions (id, job_id, user_id, amount, type, status, mpesa_receipt) VALUES (${transactionId}, ${jobId || null}, ${userId}, ${amount}, ${type}, 'pending', ${darajaResp.CheckoutRequestID})`;
      }
      console.log(`[DARAJA] Push sent → ${darajaResp.CheckoutRequestID}`);
      return res.json({ ...darajaResp, transactionId, checkoutRequestId: darajaResp.CheckoutRequestID, mode: "daraja" });
    } catch (err) {
      console.error("[DARAJA] Error:", err);
      return res.status(500).json({ error: "Payment initiation failed. Try again." });
    }
  }

  console.warn("[DARAJA] No credentials — simulation mode");
  const fakeCheckoutId = `ws_CO_${Date.now()}_SIM`;
  const fakeReceipt = `MPESA${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  try {
    if (sql) {
      await sql`INSERT INTO transactions (id, job_id, user_id, amount, type, status, mpesa_receipt) VALUES (${transactionId}, ${jobId || null}, ${userId}, ${amount}, ${type}, 'completed', ${fakeReceipt})`;
      if (type === "registration") {
        await sql`UPDATE worker_profiles SET registration_paid = true, trust_score = trust_score + 10 WHERE user_id = ${userId}`;
      }
    }
    return res.json({ MerchantRequestID: "SIM-001", CheckoutRequestID: fakeCheckoutId, ResponseCode: "0", ResponseDescription: "Success. Request accepted for processing", CustomerMessage: "Check your phone for the STK prompt.", transactionId, checkoutRequestId: fakeCheckoutId, mode: "simulation" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to record transaction" });
  }
});

// M-Pesa callback
app.post("/api/mpesa/callback", async (req, res) => {
  if (process.env.NODE_ENV === "production" && !isSafaricomIP(req)) {
    console.warn("[DARAJA] Callback rejected — unknown IP:", req.socket.remoteAddress);
    return res.status(403).json({ ResultCode: 1, ResultDesc: "Forbidden" });
  }
  console.log("[DARAJA] Callback:", JSON.stringify(req.body));
  try {
    const stkCallback = req.body?.Body?.stkCallback;
    if (!stkCallback || !sql) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    const checkoutRequestId: string = stkCallback.CheckoutRequestID;
    const resultCode: number = stkCallback.ResultCode;
    if (resultCode === 0) {
      const items: { Name: string; Value: unknown }[] = stkCallback.CallbackMetadata?.Item || [];
      const getVal = (name: string) => items.find((i) => i.Name === name)?.Value;
      const mpesaReceipt = String(getVal("MpesaReceiptNumber") ?? checkoutRequestId);
      await sql`UPDATE transactions SET status = 'completed', mpesa_receipt = ${mpesaReceipt} WHERE mpesa_receipt = ${checkoutRequestId}`;
      const txRows = await sql`SELECT user_id, type FROM transactions WHERE mpesa_receipt = ${mpesaReceipt} LIMIT 1`;
      if (txRows.length > 0 && txRows[0].type === "registration") {
        await sql`UPDATE worker_profiles SET registration_paid = true, trust_score = trust_score + 10 WHERE user_id = ${txRows[0].user_id}`;
      }
      console.log(`[DARAJA] Confirmed: ${mpesaReceipt}`);
    } else {
      await sql`UPDATE transactions SET status = 'failed' WHERE mpesa_receipt = ${checkoutRequestId}`;
      console.warn(`[DARAJA] Failed/cancelled: ${checkoutRequestId} (code ${resultCode})`);
    }
  } catch (err) {
    console.error("[DARAJA] Callback error:", err);
  }
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// Payment status poll
app.get("/api/mpesa/status/:checkoutRequestId", async (req, res) => {
  const { checkoutRequestId } = req.params;
  if (hasDaraja() && !checkoutRequestId.endsWith("_SIM")) {
    try {
      const queryResp = await darajaStkQuery(checkoutRequestId);
      if (queryResp.ResultCode === "0") {
        if (sql) {
          await sql`UPDATE transactions SET status = 'completed' WHERE mpesa_receipt = ${checkoutRequestId} AND status = 'pending'`;
          const txRows = await sql`SELECT user_id, type FROM transactions WHERE mpesa_receipt = ${checkoutRequestId} AND type = 'registration' LIMIT 1`;
          if (txRows.length > 0) {
            await sql`UPDATE worker_profiles SET registration_paid = true, trust_score = trust_score + 10 WHERE user_id = ${txRows[0].user_id} AND registration_paid = false`;
          }
        }
        return res.json({ status: "completed", mpesaReceipt: checkoutRequestId });
      }
      if (queryResp.ResultCode !== undefined) {
        if (sql) await sql`UPDATE transactions SET status = 'failed' WHERE mpesa_receipt = ${checkoutRequestId} AND status = 'pending'`;
        return res.json({ status: "failed", reason: queryResp.ResultDesc });
      }
      return res.json({ status: "pending" });
    } catch (err) {
      console.warn("[DARAJA] STK query failed, falling back to DB:", err);
    }
  }
  if (!sql) return res.json({ status: "unknown" });
  try {
    const rows = await sql`SELECT status, mpesa_receipt, amount, type FROM transactions WHERE mpesa_receipt = ${checkoutRequestId} ORDER BY created_at DESC LIMIT 1`;
    if (rows.length === 0) return res.json({ status: "pending" });
    res.json({ status: rows[0].status, mpesaReceipt: rows[0].mpesa_receipt, amount: rows[0].amount, type: rows[0].type });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// M-Pesa sandbox simulation
app.post("/api/mpesa/simulate", async (req, res) => {
  if (!hasDaraja()) return res.status(400).json({ error: "Daraja credentials not configured" });
  const { shortCode, amount, msisdn, billRefNumber } = req.body;
  try {
    const token = await getDarajaToken();
    const resp = await fetch(`${DARAJA_BASE}/mpesa/c2b/v1/simulate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ShortCode: shortCode || process.env.MPESA_SHORTCODE, CommandID: "CustomerPayBillOnline", Amount: amount, Msisdn: msisdn, BillRefNumber: billRefNumber || "TEST" }),
    });
    res.json(await resp.json());
  } catch {
    res.status(500).json({ error: "Simulation failed" });
  }
});

// Asante Drop donations
app.post("/api/donations", async (req, res) => {
  const { id, jobId, userId, donorAddress, amountKES, txHash, tokenSymbol } = req.body;
  if (!id || !amountKES) return res.status(400).json({ error: "id and amountKES are required" });
  try {
    if (sql) {
      await sql`INSERT INTO donations (id, job_id, user_id, donor_address, amount_kes, tx_hash, token_symbol, status) VALUES (${id}, ${jobId || null}, ${userId || null}, ${donorAddress || null}, ${amountKES}, ${txHash || null}, ${tokenSymbol || 'cKES'}, 'confirmed') ON CONFLICT (id) DO NOTHING`;
    }
    console.log(`[ASANTE] Donation ${id}: ${amountKES} ${tokenSymbol || 'cKES'} tx=${txHash}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[ASANTE] Donation record error:", err);
    res.status(500).json({ error: "Failed to record donation" });
  }
});

app.get("/api/donations", async (_req, res) => {
  if (!sql) return res.json([]);
  try {
    const rows = await sql`SELECT id, job_id, donor_address, amount_kes, tx_hash, token_symbol, created_at FROM donations ORDER BY created_at DESC LIMIT 100`;
    res.json(rows);
  } catch {
    res.json([]);
  }
});

app.get("/api/users/:id/transactions", async (req, res) => {
  if (!sql) return res.json([]);
  try {
    const transactions = await sql`SELECT * FROM transactions WHERE user_id = ${req.params.id} ORDER BY created_at DESC`;
    res.json(transactions);
  } catch {
    res.json([]);
  }
});

// ── JWT Authenticated Middleware & Auth Routes ─────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "fundiconnect-security-salt-2026-secret";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(payload: { id: string; name?: string; role?: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Auth endpoints
app.post("/api/auth/register", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { name, phone, role, password, location } = req.body;
  if (!phone || !password || !role) {
    return res.status(400).json({ error: "Phone, password, and role are required" });
  }
  const numericPhone = phone.replace(/\D/g, "");
  const id = `user_${numericPhone}`;
  const passHash = hashPassword(password);
  
  try {
    const existing = await sql`SELECT id FROM users WHERE phone = ${phone} LIMIT 1`;
    if (existing.length > 0) {
      return res.status(400).json({ error: "A user with this phone number already exists" });
    }

    await sql`
      INSERT INTO users (id, name, phone, role, location, access_type, password_hash)
      VALUES (${id}, ${name || null}, ${phone}, ${role}, ${location || null}, 'online', ${passHash})
    `;

    if (role === "fundi" || role === "worker") {
      await sql`
        INSERT INTO worker_profiles (user_id, skills, trust_level, trust_score, completed_jobs_count, disputes_count, avg_rating, availability, is_vouched, registration_paid)
        VALUES (${id}, ${[]}, 'Level 1', 10, 0, 0, 5.0, 'available', false, false)
        ON CONFLICT (user_id) DO NOTHING
      `;
    }

    const token = generateToken({ id, name, role });
    res.json({ success: true, token, user: { id, name, phone, role, location } });
  } catch (err) {
    console.error("[AUTH REGISTER]", err);
    res.status(500).json({ error: "Database registration error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }
  try {
    const passHash = hashPassword(password);
    const users = await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1`;
    if (users.length === 0 || users[0].password_hash !== passHash) {
      return res.status(401).json({ error: "Invalid phone number or password" });
    }
    const user = users[0];
    const token = generateToken({ id: String(user.id), name: String(user.name), role: String(user.role) });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        location: user.location,
        photoUrl: user.photo_url
      }
    });
  } catch (err) {
    console.error("[AUTH LOGIN]", err);
    res.status(500).json({ error: "Database login query failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  try {
    const users = await sql`SELECT id, name, phone, role, location, photo_url FROM users WHERE id = ${req.user.id} LIMIT 1`;
    if (users.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: "Auth payload resolution failed" });
  }
});

// ── Google Maps API Server-Side Proxy / Config ──────────────────────────────
app.get("/api/config/maps", (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY || "";
  res.json({ apiKey: key });
});

// ── Africa's Talking Webhooks (USSD, SMS, Voice) ───────────────────────────
const ussdSessions: Record<string, { step: string; phone?: string; skill?: string; location?: string }> = {};

app.post("/api/ussd", async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
  let responseText = "";
  const parts = (text || "").split("*");
  const lastInput = parts[parts.length - 1];

  if (!text || text === "") {
    responseText = "CON Welcome to FundiConnect Africa\n1. Register as a Fundi\n2. Find a Nearby Fundi\n3. Check Trust Honor\n4. Help & Support";
  } else if (parts[0] === "1") {
    if (parts.length === 1) {
      responseText = "CON Select your skill category:\n1. Plumber\n2. Carpenter\n3. Electrician\n4. Mechanic\n5. Painter\n6. Cleaner";
    } else if (parts.length === 2) {
      const skills = ["Plumber", "Carpenter", "Electrician", "Mechanic", "Painter", "Cleaner"];
      const skillIdx = parseInt(lastInput) - 1;
      const selectedSkill = skills[skillIdx] || "Artisan";
      ussdSessions[sessionId] = { step: "wait_location", skill: selectedSkill, phone: phoneNumber };
      responseText = `CON Enter your town/location for ${selectedSkill} work:\n(e.g. Ruiru, Juja, Thika)`;
    } else if (parts.length === 3) {
      const session = ussdSessions[sessionId] || { step: "wait_location", skill: "Artisan", phone: phoneNumber, location: "" };
      session.location = lastInput;
      
      if (sql) {
        try {
          const numericPhone = String(session.phone).replace(/\D/g, "");
          const dummyId = `user_${numericPhone || Date.now()}`;
          const dummyName = `Fundi ${numericPhone.slice(-4)}`;
          
          await sql`
            INSERT INTO users (id, name, phone, role, location, access_type)
            VALUES (${dummyId}, ${dummyName}, ${session.phone || '0700000000'}, 'fundi', ${session.location}, 'offline')
            ON CONFLICT (id) DO UPDATE SET location = ${session.location}
          `;
          await sql`
            INSERT INTO worker_profiles (user_id, skills, trust_level, trust_score, completed_jobs_count, availability)
            VALUES (${dummyId}, ${[session.skill]}, 'Level 1', 10, 0, 'available')
            ON CONFLICT (user_id) DO UPDATE SET skills = ${[session.skill]}
          `;
        } catch (dbErr) {
          console.error("[USSD DB ERROR]", dbErr);
        }
      }
      delete ussdSessions[sessionId];
      responseText = `END Registration successful!\n\nYour profile as a ${session.skill} in ${session.location} is active. You will receive client alerts near you via SMS. Asanteni!`;
    }
  } else if (parts[0] === "2") {
    if (parts.length === 1) {
      responseText = "CON Select service you need:\n1. Plumbing\n2. Carpentry\n3. Electrical\n4. Mechanical\n5. Painting\n6. Cleaning";
    } else if (parts.length === 2) {
      ussdSessions[sessionId] = { step: "wait_client_location", skill: lastInput };
      responseText = "CON Enter your current location:\n(e.g. Juja, Ruiru, Nairobi)";
    } else if (parts.length === 3) {
      const session = ussdSessions[sessionId] || { step: "wait_client_location", skill: "1" };
      const skillsMap = ["Plumber", "Carpenter", "Electrician", "Mechanic", "Painter", "Cleaner"];
      const targetSkillNum = parseInt(String(session.skill)) - 1;
      const targetSkill = skillsMap[targetSkillNum] || "Handyman";
      const targetLocation = lastInput;

      let foundFundis = 0;
      if (sql) {
        try {
          const rows = await sql`
            SELECT u.name, u.phone FROM users u 
            JOIN worker_profiles w ON u.id = w.user_id 
            WHERE ${targetSkill} = ANY(w.skills) AND LOWER(u.location) = LOWER(${targetLocation})
            LIMIT 2
          `;
          foundFundis = rows.length;
        } catch (err) {
          console.error(err);
        }
      }
      delete ussdSessions[sessionId];
      
      if (foundFundis > 0) {
        responseText = `END Broadcast active!\n\nWe found ${foundFundis} verified ${targetSkill}s in ${targetLocation}. They have been requested to dial you directly. Thank you!`;
      } else {
        responseText = `END Broadcast active!\n\nWe did not find any immediate ${targetSkill}s in ${targetLocation}, but we have broadcasted your request to our regional network. You will receive an SMS.`;
      }
    }
  } else if (parts[0] === "3") {
    if (parts.length === 1) {
      responseText = "CON Enter Fundi's mobile number:\n(e.g. 254712345678)";
    } else if (parts.length === 2) {
      const targetPhone = lastInput;
      let score = 90;
      let level = "Level 1";
      if (sql) {
        try {
          const rows = await sql`
            SELECT w.trust_level, w.trust_score FROM users u 
            JOIN worker_profiles w ON u.id = w.user_id 
            WHERE u.phone LIKE ${'%' + targetPhone} LIMIT 1
          `;
          if (rows.length > 0) {
            score = Number(rows[0].trust_score || 90);
            level = String(rows[0].trust_level || "Level 1");
          }
        } catch (err) {
          console.error(err);
        }
      }
      responseText = `END Trust Honor Result:\n\nPhone: ${targetPhone}\nTrust Level: ${level}\nHonor Score: ${score}%\n\nVerfied via FundiConnect Trust Registry.`;
    }
  } else {
    responseText = "END FundiConnect Support:\n- USSD Shortcode: *483*91#\n- Support: 0700000000\n- Zero-data marketplace. Karibu!";
  }

  res.set("Content-Type", "text/plain");
  res.send(responseText);
});

app.post("/api/sms", async (req, res) => {
  const { from, to, text, date, id } = req.body;
  console.log(`[AFRICASTALKING SMS] From: ${from} Message: "${text}" ID: ${id}`);
  res.json({ success: true, description: "SMS callback logged successfully" });
});

// ── Multer & Portfolio AWS-supported File Uploads ────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.post("/api/workers/:id/upload-portfolio", upload.single("file"), async (req: any, res) => {
  const workerId = req.params.id;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const filename = `${Date.now()}_${req.file.originalname}`;
    console.log(`[STORAGE] Received file ${filename} (${req.file.size} bytes)`);

    let publicUrl = fileBase64;
    
    if (process.env.AWS_ACCESS_KEY_ID && process.env.S3_BUCKET) {
      try {
        const { S3Client, PutObjectCommand } = await import(String("@aws-sdk/client-s3")) as any;
        const s3 = new S3Client({
          region: process.env.AWS_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
          }
        });
        await s3.send(new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: `portfolios/${workerId}/${filename}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
          ACL: "public-read"
        }));
        publicUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/portfolios/${workerId}/${filename}`;
        console.log(`[S3 STORAGE] Upload successful to S3: ${publicUrl}`);
      } catch (s3Err) {
        console.warn("[S3 STORAGE] Upload failed, falling back to instant local presentationURI:", s3Err);
      }
    }

    if (sql) {
      await sql`
        UPDATE worker_profiles 
        SET portfolio = array_append(COALESCE(portfolio, ARRAY[]::TEXT[]), ${publicUrl}) 
        WHERE user_id = ${workerId}
      `;
    }

    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("[UPLOAD PORTFOLIO]", err);
    res.status(500).json({ error: "Failed to store portfolio item" });
  }
});

// ── Production static serving (non-Vercel only — Vercel serves dist/ directly) ──
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

// ── Local dev: start Vite dev server + listen ──────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  (async () => {
    try { await initDb(); } catch { console.warn("[FUNDICONNECT] DB unavailable — running in demo mode"); }
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    }
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`[FUNDICONNECT] Server running at http://localhost:${PORT}`);
    });
  })();
} else {
  // On Vercel: kick off init immediately and reuse the same promise across
  // all cold-start requests so the first request awaits table creation.
  dbInitPromise = initDb().catch((err) => {
    console.error("DB init failed on Vercel:", err);
  });
}

export default app;
