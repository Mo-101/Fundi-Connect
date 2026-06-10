import { WorkerProfile } from "../types";
import { initialWorkers } from "../mockData";

// Retrieve or initialize workers in localStorage
const getStoredWorkers = (): WorkerProfile[] => {
  const cached = localStorage.getItem("fundi_workers");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Error parsing stored workers, falling back", err);
    }
  }
  
  // Map our initial workers with optional/default properties for scoring
  const profiles: WorkerProfile[] = initialWorkers.map(w => ({
    ...w,
    disputesCount: w.id === "fundi-03" ? 2 : 0, 
    avgRating: w.rating,
    badges: w.isVerified ? ["verified", "vouched"] : [],
    isVouched: w.isVerified,
    trustScore: 90,
    trustLevel: w.isVerified ? "trusted" : "new",
  }));
  localStorage.setItem("fundi_workers", JSON.stringify(profiles));
  return profiles;
};

const saveStoredWorkers = (workers: WorkerProfile[]) => {
  localStorage.setItem("fundi_workers", JSON.stringify(workers));
};

export const api = {
  async getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    const list = getStoredWorkers();
    const found = list.find(w => w.id === workerId);
    return found || null;
  },

  async saveWorkerProfile(workerId: string, profile: Partial<WorkerProfile>): Promise<WorkerProfile | null> {
    const list = getStoredWorkers();
    const idx = list.findIndex(w => w.id === workerId);
    if (idx === -1) return null;
    
    list[idx] = { ...list[idx], ...profile };
    saveStoredWorkers(list);
    return list[idx];
  },

  async getWorkers(): Promise<WorkerProfile[]> {
    return getStoredWorkers();
  }
};
