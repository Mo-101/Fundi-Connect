import React, { useState, useEffect } from "react";
import { translations } from "../lib/translations";
import { Quote, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BarazaWisdomProps {
  language: "eng" | "swa" | "sheng";
}

export function BarazaWisdom({ language }: BarazaWisdomProps) {
  const proverbs = translations[language].proverbs_list;
  const [proverbIdx, setProverbIdx] = useState(0);

  // Auto rotate proverbs gently every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setProverbIdx((prev) => (prev + 1) % proverbs.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [proverbs.length]);

  // Handle manual refresh/ponder next
  const handleRandomize = () => {
    setProverbIdx((prev) => (prev + 1) % proverbs.length);
  };

  return (
    <div className="relative overflow-hidden bg-[#181109]/45 border border-amber-500/20 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none">
      {/* Dynamic ambient sun gold background aura */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex gap-3.5 items-start">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-cyber-gold rounded-xl shrink-0 mt-0.5">
          <Quote className="w-5 h-5" />
        </div>
        
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-cyber-gold font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{translations[language].baraza_wisdom_title}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={`${language}-${proverbIdx}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.3 }}
              className="text-amber-100 font-sans italic text-sm md:text-base leading-relaxed font-medium"
            >
              "{proverbs[proverbIdx] || proverbs[0]}"
            </motion.p>
          </AnimatePresence>

          <p className="font-mono text-[8px] text-amber-500/60 uppercase">
            — Sitting under mabati shade, sharing chai & trusting neighbors
          </p>
        </div>
      </div>

      <button
        onClick={handleRandomize}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 rounded-lg text-[9px] font-mono text-cyber-gold uppercase tracking-wider cursor-pointer font-bold select-none hover:scale-[1.02] transition active:scale-100"
      >
        <RefreshCw className="w-3 h-3 text-cyber-gold animate-spin-slow" />
        {language === "eng" ? "Ponder Next" : language === "swa" ? "Tafakari Busara" : "Busara Next"}
      </button>
    </div>
  );
}
