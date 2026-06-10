import React, { useState, useEffect } from "react";
import { translations } from "../lib/translations";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sun, 
  Coffee, 
  Moon, 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  HelpCircle, 
  Flame, 
  Volume2, 
  Award,
  Zap
} from "lucide-react";

interface TwendeKaziBannerProps {
  language: "eng" | "swa" | "sheng";
  currentUserRole: "worker" | "client" | "introducer" | "guest";
  currentUserName: string;
}

export function TwendeKaziBanner({ 
  language, 
  currentUserRole,
  currentUserName 
}: TwendeKaziBannerProps) {
  // Determine simulated time of day based on clock or manual override
  const [timePeriod, setTimePeriod] = useState<"morning" | "afternoon" | "evening">(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "morning";
    if (hours >= 12 && hours < 17) return "afternoon";
    return "evening";
  });

  // Cycle through different sub-messages for variety
  const [msgOffset, setMsgOffset] = useState(0);

  // Auto cycle messages every 8 seconds for visual life
  useEffect(() => {
    const timer = setInterval(() => {
      setMsgOffset((prev) => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Culture messages dictionaries for ENG / SWA / SHENG
  const cultureEngine = {
    morning: {
      eng: [
        "Good morning, fundi. Let's do honest work. Good work advertises itself.",
        "Welcome back. The neighborhood is awake. There's work waiting for you today.",
        "Today is a new day. Put in a little effort, the results will speak for themselves."
      ],
      swa: [
        "☀️ Habari ya asubuhi fundi. Twende kazi. Kazi nzuri hujitangaza yenyewe.",
        "☀️ Karibu tena. Mtaa umeamka. Kuna kazi inakusubiri leo.",
        "☀️ Leo ni siku mpya. Weka bidii kidogo, matokeo yataongea yenyewe."
      ],
      sheng: [
        "☀️ Niaje mkuu, uko rada? Amka ukafanye shughuli safi leo. Kazi yenyewe hujitangaza.",
        "☀️ Oya, karibu tena kijiweni. Raia wameamka na dondoo za vibarua zinamwagika.",
        "☀️ Siku mpya, form mpya! Weka jasho kidogo leo ujaze mfuko chapchap."
      ]
    },
    afternoon: {
      eng: [
        "How is the search going, fundi? Slow but sure, we are making steady progress.",
        "How is today's job proceeding? The community depends on you.",
        "Stay steady at the workbench. Great things are built brick by brick."
      ],
      swa: [
        "🛠️ Mambo fundi? Tunaendelea pole pole, lakini tunafika.",
        "🌍 Kazi ya leo inaendeleaje? Jamii inakutegemea.",
        "🛠️ Simama imara kazini. Kazi ya mnyonge haipotei bure."
      ],
      sheng: [
        "🛠️ Niaje bro? Tunazidisha taratibu taratibu, lakini tunafika.",
        "🌍 Shughuli za leo zinajipa aje? Mtaa mzima unakutegemea.",
        "🛠️ Shikilia hapo hapo kijiweni. Mafanikio huanza na bidii ya leo."
      ]
    },
    evening: {
      eng: [
        "You've worked hard today. Rest up. Tomorrow is another day.",
        "Sun's down, fundi. Reflect on today's honest labor. Safe returns home.",
        "A peaceful evening. Count your daily wins and prepare for tomorrow's blessing."
      ],
      swa: [
        "🌙 Umejituma leo. Pumzika kidogo. Kesho kuna siku nyingine.",
        "🌙 Jua limeshuka jahazi. Jasho la honest work haliwezi potea. Pumzika salama.",
        "🌙 Pumzika baada ya taabu. Kesho mtaa utakuhitaji ukiwa mchangamfu tena."
      ],
      sheng: [
        "🌙 Mkuu umejitolea leo vibaya sana. Rest kiasi, kesho pia ni siku ya kuomoka.",
        "🌙 Giza imeingia. Hesabu chapaa yako ya leo kisha sleep fiti. Safi sana!",
        "🌙 Tulia mkuu wetu. Kesho kijiwe kitatema gigs zingine fiti. Umefanya kazi tight leo."
      ]
    }
  };

  const motivationList = [
    {
      icon: "🌅",
      eng: "Others started early. But the day is still yours. Let's do work.",
      swa: "🌅 Wengine walianza mapema. Lakini bado siku ni yako. Twende kazi.",
      sheng: "🌅 Wassee wengine walicheza mapema, lakini bado time iko ya kusaka chapaa yako leo. Twende kazi!"
    },
    {
      icon: "🔥",
      eng: "Work doesn't run away. But good opportunities love prepared people.",
      swa: "🔥 Kazi haikimbii. Lakini nafasi nzuri hupenda watu walio tayari.",
      sheng: "🔥 Job haikimbilii yeyote, lakini rada safi hukujia mseee mwenye yuko sharp na fiti."
    },
    {
      icon: "🌍",
      eng: "Little by little fills the measuring can. One job today, another tomorrow. That is the fundi's journey.",
      swa: "🌍 Kidogo kidogo hujaza kibaba. Job moja leo. Job nyingine kesho. Ndio safari ya fundi.",
      sheng: "🌍 Haba na haba hujaza kibaba mkuu. Kibarua kimoja leo, ingine kesho, hivo ndio msee huomoka."
    }
  ];

  const currentGreeting = cultureEngine[timePeriod][language][msgOffset] || cultureEngine[timePeriod][language][0];
  const currentMotivation = motivationList[msgOffset % motivationList.length];

  return (
    <div className="relative bg-linear-to-r from-amber-500/10 via-[#1e150a]/40 to-yellow-500/10 border border-amber-500/15 rounded-2xl p-5 md:p-6 overflow-hidden select-none">
      {/* African pattern theme grid style element */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/[0.03] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/[0.03] rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 position-relative z-10">
        
        {/* Left Side: Time adaptation controls + Golden word */}
        <div className="space-y-3.5 flex-1 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Interactive simulated time switch buttons to test and play with the engine */}
            <div className="flex bg-zinc-950/90 border border-white/[0.06] p-0.5 rounded-xl gap-0.5 mr-1 text-[8px] font-mono font-bold uppercase select-none">
              <button 
                onClick={() => setTimePeriod("morning")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition ${timePeriod === "morning" ? "bg-amber-500 text-zinc-950 font-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                title="Morning Spirit"
              >
                <Sun className="w-3 h-3 shrink-0" />
                <span>Asubuhi</span>
              </button>
              <button 
                onClick={() => setTimePeriod("afternoon")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition ${timePeriod === "afternoon" ? "bg-amber-500 text-zinc-950 font-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                title="Afternoon Sweat"
              >
                <Coffee className="w-3 h-3 shrink-0" />
                <span>Mchana</span>
              </button>
              <button 
                onClick={() => setTimePeriod("evening")}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition ${timePeriod === "evening" ? "bg-amber-500 text-zinc-950 font-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
                title="Evening Rest"
              >
                <Moon className="w-3 h-3 shrink-0" />
                <span>Jioni</span>
              </button>
            </div>

            <span className="text-[9px] font-mono bg-amber-500/10 text-cyber-gold border border-amber-500/35 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {currentUserRole === "worker" ? "Fundi Suite" : currentUserRole === "client" ? "Neighbor Suite" : "Baraza Suite"}
            </span>

            <span className="text-[9px] font-mono bg-[#E63946]/10 text-cyber-red border border-cyber-red/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyber-red fill-current" /> TWENDE KAZI ENGINE
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="font-sans font-black text-white text-base md:text-xl uppercase tracking-tight flex items-center gap-2">
              <span className="text-cyber-gold shrink-0">
                {timePeriod === "morning" && "☀️"}
                {timePeriod === "afternoon" && "🛠️"}
                {timePeriod === "evening" && "🌙"}
              </span>
              <span>
                {language === "eng" ? `Niaje, ${currentUserName}!` : language === "swa" ? `Salama, Mzalendo ${currentUserName}!` : `Sasa, ${currentUserName}!`}
              </span>
            </h2>

            <AnimatePresence mode="wait">
              <motion.p 
                key={`${timePeriod}-${language}-${msgOffset}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-amber-100/90 font-sans font-medium text-sm md:text-base leading-relaxed antialiased"
              >
                "{currentGreeting}"
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Dynamic encouragement quote */}
          <div className="pt-2 border-t border-amber-500/10 flex items-start gap-2 max-w-2xl text-[11px] text-zinc-400 font-sans italic">
            <span className="text-lg shrink-0 mt-[-2px]">{currentMotivation.icon}</span>
            <p>"{currentMotivation[language]}"</p>
          </div>
        </div>

        {/* Right Side: Trust & Motivation highlights */}
        <div className="md:border-l border-amber-500/15 md:pl-6 space-y-3 shrink-0 md:w-60 w-full select-none">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyber-gold font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-gold" />
              <span>{language === "eng" ? "VOUCH STATUS" : "UAMINIFU MTAANI"}</span>
            </div>
            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-white/[0.04]">
              <p className="font-sans text-xs text-white font-bold leading-none flex items-center gap-1">
                🤝 {language === "eng" ? "Reputation index: 98%" : "Uaminifu wako umeongezeka!"}
              </p>
              <p className="text-[9px] text-zinc-400 leading-normal mt-1.5 font-sans">
                {language === "eng" 
                  ? "Residents recognize your honesty. Continue the great pace!" 
                  : "Watu mtaani wanaona sifa ya kazi yako na wanakuamini kabisa."}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-cyber-mint font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-cyber-mint animate-pulse" />
              <span>{language === "eng" ? "RADAR COVERAGE" : "RADA YA KIJIWENI"}</span>
            </div>
            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-white/[0.04]">
              <p className="font-sans text-xs text-white font-bold leading-none">
                👀 {language === "eng" ? "Visibility Improved!" : "Mtaa unakuulizia leo!"}
              </p>
              <p className="text-[9px] text-zinc-400 leading-normal mt-1.5 font-sans">
                {language === "eng" 
                  ? "More local search parameters trace your node profiles directly." 
                  : "Wasaka fundi zaidi sasa wanaona kazi na kupigia salamu."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
