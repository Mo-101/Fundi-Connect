import { api } from '../lib/api';
import { WorkerProfile, TrustLevel } from '../types';

export async function calculateTrustScore(workerId: string): Promise<number> {
  try {
    const data = await api.getWorkerProfile(workerId);
    if (!data) return 0;

    const { 
      completedJobsCount = 0, 
      disputesCount = 0, 
      avgRating = 0, 
    } = data;

    const vouchesCount = data.badges?.filter(b => b === 'vouched').length * 2 || 0; 
    
    let score = (completedJobsCount * 5) + (avgRating * 10) + (vouchesCount * 15) - (disputesCount * 30);
    score = Math.max(0, Math.min(100, score));
    return Math.round(score);
  } catch (err) {
    console.error("Error calculating trust score:", err);
    return 0;
  }
}

export async function updateWorkerTrust(workerId: string) {
  const data = await api.getWorkerProfile(workerId);
  if (!data) return;

  const newScore = await calculateTrustScore(workerId);
  let level: TrustLevel = 'new';
  
  if (data.isVouched) {
    if (newScore > 80) level = 'master';
    else if (newScore > 60) level = 'trusted';
    else if (newScore > 40) level = 'verified';
    else level = 'vouched';
  }
  
  // Note: api.saveWorkerProfile or similar should be used here if implemented
  console.log(`Updated worker ${workerId} trust to ${level} (score: ${newScore})`);
}
