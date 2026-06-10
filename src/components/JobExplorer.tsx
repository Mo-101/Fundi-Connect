/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Job, JobBid, Worker } from "../types";
import { PlusCircle, Play, Pause, Coins, Calendar, MapPin, Send, MessageSquare, AlertTriangle, User, UserCheck, Sparkles } from "lucide-react";
import { NeonCard } from "./CyberDeck";
import { aiService } from "../lib/aiService";
import { translations } from "../lib/translations";

interface JobExplorerProps {
  jobs: Job[];
  workers: Worker[];
  language: "eng" | "swa" | "sheng";
  onAddJob: (job: Job) => void;
  onPlaceBid: (jobId: string, bid: JobBid) => void;
}

export function JobExplorer({ jobs, workers = [], language, onAddJob, onPlaceBid }: JobExplorerProps) {
  const [activeTab, setActiveTab] = useState<"list" | "post">("list");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Smart Match Protocol state
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedJobId, setMatchedJobId] = useState<string | null>(null);

  // Reset matched recommendations if details target changes
  useEffect(() => {
    if (selectedJob && selectedJob.id !== matchedJobId) {
      setSmartMatches([]);
      setMatchedJobId(null);
    }
  }, [selectedJob]);

  // Haversine distance calculator
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSmartMatch = async (job: Job) => {
    setIsMatching(true);
    setSmartMatches([]);
    setMatchedJobId(job.id);
    try {
      const results = await aiService.findSmartMatches(job, workers);
      setSmartMatches(results);
    } catch (err) {
      console.error("AI matching trigger failed:", err);
    } finally {
      setIsMatching(false);
    }
  };

  // Post Gig Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Electrical");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [town, setTown] = useState("");
  const [urgency, setUrgency] = useState<"immediate" | "standard" | "scheduled">("standard");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [formError, setFormError] = useState("");

  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleRecommendCategory = async () => {
    if (!description.trim()) return;
    setIsSuggesting(true);
    try {
      const resp = await aiService.suggestTrades(description);
      const list = resp.split(",").map(item => item.trim());
      setAiSuggestions(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggesting(false);
    }
  };

  // Place Bid form state
  const [bidAmount, setBidAmount] = useState("");
  const [bidHours, setBidHours] = useState("");
  const [bidProposal, setBidProposal] = useState("");
  const [bidError, setBidError] = useState("");

  // Fake voice notes state
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!title || !description || !budget || !town || !clientName) {
      setFormError("Please configure all necessary telemetry fields!");
      return;
    }

    const newJob: Job = {
      id: `job-user-${Date.now()}`,
      title,
      description,
      category,
      budgetKsh: parseFloat(budget) || 1200,
      locationName: town,
      coordinates: { lat: -1.313 + Math.random() * 0.02, lng: 36.78 + Math.random() * 0.02 },
      postedDate: new Date().toISOString(),
      status: "open",
      urgency,
      clientId: "user-client-1",
      clientName,
      clientPhone: clientPhone || "+254 700 000 000",
      paymentStatus: "unpaid",
      bids: []
    };

    onAddJob(newJob);
    setTitle("");
    setDescription("");
    setBudget("");
    setTown("");
    setClientName("");
    setClientPhone("");
    setActiveTab("list");
  };

  const handlePlaceBidSubmit = (e: React.FormEvent, jobId: string) => {
    e.preventDefault();
    const parsedAmount = parseInt(bidAmount);
    const parsedHours = parseInt(bidHours);

    if (isNaN(parsedAmount) || parsedAmount < 100) {
      setBidError("Specify standard bid Ksh amount (>100)");
      return;
    }
    if (isNaN(parsedHours) || parsedHours < 1) {
      setBidError("Target completion timeframe needed");
      return;
    }
    if (!bidProposal) {
      setBidError("Record technical workflow breakdown!");
      return;
    }

    const newBid: JobBid = {
      id: `bid-user-${Date.now()}`,
      workerId: "user-fundi", // Simulate bidding as a worker
      workerName: "Bwana Tech (Simulated)",
      workerRating: 4.8,
      amountKsh: parsedAmount,
      durationHours: parsedHours,
      proposal: bidProposal,
      postedDate: new Date().toISOString()
    };

    onPlaceBid(jobId, newBid);

    // Refresh active job view with placed bid local
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({
        ...selectedJob,
        bids: [...(selectedJob.bids || []), newBid]
      });
    }

    setBidAmount("");
    setBidHours("");
    setBidProposal("");
    setBidError("");
  };

  return (
    <div className="space-y-4">
      {/* Tab toggle */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-white/[0.05] select-none">
        <button
          onClick={() => { setActiveTab("list"); setSelectedJob(null); }}
          className={`py-2 text-center font-mono text-[10px] uppercase tracking-wider rounded-lg transition duration-250 cursor-pointer ${
            activeTab === "list" && !selectedJob
              ? "bg-cyber-gold text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {language === "eng" ? "FIND WORK (VALUED GIGS)" : language === "swa" ? "VIBARUA VYA LEO" : "SHUGHULI ZA LEO (GIGS)"}
        </button>
        <button
          onClick={() => { setActiveTab("post"); setSelectedJob(null); }}
          className={`py-2 text-center font-mono text-[10px] uppercase tracking-wider rounded-lg transition duration-250 cursor-pointer ${
            activeTab === "post"
              ? "bg-cyber-gold text-zinc-950 font-bold"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {language === "eng" ? "POST NEW SERVICE GIG" : language === "swa" ? "CHAPISHA KIBARUA KIPYA" : "RUSHIA MAFUNDI KAZI"}
        </button>
      </div>

      {/* Main View router */}
      {selectedJob ? (
        // Job details and Bid placement view
        <div className="space-y-4">
          <button
            onClick={() => setSelectedJob(null)}
            className="text-xs font-mono text-cyber-gold hover:text-cyber-gold/80 flex items-center gap-1 cursor-pointer"
          >
            ← BACK TO REGISTRY
          </button>

          <NeonCard glowColor={selectedJob.urgency === "immediate" ? "red" : "gold"}>
            <header className="flex justify-between items-start gap-1 pb-2.5 border-b border-cyber-cream/10">
              <div className="space-y-1 select-none">
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  selectedJob.urgency === "immediate" ? "bg-cyber-red text-cyber-cream animate-pulse" : "bg-cyber-surface text-cyber-muted"
                }`}>
                  {selectedJob.urgency.toUpperCase()} PRIORITY
                </span>
                <h3 className="font-display font-bold text-cyber-cream text-base mt-1 tracking-tight leading-tight">
                  {selectedJob.title}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-cyber-muted block">Budget (Ksh)</span>
                <span className="text-base font-display font-bold text-cyber-mint">{selectedJob.budgetKsh} Ksh</span>
              </div>
            </header>

            <div className="py-3.5 space-y-3">
              <p className="font-sans text-xs text-[#C5C8DA] leading-relaxed">
                {selectedJob.description}
              </p>

              {/* Simulated Audio Note Player */}
              {selectedJob.hasVoiceNote && (
                <div className="p-2.5 bg-cyber-midnight/90 border border-cyber-gold/25 rounded flex items-center gap-3">
                  <button
                    onClick={() => setPlayingNoteId(playingNoteId === selectedJob.id ? null : selectedJob.id)}
                    className="w-8 h-8 rounded-full bg-cyber-gold flex items-center justify-center shrink-0 text-cyber-midnight cursor-pointer shadow-md hover:scale-105 active:scale-95 transition"
                  >
                    {playingNoteId === selectedJob.id ? <Pause className="w-4 h-4 fill-cyber-midnight" /> : <Play className="w-4 h-4 fill-cyber-midnight ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] text-cyber-gold font-bold">CLIENT VOICE DIAGNOSTIC NOTE</p>
                    {playingNoteId === selectedJob.id ? (
                      <div className="flex items-center gap-0.5 h-3 mt-1">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-cyber-mint w-[2px] rounded-xs transition-all duration-300"
                            style={{
                              height: `${15 + Math.sin((Date.now() + i * 150) / 100) * 80}%`,
                              animation: `pulse 1s ease-in-out infinite alternate ${i * 40}ms`
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 h-2 mt-1 opacity-45">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <div key={i} className="bg-cyber-muted w-[2px] h-[3px] rounded-xs" />
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-cyber-muted select-none">0:32</span>
                </div>
              )}

              {/* Metadata block */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-b border-cyber-cream/5 py-2.5 font-mono text-[10px] text-cyber-muted uppercase">
                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-cyber-red" /> {selectedJob.locationName}</span>
                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-cyber-gold" /> {new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                <span className="flex items-center">Client: {selectedJob.clientName}</span>
              </div>

              {/* 🪄 Smart Match Protocol */}
              <div className="py-2.5 border-b border-cyber-cream/5 text-left">
                <div className="p-4 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <span className="font-mono text-[10px] font-black text-cyber-gold uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyber-gold animate-pulse" /> Gemini Smart Match Engine
                    </span>
                    {smartMatches.length > 0 && (
                      <span className="py-0.5 px-2 bg-cyber-mint/10 border border-cyber-mint/20 rounded-full text-[8.5px] font-mono font-bold text-cyber-mint uppercase tracking-wider">
                        Mesh Analysis Complete
                      </span>
                    )}
                  </div>

                  {smartMatches.length === 0 && !isMatching && (
                    <div className="space-y-3">
                      <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                        Query our neighborhood neural network. Let Gemini analyze trade compatibility, specialized sub-skills, rating history, and precise GPS distance to nominate the top 3 best-suited Fundis.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSmartMatch(selectedJob)}
                        className="w-full py-2 bg-cyber-gold/10 hover:bg-cyber-gold text-cyber-gold hover:text-zinc-950 px-3 font-mono font-bold text-[10px] uppercase rounded-xl border border-cyber-gold/30 hover:border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_#d4af37]/30"
                      >
                        <Sparkles className="w-4 h-4 text-cyber-gold" /> Trigger Smart Match Protocol
                      </button>
                    </div>
                  )}

                  {isMatching && (
                    <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="relative flex justify-center items-center h-10 w-10">
                        <div className="absolute inset-0 rounded-full border border-dashed border-cyber-gold animate-spin" />
                        <Sparkles className="w-5 h-5 text-cyber-gold animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] text-cyber-gold uppercase tracking-widest font-black animate-pulse leading-none">Scanning Cyber Jua Kali Mesh</p>
                        <p className="font-sans text-[10px] text-zinc-500 pt-1">
                          Measuring proximity vectors & parsing skill matrices...
                        </p>
                      </div>
                    </div>
                  )}

                  {smartMatches.length > 0 && !isMatching && (
                    <div className="space-y-3 pt-1">
                      <p className="font-sans text-[11px] text-zinc-400">
                        Top 3 verified technicians optimized for trade category, subSkills alignment, and proximity:
                      </p>
                      <div className="space-y-2.5">
                        {smartMatches.map((match: any) => {
                          const wInfo = workers.find((w) => w.id === match.id);
                          return (
                            <div 
                              key={match.id} 
                              className="p-3 bg-zinc-900 border border-white/[0.04] rounded-2xl hover:border-cyber-gold/25 transition space-y-2 text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                  {wInfo?.avatar ? (
                                    <img 
                                      src={wInfo.avatar} 
                                      alt={wInfo.name} 
                                      referrerPolicy="no-referrer"
                                      className="w-9 h-9 rounded-xl border border-white/[0.08]"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-xl bg-zinc-855 flex items-center justify-center font-bold text-white uppercase text-xs">
                                      {(wInfo?.name || match.name || "F").charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="font-sans font-black text-xs text-white uppercase leading-none">
                                        {wInfo?.name || match.name || "Fundi Node"}
                                      </h5>
                                      {wInfo?.isVerified && (
                                        <UserCheck className="w-3.5 h-3.5 text-cyber-mint" />
                                      )}
                                    </div>
                                    <span className="font-mono text-[9px] text-zinc-500 mt-1 block">
                                      {wInfo?.category || "Contractor"} • ⭐ {wInfo?.rating || "4.8"}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono text-[10px] text-cyber-mint font-bold block leading-none">
                                    {match.score}% MATCH
                                  </span>
                                  <span className="text-[8px] text-zinc-505 text-zinc-400 font-mono block uppercase mt-1 leading-none">
                                    {wInfo?.locationName || "Nearby"}
                                  </span>
                                </div>
                              </div>

                              <p className="font-sans text-[11.5px] text-zinc-300 leading-relaxed">
                                {match.reason}
                              </p>

                              {/* ⚖️ Rule-Based Transparent Sovereign Score Breakdown */}
                              <div className="mt-2.5 p-3 bg-zinc-950 rounded-2xl border border-white/[0.03] space-y-2 select-none">
                                <span className="font-mono text-[8px] text-zinc-500 uppercase font-black block tracking-widest leading-none pb-0.5">Sovereign Dispatch Index & Weights</span>
                                <div className="grid grid-cols-5 gap-1.5 text-center font-mono">
                                  <div className="p-1.5 bg-zinc-900 border border-white/[0.02] rounded-xl flex flex-col justify-between">
                                    <div className="text-zinc-300 text-[10.5px] font-bold leading-none">
                                      {match.breakdown?.skillScore || 0}<span className="text-[7.5px] text-zinc-500">/40</span>
                                    </div>
                                    <div className="text-[6.5px] text-zinc-500 uppercase tracking-tight mt-1 leading-none font-medium">Trade Skill</div>
                                  </div>

                                  <div className="p-1.5 bg-zinc-900 border border-white/[0.02] rounded-xl flex flex-col justify-between">
                                    <div className="text-zinc-300 text-[10.5px] font-bold leading-none">
                                      {match.breakdown?.distanceScore || 0}<span className="text-[7.5px] text-zinc-500">/25</span>
                                    </div>
                                    <div className="text-[6.5px] text-zinc-500 uppercase tracking-tight mt-1 leading-none font-medium">Proximity</div>
                                  </div>

                                  <div className="p-1.5 bg-zinc-900 border border-white/[0.02] rounded-xl flex flex-col justify-between">
                                    <div className="text-[#38bdf8] text-[10.5px] font-bold leading-none">
                                      {match.breakdown?.wordKeptScore || 0}<span className="text-[7.5px] text-zinc-500">/15</span>
                                    </div>
                                    <div className="text-[6.5px] text-[#38bdf8]/60 uppercase tracking-tight mt-1 leading-none font-medium text-wrap">Word Kept</div>
                                  </div>

                                  <div className="p-1.5 bg-zinc-900 border border-white/[0.02] rounded-xl flex flex-col justify-between">
                                    <div className="text-cyber-mint text-[10.5px] font-bold leading-none">
                                      {match.breakdown?.repeatScore || 0}<span className="text-[7.5px] text-zinc-500">/10</span>
                                    </div>
                                    <div className="text-[6.5px] text-cyber-mint/60 uppercase tracking-tight mt-1 leading-none font-medium text-wrap">Repeat Clis</div>
                                  </div>

                                  <div className="p-1.5 bg-zinc-900 border border-white/[0.02] rounded-xl flex flex-col justify-between">
                                    <div className="text-cyber-gold text-[10.5px] font-bold leading-none">
                                      {match.breakdown?.elderWitnessScore || 0}<span className="text-[7.5px] text-zinc-500">/10</span>
                                    </div>
                                    <div className="text-[6.5px] text-cyber-gold/60 uppercase tracking-tight mt-1 leading-none font-medium text-wrap">Elder Vow</div>
                                  </div>
                                </div>
                              </div>

                              {/* Skills alignment badging */}
                              <div className="flex flex-wrap gap-1 pt-1">
                                {wInfo?.subSkills && wInfo.subSkills.slice(0, 3).map((sub, sIdx) => (
                                  <span 
                                    key={sIdx} 
                                    className="bg-zinc-950 text-zinc-405 text-zinc-400 font-mono text-[8.5px] py-0.5 px-1.5 rounded-sm border border-white/[0.03]"
                                  >
                                    {sub}
                                  </span>
                                ))}
                                {wInfo?.coordinates && selectedJob.coordinates ? (
                                  <span className="bg-cyber-gold/5 text-cyber-gold font-mono text-[8.5px] py-0.5 px-1.5 rounded-sm border border-cyber-gold/15">
                                    {(getDistanceKm(selectedJob.coordinates.lat, selectedJob.coordinates.lng, wInfo.coordinates.lat, wInfo.coordinates.lng)).toFixed(1)} km away
                                  </span>
                                ) : (
                                  <span className="bg-cyber-gold/5 text-cyber-gold font-mono text-[8.5px] py-0.5 px-1.5 rounded-sm border border-cyber-gold/15">
                                    Local Sector
                                  </span>
                                )}
                              </div>

                              <div className="flex gap-2 pt-1 font-mono text-[9px]">
                                <button
                                  type="button"
                                  onClick={() => alert(`Contacting ${wInfo?.name || "Fundi"} (${wInfo?.phone}) via secure GSM/USSD broadcast to lock down their workbench!`)}
                                  className="flex-1 py-1 px-2.5 bg-cyber-mint hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold uppercase cursor-pointer text-center select-none"
                                >
                                  Request Fast Bid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => alert(`GSM SMS telemetry successfully beamed to ${wInfo?.name || "Fundi"} at ${wInfo?.phone}.`)}
                                  className="py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg cursor-pointer text-center select-none"
                                >
                                  Sensitize Node
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSmartMatch(selectedJob)}
                        className="text-[9px] font-mono text-zinc-500 hover:text-cyber-gold uppercase block text-center mx-auto hover:underline pt-1 cursor-pointer"
                      >
                        🔄 Recalculate neural weights
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bids List block within Details */}
            <div className="space-y-3">
              <h4 className="font-mono text-xs font-bold text-cyber-gold tracking-widest uppercase">
                --- PIPELINE BIDS ({selectedJob.bids?.length || 0}) ---
              </h4>

              {selectedJob.bids && selectedJob.bids.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {selectedJob.bids.map((bid) => (
                    <div key={bid.id} className="p-3 bg-cyber-midnight border border-cyber-cream/10 rounded font-sans text-xs">
                      <header className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                        <span className="text-cyber-cream font-bold flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-cyber-gold" /> {bid.workerName}
                        </span>
                        <span className="text-cyber-mint font-bold">{bid.amountKsh} Ksh / {bid.durationHours} hrs</span>
                      </header>
                      <p className="text-cyber-muted mb-1">{bid.proposal}</p>
                      <span className="font-mono text-[9px] text-[#55566A]">{new Date(bid.postedDate).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10px] text-cyber-muted italic p-2 bg-cyber-surface-dark/70 rounded">No offers or bids placed on this ledger task yet.</p>
              )}
            </div>

            {/* Post Bid Form */}
            {selectedJob.status === "open" && (
              <form onSubmit={(e) => handlePlaceBidSubmit(e, selectedJob.id)} className="mt-5 pt-4 border-t border-cyber-cream/10 space-y-3 font-mono">
                <h5 className="text-cyber-cream text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-cyber-gold" /> PROPOSE WORKFLOW RATE
                </h5>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div className="space-y-1">
                    <label className="text-[9px] text-cyber-muted block">YOUR PRICE OFFER (KSH)</label>
                    <input
                      type="number"
                      placeholder="e.g. 8000"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-1.5 text-xs text-cyber-cream placeholder-cyber-muted focus:outline-hidden focus:border-cyber-gold/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-cyber-muted block">HOURS NEEDED</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={bidHours}
                      onChange={(e) => setBidHours(e.target.value)}
                      className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-1.5 text-xs text-cyber-cream placeholder-cyber-muted focus:outline-hidden focus:border-cyber-gold/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-cyber-muted block">TECHNICAL STRATEGY & CREDENTIAL DETAILS</label>
                  <textarea
                    rows={2}
                    placeholder="Describe how you will fix the customer issues safely..."
                    value={bidProposal}
                    onChange={(e) => setBidProposal(e.target.value)}
                    className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded p-2 text-xs text-cyber-cream placeholder-cyber-muted focus:outline-hidden focus:border-cyber-gold/50"
                  />
                </div>

                {bidError && <p className="text-cyber-red text-[11px] font-bold">{bidError}</p>}

                <button
                  type="submit"
                  className="w-full py-2 bg-cyber-mint text-cyber-midnight text-xs font-display font-bold rounded cursor-pointer transform hover:scale-[1.01] active:translate-y-0 transition border-b border-emerald-600 uppercase"
                >
                  TRANSMIT DIGITAL BID
                </button>
              </form>
            )}
          </NeonCard>
        </div>
      ) : activeTab === "list" ? (
        // Jobs list
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="p-8 text-center bg-[#181109]/30 rounded-2xl border border-amber-500/10 space-y-2">
              <h4 className="font-sans font-black text-white text-base uppercase tracking-tight">
                {translations[language].empty_jobs_title}
              </h4>
              <p className="text-xs text-zinc-400 font-sans max-w-sm mx-auto">
                {translations[language].empty_jobs_desc}
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <NeonCard
                key={job.id}
                onClick={() => setSelectedJob(job)}
                glowColor={job.urgency === "immediate" ? "red" : "gold"}
                className="hover:scale-[1.01] active:scale-100 p-4"
              >
                <div className="flex justify-between items-start gap-1 pb-2">
                  <div className="space-y-1 min-w-0">
                    <header className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold leading-none select-none ${
                        job.urgency === "immediate"
                          ? "bg-cyber-red/10 text-cyber-red border border-cyber-red/30 animate-pulse"
                          : "bg-cyber-surface text-cyber-muted border border-cyber-cream/5"
                      }`}>
                        {job.category.toUpperCase()}
                      </span>
                      {job.status === "completed" && (
                        <span className="px-1.5 py-0.5 bg-cyber-mint/10 text-cyber-mint font-mono text-[8px] rounded font-bold border border-cyber-mint/30">
                          FINISHED
                        </span>
                      )}
                    </header>
                    <h3 className="font-display font-bold text-cyber-cream text-sm truncate leading-tight select-none">
                      {job.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-cyber-mint font-display font-medium text-xs">{job.budgetKsh} Ksh</span>
                    <span className="text-[9px] text-[#696C83] font-mono block uppercase leading-none">Limit</span>
                  </div>
                </div>

                <p className="font-sans text-[11px] text-cyber-muted line-clamp-2 leading-relaxed mb-3">
                  {job.description}
                </p>

                <footer className="border-t border-cyber-cream/10 pt-2.5 flex justify-between items-center font-mono text-[9px] text-[#868A9E]">
                  <span className="flex items-center"><MapPin className="w-3 h-3 text-cyber-red mr-0.5" /> {job.locationName}</span>
                  <span className="flex items-center gap-1 bg-[#182052] px-2 py-0.5 rounded text-cyber-gold font-bold">
                    <MessageSquare className="w-3 h-3" /> {job.bids?.length || 0} PROPOSALS
                  </span>
                </footer>
              </NeonCard>
            ))
          )}
        </div>
      ) : (
        // Post job form
        <form onSubmit={handleSubmitJob} className="p-5 bg-cyber-surface/90 border border-cyber-cream/15 rounded-md space-y-3.5 font-mono text-xs">
          <header className="border-b border-cyber-cream/15 pb-2">
            <h3 className="font-display font-bold text-sm text-cyber-gold flex items-center gap-1.5 uppercase">
              <PlusCircle className="w-4 h-4" /> BROADCAST COMPLIANT SERVICE GIG
            </h3>
            <p className="text-[10px] text-cyber-muted pt-0.5 uppercase">Posts to local area fundi network automatically</p>
          </header>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">PROJECT TITLE / TOPIC</label>
            <input
              type="text"
              placeholder="e.g. Solar hybrid inverter short-circuit diagnostic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-3 py-2 text-cyber-cream focus:outline-hidden focus:border-cyber-gold/50 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted">TRADE DIVISION</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-2 text-cyber-cream focus:outline-hidden text-[11px]"
              >
                <option value="Electrical">ELECTRICAL / AC GRID</option>
                <option value="Plumbing">PLUMBING / FILTERS</option>
                <option value="Smart Tech">SMART TECH / CHIPS</option>
                <option value="Masonry">MASONRY / ROOFING</option>
                <option value="Carpentry">CARPENTRY / FRAMING</option>
                <option value="Solar Energy">SOLAR ENERGY / POWER</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted">BUDGET CASH limit (Ksh)</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-1.5 text-cyber-cream focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">TOWNSHIPS / SUB-LOCATION IN EST</label>
            <input
              type="text"
              placeholder="e.g. Kangemi Central Sector 2, Nairobi"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-3 py-2 text-cyber-cream focus:outline-hidden font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-cyber-muted">JOB SCOPE & TECHNICAL FAULT WORKFLOW DESCRIPTION</label>
            <textarea
              rows={3}
              placeholder="In-depth details of what needs to be fixed, what wiring/tools are required..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim() === "") {
                  setAiSuggestions([]);
                }
              }}
              className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded p-2.5 text-cyber-cream focus:outline-hidden font-sans text-xs"
            />
            {description.trim().length > 10 && (
              <div className="pt-2 flex flex-col gap-2 bg-[#0c102a]/65 p-2.5 rounded border border-cyber-gold/10">
                <div className="flex justify-between items-center select-none">
                  <span className="text-[9px] text-cyber-muted font-bold uppercase">GEMINI SMART CLASSIFIER</span>
                  <button
                    type="button"
                    onClick={handleRecommendCategory}
                    disabled={isSuggesting}
                    className="text-[9px] text-cyber-gold font-mono hover:underline flex items-center gap-1 uppercase bg-cyber-gold/10 px-2 py-0.5 rounded border border-cyber-gold/30 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-cyber-gold animate-pulse" />
                    {isSuggesting ? "PROCESSING..." : "SUGGEST TRADES"}
                  </button>
                </div>
                {aiSuggestions.length > 0 && (
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[8px] text-zinc-500 uppercase">Select suitable category to apply to Trade Division:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSuggestions.map((sug, i) => {
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (sug.toLowerCase().includes("electric")) setCategory("Electrical");
                              else if (sug.toLowerCase().includes("plumb")) setCategory("Plumbing");
                              else if (sug.toLowerCase().includes("smart") || sug.toLowerCase().includes("control") || sug.toLowerCase().includes("cyber")) setCategory("Smart Tech");
                              else if (sug.toLowerCase().includes("mason") || sug.toLowerCase().includes("brick") || sug.toLowerCase().includes("roof")) setCategory("Masonry");
                              else if (sug.toLowerCase().includes("carpent") || sug.toLowerCase().includes("wood")) setCategory("Carpentry");
                              else if (sug.toLowerCase().includes("solar") || sug.toLowerCase().includes("power") || sug.toLowerCase().includes("energy")) setCategory("Solar Energy");
                              else setCategory(sug);
                            }}
                            className="bg-[#05081c] hover:bg-cyber-gold/20 text-cyber-gold px-2 py-1 rounded text-[10px] font-mono border border-cyber-gold/20 select-none cursor-pointer"
                          >
                            + {sug.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted font-bold">CLI NAME</label>
              <input
                type="text"
                placeholder="e.g. Amina"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-2 text-cyber-cream focus:outline-hidden font-sans"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-cyber-muted block">CLI TELEMETRY PHONE</label>
              <input
                type="text"
                placeholder="e.g. +254 ..."
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[#0A0E27] border border-cyber-cream/15 rounded px-2.5 py-2 text-cyber-cream focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1.5">
            <span className="text-[9px] text-cyber-muted block uppercase mb-1">URGENCY PROTOCOL STATE</span>
            <div className="grid grid-cols-3 gap-2">
              {(["immediate", "standard", "scheduled"] as const).map((urg) => (
                <button
                  key={urg}
                  type="button"
                  onClick={() => setUrgency(urg)}
                  className={`py-1 rounded text-[10px] font-bold border transition ${
                    urgency === urg
                      ? urg === "immediate"
                        ? "bg-cyber-red text-cyber-cream border-cyber-red font-extrabold shadow-neon-red/30"
                        : "bg-cyber-gold text-cyber-midnight border-cyber-gold font-extrabold"
                      : "bg-[#0A0E27] text-cyber-muted border-cyber-cream/10 hover:border-cyber-cream/35"
                  }`}
                >
                  {urg.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {formError && (
            <div className="p-2.5 bg-cyber-red/10 border border-cyber-red/20 rounded-xl text-cyber-red text-xs">
              <strong>⚠️ Warning:</strong> {formError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-cyber-gold text-cyber-midnight font-display font-bold rounded text-xs select-none cursor-pointer transform hover:scale-[1.01] transition border-b-2 border-orange-600 uppercase"
          >
            TRANSMIT BROADCAST ON CHAIN
          </button>
        </form>
      )}
    </div>
  );
}
