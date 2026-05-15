import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { WorkerProfile, User, Job } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Search,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';

export default function AdminDashboard() {
  const [pendingWorkers, setPendingWorkers] = useState<WorkerProfile[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState({ totalWorkers: 0, totalJobs: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kyc' | 'jobs' | 'metrics'>('kyc');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const allWorkers = await api.getWorkers();
        const pending = allWorkers.filter(w => w.trustLevel === 'new');
        setPendingWorkers(pending as any);

        const allJobs = await api.getJobs();
        setRecentJobs(allJobs as any);

        setStats({
          totalWorkers: allWorkers.length,
          totalJobs: allJobs.length,
          totalRevenue: 50000 // Mock revenue for now
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleVerifyWorker = async (userId: string) => {
    try {
      await api.updateWorkerStatus(userId, 'verified');
      setPendingWorkers(prev => prev.filter(w => w.userId !== userId));
    } catch (err) {
      console.error("Verification failed:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      <div className="w-16 h-16 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-cream p-6 flex flex-col max-w-6xl mx-auto selection:bg-brand-indigo/20 relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      
      <header className="py-12 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-full hover:bg-stone-50 transition-all shadow-sm">
            <ChevronLeft className="w-8 h-8 text-stone-900" />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black serif tracking-tighter text-stone-900 leading-none">Admin Control</h1>
            <p className="text-xl text-brand-indigo font-black serif italic opacity-80 leading-none">Guardians of the Mesh</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-12">
        <div className="bg-white p-8 rounded-[48px] shadow-xl border-4 border-stone-900/5 group hover:border-brand-indigo/20 transition-all">
          <div className="w-14 h-14 bg-brand-indigo/10 rounded-2xl flex items-center justify-center text-brand-indigo mb-6 group-hover:scale-110 transition-transform">
            <Users className="w-8 h-8" />
          </div>
          <div className="text-5xl font-black serif tracking-tighter text-stone-900">{stats.totalWorkers}</div>
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-[0.2em] mt-2">Active Fundis</div>
        </div>
        <div className="bg-white p-8 rounded-[48px] shadow-xl border-4 border-stone-900/5 group hover:border-brand-red/20 transition-all">
          <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red mb-6 group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8" />
          </div>
          <div className="text-5xl font-black serif tracking-tighter text-stone-900">{stats.totalJobs}</div>
          <div className="text-[10px] uppercase font-black text-stone-400 tracking-[0.2em] mt-2">Mesh Jobs</div>
        </div>
        <div className="bg-brand-indigo text-white p-8 rounded-[48px] shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-brand-gold mb-6 group-hover:rotate-12 transition-transform">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="text-5xl font-black serif tracking-tighter">KES {stats.totalRevenue.toLocaleString()}</div>
            <div className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] mt-2">Platform Revenue</div>
          </div>
          <div className="absolute inset-0 kanga-pattern opacity-10" />
        </div>
      </section>

      <div className="flex gap-4 mb-10 relative z-10">
        {[
          { id: 'kyc', label: 'KYC Requests', icon: ShieldCheck },
          { id: 'jobs', label: 'Job Monitoring', icon: Briefcase },
          { id: 'metrics', label: 'Ecosystem', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-3 py-6 rounded-[32px] font-black text-[10px] uppercase tracking-[0.3em] transition-all border-4 ${
              activeTab === tab.id 
                ? 'bg-stone-900 text-white border-stone-900 shadow-xl' 
                : 'bg-white text-stone-400 border-transparent hover:border-stone-900/10'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 relative z-10 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'kyc' && (
            <motion.div 
              key="kyc"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {pendingWorkers.length === 0 ? (
                <div className="text-center py-32 bg-white/40 rounded-[64px] border-4 border-dashed border-stone-200">
                   <p className="text-stone-400 serif italic text-2xl">All fundis are verified. Quiet day inRuaka.</p>
                </div>
              ) : (
                pendingWorkers.map((worker) => (
                  <div key={worker.id} className="bg-white p-10 rounded-[56px] shadow-xl border-4 border-transparent hover:border-brand-indigo/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-8">
                       <div className="w-24 h-24 bg-brand-cream rounded-[40px] flex items-center justify-center text-brand-indigo text-3xl font-black serif italic border-4 border-stone-50 group-hover:scale-105 transition-transform">
                         {worker.skills?.[0]?.[0] || 'F'}
                       </div>
                       <div className="space-y-2">
                          <h3 className="text-3xl font-black serif tracking-tighter text-stone-900 leading-none">Fundi {worker.userId.slice(0, 8)}</h3>
                          <p className="text-brand-indigo font-black serif italic text-xl">{worker.skills?.join(' & ')}</p>
                          <div className="flex items-center gap-4 pt-2">
                             <div className="px-3 py-1 bg-stone-100 rounded-full text-[8px] font-black uppercase tracking-widest text-stone-500">Member Since 2026</div>
                             <div className="px-3 py-1 bg-stone-100 rounded-full text-[8px] font-black uppercase tracking-widest text-stone-500">0 Disputes</div>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => handleVerifyWorker(worker.id)}
                         className="px-10 py-5 bg-brand-olive text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-green-700 transition-all flex items-center gap-3 active:scale-95"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                         Verify Profile
                       </button>
                       <button className="p-5 bg-brand-cream rounded-[24px] text-stone-300 hover:text-brand-red transition-all">
                         <XCircle className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'jobs' && (
            <motion.div 
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {recentJobs.map((job) => (
                <div key={job.id} className="bg-white p-8 rounded-[48px] shadow-xl border-4 border-transparent hover:border-brand-red/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-[24px] ${job.status === 'open' ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-indigo/10 text-brand-indigo'}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-stone-900 text-2xl serif leading-tight capitalize">{job.skillNeeded}</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-2 italic">
                        {job.status} · KES {job.budget} · {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${job.paymentStatus === 'confirmed' ? 'bg-brand-olive/10 text-brand-olive' : 'bg-brand-gold/10 text-brand-gold'}`}>
                      {job.paymentStatus || 'No Payment'}
                    </div>
                    <button className="p-4 bg-brand-cream rounded-2xl text-stone-300 hover:text-stone-900 transition-all">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div 
              key="metrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
               <div className="bg-white p-12 rounded-[64px] shadow-xl border-4 border-stone-900/5 space-y-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-black serif tracking-tighter text-stone-900">Health Index</h3>
                    <AlertTriangle className="w-8 h-8 text-brand-gold" />
                  </div>
                  <div className="space-y-8">
                     {[
                       { label: 'Successful Matches', value: '94%', color: 'bg-brand-olive' },
                       { label: 'Dispute Rate', value: '1.2%', color: 'bg-brand-red' },
                       { label: 'Avg Payout Time', value: '4.5 hrs', color: 'bg-brand-indigo' },
                     ].map(metric => (
                       <div key={metric.label} className="space-y-4">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-stone-400">{metric.label}</span>
                            <span className="text-stone-900">{metric.value}</span>
                          </div>
                          <div className="h-4 bg-brand-cream rounded-full overflow-hidden p-1 shadow-inner">
                            <div className={`h-full ${metric.color} rounded-full`} style={{ width: metric.value.includes('%') ? metric.value : '70%' }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               
               <div className="bg-brand-indigo text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 kanga-pattern opacity-10" />
                  <div className="relative z-10 space-y-8">
                    <h3 className="text-3xl font-black serif tracking-tighter">Community Impact</h3>
                    <p className="text-xl serif italic opacity-70 leading-relaxed">
                      FundiConnect has facilitated KES 1.2M in local work this month. 
                      98% of neighbors report feeling safer using verified fundis.
                    </p>
                    <div className="pt-8 border-t border-white/10 flex gap-10">
                       <div>
                          <div className="text-4xl font-black serif">420</div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">Neighbor Vouches</div>
                       </div>
                       <div>
                          <div className="text-4xl font-black serif">89K</div>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-2">Tips Collected</div>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
