import { 
  Home, 
  Map as MapIcon, 
  Briefcase, 
  MessageSquare, 
  Users2, 
  User, 
  Settings, 
  ShieldCheck, 
  CreditCard 
} from 'lucide-react';
import { UserRole } from '../types';

export interface RouteConfig {
  label: string;
  path: string;
  icon: any;
  roles: UserRole[];
  mobile: boolean;
}

export const routes: RouteConfig[] = [
  { label: "Home", path: "/smartphone/dashboard", icon: Home, roles: ["client", "worker", "admin"], mobile: true },
  { label: "Mesh", path: "/smartphone/mesh", icon: MapIcon, roles: ["client", "worker", "admin"], mobile: true },
  { label: "Jobs", path: "/smartphone/jobs", icon: Briefcase, roles: ["client", "worker", "admin"], mobile: true },
  { label: "Profile", path: "/smartphone/profile", icon: User, roles: ["client", "worker", "admin"], mobile: true },
  { label: "Gumzo", path: "/smartphone/messages", icon: MessageSquare, roles: ["client", "worker", "admin"], mobile: false },
  { label: "Baraza", path: "/smartphone/community", icon: Users2, roles: ["client", "worker", "admin"], mobile: false },
  { label: "Payments", path: "/smartphone/payments", icon: CreditCard, roles: ["client", "worker", "admin"], mobile: false },
  { label: "Verify", path: "/smartphone/verify-worker", icon: ShieldCheck, roles: ["worker", "admin"], mobile: false },
  { label: "Settings", path: "/smartphone/settings", icon: Settings, roles: ["client", "worker", "admin"], mobile: false },
];
