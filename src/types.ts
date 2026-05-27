export type UserRole = 'worker' | 'client' | 'introducer' | 'agent' | 'admin';
export type AccessType = 'smartphone' | 'ussd' | 'sms' | 'voice' | 'kiosk';
export type JobStatus = 'pending_payment' | 'open' | 'accepted' | 'in_progress' | 'completed' | 'reviewed' | 'closed' | 'disputed';
export type Urgency = 'today' | 'this_week' | 'flexible';
export type TrustLevel = 'new' | 'vouched' | 'verified' | 'trusted' | 'master';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  accessType: AccessType;
  createdAt: any; // ServerTimestamp
  photoUrl?: string;
}

export interface WorkerProfile {
  userId: string;
  skills: string[];
  trustLevel: TrustLevel;
  trustScore: number;
  badges: string[];
  completedJobsCount: number;
  disputesCount: number;
  avgRating: number;
  availability: 'available' | 'busy' | 'away';
  isVouched: boolean;
  registrationPaid: boolean;
  portfolio?: string[];
  bio?: string;
  tradeSymbol?: string; // e.g., 'hammer', 'wrench'
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
}

export interface IntroducerProfile {
  userId: string;
  organization: string; // e.g. "St. Jude's Church", "Joy Chama"
  role: string; // e.g. "Pastor", "Chairlady"
  vouchCount: number;
  honorKept: number; // Percentage
  totalJobsGenerated: number;
}

export interface Job {
  id: string;
  clientId: string;
  workerId?: string;
  skillNeeded: string;
  description: string;
  location: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  urgency: Urgency;
  budget: string;
  status: JobStatus;
  createdAt: any;
  completedAt?: any;
}

export interface Vouch {
  id: string;
  workerId: string;
  voucherName: string;
  voucherPhone: string;
  relationship: string;
  trustWeight: number;
  createdAt: any;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: any;
}
