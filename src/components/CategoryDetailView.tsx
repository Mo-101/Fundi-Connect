/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  Send,
  Calendar,
  MessageSquare
} from "lucide-react";
import { NeonCard } from "./CyberDeck";
import { Worker } from "../types";

// Categorized fallback mock banners
const BANNER_THEMES: Record<string, string> = {
  "Electrical": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800",
  "Plumbing": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
  "Smart Tech": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
  "Carpentry": "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=800",
  "Solar Energy": "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800",
  "Masonry": "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800"
};

interface CategoryDetailViewProps {
  category: string;
  workers: Worker[];
  onBack: () => void;
  onBookWorker: (worker: Worker) => void;
  onInitiateMessage: (workerId: string, workerName: string) => void;
}

export function CategoryDetailView({
  category,
  workers,
  onBack,
  onBookWorker,
  onInitiateMessage
}: CategoryDetailViewProps) {
  // Filter matched workers
  const matchedWorkers = workers.filter(
    (w) => w.category.toLowerCase().trim() === category.toLowerCase().trim()
  );

  // Simple client-side realistic "AI insights" matching technician context
  const getAIInsight = (w: Worker) => {
    const hasSolar = w.subSkills.some(s => s.toLowerCase().includes("solar") || s.toLowerCase().includes("inverter"));
    if (hasSolar) {
      return `Solar Node Analyzer confirms 98.4% efficiency on recent setups. Ideal for backup photovoltaic arrays.`;
    }
    const hasLeak = w.subSkills.some(s => s.toLowerCase().includes("leak") || s.toLowerCase().includes("bio"));
    if (hasLeak) {
      return `Hydro-flow sensor metrics indicate zero micro-fractures in previous deployments. Specializes in non-destructive inspection.`;
    }
    const hasTech = w.subSkills.some(s => s.toLowerCase().includes("solder") || s.toLowerCase().includes("pos"));
    if (hasTech) {
      return `Diagnostic glove registers high precision micro-soldering capabilities. Expert in low-power integrated controller configurations.`;
    }
    return `Regional trust telemetry verified. 100% completed job confirmation rate under community introducer guidelines.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 select-none">
        <button
          onClick={onBack}
          className="p-2.5 bg-zinc-900 border border-white/[0.08] text-cyber-gold hover:text-white rounded-xl transition cursor-pointer font-bold text-xs flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> BACK TO PORTAL
        </button>
        <span className="font-mono text-zinc-500 text-xs">// TRADES REGISTRY PORTAL //</span>
      </div>

      {/* Cyber Hero Banner */}
      <div className="relative h-44 rounded-3xl overflow-hidden border border-white/[0.08] select-none">
        <img 
          src={BANNER_THEMES[category] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"} 
          alt={category} 
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex flex-col justify-end p-6">
          <div className="space-y-1">
            <span className="py-0.5 px-2 bg-cyber-gold text-zinc-950 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest inline-block leading-none">
              COOPERATIVE REGISTER
            </span>
            <h2 className="font-sans font-black text-3xl text-white uppercase tracking-tight">
              {category} SPECIALISTS.
            </h2>
            <p className="font-mono text-[9px] text-[#22c55e] uppercase font-bold tracking-widest mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" /> Active matched connections: {matchedWorkers.length} near you
            </p>
          </div>
        </div>
      </div>

      {/* Technician Listing */}
      <div className="space-y-4">
        {matchedWorkers.length === 0 ? (
          <NeonCard glowColor="red" title="Zero Network Handymen Match">
            <div className="text-center py-10 space-y-3 font-sans max-w-sm mx-auto">
              <p className="text-zinc-400 text-xs">
                The local cooperative ledger hasn’t completed verifying specialists under {category} in your current GSM cell range.
              </p>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-cyber-gold text-zinc-950 font-sans font-bold text-[10px] uppercase rounded-lg cursor-pointer"
              >
                REQUEST VIA WORK BULLETINS
              </button>
            </div>
          </NeonCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {matchedWorkers.map((worker) => (
              <NeonCard 
                key={worker.id} 
                glowColor={worker.isOnline ? "mint" : "gold"}
                className="hover:border-cyber-gold transition duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left segment info */}
                  <div className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                    <div className="relative">
                      <img 
                        src={worker.avatar} 
                        alt={worker.name} 
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-2xl border-2 border-cyber-gold/80 object-cover"
                      />
                      {worker.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-cyber-mint border-2 border-zinc-950 rounded-full animate-pulse shadow-[0_0_6px_#22c55e]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-sans font-black text-[#fafafa] uppercase text-sm leading-tight">{worker.name}</h4>
                      <p className="font-mono text-[9px] text-zinc-500 uppercase flex items-center justify-center lg:justify-start gap-1">
                        <MapPin className="w-3 h-3 text-cyber-red" /> {worker.locationName}
                      </p>
                    </div>

                    <span className="px-2 py-0.5 bg-zinc-900 border border-[#fafafa]/5 text-zinc-300 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyber-gold" /> {worker.verificationLevel || "Standard Setup"}
                    </span>
                  </div>

                  {/* Right segment stats & AI Insights */}
                  <div className="lg:col-span-9 space-y-4">
                    <div>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Technician Expertise Bio</span>
                      <p className="font-sans text-xs text-zinc-300 leading-relaxed italic">"{worker.bio}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 bg-zinc-950/80 border border-white/[0.03] rounded-xl">
                        <span className="font-mono text-[8px] text-zinc-500 block uppercase">Standard Rate</span>
                        <span className="font-sans text-xs text-cyber-cream font-bold">{worker.hourlyRateKsh} Ksh/hr</span>
                      </div>
                      <div className="p-2.5 bg-zinc-950/80 border border-white/[0.03] rounded-xl">
                        <span className="font-mono text-[8px] text-zinc-500 block uppercase">Completed Jobs</span>
                        <span className="font-sans text-xs text-cyber-mint font-bold">{worker.completedJobsCount} syncs</span>
                      </div>
                      <div className="p-2.5 bg-zinc-950/80 border border-white/[0.03] rounded-xl">
                        <span className="font-mono text-[8px] text-zinc-500 block uppercase">Clarity Score</span>
                        <span className="font-sans text-xs text-cyber-gold font-bold flex items-center justify-center gap-0.5">
                          <Star className="w-3 h-3 fill-cyber-gold stroke-none inline shrink-0" /> {worker.rating} / 5.0
                        </span>
                      </div>
                    </div>

                    {/* AI Trust Insight block */}
                    <div className="p-3 bg-[#E63946]/5 border border-cyber-red/20 rounded-xl space-y-1">
                      <p className="font-mono text-[9px] font-bold text-cyber-red flex items-center gap-1.5 select-none animate-pulse">
                        <Sparkles className="w-3.5 h-3.5 text-cyber-red" /> MESH AI TRUST ASSESSMENT
                      </p>
                      <p className="text-[11px] text-[#fafafa]/80 font-sans italic leading-normal">
                        "{getAIInsight(worker)}"
                      </p>
                    </div>

                    {/* Booking Triggers */}
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => onInitiateMessage(worker.id, worker.name)}
                        className="px-4 py-2 bg-zinc-900 border border-white/[0.06] text-zinc-350 hover:text-white rounded-xl font-sans text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> SMS Telegram
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => onBookWorker(worker)}
                        className="px-5 py-2.5 bg-cyber-gold text-zinc-950 rounded-xl font-sans text-[10px] font-bold uppercase cursor-pointer hover:scale-[1.01] active:scale-95 transition flex items-center gap-1.5 shadow-lg shadow-cyber-gold/10"
                      >
                        <Briefcase className="w-3.5 h-3.5 text-zinc-950" /> Initiate Work Proposal
                      </button>
                    </div>

                  </div>

                </div>
              </NeonCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
