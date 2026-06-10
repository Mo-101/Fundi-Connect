/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TrustLevel = 'new' | 'vouched' | 'verified' | 'trusted' | 'master';

export interface WorkerProfile extends Worker {
  disputesCount?: number;
  avgRating?: number;
  badges?: string[];
  isVouched?: boolean;
  trustScore?: number;
  trustLevel?: TrustLevel;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  category: string; // e.g. "Electrical", "Plumbing", "Masonry", "Carpentry", "Smart Tech", "Solar Energy"
  subSkills: string[];
  rating: number;
  completedJobsCount: number;
  hourlyRateKsh: number; // Ksh is Kenyan Shilling
  locationName: string; // e.g. "Kibera, Nairobi", "Kangemi", "Rongai"
  coordinates: { lat: number; lng: number };
  isOnline: boolean;
  isVerified: boolean;
  verificationLevel: "Tier-1" | "Tier-2" | "Tier-3" | null;
  hasUssdFallback: boolean; // capable of accepting jobs via SMS/USSD automatically
  bio: string;
  reviews: Review[];
  featured?: boolean;
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetKsh: number;
  locationName: string;
  coordinates: { lat: number; lng: number };
  postedDate: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  urgency: "immediate" | "standard" | "scheduled";
  clientId: string;
  clientName: string;
  clientPhone: string;
  assignedWorkerId?: string;
  bids?: JobBid[];
  paymentStatus: "unpaid" | "escrowed" | "released";
  hasVoiceNote?: boolean;
}

export interface JobBid {
  id: string;
  workerId: string;
  workerName: string;
  workerRating: number;
  amountKsh: number;
  durationHours: number;
  proposal: string;
  postedDate: string;
}

export interface Kiosk {
  id: string;
  name: string;
  agentName: string;
  phone: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  servicesCount: number;
  isVerifiedHub: boolean;
}

export interface Message {
  id: string;
  channelId: string; // job ID or peer conversation
  senderId: string;
  senderName: string;
  senderType: "client" | "worker";
  text: string;
  timestamp: string;
  isRead: boolean;
  isAudio?: boolean;
  audioDuration?: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: "worker" | "client" | "kiosk";
  title: string;
  content: string;
  tags: string[];
  likes: number;
  repliesCount: number;
  postedDate: string;
  isSticky?: boolean;
}

export interface AsanteDrop {
  id: string;
  workerId: string;
  workerName: string;
  amountCelo: number; // Asante drops using MiniPay / CELO network
  transactionHash: string;
  reason: string;
  timestamp: string;
}
