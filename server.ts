import express from "express";
import path from "path";
import https from "https";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

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

const sql: SqlFn | null = process.env.DATABASE_URL
  ? (process.env.VERCEL
      ? neon(process.env.DATABASE_URL) as unknown as SqlFn
      : makeLocalSql(process.env.DATABASE_URL))
  : null;

// ── DB Init ────────────────────────────────────────────────────────────────
// Cached promise so all requests await the same init (no race on cold start)
let dbInitPromise: Promise<void> | null = null;

async function initDb() {
  if (!sql) {
    console.warn("DATABASE_URL not found. Skipping DB initialization.");
    return;
  }
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful.");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
  try {
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
        registration_paid BOOLEAN DEFAULT FALSE
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
    try {
      await sql`ALTER TABLE users ALTER COLUMN name DROP NOT NULL`;
      await sql`ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`;
      await sql`ALTER TABLE users ALTER COLUMN role DROP NOT NULL`;
      await sql`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS disputes_count INTEGER DEFAULT 0`;
      await sql`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS avg_rating NUMERIC DEFAULT 0`;
      await sql`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS is_vouched BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS registration_paid BOOLEAN DEFAULT FALSE`;
    } catch (migErr) {}
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
      isVouched: w.is_vouched, registrationPaid: w.registration_paid
    })));
  } catch (err) {
    console.error(err);
    res.json([]);
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
      lat: w.lat, lng: w.lng, isVouched: w.is_vouched, registrationPaid: w.registration_paid
    });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/workers", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { userId, skills, experienceYears, trustLevel, trustScore, availability, bio, lat, lng, completedJobsCount, disputesCount, avgRating, isVouched, registrationPaid } = req.body;
  try {
    await sql`
      INSERT INTO worker_profiles (user_id, skills, experience_years, trust_level, trust_score, availability, bio, lat, lng, completed_jobs_count, disputes_count, avg_rating, is_vouched, registration_paid)
      VALUES (${userId}, ${skills || null}, ${experienceYears || 0}, ${trustLevel || 'new'}, ${trustScore || 0}, ${availability || 'available'}, ${bio || null}, ${lat || null}, ${lng || null}, ${completedJobsCount || 0}, ${disputesCount || 0}, ${avgRating || 0}, ${isVouched || false}, ${registrationPaid || false})
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
        registration_paid = COALESCE(EXCLUDED.registration_paid, worker_profiles.registration_paid)
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

app.patch("/api/jobs/:id/status", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { status, workerId } = req.body;
  try {
    if (status === 'completed') {
      await sql`UPDATE jobs SET status = ${status}, completed_at = CURRENT_TIMESTAMP WHERE id = ${req.params.id}`;
      if (workerId) {
        await sql`UPDATE worker_profiles SET completed_jobs_count = completed_jobs_count + 1 WHERE user_id = ${workerId}`;
      }
    } else {
      await sql`UPDATE jobs SET status = ${status}, worker_id = COALESCE(${workerId || null}, worker_id) WHERE id = ${req.params.id}`;
    }
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

// Vouching
app.post("/api/vouch", async (req, res) => {
  if (!sql) return res.status(503).json({ error: "Database not available" });
  const { voucherId, workerId } = req.body;
  try {
    await sql`INSERT INTO vouches (voucher_id, worker_id) VALUES (${voucherId}, ${workerId}) ON CONFLICT DO NOTHING`;
    const vouchCount = await sql`SELECT count(*) FROM vouches WHERE worker_id = ${workerId}`;
    const count = parseInt(vouchCount[0].count);
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
