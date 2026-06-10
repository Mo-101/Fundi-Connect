/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { Hammer, User, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { NeonCard, KenteStrip } from "./CyberDeck";

interface OnboardingViewProps {
  onSelectRole: (role: "worker" | "client" | "introducer") => void;
}

export function OnboardingView({ onSelectRole }: OnboardingViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <NeonCard glowColor="violet" className="p-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyber-violet/10 border border-cyber-violet/30 rounded-full text-[9px] font-mono font-bold text-cyber-violet uppercase tracking-wider">
            Identity Grid Onboarding
          </div>
          <h2 className="font-sans font-black text-2xl text-cyber-cream uppercase tracking-tight">
            YOUR ROLE IN THE SKILLMESH
          </h2>
          <p className="text-zinc-400 font-sans text-xs leading-relaxed">
            Choose your network identity to coordinate trust and execute peer-to-peer services across Nairobi. Complete verification to unlock full ledger status.
          </p>
        </div>
      </NeonCard>

      {/* Role Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Role 1: Worker / Fundi */}
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="relative group cursor-pointer"
          onClick={() => onSelectRole("worker")}
        >
          <NeonCard glowColor="gold" className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyber-gold/15 flex items-center justify-center text-cyber-gold border border-cyber-gold/30">
                <Hammer className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-black text-sm text-cyber-cream uppercase tracking-wide">
                  I Have a Skill
                </h3>
                <p className="font-mono text-[10px] text-cyber-gold uppercase font-bold italic leading-none">
                  Nina ujuzi / Active Fundi
                </p>
                <p className="font-sans text-[11px] text-zinc-400 leading-snug pt-2">
                  Register your technical jua kali skills, establish verification standing, and claim local on-chain work projects in your region.
                </p>
              </div>
            </div>
            
            <div className="pt-6 flex justify-between items-center text-cyber-gold font-mono text-[9px] font-bold group-hover:text-cyber-cream transition">
              <span>REGISTER FUNDI</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </NeonCard>
        </motion.div>

        {/* Role 2: Client / Employer */}
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="relative group cursor-pointer"
          onClick={() => onSelectRole("client")}
        >
          <NeonCard glowColor="red" className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyber-red/15 flex items-center justify-center text-cyber-red border border-cyber-red/30">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-black text-sm text-cyber-cream uppercase tracking-wide">
                  I Need Help
                </h3>
                <p className="font-mono text-[10px] text-cyber-red uppercase font-bold italic leading-none">
                  Nahitaji huduma / Client
                </p>
                <p className="font-sans text-[11px] text-zinc-400 leading-snug pt-2">
                  Find verified local technicians for grid electricity repairs, micro-plumbing, or battery packs. Secure escrow via MiniPay.
                </p>
              </div>
            </div>
            
            <div className="pt-6 flex justify-between items-center text-cyber-red font-mono text-[9px] font-bold group-hover:text-cyber-cream transition">
              <span>POST REPAIR ORDER</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </NeonCard>
        </motion.div>

        {/* Role 3: Introducer / Community Leader */}
        <motion.div 
          whileHover={{ scale: 1.01, y: -2 }}
          className="relative group cursor-pointer"
          onClick={() => onSelectRole("introducer")}
        >
          <NeonCard glowColor="mint" className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-cyber-mint/15 flex items-center justify-center text-cyber-mint border border-cyber-mint/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-sans font-black text-sm text-cyber-cream uppercase tracking-wide">
                  Introducer / Elder
                </h3>
                <p className="font-mono text-[10px] text-cyber-mint uppercase font-bold italic leading-none">
                  Mwangalizi / Sponsor
                </p>
                <p className="font-sans text-[11px] text-zinc-400 leading-snug pt-2">
                  Pastor, Cooperative head or Elder certifying member credibility. Vouch for reliable tradesmen to grow regional trust standing.
                </p>
              </div>
            </div>
            
            <div className="pt-6 flex justify-between items-center text-cyber-mint font-mono text-[9px] font-bold group-hover:text-cyber-cream transition">
              <span>MANAGE TRUST LEDGER</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </NeonCard>
        </motion.div>
      </div>

      <KenteStrip className="h-1 rounded-full" />
    </div>
  );
}
