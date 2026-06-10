/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  User as UserIcon, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  Star, 
  Briefcase, 
  Heart, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  ChevronRight, 
  LogOut,
  Layers,
  ShieldAlert
} from "lucide-react";
import { NeonCard, KenteStrip } from "./CyberDeck";

interface UserProfileViewProps {
  name: string;
  phone: string;
  locationName: string;
  role: "worker" | "client" | "introducer" | "guest";
  avatar: string;
  completedJobsCount: number;
  trustScore: number;
  onLaunchKycClick: () => void;
  onLogoutClick: () => void;
  onNavigateTab: (tab: "standby" | "gigs" | "community" | "payments") => void;
}

export function UserProfileView({
  name,
  phone,
  locationName,
  role,
  avatar,
  completedJobsCount,
  trustScore = 95,
  onLaunchKycClick,
  onLogoutClick,
  onNavigateTab
}: UserProfileViewProps) {
  const isWorker = role === "worker";

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header Profile display card */}
      <NeonCard glowColor="gold" className="relative overflow-hidden p-6 select-none">
        {/* Animated abstract kente element */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-cyber-gold/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative z-10">
          <div className="relative">
            <img 
              src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=juma"} 
              alt={name} 
              className="w-24 h-24 rounded-3xl border-2 border-cyber-gold object-cover shadow-xl"
            />
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-cyber-mint border-2 border-zinc-950 rounded-full" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-zinc-900 border border-[#fafafa]/5 text-cyber-gold text-[9px] font-mono rounded-full font-bold uppercase tracking-wider">
              UAMINIFU MTAANI (LOCAL REPUTATION)
            </div>
            
            <h2 className="font-sans font-black text-2xl text-white uppercase tracking-tight">
              {name || "Juma Kamau"}
            </h2>
            
            <p className="font-mono text-[10px] text-zinc-400 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyber-red" /> {locationName || "Kasarani, Nairobi"}
            </p>
          </div>
        </div>
      </NeonCard>

      {/* Portable Trust Ledger Story Chronicle */}
      <NeonCard glowColor="mint" title="Kijitabu cha Maadili // Portable Trust Ledger" subLabel="A Narrative Chronicle of Community Standing">
        <div className="space-y-4 font-sans text-xs select-none">
          <p className="text-zinc-400 leading-relaxed">
            In our village mesh, trust is never reduced to an arbitrary numeric metric. It is a living, breathing chronicle of your commitments, witnesses, and honorable sweat. This is your active standing:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyber-gold/10 text-cyber-gold rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] text-cyber-gold uppercase font-bold tracking-widest block leading-none">WORD KEPT // AHADI YAKO</span>
              </div>
              <h4 className="font-sans font-extrabold text-sm text-white capitalize">Contract Compliance</h4>
              <p className="text-[11px] text-zinc-450 text-zinc-400 leading-relaxed font-sans mt-1">
                Kept your sacred word on <strong>{completedJobsCount || "0"}</strong> consecutive neighborhood jobs. Zero delays, shortcuts, or abandonments.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyber-mint/10 text-cyber-mint rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] text-cyber-mint uppercase font-bold tracking-widest block leading-none">ELDER WITNESS // USHAHIDI</span>
              </div>
              <h4 className="font-sans font-extrabold text-sm text-white capitalize">District Elder Endorsements</h4>
              <p className="text-[11px] text-zinc-450 text-zinc-400 leading-relaxed font-sans mt-1">
                Vouched as a Tier-3 Master tradesman by authorized Parish Elders. Authenticated on the GSM radio broadcast ledger.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyber-violet/10 text-cyber-violet rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] text-cyber-violet uppercase font-bold tracking-widest block leading-none">LINEAGE // KIZAZI HURU</span>
              </div>
              <h4 className="font-sans font-extrabold text-sm text-white capitalize">Apprenticeship Legacy</h4>
              <p className="text-[11px] text-zinc-450 text-zinc-400 leading-relaxed font-sans mt-1">
                Active mentor of local youths. Guiding 2 wanagenzi in skilled Jua Kali practices to lift our neighborhood family.
              </p>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyber-red/10 text-cyber-red rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <span className="font-mono text-[9px] text-cyber-red uppercase font-bold tracking-widest block leading-none">MIGOGORO // DISPUTES</span>
              </div>
              <h4 className="font-sans font-extrabold text-sm text-white capitalize">Conflict Resolutions</h4>
              <p className="text-[11px] text-zinc-450 text-zinc-400 leading-relaxed font-sans mt-1">
                <strong>0 active disputes</strong> before the parish board. If conflict arises, we sit, drink chai, and submit directly to elder-mediated peace.
              </p>
            </div>
          </div>
        </div>
      </NeonCard>

      {/* Trust verification center status card */}
      <NeonCard glowColor="violet" title="Hali ya Uthibitisho (Identity & Certification)" subLabel="Mtaa Registry Status">
        <div className="space-y-4 font-sans text-xs">
          <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyber-gold/10 text-cyber-gold rounded-xl shrink-0">
                <ShieldCheck className="w-6 h-6 text-cyber-gold" />
              </div>
              <div>
                <h4 className="font-sans font-black text-xs text-white uppercase select-none leading-none">Secure Mesh Identity Node</h4>
                <p className="text-[10px] text-zinc-400 font-sans uppercase mt-1 leading-snug">Register your ID with local kiosks to upgrade credentials and expand dispatch parameters</p>
              </div>
            </div>
            
            <button
              onClick={onLaunchKycClick}
              className="px-4 py-2 bg-cyber-gold text-zinc-950 font-sans font-extrabold text-[10px] uppercase rounded-xl cursor-pointer hover:scale-[1.01] active:scale-95 transition whitespace-nowrap"
            >
              Jitambulishe Hapa (ID)
            </button>
          </div>
        </div>
      </NeonCard>

      {/* Menu links checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 select-none">
        
        <button
          onClick={() => onNavigateTab("payments")}
          className="p-4 bg-[#18181b]/95 border border-white/[0.06] hover:border-cyber-gold rounded-2xl flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 text-cyber-gold rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-black text-xs text-white uppercase leading-none">MiniPay ledger</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1 leading-none">Transaction metrics</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => onNavigateTab("standby")}
          className="p-4 bg-[#18181b]/95 border border-white/[0.06] hover:border-cyber-gold rounded-2xl flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 text-cyber-mint rounded-xl">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-black text-xs text-white uppercase leading-none">Bookmark mesh</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1 leading-none">Saved local workers</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={() => onNavigateTab("community")}
          className="p-4 bg-[#18181b]/95 border border-white/[0.06] hover:border-cyber-gold rounded-2xl flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 text-cyber-red rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-black text-xs text-white uppercase leading-none">Cyber helpdesk</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1 leading-none">Cooperative assistance</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>

        <button
          onClick={onLogoutClick}
          className="p-4 bg-cyber-red/5 hover:bg-cyber-red/10 border border-cyber-red/25 rounded-2xl flex items-center justify-between transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-950 text-cyber-red rounded-xl">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-black text-xs text-cyber-red uppercase leading-none">Discard session</h4>
              <p className="text-[9px] text-zinc-500 font-mono uppercase mt-1 leading-none">Clear member keys</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyber-red opacity-60" />
        </button>

      </div>

      <KenteStrip className="h-1 rounded-full" />
    </div>
  );
}
