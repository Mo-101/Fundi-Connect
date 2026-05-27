import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { aiService } from '../services/aiService';
import { WorkerProfile, User } from '../types';
import { SKILL_IMAGES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Star, 
  MapPin, 
  Briefcase, 
  Heart, 
  ShieldCheck, 
  ArrowUpRight,
  SearchX,
  Sparkles
} from 'lucide-react';

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

export default function CategoryDetail() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<(User & WorkerProfile & { aiInsight?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!category) return;
      try {
        const decodedCat = decodeURIComponent(category);
        const allWorkers = await api.getWorkers();
        // Filter workers by skill in memory
        const filtered = allWorkers.filter(w => w.skills && w.skills.includes(decodedCat));
        
        // Fetch AI insights for each worker
        const workersWithInsight = await Promise.all(filtered.map(async (w) => {
          const insight = await aiService.getTrustInsight(w);
          return { ...w, aiInsight: insight };
        }));
        
        setWorkers(workersWithInsight as any);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, [category]);

  const decodedCategory = decodeURIComponent(category || '').split('(')[0].trim();

  return (
    <PageContainer>
      <PageHeader 
        title={decodedCategory} 
        subtitle="Top Neighbors in this Trade"
      />

      {loading ? (
        <LoadingState message={`Finding ${decodedCategory} Fundis...`} />
      ) : (
        <div className="space-y-8 mt-8 pb-20">
          <div className="relative h-[240px] md:h-[400px] rounded-[48px] overflow-hidden neumorph-raised group mb-12">
             <img 
               src={category ? SKILL_IMAGES[decodeURIComponent(category)] : undefined} 
               alt={category || ''} 
               className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90 group-hover:opacity-100"
               referrerPolicy="no-referrer"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/30 to-transparent flex flex-col justify-end p-10">
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tighter serif leading-[0.9] capitalize text-white">
                    {decodedCategory}.
                  </h1>
                </div>
             </div>
          </div>

          {workers.length === 0 ? (
            <EmptyState 
              message="The mesh is growing every day. Be the first to join or request one anyway. No Experts Found."
              actionLabel="Post Request"
              onAction={() => navigate('/smartphone/request-job')}
            />
          ) : (
            <AnimatePresence>
              {workers.map((worker, i) => (
                <motion.div
                  key={worker.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[48px] shadow-xl flex flex-col md:flex-row items-center gap-10 border border-stone-100 group relative overflow-hidden h-[400px] md:h-[240px]"
                >
                  <img 
                    src={SKILL_IMAGES[decodeURIComponent(category || '')] || undefined} 
                    alt={category} 
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] transition-transform duration-1000 group-hover:scale-110 group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-stone-900/95 via-stone-900/40 to-transparent" />
                  
                  <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-10 w-full h-full">
                    <div className="w-28 h-28 rounded-[36px] bg-brand-red p-1 shrink-0 border-4 border-stone-100/20 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                      {worker.photoUrl ? (
                        <img src={worker.photoUrl} alt={worker.name} className="w-full h-full object-cover rounded-[32px]" />
                      ) : (
                        <div className="w-full h-full bg-brand-red flex items-center justify-center text-white font-black serif italic text-4xl">
                           {worker.name?.[0] || '?'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left text-white">
                      <div className="space-y-1">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          <h3 className="text-3xl font-black serif text-white tracking-tighter drop-shadow-md">{worker.name || 'Anonymous Neighbor'}</h3>
                          <div className="flex items-center gap-1.5 px-4 py-1 bg-brand-indigo/80 backdrop-blur-md text-brand-gold rounded-full border border-white/10 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-brand-gold" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{worker.trustScore || 0}% Trust</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-white/60">
                          <MapPin className="w-4 h-4 text-brand-gold" />
                          <span className="text-xs font-black uppercase tracking-widest leading-none drop-shadow-sm">{worker.location || 'Ruiru'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                         <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2 border border-white/10">
                            <Briefcase className="w-3.5 h-3.5" /> {worker.completedJobsCount || 0} Jobs
                         </div>
                         <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white/80 flex items-center gap-2 border border-white/10">
                            <ShieldCheck className="w-3.5 h-3.5" /> {worker.trustLevel}
                         </div>
                      </div>

                      {worker.aiInsight && (
                        <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                           <Sparkles className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                           <p className="text-[10px] text-brand-gold/90 font-medium italic leading-relaxed">
                             "{worker.aiInsight}"
                           </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                          onClick={() => navigate('/smartphone/request-job', { state: { skill: worker.skills?.[0], workerId: worker.userId, workerName: worker.name, location: worker.location } })}
                          className="flex-1 px-8 py-4 bg-brand-red text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-white hover:text-stone-900 transition-all flex items-center justify-center gap-2"
                        >
                          Book Fundi <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/smartphone/chat/${worker.userId}`)}
                          className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border border-white/20 hover:bg-white hover:text-stone-900 transition-all"
                        >
                           Message
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </PageContainer>
  );
}
