import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { Job, WorkerProfile } from '../types';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Clock, DollarSign, CheckCircle2, User } from 'lucide-react';
import { formatDistance } from 'date-fns';

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      const userId = localStorage.getItem('mesh_user_id');
      if (!userId) return;
      try {
        const prof = await api.getWorkerProfile(userId);
        if (prof) {
          setProfile(prof);
          const allJobs = await api.getJobs();
          // Filter open jobs matching worker skills
          const matchingJobs = allJobs.filter(j => 
            j.status === 'open' && 
            prof.skills.includes(j.skillNeeded)
          );
          setJobs(matchingJobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleAccept = async (jobId: string) => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) return;
    try {
      await api.updateJobStatus(jobId, 'assigned', userId);
      alert("Job accepted! Connect with the client now.");
      navigate('/smartphone/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to accept job. It might have been taken.");
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Just now';
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistance(d, new Date(), { addSuffix: true });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="The Local Mesh" 
        subtitle="Kazi zinazopatikana"
      />

      {loading ? (
        <LoadingState message="Scanning for matching jobs..." />
      ) : (
        <div className="space-y-6 pb-12">
          {jobs.length === 0 ? (
            <EmptyState 
              message="Nyamaza kidogo. No jobs for your skills right now. The mesh is always growing." 
              onAction={() => navigate('/smartphone/dashboard')}
              actionLabel="Return to Dashboard"
              icon={Clock}
            />
          ) : (
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: i * 0.1 } }}
                  className="bg-brand-cream p-10 rounded-[56px] neumorph-raised border border-white/50 space-y-8 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 kanga-pattern opacity-[0.02] -rotate-12 scale-150 pointer-events-none" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-4">
                      <div className="px-5 py-2 bg-brand-indigo text-brand-gold rounded-full text-[10px] font-black uppercase tracking-[0.25em] inline-block shadow-lg">
                        {job.skillNeeded}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] italic">Neighbor Matching...</p>
                        <h3 className="text-4xl font-black serif text-stone-900 tracking-tighter leading-none">{job.location}</h3>
                      </div>
                    </div>
                    <div className="text-[10px] text-stone-400 font-black uppercase tracking-widest px-4 py-2 bg-white rounded-full neumorph-flat border border-white/50">
                      {formatDate(job.createdAt)}
                    </div>
                  </div>

                  <p className="text-stone-600 serif italic leading-[1.6] text-2xl font-medium px-2">
                    "{job.description}"
                  </p>

                  <div className="flex items-center gap-10 relative z-10 border-t border-white/50 pt-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Budget</span>
                      <div className="flex items-center text-stone-900 font-black tracking-tight text-xl">
                        <span className="text-brand-red text-sm mr-1">KES</span> {job.budget || 'Negotiable'}
                      </div>
                    </div>
                    <div className="flex flex-col border-l border-white/50 pl-10">
                      <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">Urgency</span>
                      <div className="flex items-center text-stone-900 font-black tracking-tight text-xl capitalize">
                        {job.urgency.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAccept(job.id)}
                    className="w-full py-6 bg-brand-red text-white rounded-[32px] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center space-x-3 shadow-[0_20px_50px_rgba(191,16,46,0.3)] hover:bg-brand-brown transition-all group active:scale-95 border-b-[8px] border-brand-brown/50"
                  >
                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Nipo Tayari (I am ready)</span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </PageContainer>
  );
}
