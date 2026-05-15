import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  PhoneCall, 
  Store, 
  ChevronLeft, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

const channels = [
  {
    id: 'ussd',
    title: 'USSD Service',
    description: 'Dial *555# on any phone to register or find work. No data needed.',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-amber-100 text-amber-700',
    path: '/ussd'
  },
  {
    id: 'voice',
    title: 'Voice Assistant',
    description: 'Call our JembeAI line and just speak. We record your skills.',
    icon: <PhoneCall className="w-6 h-6" />,
    color: 'bg-emerald-100 text-emerald-700',
    path: '/voice'
  },
  {
    id: 'sms',
    title: 'SMS Booking',
    description: 'Send "SKILL SITE" to 22334. Example: "PLUMBER RUIRU"',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-700',
    path: '/sms'
  },
  {
    id: 'kiosks',
    title: 'Fundi Kiosks',
    description: 'Visit a community kiosk to get a photo and manual vouch.',
    icon: <Store className="w-6 h-6" />,
    color: 'bg-stone-100 text-stone-700',
    path: '/kiosks'
  }
];

export default function OfflineSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-cream text-stone-900 selection:bg-brand-red/20 relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-screen">
        <header className="mb-16">
          <button 
            onClick={() => navigate('/')}
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-stone-400 hover:text-brand-red transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Rudi Nyumbani (Back Home)
          </button>
          
          <div className="mt-12 space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-brand-indigo px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold shadow-xl">
              <Sparkles className="w-4 h-4" />
              Dignity-first accessibility
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter serif leading-[0.9]">
              No smartphone?<br/><span className="text-brand-red">No problem.</span>
            </h1>
            <p className="text-2xl text-brand-indigo font-black serif italic opacity-80 leading-none">Hakuna smartphone? Usijali.</p>
            <p className="max-w-2xl text-xl text-stone-500 serif italic leading-relaxed">
              We believe every skill deserves to be visible, regardless of technology. Choose an access frequency below.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 flex-1">
          {channels.map((channel, i) => (
            <motion.div
              key={channel.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                onClick={() => navigate(channel.path)}
                className="w-full text-left bg-white border-2 border-stone-100 p-10 rounded-[48px] shadow-sm hover:shadow-2xl hover:border-brand-red/20 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="absolute inset-0 kanga-pattern opacity-0 group-hover:opacity-[0.03] transition-opacity" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mb-8 transition-all group-hover:scale-110 group-hover:rotate-6 duration-500 shadow-lg ${channel.color}`}>
                    {channel.icon}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight text-stone-900 group-hover:text-brand-red transition-colors serif leading-none">{channel.title}</h3>
                  <p className="mt-4 text-stone-500 serif italic text-lg leading-relaxed">{channel.description}</p>
                  
                  <div className="mt-10 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-brand-indigo transition-colors">
                    Dial Frequency <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <section className="mt-24 p-10 md:p-16 rounded-[64px] bg-brand-indigo text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 kanga-pattern opacity-10" />
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">
                <ShieldCheck className="w-4 h-4" />
                Verified & Trusted
              </div>
              <h2 className="text-5xl font-black serif tracking-tight leading-[0.95]">Your trust ledger travels with you.</h2>
              <p className="text-white/70 serif italic text-xl leading-relaxed">
                Whether you register via USSD or smartphone, your work history and vouches are unified in one immutable mesh.
              </p>
            </div>
            <div className="flex flex-col gap-6">
               <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl">
                  <p className="text-[10px] uppercase font-black text-brand-gold tracking-[0.3em] mb-2">Total Verified Fundis</p>
                  <p className="text-5xl font-black tracking-tighter serif">2,500+</p>
               </div>
               <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md shadow-2xl">
                  <p className="text-[10px] uppercase font-black text-brand-gold tracking-[0.3em] mb-2">Monthly Job Matches</p>
                  <p className="text-5xl font-black tracking-tighter serif">4,200+</p>
               </div>
            </div>
          </div>
        </section>

        <footer className="py-20 text-center relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">FundiConnect Africa · SkillMesh Ledger 2.0</p>
        </footer>
      </div>
    </div>
  );
}
