/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Worker } from "../types";
import { Search, Star, Shield, Smartphone, ArrowRight, MapPin, Radio, Coins, Activity } from "lucide-react";
import { NeonCard } from "./CyberDeck";

interface WorkerCatalogProps {
  workers: Worker[];
  language: "eng" | "swa" | "sheng";
  onSelectWorker: (worker: Worker) => void;
  onPostJobDirect?: (worker: Worker) => void;
}

export function WorkerCatalog({ workers, language, onSelectWorker, onPostJobDirect }: WorkerCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterOnline, setFilterOnline] = useState<boolean>(false);
  const [filterVerified, setFilterVerified] = useState<boolean>(false);

  // Filter skills taxonomy
  const categories = ["All", "Electrical", "Plumbing", "Smart Tech", "Masonry", "Carpentry", "Solar Energy"];

  const filteredWorkers = workers.filter((worker) => {
    const matchesCategory = selectedCategory === "All" || worker.category === selectedCategory;
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.subSkills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      worker.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !filterOnline || worker.isOnline;
    const matchesVerified = !filterVerified || worker.isVerified;

    return matchesCategory && matchesSearch && matchesOnline && matchesVerified;
  });

  const getPlaceholder = () => {
    if (language === "sheng") return "Saka fundi, ujanja, au mtaa wa Nairobi...";
    if (language === "swa") return "Tafuta fundi, ufundi, au mtaa...";
    return "Search fundi, skill, or neighborhood...";
  };

  const getOnlineLabel = () => {
    if (language === "sheng") return "● WAKO CODE ACTIVE (ONLINE)";
    if (language === "swa") return "● MAFUNDI WA SASA (ONLINE)";
    return "● CURRENTLY ONLINE";
  };

  const getVerifiedLabel = () => {
    if (language === "sheng") return "🛡️ MAVOUCHI WA WAZEE";
    if (language === "swa") return "🛡️ ALAMA YA UAMINIFU (VERIFIED)";
    return "🛡️ TRUST BADGE (VERIFIED)";
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-cyber-muted" />
        <input
          type="text"
          placeholder={getPlaceholder()}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-10 py-2.5 font-sans text-xs text-cyber-cream placeholder-cyber-muted focus:outline-hidden focus:border-cyber-gold/50 transition-all font-medium"
        />
      </div>

      {/* Categories horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 select-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-250 cursor-pointer ${
              selectedCategory === cat
                ? "bg-cyber-gold text-zinc-950 font-bold border border-cyber-gold shadow-sm"
                : "bg-zinc-900 border border-white/[0.05] text-cyber-muted hover:text-cyber-cream hover:border-white/[0.15]"
            }`}
          >
            {cat === "All" 
              ? (language === "eng" ? "ALL" : language === "swa" ? "WOTE" : "WOTE")
              : cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Fast toggles */}
      <div className="flex gap-4 px-1 py-1 text-xs select-none">
        <label className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-muted cursor-pointer hover:text-cyber-cream">
          <input
            type="checkbox"
            checked={filterOnline}
            onChange={(e) => setFilterOnline(e.target.checked)}
            className="rounded border-none accent-cyber-mint bg-zinc-900"
          />
          <span className={filterOnline ? "text-cyber-mint font-bold" : ""}>{getOnlineLabel()}</span>
        </label>
        <label className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-muted cursor-pointer hover:text-cyber-cream">
          <input
            type="checkbox"
            checked={filterVerified}
            onChange={(e) => setFilterVerified(e.target.checked)}
            className="rounded border-none accent-cyber-gold bg-zinc-900"
          />
          <span className={filterVerified ? "text-cyber-gold font-bold" : ""}>{getVerifiedLabel()}</span>
        </label>
      </div>

      {/* Workers count */}
      <div className="flex justify-between items-center px-1 font-mono text-[10px] text-zinc-500">
        <span>
          {language === "eng" 
            ? `FOUND: ${filteredWorkers.length} SERVICE EXPERTS` 
            : language === "swa" 
            ? `IDADI YA MAFUNDI: ${filteredWorkers.length} WALIOPO` 
            : `MAJAHAA WA KAZI: ${filteredWorkers.length} WAKO RADA`}
        </span>
        <span>NAIROBI PORT // JUA KALI TECH</span>
      </div>

      {/* Workers grid */}
      <div className="space-y-3.5">
        {filteredWorkers.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/60 rounded-[1.5rem] border border-dashed border-white/[0.08] space-y-2">
            <span className="text-xl text-cyber-gold select-none">⚡</span>
            <h4 className="font-sans font-black text-white text-sm uppercase tracking-tight">
              {language === "eng" 
                ? "No active fundis found" 
                : language === "swa" 
                ? "Hakuna mafundi walipatikana" 
                : "Hakuna msee wa kuunda ameweza kupatikana"}
            </h4>
            <p className="font-sans text-xs text-cyber-muted max-w-xs mx-auto">
              {language === "eng" 
                ? "Try resetting the filters or dial *384# for offline local assistance." 
                : language === "swa" 
                ? "Jaribu kufuta vichujio vingine au piga nambari ya simu ya offline kupitia *384#." 
                : "Futa hizi filter kwanza mkuu au vuta simulation ya piga nambari *384# ucheki form ya offline."}
            </p>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <NeonCard
              key={worker.id}
              onClick={() => onSelectWorker(worker)}
              glowColor={worker.isOnline ? "mint" : "gold"}
              className="p-4"
            >
              <div className="flex gap-3.5">
                {/* Avatar area */}
                <div className="relative isolate shrink-0">
                  <img
                    src={worker.avatar}
                    alt={worker.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl border-2 border-zinc-950 object-cover"
                  />
                  {worker.isOnline ? (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-cyber-mint border-2 border-zinc-900 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                  ) : (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-cyber-muted border-2 border-zinc-900 rounded-full" />
                  )}
                </div>

                {/* Info block */}
                <div className="flex-1 min-w-0 space-y-1">
                  <header className="flex justify-between items-start">
                    <h3 className="font-sans font-bold text-cyber-cream text-sm truncate leading-tight flex items-center gap-1.5">
                      {worker.name}
                      {worker.isVerified && (
                        <span className="shrink-0 flex items-center bg-cyber-gold/10 px-1.5 py-0.5 rounded-full text-[9px] text-cyber-gold border border-cyber-gold/20 font-mono scale-90">
                          <Shield className="w-2.5 h-2.5 inline fill-cyber-gold/15 mr-0.5" />
                          {worker.verificationLevel}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-0.5 text-cyber-gold font-mono text-xs shrink-0 pl-1">
                      <Star className="w-3.5 h-3.5 fill-cyber-gold stroke-none" />
                      <span className="font-bold">{worker.rating}</span>
                    </div>
                  </header>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-zinc-500 font-mono text-[10px]">
                    <span className="text-cyber-mint uppercase font-bold text-[9px]">{worker.category}</span>
                    <span className="select-none text-zinc-700">•</span>
                    <span className="flex items-center text-zinc-400">
                      <MapPin className="w-2.5 h-2.5 mr-0.5 text-cyber-red" />
                      {worker.locationName}
                    </span>
                  </div>

                  {/* Skills preview tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {worker.subSkills.slice(0, 2).map((skill, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-zinc-950/70 rounded text-[9px] text-zinc-400 font-mono border border-white/[0.04] uppercase">
                        {skill}
                      </span>
                    ))}
                    {worker.subSkills.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-zinc-800 text-cyber-gold font-mono text-[9px] rounded font-bold">
                        +{worker.subSkills.length - 2} MORE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic bottom strip within card */}
              <div className="mt-3.5 border-t border-white/[0.05] pt-2.5 flex justify-between items-center font-mono">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-zinc-500 uppercase leading-none">
                    {language === "eng" ? "Standard Rate" : language === "swa" ? "Gharama ya Kawaida" : "Bei ya Kawaida"}
                  </p>
                  <p className="text-xs text-cyber-cream font-bold">{worker.hourlyRateKsh} Ksh <span className="font-normal text-[10px] text-zinc-500">/ hr</span></p>
                </div>

                <div className="flex gap-2">
                  {worker.hasUssdFallback && (
                    <span
                      title="USSD Safe Fallback Protocol Enabled"
                      className="px-1.5 rounded-lg flex items-center justify-center bg-cyber-gold/10 border border-cyber-gold/20 text-cyber-gold py-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorker(worker);
                    }}
                    className="px-3 py-1 bg-zinc-800 text-[#fafafa] rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    {language === "eng" ? "VIEW PROFILE" : language === "swa" ? "TAZAMA WASIFU" : "CHEKI FUNDI"}{" "}
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </NeonCard>
          ))
        )}
      </div>
    </div>
  );
}
