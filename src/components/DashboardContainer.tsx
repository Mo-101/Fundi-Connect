/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "motion/react";
import { 
  Hammer, 
  MapPin, 
  Star, 
  CheckCircle, 
  Bell, 
  Plus, 
  Receipt, 
  Calendar, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Search, 
  TrendingUp, 
  Award, 
  User as UserIcon, 
  Heart,
  X,
  Volume2,
  Lock,
  Boxes,
  HelpCircle,
  FileCheck,
  AlertTriangle,
  Users
} from "lucide-react";
import { NeonCard, KenteStrip } from "./CyberDeck";
import { Worker, Job, Review } from "../types";
import { TwendeKaziBanner } from "./TwendeKaziBanner";

interface DashboardContainerProps {
  workers: Worker[];
  jobs: Job[];
  currentUserRole: "worker" | "client" | "introducer" | "guest";
  currentUserName: string;
  currentUserLocation: string;
  currentUserPhone: string;
  currentUserAvatar: string;
  onPostJobClick: () => void;
  onSelectCategory: (cat: string) => void;
  onLaunchKyc: () => void;
  onLaunchTip: (workerName: string) => void;
  onUpdateJobs: (updated: Job[]) => void;
  onAddPost?: (title: string, content: string) => void;
  language?: "eng" | "swa" | "sheng";
}

export function DashboardContainer({
  workers,
  jobs,
  currentUserRole,
  currentUserName,
  currentUserLocation,
  currentUserPhone,
  currentUserAvatar,
  onPostJobClick,
  onSelectCategory,
  onLaunchKyc,
  onLaunchTip,
  onUpdateJobs,
  onAddPost,
  language = "eng"
}: DashboardContainerProps) {
  // Modal togglers
  const [showFormula, setShowFormula] = useState(false);
  const [showBaraza, setShowBaraza] = useState<{ isOpen: boolean; jobId?: string }>({ isOpen: false });
  const [showRatingModal, setShowRatingModal] = useState<{ isOpen: boolean; job: Job | null }>({ isOpen: false, job: null });
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Elder Governance states
  const [pendingVouches, setPendingVouches] = useState<any[]>([
    { id: "v-1", name: "Kariuki Mwangi", trade: "Plumbing Specialist", sector: "Kasarani, Compound 4", phone: "+254 701 445 921", trustTier: "Tier-2 Requester" },
    { id: "v-2", name: "Fatuma Ali", trade: "Solar Grid Installer", sector: "Kibera Sector 3", phone: "+254 755 993 110", trustTier: "Tier-2 Requester" }
  ]);

  const [activeDisputes, setActiveDisputes] = useState<any[]>([
    { id: "disp-1", jobId: "g-103", clientName: "Amina Omondi", workerName: "Juma Kamau", issue: "Incomplete circuit panel wiring", amountKsh: 4500 },
    { id: "disp-2", jobId: "g-104", clientName: "George Njoroge", workerName: "Aisha Mwangi", issue: "Kitchen pipe misalignment check leaking", amountKsh: 3000 }
  ]);

  const [elderTitle, setElderTitle] = useState("");
  const [elderContent, setElderContent] = useState("");
  const [elderTag, setElderTag] = useState("Coop Alert");

  // Simulated Database Ledger Transactions state
  const [mpesaTransactions, setMpesaTransactions] = useState<any[]>([
    { id: "tx-mpesa-001", date: "2026-06-08", type: "onboarding_deposit", amount: 100, status: "completed", receipt: "QY876BHS88" },
    { id: "tx-mpesa-002", date: "2026-06-09", type: "escrow_contract", amount: 4500, status: "completed", receipt: "QY901JKD12" },
  ]);

  // Handle worker job statuses: "accepted" -> "in_progress" -> "completed"
  const handleStartJob = (jobId: string) => {
    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        return { ...job, status: "assigned" as const }; // assigned corresponds to start state
      }
      return job;
    });
    onUpdateJobs(updated);
    
    // Append transaction log
    setMpesaTransactions([
      { id: `tx-mpesa-${Date.now()}`, date: "2026-06-09", type: "work_commenced", amount: 1500, status: "completed", receipt: "TRD" + Math.floor(1000 + Math.random() * 9000) },
      ...mpesaTransactions
    ]);
  };

  const handleCompleteJob = (jobId: string) => {
    const updated = jobs.map((job) => {
      if (job.id === jobId) {
        return { ...job, status: "completed" as const, paymentStatus: "released" as const };
      }
      return job;
    });
    onUpdateJobs(updated);

    const jobObj = jobs.find(j => j.id === jobId);
    if (jobObj) {
      onLaunchTip(jobObj.assignedWorkerId ? (workers.find(w => w.id === jobObj.assignedWorkerId)?.name || "the fundi") : "the fundi");
    }
  };

  // Submit client feedback review
  const handleRatingSubmit = () => {
    if (!showRatingModal.job) return;
    const targetJob = showRatingModal.job;
    
    alert(`Asante! Review submitted. Rating: ${ratingVal} stars. Comments: "${ratingComment}"`);
    setShowRatingModal({ isOpen: false, job: null });
    setRatingComment("");
    setRatingVal(5);
  };

  const fileComplaint = (id: string) => {
    setShowBaraza({ isOpen: true, jobId: id });
  };

  // Filter nearby workers for search
  const filteredWorkers = workers.filter((w) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      w.name.toLowerCase().includes(query) ||
      w.category.toLowerCase().includes(query) ||
      w.locationName.toLowerCase().includes(query)
    );
  });

  // Dynamic Dashboard branches based on Persona
  return (
    <div className="space-y-6">
      <TwendeKaziBanner 
        language={language}
        currentUserRole={currentUserRole}
        currentUserName={currentUserName}
      />
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: WORKER DASHBOARD */}
        {currentUserRole === "worker" && (
          <motion.div
            key="worker-dash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Left profile stats panel */}
            <div className="md:col-span-4 space-y-4 select-none">
              <NeonCard glowColor="gold" className="text-center p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={currentUserAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=juma"}
                      alt={currentUserName}
                      className="w-24 h-24 rounded-full border-2 border-cyber-gold object-cover"
                    />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-cyber-mint border-2 border-zinc-950 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-sans font-black text-[#fafafa] uppercase text-base">{currentUserName || "Juma Kamau"}</h3>
                    <p className="font-mono text-[9px] text-[#22c55e] uppercase">Active sync Node</p>
                    <p className="font-sans text-stone-505 text-xs text-zinc-400 font-medium flex items-center justify-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyber-red" /> {currentUserLocation || "Ruiru, Nairobi"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/[0.04] w-full flex flex-col gap-1.5 items-center">
                    <button
                      onClick={onLaunchKyc}
                      className="px-3 py-1 bg-cyber-gold/10 border border-cyber-gold/25 hover:border-cyber-gold text-cyber-gold text-[10px] font-mono leading-none rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-cyber-gold" /> Identity level: Tier-3 Verified
                    </button>
                    <span className="text-[9px] text-zinc-550 text-zinc-500 font-mono">Vouched by Elder Group</span>
                  </div>
                </div>
              </NeonCard>

              {/* Formula & calculations launcher */}
              <NeonCard glowColor="violet" onClick={() => setShowFormula(true)}>
                <div className="space-y-3 cursor-pointer py-1">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Stewardship score specs</span>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-sans font-black text-2xl text-cyber-violet">98% TRUST</h4>
                    <span className="text-zinc-450 text-[10px] font-mono hover:underline">Formulations →</span>
                  </div>
                  <p className="text-[10px] font-sans leading-normal text-zinc-400">
                    Calculated live based on completed escrow disbursements vs cancellations. Click to inspect algorithms.
                  </p>
                </div>
              </NeonCard>
            </div>

            {/* Right main jobs & transactions listing */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Quick Actions Panel */}
              <NeonCard glowColor="gold" title={translations[language].workbench_title} subLabel={translations[language].workbench_subtitle}>
                <div className="grid grid-cols-2 gap-3 pb-1 pt-1 select-none">
                  <div className="p-4 bg-zinc-950 border border-white/[0.03] rounded-2xl space-y-1.5 text-left">
                    <span className="p-2.5 bg-cyber-gold/10 text-cyber-gold border border-cyber-gold/20 rounded-xl inline-block">
                      <Boxes className="w-5 h-5" />
                    </span>
                    <h4 className="font-sans font-black text-xs text-white uppercase font-bold">{translations[language].discover_work_title}</h4>
                    <p className="text-[10px] text-zinc-450 leading-snug">{translations[language].discover_work_desc}</p>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-white/[0.03] rounded-2xl space-y-1.5 text-left">
                    <span className="p-2.5 bg-cyber-mint/10 text-cyber-mint border border-cyber-mint/20 rounded-xl inline-block">
                      <TrendingUp className="w-5 h-5" />
                    </span>
                    <h4 className="font-sans font-black text-xs text-white uppercase font-bold">{translations[language].sponsor_program_title}</h4>
                    <p className="text-[10px] text-zinc-450 leading-snug">{translations[language].sponsor_program_desc}</p>
                  </div>
                </div>
              </NeonCard>

              {/* Technician jobs requests queue */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline select-none">
                  <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">{translations[language].active_queue_title}</h3>
                  <span className="text-[9px] text-[#22c55e] font-mono uppercase tracking-widest font-bold">{translations[language].active_queue_sync}</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {jobs.filter(j => j.status !== "completed" && j.status !== "cancelled").map((job) => (
                    <div key={job.id} className="p-4 bg-zinc-900 border border-white/[0.04] rounded-2xl flex items-center justify-between text-xs font-mono">
                      <div className="space-y-1.5">
                        <div className="space-y-0.5">
                          <span className="py-0.5 px-2 bg-cyber-gold/10 border border-cyber-gold/30 rounded text-[8px] font-bold text-cyber-gold uppercase mr-2 tracking-wide font-mono leading-none inline-block">
                            {job.category}
                          </span>
                          <h4 className="font-sans font-extrabold text-white text-sm tracking-tight capitalize leading-none pt-1">
                            {job.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-none">Budget: <strong>{job.budgetKsh} Ksh</strong> // Client: {job.clientName}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {job.status === "open" && (
                          <button
                            onClick={() => handleStartJob(job.id)}
                            className="px-3.5 py-1.5 bg-cyber-gold hover:bg-cyber-gold/90 text-zinc-950 font-sans font-bold text-[10px] rounded-lg uppercase cursor-pointer"
                          >
                            Accept Task
                          </button>
                        )}
                        {job.status === "assigned" && (
                          <button
                            onClick={() => handleCompleteJob(job.id)}
                            className="px-3.5 py-1.5 bg-cyber-red text-white hover:bg-cyber-red/90 font-sans font-bold text-[10px] rounded-lg uppercase cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        <button 
                          onClick={() => fileComplaint(job.id)}
                          className="hover:text-cyber-red text-zinc-500 transition px-2 py-1 text-[10px] hover:underline"
                        >
                          Dispute
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Ledger Card */}
              <NeonCard glowColor="mint" title={translations[language].ledger_log_title} subLabel={translations[language].ledger_log_subtitle}>
                <div className="space-y-3 font-mono text-xs max-h-48 overflow-y-auto">
                  {mpesaTransactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-zinc-950/80 rounded-xl flex justify-between items-center border border-white/[0.02]">
                      <div className="space-y-1">
                        <p className="font-sans font-bold text-cyber-cream leading-none capitalize">{tx.type.replace("_", " ")}</p>
                        <p className="text-[9px] text-zinc-500">M-PESA REF: <strong className="text-zinc-400">{tx.receipt}</strong> // {tx.date}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="font-bold text-white block">KES {tx.amount}</span>
                        <span className="text-[9px] text-cyber-mint font-bold uppercase leading-none">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </NeonCard>

            </div>
          </motion.div>
        )}

        {/* VIEW 2: CLIENT DASHBOARD */}
        {currentUserRole === "client" && (
          <motion.div
            key="client-dash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick search input */}
            <div className="relative max-w-xl mx-auto select-none">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500">
                <Search className="w-5 h-5 text-cyber-gold" />
              </span>
              <input 
                type="text"
                placeholder="Query standby technicians by name, trade or region..."
                value={searchQuery}
                aria-label="Query standby technicians"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181b]/95 border border-white/[0.08] text-white rounded-2xl py-3.5 pl-12 pr-20 text-xs font-mono uppercase focus:outline-hidden focus:border-cyber-gold/70 focus:bg-zinc-900 transition-all font-bold placeholder:text-zinc-650 tracking-wider shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono font-bold text-cyber-red uppercase hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Request service quick banner card */}
            <NeonCard glowColor="violet" title="Commence Handyman Request" subLabel="Instant Dispatch">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 select-none">
                <div className="space-y-1.5 flex-1 text-left">
                  <h3 className="font-sans font-black text-xl text-white uppercase tracking-tight">Need urgent help with grid panel, pipe leaks or wiring?</h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Launch a digital work dispatch bulletin with custom budget. Local nearby certified specialists in Nairobi receive SMS queries immediately.
                  </p>
                </div>
                <button
                  onClick={onPostJobClick}
                  className="px-6 py-3 bg-cyber-gold hover:bg-cyber-gold/90 text-zinc-950 font-sans font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 shadow-lg shadow-cyber-gold/10"
                >
                  <Plus className="w-4 h-4 text-zinc-950" /> Publish Work Order
                </button>
              </div>
            </NeonCard>

            {/* Neighbor Categories slider */}
            <div className="space-y-3 select-none">
              <div className="flex justify-between items-baseline">
                <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">Standby trades disciplines</h3>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">NICHES REGISTRY</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {workers.reduce((acc, current) => {
                  if (!acc.includes(current.category)) {
                    acc.push(current.category);
                  }
                  return acc;
                }, [] as string[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className="flex-shrink-0 w-28 h-28 bg-[#18181b] border border-white/[0.06] hover:border-cyber-gold/50 rounded-2xl p-4 flex flex-col justify-between items-start snap-center cursor-pointer transition relative group overflow-hidden shadow-md"
                  >
                    <div className="text-xl">🛠</div>
                    <div className="z-10">
                      <span className="font-sans text-[11px] font-black text-white hover:text-cyber-gold leading-none uppercase select-all group-hover:text-cyber-gold">
                        {cat}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Matched technicians lists block */}
            <div className="space-y-4">
              <div className="flex justify-between select-none items-baseline">
                <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">STANDBY SPECIALISTS DIRECTORY</h3>
                <span className="text-[9.5px] font-mono text-cyber-mint uppercase font-bold tracking-widest leading-none">
                  ✔ {filteredWorkers.length} NODES LINKED
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkers.map((worker) => (
                  <NeonCard 
                    key={worker.id} 
                    glowColor="gold"
                    className="hover:border-cyber-gold transition cursor-pointer duration-300"
                    onClick={() => onSelectCategory(worker.category)}
                  >
                    <div className="flex items-center gap-5 select-none">
                      <div className="relative shrink-0">
                        <img 
                          src={worker.avatar} 
                          alt={worker.name} 
                          className="w-16 h-16 rounded-2xl border border-white/[0.1] object-cover"
                        />
                        {worker.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-cyber-mint border border-zinc-950 rounded-full animate-pulse blur-[1px]" />
                        )}
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans font-black text-cyber-cream text-sm leading-none whitespace-nowrap truncate">{worker.name}</h4>
                            <span className="px-1.5 py-0.5 bg-cyber-gold/10 text-cyber-gold border border-cyber-gold/20 text-[7.5px] font-mono font-bold uppercase rounded">
                              {worker.verificationLevel}
                            </span>
                          </div>
                          <p className="font-mono text-[9px] text-[#22c55e] font-bold uppercase leading-none mt-1">{worker.category}</p>
                        </div>
                        <p className="font-sans text-[10px] text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyber-red" /> {worker.locationName}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="font-sans text-xs font-black text-cyber-gold flex items-center justify-end gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-cyber-gold stroke-none inline shrink-0" /> {worker.rating}
                        </span>
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase font-bold tracking-wider block mt-1">{worker.completedJobsCount} syncs</span>
                      </div>
                    </div>
                  </NeonCard>
                ))}
              </div>
            </div>

            {/* Request history checklist ledger */}
            <div className="space-y-3">
              <h3 className="font-sans font-black text-base text-white uppercase tracking-tight select-none">Your posted service requests</h3>
              <div className="space-y-2.5">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 bg-zinc-90 w-full bg-zinc-900 border border-white/[0.04] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="py-0.5 px-1 bg-cyber-violet/10 border border-cyber-violet/30 rounded text-[8px] font-bold text-cyber-violet uppercase mr-2 tracking-wide font-mono leading-none inline-block">
                          {job.category}
                        </span>
                        <h4 className="font-sans font-extrabold text-[#fafafa] text-sm tracking-tight capitalize leading-none pt-0.5 inline-block">
                          {job.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-zinc-500">Ksh: <strong>{job.budgetKsh}</strong> // Coords: {job.locationName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold tracking-wider uppercase inline-block ${
                        job.status === "completed" 
                          ? "bg-cyber-mint/15 text-cyber-mint border border-cyber-mint/30" 
                          : "bg-cyber-gold/15 text-cyber-gold border border-cyber-gold/30"
                      }`}>
                        {job.status}
                      </span>

                      {job.status === "completed" && (
                        <button
                          onClick={() => setShowRatingModal({ isOpen: true, job })}
                          className="px-3 py-1 bg-cyber-gold text-zinc-950 font-sans font-bold text-[9.5px] rounded-lg uppercase cursor-pointer"
                        >
                          RATE FUNDI
                        </button>
                      )}

                      {job.status === "assigned" && (
                        <button
                          onClick={() => handleCompleteJob(job.id)}
                          className="px-3.5 py-1.5 bg-cyber-red text-white hover:bg-cyber-red/90 font-sans font-bold text-[10px] rounded-lg uppercase cursor-pointer"
                        >
                          MARK COMPLETED
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* VIEW 3: INTRODUCER DASHBOARD */}
        {currentUserRole === "introducer" && (
          <motion.div
            key="introducer-dash"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Introducer core stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Bio Card */}
              <div className="md:col-span-4 select-none">
                <NeonCard glowColor="mint" className="text-center p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 bg-cyber-mint/10 border border-cyber-mint/30 rounded-3xl flex items-center justify-center text-cyber-mint">
                      <Users className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-sans font-black text-[#fafafa] uppercase text-sm leading-tight">{currentUserName || "Elder James"}</h3>
                      <p className="font-mono text-[9px] text-[#22c55e] uppercase">Reputation Guardian Index</p>
                      <p className="font-sans text-[11.5px] text-zinc-400">Ruiru Parish, Compound B</p>
                    </div>

                    <p className="font-sans text-[11px] leading-relaxed text-zinc-500 italic">
                      "Overseeing the peer-to-peer trust handshake ledger. Empowering local communities with USSD vouching."
                    </p>
                  </div>
                </NeonCard>
              </div>

              {/* Right Statistics indices */}
              <div className="md:col-span-8 select-none">
                <NeonCard glowColor="gold" title="Cooperative Integrity Dashboard" subLabel="Network State">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-zinc-950/85 border border-white/[0.04] rounded-2xl text-left space-y-1">
                      <p className="font-mono text-[8px] text-zinc-550 text-zinc-500 uppercase leading-none">ACTIVE VOUCHED COOPS</p>
                      <span className="font-display font-black text-3xl text-cyber-gold block">{18 + (2 - pendingVouches.length)} Nodes</span>
                      <p className="text-[10px] text-zinc-400 leading-snug font-sans">Verified experienced tradesmen active in Ruiru, Kayole and Kasarani.</p>
                    </div>

                    <div className="p-4 bg-zinc-950/85 border border-white/[0.04] rounded-2xl text-left space-y-1">
                      <p className="font-mono text-[8px] text-zinc-550 text-zinc-500 uppercase leading-none">BARAZA RESOLVEMENTS</p>
                      <span className="font-display font-black text-3xl text-cyber-mint block">{42 + (2 - activeDisputes.length)} Syncs</span>
                      <p className="text-[10px] text-zinc-400 leading-snug font-sans font-semibold">Disputes settled successfully on local escrow agreements.</p>
                    </div>
                  </div>
                </NeonCard>
              </div>

            </div>

            {/* Elder Interactive Vouch Registry */}
            <div className="space-y-3">
              <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">Pending Trust Vouch Inbox ({pendingVouches.length})</h3>
              {pendingVouches.length === 0 ? (
                <div className="p-6 bg-zinc-900 border border-white/[0.04] rounded-2xl text-center font-mono text-zinc-505 text-zinc-500 text-xs">
                  ★ All pending handymen verified! The community is secure.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingVouches.map((v) => (
                    <div key={v.id} className="p-4 bg-zinc-900 border border-white/[0.04] rounded-2xl flex flex-col justify-between gap-3 text-xs font-mono">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-sans font-extrabold text-white text-sm">{v.name}</h4>
                          <span className="text-[8.5px] font-bold text-cyber-gold uppercase bg-cyber-gold/10 px-2 py-0.5 rounded border border-cyber-gold/20">{v.trustTier}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">Trade: <strong>{v.trade}</strong> // Sector: {v.sector}</p>
                        <p className="text-[10px] text-zinc-500">Phone: {v.phone}</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setPendingVouches(pendingVouches.filter(p => p.id !== v.id));
                            alert(`Asante! You successfully vouched for ${v.name}. Their Trust Shield status upgraded to Tier-3 Verified on the mesh protocol.`);
                          }}
                          className="px-4 py-2 bg-cyber-gold hover:bg-cyber-gold/90 text-zinc-950 font-sans font-bold text-[10px] rounded-xl uppercase cursor-pointer"
                        >
                          VOUCH COOPERATIVE FOR TIER-3
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elder Interactive Baraza dispute solvers */}
            <div className="space-y-3">
              <h3 className="font-sans font-black text-base text-white uppercase tracking-tight">Active Citizens Baraza Disputes ({activeDisputes.length})</h3>
              {activeDisputes.length === 0 ? (
                <div className="p-6 bg-zinc-900 border border-white/[0.04] rounded-2xl text-center font-mono text-zinc-505 text-zinc-500 text-xs">
                  ✔ All dispute cases cleared. No active manual mediations required.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDisputes.map((d) => (
                    <div key={d.id} className="p-4 bg-zinc-900 border border-[#E63946]/20 rounded-2xl space-y-3 text-xs font-mono text-[#ACAFC2]">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[9px] font-bold text-cyber-red uppercase bg-cyber-red/10 px-2 py-0.5 rounded border border-cyber-red/25">Baraza Case {d.jobId}</span>
                          <span className="text-white font-bold">Escrow: KES {d.amountKsh}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">Claim: <strong>{d.issue}</strong></p>
                        <p className="text-[10px] text-zinc-500">Fundi: {d.workerName} // Client: {d.clientName}</p>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => {
                            setActiveDisputes(activeDisputes.filter(ad => ad.id !== d.id));
                            alert(`Verdict signed: Disbursing KES ${d.amountKsh} directly to Fundi ${d.workerName}. Trust confirmed.`);
                          }}
                          className="px-3 py-1.5 bg-cyber-mint hover:bg-cyber-mint/90 text-zinc-950 font-sans font-semibold text-[9.5px] rounded-lg uppercase cursor-pointer"
                        >
                          RELEASE TO FUNDI
                        </button>
                        <button
                          onClick={() => {
                            setActiveDisputes(activeDisputes.filter(ad => ad.id !== d.id));
                            alert(`Verdict signed: Refunding KES ${d.amountKsh} back to client ${d.clientName}.`);
                          }}
                          className="px-3 py-1.5 bg-zinc-900 border border-white/[0.1] hover:border-white text-white font-sans font-semibold text-[9.5px] rounded-lg uppercase cursor-pointer"
                        >
                          REFUND CLIENT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Elder Announcement Broadcaster */}
            <NeonCard glowColor="violet" title="Publish Official Baraza Bulletin" subLabel="Governance Broadcast">
              <div className="space-y-4 text-xs font-mono">
                <p className="text-zinc-400 font-sans leading-relaxed">
                  Post trusted trade guidelines, official safety alerts, background scanning announcements, or standard cooperative labor pricing benchmarks directly to the Community Baraza.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Announcement Trade Bulletin Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Kasarani Grid panel Safety Standard Alert"
                        value={elderTitle}
                        onChange={(e) => setElderTitle(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Announcement category tag</label>
                      <select
                        value={elderTag}
                        onChange={(e) => setElderTag(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:outline-hidden"
                      >
                        <option value="Coop Alert">⚠️ Cooperative Alert</option>
                        <option value="Rates">📊 Price Rate Guideline</option>
                        <option value="Safety Bulletin">🛡️ Mesh Safety Bulletin</option>
                        <option value="General Check">💼 Hiring & Job Check</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Announcement Bulletin Content</label>
                    <textarea
                      rows={4}
                      placeholder="Specify important technical guidelines or safety standards..."
                      value={elderContent}
                      onChange={(e) => setElderContent(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/[0.08] text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1 select-none">
                  <button
                    onClick={() => {
                      if (!elderTitle || !elderContent) {
                        alert("Please fill in both title and content to broadcast!");
                        return;
                      }
                      if (onAddPost) {
                        onAddPost(elderTitle, elderContent);
                        alert(`Cooperative Bulletin broadcasted successfully: "${elderTitle}" has been posted live onto the Community Baraza Forums database!`);
                        setElderTitle("");
                        setElderContent("");
                      }
                    }}
                    className="px-6 py-2.5 bg-[#a855f7] hover:bg-[#a855f7]/90 text-white font-sans font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    BROADCAST TO COMMUNITY BARAZA
                  </button>
                </div>
              </div>
            </NeonCard>

            {/* Dynamic USSD rules explanation index */}
            <NeonCard glowColor="violet" title={translations[language].ledger_rule_title} subLabel={translations[language].ledger_rule_subtitle}>
              <div className="space-y-4 font-sans text-xs">
                <p className="text-zinc-400 leading-relaxed">
                  Introducers execute vouch controls completely offline using cellular feature-phones. Dial matching USSD codes below to approve character profiles:
                </p>

                <div className="p-4 bg-zinc-950 border border-[#a855f7]/30 rounded-xl font-mono text-xs text-[#a855f7] flex flex-col md:flex-row gap-4 items-center justify-between select-all">
                  <div className="space-y-1.5 text-center md:text-left">
                    <p className="font-bold underline uppercase block text-[10px]">DIAL DIRECT VOUCH CORE CODE</p>
                    <p className="text-white text-base font-bold tracking-widest select-all">*555*11*&lt;PHONE_NUMBER&gt;#</p>
                  </div>
                  <span className="py-1 px-3 bg-[#a855f7]/15 rounded-full text-[9px] font-bold uppercase tracking-wider block">
                    GSM BROADCAST LINK
                  </span>
                </div>
              </div>
            </NeonCard>

          </motion.div>
        )}
      </AnimatePresence>

      {/* CORE DIALOG MODALS OVERLAYS */}
      <AnimatePresence>
        
        {/* MODAL 1: TRUST FORMULA */}
        {showFormula && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-midnight/90 backdrop-blur-md">
            <div className="relative w-full max-w-sm overflow-hidden bg-cyber-surface border-2 border-cyber-violet/80 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center bg-[#182052] px-4 py-2 border-b border-cyber-violet/20 font-mono text-xs">
                <span className="text-cyber-violet flex items-center gap-1 font-bold">
                  ⚡ INTEGRATIVE TRUST ALGORITHMS
                </span>
                <button onClick={() => setShowFormula(false)} className="text-cyber-muted hover:text-white cursor-pointer select-none text-sm">✕</button>
              </div>
              <div className="p-6 font-mono text-xs bg-cyber-surface-dark space-y-4 leading-relaxed">
                <h4 className="font-sans font-black text-sm text-center text-white">THE HONOR SPECIFICATIONS</h4>
                
                <div className="space-y-2.5">
                  <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl flex items-center gap-3">
                    <span className="h-6 w-6 font-black bg-cyber-red/25 rounded-md flex items-center justify-center text-cyber-red">40</span>
                    <div>
                      <p className="text-white font-bold leading-none">Job sync completion ratio</p>
                      <p className="text-[9px] text-zinc-500">Disbursed escrow assignments checklist</p>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl flex items-center gap-3">
                    <span className="h-6 w-6 font-black bg-cyber-gold/25 rounded-md flex items-center justify-center text-cyber-gold">30</span>
                    <div>
                      <p className="text-white font-bold leading-none">No flagged disputes</p>
                      <p className="text-[9px] text-zinc-500">Completed without digital elder reviews</p>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl flex items-center gap-3">
                    <span className="h-6 w-6 font-black bg-[#22c55e]/25 rounded-md flex items-center justify-center text-[#22c55e]">20</span>
                    <div>
                      <p className="text-white font-bold leading-none">Introducers vuch index</p>
                      <p className="text-[9px] text-zinc-500">Character testimonials approved on-chain</p>
                    </div>
                  </div>
                </div>

                <p className="text-[9.5px] text-zinc-500 font-sans text-center italic pt-2">
                  Honor metric coefficients synchronize daily via automated blockchain audits.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: DIGITAL BARAZA DISPUTE REVIEW */}
        {showBaraza.isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-cyber-midnight/90 backdrop-blur-md">
            <div className="relative w-full max-w-sm overflow-hidden bg-cyber-surface border-2 border-cyber-red/80 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center bg-[#182052] px-4 py-2 border-b border-cyber-red/25 font-mono text-xs">
                <span className="text-cyber-red flex items-center gap-1 font-bold animate-pulse">
                  ⚖ CITIZENS DIGITAL BARAZA CASE
                </span>
                <button onClick={() => setShowBaraza({ isOpen: false })} className="text-cyber-muted hover:text-white cursor-pointer select-none text-sm">✕</button>
              </div>
              <div className="p-6 font-mono text-xs bg-cyber-surface-dark space-y-4 leading-normal select-all">
                <div className="text-center space-y-1">
                  <h4 className="font-sans font-black text-sm text-white uppercase tracking-tight">SEEK ELDERS REVIEW PROTOCOL</h4>
                  <p className="text-zinc-550 text-[9.5px] uppercase tracking-wider text-zinc-550">Nairobi local dispute block</p>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                  Your case review request will alert three community elders within the matching GSM sector. Standard case resolution verdict processes manually within 48 hours.
                </p>

                <div className="p-3 bg-zinc-950 rounded-xl border border-white/[0.04] text-xs">
                  <header className="text-cyber-gold font-bold pb-1 flex items-center gap-1 leading-none select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-gold animate-bounce" /> CORE STATUS: QUEUED_FOR_EVAL
                  </header>
                  <p className="text-[10px] text-zinc-500">Complaint registered under job hash: #{showBaraza.jobId}</p>
                </div>

                <button
                  onClick={() => {
                    alert("Dispute filed securely to elder board. Trust the cooperative process.");
                    setShowBaraza({ isOpen: false });
                  }}
                  className="w-full py-2.5 bg-cyber-red text-white hover:bg-cyber-red/90 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  DISPATCH TO ELDERS BOARD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: FEEDBACK & RATING DIALOG */}
        {showRatingModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cyber-midnight/95 backdrop-blur-md">
            <div className="relative w-full max-w-sm overflow-hidden bg-cyber-surface border-2 border-cyber-gold/80 rounded-2xl shadow-xl">
              <div className="flex justify-between items-center bg-[#182052] px-4 py-2 border-b border-cyber-gold/25 font-mono text-xs select-none">
                <span className="text-cyber-gold flex items-center gap-1 font-bold">
                  ★ FEEDBACK EVALUATION DIALOG
                </span>
                <button onClick={() => setShowRatingModal({ isOpen: false, job: null })} className="text-cyber-muted hover:text-white cursor-pointer text-sm">✕</button>
              </div>
              <div className="p-6 font-mono text-xs bg-cyber-surface-dark space-y-4">
                <div className="text-center space-y-1 select-none">
                  <h4 className="font-sans font-black text-sm text-[#fafafa] uppercase">RATE RECIPIENT PERFORMANCE</h4>
                  <p className="text-[10px] text-zinc-500">Your feedback updates matching trust score factors</p>
                </div>

                <div className="flex justify-center gap-2 py-1 select-none">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingVal(star)}
                      className="cursor-pointer transition transform active:scale-90"
                    >
                      <Star className={`w-7 h-7 shrink-0 ${star <= ratingVal ? "text-cyber-gold fill-cyber-gold" : "text-zinc-700"}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase block select-none">Experience comments</label>
                  <textarea
                    rows={3}
                    placeholder="Describe tradesman execution clarity, timelines compliance, etc..."
                    value={ratingComment}
                    onChange={(e) => setCommentOnLocal(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-cyber-cream focus:outline-hidden text-xs resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRatingSubmit}
                  className="w-full py-2.5 bg-cyber-gold text-zinc-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  DISBURSE REVIEW FEEDBACK
                </button>
              </div>
            </div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );

  // Local state helper inside because of TypeScript bindings
  function setCommentOnLocal(val: string) {
    setRatingComment(val);
  }
}
