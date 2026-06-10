/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  initialWorkers, 
  initialJobs, 
  initialCommunityPosts, 
  mockAsanteDrops,
  getCyberAvatar 
} from "./mockData";
import { Worker, Job, CommunityPost, AsanteDrop, JobBid } from "./types";
import { 
  KenteStrip, 
  WovenGrid, 
  NeonCard, 
  UssdSimulator 
} from "./components/CyberDeck";
import { WorkerCatalog } from "./components/WorkerCatalog";
import { JobExplorer } from "./components/JobExplorer";
import { CommunityForum } from "./components/CommunityForum";
import { PaymentsCenter } from "./components/PaymentsCenter";

// Newly Integrated Functional Modifiers & Views
import { OnboardingView } from "./components/OnboardingView";
import { RegisterWorkerWizard } from "./components/RegisterWorkerWizard";
import { CategoryDetailView } from "./components/CategoryDetailView";
import { VerifyWorkerKyc } from "./components/VerifyWorkerKyc";
import { AsanteDropCenter } from "./components/AsanteDropCenter";
import { DashboardContainer } from "./components/DashboardContainer";
import { UserProfileView } from "./components/UserProfileView";
import { aiService } from "./lib/aiService";
import { calculateTrustScore, updateWorkerTrust } from "./utils/trust";
import { ServiceAreaVisualizer } from "./components/ServiceAreaVisualizer";
import { translations } from "./lib/translations";
import { BarazaWisdom } from "./components/BarazaWisdom";

import { 
  Smartphone, 
  Wifi, 
  Cpu, 
  Battery, 
  ShieldCheck, 
  HelpCircle, 
  User, 
  MapPin, 
  Star,
  SmartphoneNfc,
  Coins,
  Send,
  Sparkles,
  ExternalLink,
  Info,
  Layers,
  CheckCircle,
  Clock,
  Menu,
  Activity,
  ArrowRight,
  TrendingUp,
  Receipt,
  Globe,
  MessageSquare,
  Lock,
  Boxes
} from "lucide-react";

export default function App() {
  // Database States
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [posts, setPosts] = useState<CommunityPost[]>(initialCommunityPosts);
  const [drops, setDrops] = useState<AsanteDrop[]>(mockAsanteDrops);

  // Router and Active State Controls
  const [activeTab, setActiveTab] = useState<"standby" | "gigs" | "community" | "payments" | "dashboard" | "profile">("standby");
  const [language, setLanguage] = useState<"eng" | "swa" | "sheng">("eng");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [trustInsight, setTrustInsight] = useState<string>("");
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);

  useEffect(() => {
    if (selectedWorker) {
      setIsLoadingInsight(true);
      setTrustInsight("Synchronizing ledger metrics & generating AI-Insight...");
      
      // Calculate trust score
      calculateTrustScore(selectedWorker.id).then((score) => {
        setCalculatedScore(score);
      });

      // Update trust level on the back end
      updateWorkerTrust(selectedWorker.id);

      // Generate AI-Insight from Gemini via aiService
      aiService.getTrustInsight(selectedWorker).then((insight) => {
        setTrustInsight(insight);
        setIsLoadingInsight(false);
      }).catch((err) => {
        console.error("Failed to generate trust insight:", err);
        setTrustInsight("Profile verified via SkillMesh protocol.");
        setIsLoadingInsight(false);
      });
    } else {
      setCalculatedScore(null);
      setTrustInsight("");
    }
  }, [selectedWorker]);
  const [isUssdOpen, setIsUssdOpen] = useState(false);

  // High-fidelity Sandbox Personas & Interactive Overlays
  const [currentUserRole, setCurrentUserRole] = useState<"client" | "worker" | "introducer" | "guest">("client");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [tipTargetName, setTipTargetName] = useState("");
  const [guestViewState, setGuestViewState] = useState<"onboarding" | "register-wizard" | "dashboard-view">("onboarding");

  // Local state properties for custom worker simulation
  const [workerNameSim, setWorkerNameSim] = useState("Juma Kamau");

  // Time stamp state (East Africa Time: UTC +3)
  const [eatTime, setEatTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      // Create EAT time string (UTC +3)
      const date = new Date();
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const eat = new Date(utc + (3600000 * 3));
      setEatTime(eat.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper callbacks
  const handleAddNewJob = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
  };

  const handlePlaceBid = (jobId: string, newBid: JobBid) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          bids: [...(job.bids || []), newBid]
        };
      }
      return job;
    }));
  };

  const handleAddNewPost = (newPost: CommunityPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleAddNewDrop = (newDrop: AsanteDrop) => {
    setDrops([newDrop, ...drops]);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-cyber-midnight tech-grid text-cyber-cream flex flex-col justify-between overflow-x-hidden select-text">
      {/* Dynamic woven grid background design */}
      <WovenGrid />

      {/* STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-cyber-gold flex items-center justify-center font-display font-black text-zinc-950 text-sm italic">
              F
            </div>
            <div>
              <h1 className="font-sans font-black text-lg tracking-tighter uppercase italic leading-none">
                FUNDI<span className="text-cyber-gold">.CONNECT</span>
              </h1>
              <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-widest leading-none mt-0.5">
                {translations[language].brand_msg}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
            <button onClick={() => scrollToSection("hero")} className="hover:text-cyber-cream transition cursor-pointer font-bold">HOME</button>
            <button onClick={() => { scrollToSection("mesh-terminal"); setActiveTab("standby"); }} className="hover:text-cyber-cream transition cursor-pointer">{translations[language].tab_market.toUpperCase()}</button>
            <button onClick={() => { scrollToSection("mesh-terminal"); setActiveTab("gigs"); }} className="hover:text-cyber-cream transition cursor-pointer">{translations[language].tab_gigs.toUpperCase()}</button>
            <button onClick={() => { scrollToSection("mesh-terminal"); setActiveTab("community"); }} className="hover:text-cyber-cream transition cursor-pointer">{translations[language].tab_baraza.toUpperCase()}</button>
            <button onClick={() => { scrollToSection("mesh-terminal"); setActiveTab("payments"); }} className="hover:text-cyber-cream transition cursor-pointer">{translations[language].tab_ledger.toUpperCase()}</button>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* LOCAL VOICE STYLE SWITCHER */}
            <div className="flex items-center bg-zinc-950 border border-white/[0.08] p-0.5 rounded-xl gap-0.5 select-none">
              <button
                onClick={() => setLanguage("eng")}
                className={`px-2.5 py-1 text-[8.5px] rounded-lg cursor-pointer transition-all duration-200 ${
                  language === "eng" 
                    ? "bg-cyber-gold text-zinc-950 font-black shadow-md shadow-cyber-gold/20" 
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                title="English (Friendly & Direct)"
              >
                ENG
              </button>
              <button
                onClick={() => setLanguage("swa")}
                className={`px-2.5 py-1 text-[8.5px] rounded-lg cursor-pointer transition-all duration-200 ${
                  language === "swa" 
                    ? "bg-cyber-gold text-zinc-950 font-black shadow-md shadow-cyber-gold/20" 
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                title="Kiswahili (Humble & Authentic)"
              >
                SWA
              </button>
              <button
                onClick={() => setLanguage("sheng")}
                className={`px-2.5 py-1 text-[8.5px] rounded-lg cursor-pointer transition-all duration-200 ${
                  language === "sheng" 
                    ? "bg-cyber-gold text-zinc-950 font-black shadow-md shadow-cyber-gold/20" 
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                title="Sheng (Street & Micro-Humor)"
              >
                SHENG
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-white/[0.08] rounded-full text-zinc-400 text-[10px]">
              <Clock className="w-3.5 h-3.5 text-cyber-gold animate-pulse" /> {eatTime || "14:10:10 EAT"}
            </div>
            <button 
              onClick={() => setIsUssdOpen(true)}
              className="px-3.5 py-1.5 bg-[#E63946]/10 hover:bg-[#E63946]/20 text-cyber-red border border-cyber-red/30 rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer flex items-center gap-1"
            >
              <SmartphoneNfc className="w-3 h-3 text-cyber-red" /> {translations[language].dial_code}
            </button>
          </div>
        </div>
      </nav>

      {/* AFROFUTURIST HERO ZONE */}
      <header id="hero" className="relative w-full overflow-hidden py-14 md:py-20 border-b border-white/[0.06] select-none z-10 bg-gradient-to-b from-zinc-950 to-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-gold/10 border border-cyber-gold/20 text-cyber-gold text-[10px] font-mono rounded-full font-semibold uppercase tracking-wider">
              <Activity className="w-3 h-3 text-cyber-gold animate-pulse" /> {translations[language].hero_tag}
            </div>

            <h1 className="font-sans font-black text-4xl md:text-5xl lg:text-5xl tracking-tight uppercase leading-[0.95] text-white">
              {translations[language].hero_title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-gold via-cyber-red to-cyber-mint select-all">
                {translations[language].hero_title_accent}
              </span>
            </h1>

            <p className="font-sans text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">
              {translations[language].hero_desc}
            </p>

            <KenteStrip className="h-1.5 rounded-full" />

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  scrollToSection("mesh-terminal");
                  setActiveTab("standby");
                }}
                className="px-6 py-3 bg-cyber-gold hover:bg-cyber-gold/90 text-zinc-950 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg shadow-cyber-gold/10"
              >
                {translations[language].btn_terminal} <ArrowRight className="w-4 h-4 text-zinc-950" />
              </button>
              <button
                onClick={() => setIsUssdOpen(true)}
                className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-cyber-cream rounded-xl border border-white/[0.08] font-sans font-bold text-xs uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
              >
                {translations[language].btn_emulator}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/60 border border-white/[0.05] rounded-3xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyber-gold/10 flex items-center justify-center text-cyber-gold text-lg">
                📱
              </div>
              <h3 className="font-sans font-extrabold text-[#fafafa] text-sm uppercase">{translations[language].feature_offline_title}</h3>
              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                {translations[language].feature_offline_desc}
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-white/[0.05] rounded-3xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyber-mint/10 flex items-center justify-center text-cyber-mint text-lg">
                🪙
              </div>
              <h3 className="font-sans font-extrabold text-[#fafafa] text-sm uppercase">{translations[language].feature_escrow_title}</h3>
              <p className="text-[11px] text-zinc-400 leading-normal font-sans">
                {translations[language].feature_escrow_desc}
              </p>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-white/[0.05] rounded-3xl space-y-2 col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyber-violet/10 flex items-center justify-center text-cyber-violet text-lg shrink-0">
                  🛡️
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-[#fafafa] text-sm uppercase">{translations[language].feature_kiosk_title}</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal font-sans mt-0.5">
                    {translations[language].feature_kiosk_desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN OPERATIONAL TERMINAL WORKSPACE */}
      <main id="mesh-terminal" className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10">
        
        {/* LEFT COLUMN: Mesh Console operations & workspace tabs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* MESH PERSONA SANDBOX CONTROLLER PANEL */}
          <div className="bg-[#0f1122]/90 border border-cyber-gold/30 p-3.5 rounded-2xl space-y-2 select-none">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-mono text-[9px] uppercase font-black text-cyber-gold tracking-widest leading-none gap-2">
              <span>⚡ {translations[language].persona_title.toUpperCase()}</span>
              <span className="text-cyber-mint animate-pulse font-bold">● {translations[language].persona_subtitle.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[9.5px]">
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("client");
                  setActiveTab("dashboard");
                }}
                className={`py-2 px-2.5 rounded-xl border font-bold text-center cursor-pointer transition uppercase ${
                  currentUserRole === "client"
                    ? "bg-cyber-gold border-cyber-gold text-zinc-950 font-black shadow-[0_0_8px_rgba(255,180,0,0.15)]"
                    : "bg-zinc-950/80 border-white/[0.05] text-zinc-400 hover:text-white"
                }`}
              >
                {translations[language].persona_client}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("worker");
                  setActiveTab("dashboard");
                }}
                className={`py-2 px-2.5 rounded-xl border font-bold text-center cursor-pointer transition uppercase ${
                  currentUserRole === "worker"
                    ? "bg-cyber-gold border-cyber-gold text-zinc-950 font-black shadow-[0_0_8px_rgba(255,180,0,0.15)]"
                    : "bg-zinc-950/80 border-white/[0.05] text-zinc-400 hover:text-white"
                }`}
              >
                {translations[language].persona_fundi}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("introducer");
                  setActiveTab("dashboard");
                }}
                className={`py-2 px-2.5 rounded-xl border font-bold text-center cursor-pointer transition uppercase ${
                  currentUserRole === "introducer"
                    ? "bg-cyber-gold border-cyber-gold text-zinc-950 font-black shadow-[0_0_8px_rgba(255,180,0,0.15)]"
                    : "bg-zinc-950/80 border-white/[0.05] text-zinc-400 hover:text-white"
                }`}
              >
                {translations[language].persona_elder}
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentUserRole("guest");
                  setGuestViewState("onboarding");
                  setActiveTab("dashboard");
                }}
                className={`py-2 px-2.5 rounded-xl border font-bold text-center cursor-pointer transition uppercase ${
                  currentUserRole === "guest"
                    ? "bg-cyber-gold border-cyber-gold text-zinc-950 font-black shadow-[0_0_8px_rgba(255,180,0,0.15)]"
                    : "bg-zinc-950/80 border-white/[0.05] text-zinc-400 hover:text-white"
                }`}
              >
                {translations[language].persona_guest}
              </button>
            </div>
          </div>
           
          {/* Main Workspace Navigation Controls */}
          <div className="bg-zinc-900/90 border border-white/[0.08] p-1.5 rounded-2xl grid grid-cols-2 sm:grid-cols-6 gap-1 select-none">
            <button
              onClick={() => { setActiveTab("standby"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "standby" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{translations[language].tab_market}</span>
            </button>

            <button
              onClick={() => { setActiveTab("gigs"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "gigs" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{translations[language].tab_gigs}</span>
            </button>

            <button
              onClick={() => { setActiveTab("community"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "community" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Menu className="w-3.5 h-3.5" />
              <span>{translations[language].tab_baraza}</span>
            </button>

            <button
              onClick={() => { setActiveTab("payments"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "payments" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{translations[language].tab_ledger}</span>
            </button>

            <button
              onClick={() => { setActiveTab("dashboard"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "dashboard" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{translations[language].tab_workbench}</span>
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setSelectedWorker(null); setSelectedCategory(null); setIsKycOpen(false); }}
              className={`px-2.5 py-3 rounded-xl font-mono text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 shrink-0 ${
                activeTab === "profile" 
                  ? "bg-cyber-gold text-zinc-950" 
                  : "bg-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{translations[language].tab_standing}</span>
            </button>
          </div>
           
          {/* ACTIVE PORTAL SCREENS AREA */}
          <div className="space-y-4">
            
            {selectedWorker ? (
              // Enhanced detailed worker profile layout
              <div className="space-y-4 pt-1">
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="text-xs font-mono text-cyber-gold hover:text-cyber-gold/80 flex items-center gap-1.5 cursor-pointer"
                >
                  {translations[language].back_to_catalog}
                </button>

                <NeonCard glowColor="gold" title={`${translations[language].worker_profile_title}: ${selectedWorker.name}`}>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Left Column Profile Pic & basic details */}
                    <div className="md:col-span-4 flex flex-col items-center text-center space-y-3">
                      <div className="relative">
                        <img
                          src={selectedWorker.avatar}
                          alt={selectedWorker.name}
                          referrerPolicy="no-referrer"
                          className="w-28 h-28 rounded-2xl border-2 border-cyber-gold object-cover"
                        />
                        {selectedWorker.isOnline && (
                          <span className="absolute bottom-1 right-1 w-4 h-4 bg-cyber-mint border-2 border-zinc-900 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                        )}
                      </div>

                      <div className="space-y-1 select-none">
                        <h4 className="font-sans font-bold text-base text-white">{selectedWorker.name}</h4>
                        <p className="text-[10px] text-cyber-mint font-mono font-bold uppercase">{selectedWorker.category}</p>
                        <p className="text-zinc-500 font-mono text-[9px] flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-cyber-red" /> {selectedWorker.locationName}
                        </p>
                      </div>

                      <div className="w-full pt-2 border-t border-white/[0.04] space-y-1 pb-2">
                        <span className="px-2.5 py-0.5 bg-cyber-gold/10 text-cyber-gold text-[10px] font-mono rounded-full font-bold uppercase border border-cyber-gold/20 inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED: {selectedWorker.verificationLevel}
                        </span>
                      </div>

                      {/* SERVICE AREA D3 VISUALIZER MAP */}
                      <div className="w-full pt-2 border-t border-white/[0.04]">
                        <ServiceAreaVisualizer worker={selectedWorker} language={language} />
                      </div>
                    </div>

                    {/* Right Column details */}
                    <div className="md:col-span-8 space-y-4">
                      <div>
                        <span className="font-mono text-[9px] text-zinc-500 block uppercase">{translations[language].detail_bio}</span>
                        <p className="font-sans text-sm text-zinc-300 leading-relaxed italic">"{selectedWorker.bio}"</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-zinc-950 border border-white/[0.05] rounded-xl">
                          <span className="font-mono text-[8px] text-zinc-500 block uppercase">{translations[language].detail_rate}</span>
                          <span className="font-sans text-xs text-cyber-cream font-bold">{selectedWorker.hourlyRateKsh} Ksh / hr</span>
                        </div>
                        <div className="p-3 bg-zinc-950 border border-white/[0.05] rounded-xl">
                          <span className="font-mono text-[8px] text-zinc-500 block uppercase">{translations[language].detail_completed}</span>
                          <span className="font-sans text-xs text-cyber-mint font-bold">{selectedWorker.completedJobsCount} jobs</span>
                        </div>
                        <div className="p-3 bg-zinc-950 border border-white/[0.05] rounded-xl col-span-2 md:col-span-1">
                          <span className="font-mono text-[8px] text-zinc-500 block uppercase">{translations[language].detail_rating}</span>
                          <span className="font-sans text-xs text-cyber-gold font-bold flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 fill-cyber-gold stroke-none" /> 4.9 / 5.0
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="font-mono text-[9px] text-zinc-500 block mb-1.5 uppercase">{translations[language].detail_specialty}</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedWorker.subSkills.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-zinc-950 border border-white/[0.08] rounded-lg font-mono text-[10px] text-cyber-gold font-bold uppercase">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* SKILLMESH TRUST LEDGER & AI INSIGHT INTEGRATION */}
                      <div className="p-3.5 bg-[#0a0d24]/60 border border-cyber-gold/20 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-cyber-gold uppercase font-black">
                            <Sparkles className={`w-3.5 h-3.5 ${isLoadingInsight ? "animate-spin text-cyber-gold animate-duration-1000" : "text-cyber-gold"}`} />
                            <span>{translations[language].trust_logs_title.toUpperCase()}</span>
                          </div>
                          {calculatedScore !== null && (
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-cyber-gold/10 text-cyber-gold border border-cyber-gold/30 rounded-md font-bold">
                              {translations[language].trust_index_title.toUpperCase()}: {calculatedScore}%
                            </span>
                          )}
                        </div>

                        {calculatedScore !== null && (
                          <div className="space-y-1 select-none">
                            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/[0.05]">
                              <div 
                                className="h-full bg-linear-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-1000"
                                style={{ width: `${calculatedScore}%` }}
                              />
                            </div>
                            <div className="flex justify-between font-mono text-[8px] text-zinc-500 uppercase">
                              <span>0% STANDING</span>
                              <span>{translations[language].trust_verification_metric}</span>
                              <span>100% MAXIMUM ELDER-VOUCHED</span>
                            </div>
                          </div>
                        )}

                        <div className="bg-[#030616]/80 p-2.5 rounded-lg border border-white/[0.04]">
                          <span className="font-mono text-[8px] text-zinc-500 block uppercase mb-1">{translations[language].ai_validation_title}</span>
                          <p className="font-sans text-xs text-[#fafafa] leading-relaxed">
                            {trustInsight}
                          </p>
                        </div>
                      </div>

                      {/* Client reviews feed */}
                      <div className="pt-3 border-t border-white/[0.05] space-y-2">
                        <h4 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AUTHENTIC CLIENT REVIEWS</h4>
                        {selectedWorker.reviews && selectedWorker.reviews.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedWorker.reviews.map((rev) => (
                              <div key={rev.id} className="p-3 bg-zinc-950 rounded-xl text-xs font-sans border border-white/[0.02]">
                                <header className="flex justify-between items-center mb-1 select-none">
                                  <span className="font-mono text-[10px] text-cyber-gold font-bold">{rev.reviewerName}</span>
                                  <span className="flex items-center text-cyber-gold font-mono text-[9px] bg-cyber-gold/5 px-1.5 py-0.5 rounded-full border border-cyber-gold/10">
                                    <Star className="w-3 h-3 fill-cyber-gold stroke-none inline mr-0.5 animate-pulse" /> {rev.rating}
                                  </span>
                                </header>
                                <p className="text-zinc-400 italic">"{rev.comment}"</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 bg-[#181109]/20 border border-amber-500/10 rounded-xl text-center space-y-1">
                            <p className="font-sans font-bold text-zinc-300 text-[11px] uppercase tracking-wide">
                              {translations[language].empty_comments_title}
                            </p>
                            <p className="font-sans text-[10px] text-zinc-500 italic">
                              {translations[language].empty_comments_desc}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 flex gap-2 justify-end">
                        <button 
                          onClick={() => {
                            setActiveTab("payments");
                            setSelectedWorker(null);
                          }}
                          className="px-4 py-2 bg-cyber-gold text-zinc-950 text-[10px] font-sans font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                        >
                          PROPOSE CELO AGENT ESCROW
                        </button>
                      </div>

                    </div>
                  </div>
                </NeonCard>
              </div>
            ) : (
              // Standard Tab screens rendered wide!
              <div className="space-y-4 min-h-[400px]">
                <BarazaWisdom language={language} />
                {/* INTERCEPT 1: ID SCAN UPLOAD AND VERIFICATIONS */}
                {isKycOpen ? (
                  <VerifyWorkerKyc
                    onBack={() => setIsKycOpen(false)}
                    onSubmitted={() => {
                      setIsKycOpen(false);
                      alert("National ID verified successfully on the peer ledger! Search priority boosted.");
                    }}
                  />
                ) : selectedCategory ? (
                  /* INTERCEPT 2: CATEGORY SPECIALTY BROWSER */
                  <CategoryDetailView
                    category={selectedCategory}
                    workers={workers}
                    onBack={() => setSelectedCategory(null)}
                    onBookWorker={(w) => {
                      setSelectedCategory(null);
                      scrollToSection("mesh-terminal");
                      setActiveTab("gigs");
                      alert(`Opening active dispatch system. Complete the bid specification to schedule ${w.name} matching ${w.category}.`);
                    }}
                    onInitiateMessage={(wId, wName) => {
                      alert(`Transmitting cellular dispatch request to ${wName} (+254 Cell Mesh): "Hi ${wName}, please accept our repair job proposal."`);
                    }}
                  />
                ) : (
                  <>
                    {activeTab === "standby" && (
                      <div className="space-y-4">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">
                              {language === "eng" ? "FUNDI MARKET DIRECTORY" : language === "swa" ? "ORODHA YA MAFUNDI" : "KIJIWE CHA MAFUNDI"}
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                              {language === "eng" ? "COOPERATIVE LABOR MESH DIRECTORY" : language === "swa" ? "MTANDAO CHUPAVU WA WAFANYAKAZI" : "STORY ZA MAFUNDI MTAANI"}
                            </p>
                          </div>
                          <span className="hidden sm:inline px-3 py-1 bg-zinc-900 border border-white/[0.08] text-zinc-400 font-mono text-[10px] rounded-full">
                            {language === "eng" ? "ACTIVE SYNC" : language === "swa" ? "MTANDAO TAYARI" : "LUKU ONLINE"}: {workers.length} {language === "eng" ? "FUNDIS" : "MAFUNDI"}
                          </span>
                        </header>
                        
                        {/* Catalog rendered inside WorkerCatalog */}
                        <WorkerCatalog
                           workers={workers}
                           language={language}
                           onSelectWorker={setSelectedWorker}
                        />
                      </div>
                    )}

                    {activeTab === "gigs" && (
                      <div className="space-y-4">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">COOPERATIVE GIGS BOARD</h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">PEER-TO-PEER COMMUNITY LABOUR PROJECTS</p>
                          </div>
                          <span className="hidden sm:inline px-3 py-1 bg-zinc-900 border border-white/[0.08] text-zinc-400 font-mono text-[10px] rounded-full">
                            SYNCHRONIZED METRICS: {jobs.length} WORK CALLS
                          </span>
                        </header>

                        <JobExplorer
                          jobs={jobs}
                          workers={workers}
                          language={language}
                          onAddJob={handleAddNewJob}
                          onPlaceBid={handlePlaceBid}
                        />
                      </div>
                    )}

                    {activeTab === "community" && (
                      <div className="space-y-4">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">COMMUNITY BARAZA FORUMS</h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">COOPERATIVE ALERTS, MARKET RATES & SAFETY BULLETINS</p>
                          </div>
                          <span className="hidden sm:inline px-3 py-1 bg-zinc-900 border border-white/[0.08] text-zinc-400 font-mono text-[10px] rounded-full">
                            SHARED TOPICS: {posts.length} DIALOGUES
                          </span>
                        </header>

                        <CommunityForum
                          posts={posts}
                          language={language}
                          onAddPost={handleAddNewPost}
                        />
                      </div>
                    )}

                    {activeTab === "payments" && (
                      <div className="space-y-4">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">ASANTE TRADING LEDGER (MINIPAY CELO)</h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">0% COMMISSIONS DIRECT-TO-FUNDI VALUE DISTRIBUTION</p>
                          </div>
                          <span className="hidden sm:inline px-3 py-1 bg-zinc-900 border border-white/[0.08] text-zinc-400 font-mono text-[10px] rounded-full">
                            TIPIFY TRANSACTIONS: {drops.length} TRANSFERS
                          </span>
                        </header>

                        <PaymentsCenter
                          workers={workers}
                          drops={drops}
                          onAddDrop={handleAddNewDrop}
                        />
                      </div>
                    )}

                    {activeTab === "dashboard" && (
                      <div className="space-y-4 animate-fadeIn">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center select-none">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">MY WORKBENCH CONSOLE</h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">
                              Role Type Routing: {currentUserRole === "guest" ? "UNREGISTERED GUEST" : currentUserRole.toUpperCase()} ENVIRONMENT
                            </p>
                          </div>
                          <span className="hidden sm:inline px-3 py-1 bg-[#FFB400]/10 border border-[#FFB400]/30 text-cyber-gold font-mono text-[10px] rounded-full uppercase font-bold animate-pulse">
                            Secure Workspace
                          </span>
                        </header>

                        {currentUserRole === "guest" ? (
                          guestViewState === "onboarding" ? (
                            <OnboardingView
                              onSelectRole={(role) => {
                                if (role === "worker") {
                                  setGuestViewState("register-wizard");
                                } else {
                                  // Setup client defaults
                                  setCurrentUserRole("client");
                                  setActiveTab("dashboard");
                                }
                              }}
                            />
                          ) : (
                            <RegisterWorkerWizard
                              onComplete={(wData) => {
                                // Insert newly created technician into workers registry
                                setWorkers([wData, ...workers]);
                                setWorkerNameSim(wData.name);
                                setGuestViewState("dashboard-view");
                                setCurrentUserRole("worker");
                                setActiveTab("dashboard");
                              }}
                              onCancel={() => {
                                setGuestViewState("onboarding");
                              }}
                            />
                          )
                        ) : (
                          <DashboardContainer
                            language={language}
                            workers={workers}
                            jobs={jobs}
                            currentUserRole={currentUserRole}
                            currentUserName={currentUserRole === "worker" ? workerNameSim : currentUserRole === "client" ? "Saitoti Ledama" : "Elder James"}
                            currentUserLocation={currentUserRole === "worker" ? "Kasarani, Nairobi" : "Kibera Sector 3, Nairobi"}
                            currentUserPhone={currentUserRole === "worker" ? "+254 712 345 678" : "+254 754 991 102"}
                            currentUserAvatar={getCyberAvatar(currentUserRole === "worker" ? "juma" : currentUserRole === "client" ? "saitoti" : "elder")}
                            onPostJobClick={() => {
                              scrollToSection("mesh-terminal");
                              setActiveTab("gigs");
                            }}
                            onSelectCategory={(cat) => setSelectedCategory(cat)}
                            onLaunchKyc={() => setIsKycOpen(true)}
                            onLaunchTip={(name) => {
                              setTipTargetName(name);
                              setIsTipOpen(true);
                            }}
                            onUpdateJobs={(updated) => setJobs(updated)}
                            onAddPost={(title, content) => {
                              handleAddNewPost({
                                id: `post-${Date.now()}`,
                                authorName: currentUserRole === "worker" ? workerNameSim : "Saitoti Ledama",
                                authorRole: currentUserRole === "worker" ? "worker" : "client",
                                title,
                                content,
                                tags: ["Cooperative", "Trades Manual"],
                                likes: 1,
                                repliesCount: 0,
                                postedDate: "Just now"
                              });
                            }}
                          />
                        )}
                      </div>
                    )}

                    {activeTab === "profile" && (
                      <div className="space-y-4">
                        <header className="border-b border-white/[0.06] pb-3 flex justify-between items-center select-none">
                          <div>
                            <h2 className="font-sans font-black text-lg text-white uppercase tracking-tight">MEMBER SECURITY PROFILE</h2>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-0.5">LOCALIZED LEDGER STANDING FOR CURRENT SESSION</p>
                          </div>
                        </header>

                        <UserProfileView
                          name={currentUserRole === "worker" ? workerNameSim : currentUserRole === "client" ? "Saitoti Ledama" : currentUserRole === "introducer" ? "Elder James" : "Guest Node"}
                          phone={currentUserRole === "worker" ? "+254 712 345 678" : currentUserRole === "client" ? "+254 754 991 102" : "+254 Cell Range"}
                          locationName={currentUserRole === "worker" ? "Kasarani, Nairobi" : "Kibera Sector 3, Nairobi"}
                          role={currentUserRole}
                          avatar={getCyberAvatar(currentUserRole === "worker" ? "juma" : currentUserRole === "client" ? "saitoti" : "elder")}
                          completedJobsCount={currentUserRole === "worker" ? 18 : 2}
                          trustScore={95}
                          onLaunchKycClick={() => setIsKycOpen(true)}
                          onLogoutClick={() => {
                            setCurrentUserRole("guest");
                            setGuestViewState("onboarding");
                            setActiveTab("dashboard");
                            alert("Session successfully logged out. Re-directed to guest onboarding.");
                          }}
                          onNavigateTab={(tab) => {
                            setActiveTab(tab);
                            setSelectedCategory(null);
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: The Regional Network Telemetries & Side Rails (4 cols) */}
        <div className="lg:col-span-4 space-y-6 select-none">
          
          {/* OFFLINE USSD REPLICATOR GATEWAY */}
          <NeonCard glowColor="red" title="Offline Gateway Access" subLabel="USSD Network">
            <div className="space-y-4 font-sans text-xs text-[#ACAFC2]">
              <p className="leading-relaxed">
                In East African markets, up to **60% of verified handymen** operate on simple GSM feature-phones without active highspeed 5G connectivity. To enable inclusive handoff, engineers access our secure SMS queue and USSD core.
              </p>

              <div className="p-3 bg-zinc-950 border border-[#E63946]/20 rounded-xl space-y-2">
                <p className="font-mono font-bold text-cyber-red text-[10px] flex items-center gap-1.5 animate-pulse">
                  <SmartphoneNfc className="w-3.5 h-3.5 text-cyber-red" /> M-CELLULAR GSM LINK ACTIVE
                </p>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Simulate standard dial codes to query active technicians, create work orders, and review payments completely offline.
                </p>
              </div>

              <button
                onClick={() => setIsUssdOpen(true)}
                className="w-full py-3 bg-[#E63946]/10 border border-cyber-red/40 hover:border-cyber-red text-cyber-red hover:bg-[#E63946]/20 font-sans font-bold text-xs rounded-xl cursor-pointer transition uppercase tracking-wider"
              >
                DIAL CELLULAR SIMULATOR (*384#)
              </button>
            </div>
          </NeonCard>

          {/* COOPERATIVE TRUST PLATCO INDEX */}
          <NeonCard glowColor="mint" title="Operational Trust Index" subLabel="Grid State">
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-[8px] text-zinc-500 block font-bold tracking-wider">COOPERATIVE INTEGRITY</span>
                  <span className="text-sm font-bold text-cyber-mint font-sans">99.88% COMPLIANT</span>
                </div>
                <div className="w-3 h-3 rounded-full bg-cyber-mint animate-ping" />
              </div>

              <div className="p-3 bg-zinc-950 border border-white/[0.04] rounded-xl">
                <span className="text-[8px] text-zinc-500 block font-bold mb-1 tracking-wider">MULTICAST NODE INDEX SYNC</span>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyber-gold h-full rounded-full" style={{ width: "81%" }}></div>
                  </div>
                  <span className="text-[10px] text-cyber-gold font-bold">81/100 READY</span>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-white/[0.04] rounded-xl text-xs text-zinc-400 font-sans leading-relaxed">
                <span className="font-mono text-cyber-gold font-semibold text-[9px] block mb-1 uppercase tracking-wider">MAMA BECKY'S CYBERSPACE HUB</span>
                Our certified **Cyber-Kiosks** act as local spatial safety centers. Handymen check in to complete identity verification, undergo safety training courses, and rent high-efficiency circuit measurement multimeters.
              </div>
            </div>
          </NeonCard>

          {/* LOCAL SECTOR PRICE INDEX */}
          <NeonCard glowColor="violet" title="Technical Rate Registry" subLabel="Nairobi Index">
            <div className="space-y-2.5 font-mono text-xs text-zinc-400">
              <p className="text-[10px] text-zinc-500 font-sans pb-1 leading-normal">
                Standard hourly benchmark estimates compiled directly from the Nairobi Central Cooperatives Agency.
              </p>
              
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span>⚡ GRID ELECTRICITY</span>
                <span className="text-white font-bold">850 Ksh/hr</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span>💧 WASTEWATER PLUMBING</span>
                <span className="text-white font-bold">750 Ksh/hr</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span>📟 CYBER BOARD LAYOUT</span>
                <span className="text-white font-bold">900 Ksh/hr</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span>🧱 INDUSTRIAL MASONRY</span>
                <span className="text-white font-bold">850 Ksh/hr</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.04] pb-1.5">
                <span>☀️ SOLAR PHOTOVOLTAIC</span>
                <span className="text-white font-bold">950 Ksh/hr</span>
              </div>
            </div>
          </NeonCard>

        </div>

      </main>

      {/* Interactive Cellular Emulator dialog overlay */}
      <UssdSimulator 
        isOpen={isUssdOpen} 
        onClose={() => setIsUssdOpen(false)} 
        onJobCreated={handleAddNewJob}
      />

      {/* On-Chain MiniPay Asante Tipping modal overlay */}
      {isTipOpen && (
        <AsanteDropCenter
          targetWorkerName={tipTargetName}
          onSuccess={(amount, txHash) => {
            handleAddNewDrop({
              id: `drop-${Date.now()}`,
              workerId: "sim-worker-recipient",
              workerName: tipTargetName,
              amountCelo: amount / 100, // represent simplified dollar/CELO equivalent
              transactionHash: txHash,
              reason: `Peer satisfaction bonus tip for ${tipTargetName}`,
              timestamp: new Date().toLocaleDateString()
            });
          }}
          onClose={() => setIsTipOpen(false)}
        />
      )}

      {/* CORE SYSTEM FOOTER */}
      <footer className="relative w-full border-t border-white/[0.06] bg-zinc-950/80 backdrop-blur-md mt-14 py-8 select-none z-10 font-mono text-center sm:text-left text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-zinc-405 font-bold text-zinc-300">
              © 2026 FUNDI-CONNECT DECENTRALIZED COOPERATIVE. ALL CORE PROTOCOLS SIGNED.
            </p>
            <p className="text-zinc-650 text-[10px] text-zinc-500">
              Empowering local informal handymen with secure on-chain MiniPay micro-finance & offline GSM telemetry tools.
            </p>
          </div>

          <div className="flex items-center gap-3 text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-white/[0.06] px-3 py-1 rounded-full">
              Kente Cyberpunk 2.0 Standard
            </span>
            <div className="flex items-center gap-1.5 text-cyber-mint font-bold">
              <span className="w-2 h-2 rounded-full bg-cyber-mint animate-pulse" /> NETWORK SECURE
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
