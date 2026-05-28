
import { User, WorkerProfile, Job } from '../types';

const API_BASE = '/api';

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  const token = localStorage.getItem('mesh_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMsg = `API Error: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg += ` - ${data.error}`;
      if (data.detail) errorMsg += ` (Details: ${data.detail})`;
    } catch {
      // Not JSON or no error field
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Authentication
  async register(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem("mesh_jwt_token", data.token);
    }
    return data;
  },

  async login(payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem("mesh_jwt_token", data.token);
    }
    return data;
  },

  // Users
  async getUser(id: string): Promise<User | null> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      headers: getHeaders()
    });
    if (res.status === 404) return null;
    return handleResponse(res);
  },
  
  async saveUser(user: Partial<User> & { id: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(user),
    });
    await handleResponse(res);
  },

  // Workers
  async getWorkers(): Promise<(User & WorkerProfile)[]> {
    const res = await fetch(`${API_BASE}/workers`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
    const res = await fetch(`${API_BASE}/workers/${userId}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async saveWorkerProfile(profile: Partial<WorkerProfile> & { userId: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(profile),
    });
    await handleResponse(res);
  },

  async updateWorkerStatus(userId: string, trustLevel: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workers/${userId}/status`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ trustLevel }),
    });
    await handleResponse(res);
  },

  // Jobs
  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createJob(job: Partial<Job> & { id: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(job),
    });
    await handleResponse(res);
  },

  async updateJobStatus(jobId: string, status: string, workerId?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, workerId }),
    });
    await handleResponse(res);
  },

  // Reviews
  async getWorkerReviews(workerId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/workers/${workerId}/reviews`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async createReview(review: { id: string; jobId: string; reviewerId: string; workerId: string; rating: number; comment: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(review),
    });
    await handleResponse(res);
  },

  // Messages
  async getMessages(jobId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/messages`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async sendMessage(message: { id: string; jobId: string; senderId: string; content: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(message),
    });
    await handleResponse(res);
  },

  // Vouching
  async vouchForWorker(voucherId: string, workerId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/vouch`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
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
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async checkPaymentStatus(checkoutRequestId: string): Promise<{ status: 'pending' | 'completed' | 'failed' | 'unknown'; mpesaReceipt?: string }> {
    const res = await fetch(`${API_BASE}/mpesa/status/${encodeURIComponent(checkoutRequestId)}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getTransactions(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/users/${userId}/transactions`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Wallet
  async getWorkerWallet(userId: string): Promise<{ walletAddress: string | null }> {
    const res = await fetch(`${API_BASE}/workers/${userId}/wallet`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateWorkerWallet(userId: string, walletAddress: string): Promise<void> {
    const res = await fetch(`${API_BASE}/workers/${userId}/wallet`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ walletAddress }),
    });
    await handleResponse(res);
  }
};
