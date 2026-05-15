import * as React from "react";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Hammer,
  Wrench,
  Zap,
  Paintbrush,
  Scissors,
  Sparkles,
  Car,
  BrickWall,
  Smartphone,
  ShieldCheck,
  MapPin,
  Star,
  PhoneCall,
  MessageSquare,
  Store,
  Search,
  BadgeCheck,
  Users,
  ArrowRight,
  Mic2,
  Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SKILL_IMAGES } from "../constants";

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-brand-red', 'bg-brand-gold', 'bg-brand-indigo', 'bg-brand-brown',
    'bg-rose-700', 'bg-emerald-800', 'bg-amber-600', 'bg-indigo-900'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase();
};

const artisans = [
  {
    id: "carpenter",
    skill: "Carpenter",
    icon: Hammer,
    name: "Musa Otieno",
    title: "Verified Carpenter of Ruiru",
    location: "Ruiru",
    trust: 94,
    jobs: 128,
    vouches: 9,
    response: "12 min",
    rate: "KES 1,500+",
    badge: "Master Fundi",
    languages: "Swahili, English",
    story: "Curtain rails, doors, cabinets, shelves, and custom wood repairs.",
    hasVoice: true,
    portfolioCount: 6,
  },
  {
    id: "plumber",
    skill: "Plumber",
    icon: Wrench,
    name: "Grace Wanjiru",
    title: "Trusted Plumber of Thika",
    location: "Thika",
    trust: 91,
    jobs: 86,
    vouches: 7,
    response: "18 min",
    rate: "KES 1,200+",
    badge: "Rapid Responder",
    languages: "Swahili, Kikuyu, English",
    story: "Leaks, blocked sinks, bathroom repairs, water tanks, and emergency plumbing.",
    hasVoice: true,
    portfolioCount: 4,
  },
  {
    id: "electrician",
    skill: "Electrician",
    icon: Zap,
    name: "Brian Mwangi",
    title: "Community Verified Electrician",
    location: "Kasarani",
    trust: 89,
    jobs: 74,
    vouches: 6,
    response: "21 min",
    rate: "KES 1,800+",
    badge: "Safety Checked",
    languages: "English, Swahili, Sheng",
    story: "Lighting, sockets, wiring checks, appliance faults, and diagnostics.",
    hasVoice: false,
    portfolioCount: 3,
  },
  {
    id: "painter",
    skill: "Painter",
    icon: Paintbrush,
    name: "Aisha Njeri",
    title: "Top Rated Painter of Githurai",
    location: "Githurai",
    trust: 87,
    jobs: 65,
    vouches: 5,
    response: "30 min",
    rate: "KES 2,500+",
    badge: "Clean Finish",
    languages: "Swahili, English",
    story: "Interior walls, rental refreshes, shop fronts, and waterproof touch-ups.",
    hasVoice: true,
    portfolioCount: 8,
  },
];

const filters = ["All", "Home Repair", "Beauty", "Auto", "Digital", "Construction"];

function TrustMeter({ value }: { value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none">
        <span>Trust score</span>
        <span className="text-stone-900">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
        <div className="h-full rounded-full bg-brand-gold" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ArtisanCard({ artisan }: { artisan: typeof artisans[0] }) {
  const Icon = artisan.icon;
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
    >
      <Card className="overflow-hidden rounded-[40px] border-black/5 bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group">
        <div className="relative h-64 overflow-hidden border-b border-stone-100">
          <img 
            src={SKILL_IMAGES[artisan.skill] || null} 
            alt={artisan.skill} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent opacity-80" />
           
          <div className="absolute left-6 top-6 flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-stone-800 shadow-xl border border-black/5">
            <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-stone-100 bg-stone-50">
               <img 
                 src={SKILL_IMAGES[artisan.skill] || null} 
                 alt={artisan.skill} 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </div>
            {artisan.skill}
          </div>

          {artisan.hasVoice && (
             <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full bg-brand-gold p-2.5 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer">
                <Mic2 className="h-4 w-4" />
             </div>
          )}

          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-2xl font-black leading-tight serif">{artisan.name}</p>
            <div className="flex items-center gap-2 text-xs font-medium text-white/80 mt-1 uppercase tracking-wider">
               <MapPin className="w-3 h-3 text-brand-gold" /> {artisan.location}
            </div>
          </div>
        </div>
        
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900 border border-amber-100">
              <BadgeCheck className="h-3.5 w-3.5" /> {artisan.badge}
            </span>
          </div>

          <div className="space-y-3">
             <div className="flex items-center justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <span>Work Stories (Portfolio)</span>
                <span className="text-brand-red">{artisan.portfolioCount} jobs</span>
             </div>
             <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border-2 border-dashed border-stone-100 group-hover:border-brand-gold/10 transition-colors ${i === 3 ? 'bg-stone-50' : ''}`}>
                    {i === 3 ? (
                      <span className="text-[10px] font-black text-stone-400">+{artisan.portfolioCount - 3}</span>
                    ) : (
                      <ImageIcon className="w-4 h-4 text-stone-200" />
                    )}
                  </div>
                ))}
             </div>
          </div>

          <p className="text-stone-600 serif italic text-lg leading-snug">"{artisan.story}"</p>
          
          <TrustMeter value={artisan.trust} />

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
               { label: 'Jobs', val: artisan.jobs },
               { label: 'Vouches', val: artisan.vouches },
               { label: 'Speed', val: artisan.response }
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl bg-stone-50 p-3 hover:bg-stone-100 transition-colors border border-transparent hover:border-stone-200">
                <p className="text-lg font-black text-stone-900 leading-none">{stat.val}</p>
                <p className="text-[9px] text-stone-400 uppercase font-black tracking-widest mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 pt-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Standard Rate</p>
              <p className="font-black text-xl serif leading-none">{artisan.rate}</p>
            </div>
            <Button 
              onClick={() => navigate('/smartphone/auth')}
              className="rounded-2xl bg-brand-red py-6 px-8 text-white hover:bg-brand-brown shadow-xl active:scale-95 transition-all font-black uppercase tracking-[0.15em] text-xs"
            >
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const filteredArtisans = useMemo(() => {
    return artisans.filter((a) => {
      const text = `${a.skill} ${a.name} ${a.location} ${a.story}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-brand-cream text-stone-900 selection:bg-brand-red/10">
      <section className="relative px-4 py-6 md:px-10 lg:px-16 overflow-x-hidden">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-gold/20 blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -left-24 top-72 h-80 w-80 rounded-full bg-brand-red/10 blur-3xl opacity-50 pointer-events-none" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between rounded-[24px] sm:rounded-[32px] border border-black/5 bg-white/60 p-3 sm:p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 pl-2 sm:pl-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-brand-indigo text-brand-gold shadow-lg">
              <Hammer className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="hidden xs:block sm:block">
              <p className="font-black tracking-tight text-base sm:text-xl leading-none">FundiConnect</p>
              <p className="text-[9px] text-stone-500 font-black uppercase tracking-[0.2em] mt-0.5">SkillMesh Africa</p>
            </div>
          </div>
          <div className="hidden items-center gap-10 text-[11px] font-black uppercase tracking-[0.15em] text-stone-400 md:flex">
            <button onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth'})} className="hover:text-brand-red transition-colors">Huduma</button>
            <button onClick={() => navigate('/smartphone/mesh')} className="hover:text-brand-red transition-colors text-brand-red">Mesh Map</button>
            <button onClick={() => navigate('/smartphone/community')} className="hover:text-brand-red transition-colors">Community</button>
            <button onClick={() => navigate('/offline')} className="hover:text-brand-red transition-colors">Offline</button>
            <button onClick={() => document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth'})} className="hover:text-brand-red transition-colors">Usalama</button>
          </div>
          <Button onClick={() => navigate('/smartphone/auth')} className="shrink-0 rounded-xl sm:rounded-2xl bg-brand-indigo h-10 sm:h-14 px-4 sm:px-8 hover:bg-brand-brown text-white shadow-xl font-black uppercase tracking-widest text-[10px] sm:text-xs whitespace-nowrap">
            <span className="sm:hidden">Anza</span>
            <span className="hidden sm:inline">Anza Hapa</span>
          </Button>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-32">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-brand-indigo px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] text-brand-gold shadow-2xl border border-white/10">
              <Sparkles className="h-4 w-4" /> Smartphone · USSD · Voice · Kiosk
            </div>
            
            <div className="space-y-4">
               <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-8xl serif">
                 Local skill, visible.
               </h1>
               <p className="text-xl font-black text-brand-red border-l-4 border-brand-red pl-6 serif opacity-80 decoration-brand-gold/30 underline decoration-8 underline-offset-4 sm:text-2xl md:text-3xl">
                 Ujuzi wa nyumbani, unaonekana.
               </p>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-600 serif italic sm:text-lg md:text-2xl sm:mt-10">
              A dignity-first marketplace for African artisans. Everyone can join — with or without a smartphone. Built for the community, by the community.
            </p>
            
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Button onClick={() => navigate('/smartphone/auth')} size="lg" className="h-14 sm:h-20 rounded-[24px] bg-brand-red px-6 sm:px-10 text-white hover:bg-brand-brown shadow-2xl font-black uppercase tracking-widest text-xs sm:text-sm group">
                I Need Help <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => navigate('/smartphone/auth')} size="lg" className="h-14 sm:h-20 rounded-[24px] bg-white border-2 border-stone-200 px-6 sm:px-10 text-stone-800 hover:border-black shadow-lg font-black uppercase tracking-widest text-xs sm:text-sm">
                I Have a Skill
              </Button>
            </div>

            <div className="mt-16 grid max-w-2xl grid-cols-3 gap-6">
              {[
                { val: "10+", label: "Skill Groups", sub: "Jamii ya ufundi" },
                { val: "4", label: "Channels", sub: "Njia nne" },
                { val: "100%", label: "Dignified", sub: "Heshima kwanza" }
              ].map(stat => (
                <div key={stat.label} className="group cursor-default">
                  <p className="text-4xl font-black leading-none serif text-brand-indigo group-hover:text-brand-red transition-colors">{stat.val}</p>
                  <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-2 group-hover:text-stone-900">{stat.label}</p>
                  <p className="text-[10px] text-brand-gold font-black uppercase tracking-tighter italic">{stat.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="relative hidden lg:block">
             {/* Kanga Decorative Frame */}
             <div className="absolute inset-0 border-[16px] border-brand-indigo/5 rounded-[64px] -m-8 kanga-pattern" />
             
            <div className="rounded-[56px] bg-brand-indigo p-6 shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
               <div className="bg-brand-cream rounded-[44px] overflow-hidden">
                  <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-white/50 backdrop-blur">
                     <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full bg-brand-red animate-ping" />
                        <div>
                           <p className="font-black text-sm">Live in Ruiru</p>
                           <p className="text-[10px] uppercase font-black text-stone-400 tracking-widest">Neighbor matching...</p>
                        </div>
                     </div>
                     <Smartphone className="w-6 h-6 text-brand-indigo opacity-20" />
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4 h-[320px] sm:h-[440px]">
                    {artisans.slice(0, 4).map((a) => (
                      <div key={a.id} className="relative overflow-hidden rounded-[32px] group cursor-pointer shadow-sm border border-stone-100">
                        <img 
                          src={SKILL_IMAGES[a.skill] || null} 
                          alt={a.skill} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-indigo via-brand-indigo/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-xl font-black leading-tight serif">{a.name.split(' ')[0]}.</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">{a.skill}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="discovery" className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
           <div className="space-y-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-3 rounded-full bg-brand-red px-5 py-2 text-[10px] font-black text-white uppercase tracking-[0.25em] shadow-xl">
                 <MapPin className="h-4 w-4" /> Live Neighbor Discovery
              </div>
              <h2 className="text-6xl font-black serif tracking-tighter leading-tight text-stone-900">
                 Explore the Live <br/><span className="text-brand-indigo italic">Economic Mesh.</span>
              </h2>
              <p className="text-2xl text-stone-600 serif italic leading-relaxed">
                 Search for skills in and out of your area. Our live map rotates to your location, showing available fundis and neighborhood service points in real-time.
              </p>
              <Button 
                onClick={() => navigate('/smartphone/mesh')}
                className="h-20 rounded-[24px] bg-brand-indigo px-12 text-white hover:bg-brand-red shadow-2xl font-black uppercase tracking-widest text-sm group transition-all"
              >
                Launch Mesh Map <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
           <div className="order-1 lg:order-2">
              <div className="relative aspect-square rounded-[64px] bg-stone-100 overflow-hidden shadow-2xl border-8 border-white group cursor-pointer" onClick={() => navigate('/smartphone/mesh')}>
                 <div className="absolute inset-0 bg-stone-200 animate-pulse" />
                 <div className="absolute inset-0 kanga-pattern opacity-[0.05]" />
                 <img 
                   src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000" 
                   alt="Map background" 
                   className="absolute inset-0 w-full h-full object-cover opacity-50 contrast-125 grayscale group-hover:scale-110 transition-transform duration-1000"
                 />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                       <div className="absolute inset-0 bg-brand-red rounded-full animate-ping opacity-20 scale-150" />
                       <div className="w-24 h-24 bg-brand-red text-white rounded-[32px] flex items-center justify-center shadow-2xl relative z-10 rotate-12 group-hover:rotate-0 transition-transform">
                          <MapPin className="w-12 h-12" />
                       </div>
                    </div>
                 </div>
                 <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-2">Live Status</p>
                    <p className="text-lg font-black serif text-stone-900 leading-tight">42 verified fundis active in Ruiru East right now.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <section id="access" className="mx-auto max-w-7xl px-6 pb-24 md:px-10 lg:px-16">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
           <h2 className="text-4xl md:text-6xl font-black serif max-w-3xl leading-tight">Access for every neighbor.<br/><span className="text-brand-red italic opacity-80">Njia nne za kujiunga.</span></h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: Smartphone, title: "Smartphone", text: "PWA app for profiles, work portfolios, and live neighbor matches.", path: "/smartphone/auth", color: "bg-brand-indigo" },
            { icon: MessageSquare, title: "USSD / SMS", text: "Dial *555# or text skill to register. No internet, no problem.", path: "/offline", color: "bg-brand-red" },
            { icon: PhoneCall, title: "Voice", text: "Talk to JembeAI. Speak your skill, get your work. Swahili-first.", path: "/voice", color: "bg-brand-gold" },
            { icon: Store, title: "Kiosks", text: "Physical nodes in neighborhoods helping workers bridge the gap.", path: "/kiosks", color: "bg-brand-brown" },
          ].map((item) => (
            <Card key={item.title} onClick={() => navigate(item.path)} className="rounded-[40px] border-black/5 bg-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
               <div className={`absolute top-0 right-0 w-32 h-32 ${item.color} opacity-5 -mr-16 -mt-16 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
               
              <CardContent className="p-10 space-y-6">
                <div className={`flex h-16 w-16 items-center justify-center rounded-[24px] ${item.color} text-white shadow-xl group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-black serif">{item.title}</h3>
                   <p className="text-stone-500 leading-relaxed serif italic text-lg">{item.text}</p>
                </div>
                <div className="pt-4 border-t border-stone-50 flex items-center gap-2 group-hover:text-brand-red transition-colors text-[10px] font-black uppercase tracking-widest text-stone-400">
                   Enter Channel <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="skills" className="mx-auto max-w-7xl px-6 py-12 md:px-10 lg:px-16 border-t border-black/5">
        <div className="mb-12 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="inline-flex rounded-full bg-brand-gold/10 px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-brand-brown">Huduma zetu vyumbani</p>
            <h2 className="text-5xl font-black tracking-tight md:text-7xl serif leading-none">Vetted by community.</h2>
            <p className="max-w-2xl text-stone-600 serif italic text-2xl leading-snug">Each profile is a living proof card: trust, vouches, photos, and neighborhood honor.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skill or location"
              className="w-full rounded-2xl border-2 border-stone-100 bg-white py-5 pl-14 pr-6 text-sm outline-none focus:border-brand-red focus:ring-0 transition-all font-black"
            />
          </div>
        </div>
        
        <div className="mb-12 flex flex-wrap gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-2xl px-8 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-2 ${filter === f ? "bg-brand-red border-brand-red text-white shadow-xl" : "bg-white text-stone-400 border-stone-50 hover:border-stone-200"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div id="profiles" className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtisans.map((artisan) => (
            <div key={artisan.id}>
              <ArtisanCard artisan={artisan} />
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-6 py-24 md:px-10 lg:px-16">
        <div className="grid gap-12 rounded-[64px] bg-brand-indigo p-10 text-white md:grid-cols-[.9fr_1.1fr] md:p-20 relative overflow-hidden shadow-2xl">
          {/* Kanga Overlay */}
          <div className="absolute inset-0 kanga-pattern opacity-10 pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-brand-gold px-5 py-2 text-[10px] font-black text-brand-indigo uppercase tracking-[0.25em]">
              <ShieldCheck className="h-4 w-4" /> Community truth layer
            </div>
            <h2 className="text-6xl font-black tracking-tighter leading-[0.95] serif">Trust is witnessed.<br/><span className="text-brand-gold italic">Tunajenga pamoja.</span></h2>
            <p className="leading-relaxed text-white/70 serif italic text-2xl pr-8">
              Trust is not stars — it is stories. Every profile grows through completed jobs, photos of jua kali work, and neighborhood honor.
            </p>
            <Button onClick={() => navigate('/smartphone/auth')} className="h-16 rounded-2xl bg-white text-brand-indigo hover:bg-brand-gold transition-colors px-10 font-black uppercase tracking-widest text-xs">Join the Mesh</Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-1 relative z-10">
            {[
              { icon: Users, title: "Community Vouch", text: "Neighbors verify your skill, elders confirm your honor.", color: "text-brand-gold" },
              { icon: Star, title: "Job Proof", text: "Live photos of work done improve your visibility.", color: "text-emerald-400" },
              { icon: ShieldCheck, title: "Safety Gate", text: "Our digital ledger ensures transparent local commerce.", color: "text-brand-red" },
            ].map((item) => (
              <div key={item.title} className="rounded-[40px] bg-white/5 p-10 border border-white/10 backdrop-blur-sm flex items-start space-x-8 hover:bg-white/10 transition-all group overflow-hidden relative">
                <div className={`p-5 rounded-3xl bg-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="text-2xl font-black serif">{item.title}</h3>
                   <p className="mt-2 text-lg leading-relaxed text-white/60 serif italic">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-24 text-center space-y-8 bg-white/30 border-t border-black/5 mt-20">
         <div className="flex justify-center items-center gap-4">
            <div className="h-1 w-12 bg-brand-gold rounded-full" />
            <Smartphone className="w-6 h-6 text-brand-red opacity-40" />
            <div className="h-1 w-12 bg-brand-red rounded-full" />
         </div>
        <p className="text-[11px] text-stone-900 font-black uppercase tracking-[0.4em] leading-relaxed">
          FundiConnect Africa · Nairobi MVP · SkillMesh Africa
        </p>
        <div className="flex justify-center gap-8 text-[10px] font-black text-stone-400 uppercase tracking-widest">
           <button className="hover:text-brand-red transition-colors">Sheria</button>
           <button className="hover:text-brand-red transition-colors">Usalama</button>
           <button className="hover:text-brand-red transition-colors">Dignity First</button>
        </div>
      </footer>
    </main>
  );
}
