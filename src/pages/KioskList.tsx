import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, MapPin, Store, ShieldCheck, Map as MapIcon, Users, ArrowUpRight } from 'lucide-react';

const kiosks = [
  { id: 1, name: "Juja Community Node", estate: "Juja Town", address: "Near Equity Bank", status: "Open", agents: 3, verifiedFundis: 142 },
  { id: 2, name: "Pipeline Fundi Hub", estate: "Pipeline", address: "Plot 10, Stage 3", status: "Opening Soon", agents: 2, verifiedFundis: 89 },
  { id: 3, name: "Ruiru Digital Kiosk", estate: "Ruiru", address: "Next to Post Office", status: "Open", agents: 4, verifiedFundis: 215 },
  { id: 4, name: "Kasarani Vouch Point", estate: "Kasarani", address: "Powerstar Supermarket", status: "Open", agents: 2, verifiedFundis: 112 },
];

export default function KioskList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-cream text-stone-900 selection:bg-brand-olive/20 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-16">
          <button 
            onClick={() => navigate('/offline')} 
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400 hover:text-brand-olive transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <div className="mt-12 grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                <Store className="w-3.5 h-3.5 text-amber-400" /> Physical Nodes
              </div>
              <h1 className="text-5xl font-black tracking-tight serif leading-tight">Fundi Points</h1>
              <p className="text-xl text-stone-600 serif italic leading-relaxed">
                Registered community kiosks where artisans can get their photos taken, skills verified manually, and receive paper printouts of their trust score.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-8 bg-white/60 rounded-[40px] border border-black/5 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Total Nodes</p>
                  <p className="text-4xl font-black tracking-tight">24</p>
               </div>
               <div className="p-8 bg-white/60 rounded-[40px] border border-black/5 shadow-sm backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Active Agents</p>
                  <p className="text-4xl font-black tracking-tight">60+</p>
               </div>
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {kiosks.map((kiosk, i) => (
            <motion.div
              key={kiosk.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[48px] border border-black/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-5 bg-stone-50 rounded-3xl group-hover:bg-brand-olive group-hover:text-white transition-colors duration-300">
                    <Store className="w-8 h-8" />
                  </div>
                  <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${kiosk.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {kiosk.status}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
                    {kiosk.name} 
                  </h3>
                  <div className="flex items-center gap-2 text-stone-400 text-sm mt-2 serif italic">
                    <MapPin className="w-4 h-4" /> {kiosk.estate} · {kiosk.address}
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 border-t border-stone-100 pt-8">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Verified Artisans</p>
                      <p className="text-xl font-black tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" /> {kiosk.verifiedFundis}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Active Agents</p>
                      <p className="text-xl font-black tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-stone-600" /> {kiosk.agents}
                      </p>
                   </div>
                </div>

                <button className="mt-10 w-full py-5 bg-stone-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-brand-olive transition-colors">
                  <MapIcon className="w-4 h-4" /> Get Directions
                </button>
              </div>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <section className="mt-20 bg-stone-900 rounded-[56px] p-12 text-white relative overflow-hidden ring-1 ring-white/10">
           <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-black tracking-tight serif mb-6">Become a Fundi Node.</h2>
              <p className="text-white/60 serif italic text-lg leading-relaxed mb-8">
                Do you own a shop or kiosk? help artisans in your neighborhood register on FundiConnect and earn small commissions for vouching and registration support.
              </p>
              <button className="px-8 py-5 bg-white text-stone-900 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-amber-400 transition-colors">
                Apply as an Agent <ArrowUpRight className="w-4 h-4" />
              </button>
           </div>
           <div className="absolute -right-24 bottom-0 w-80 h-80 bg-brand-olive/20 rounded-full blur-[100px]" />
        </section>
      </div>
    </div>
  );
}
