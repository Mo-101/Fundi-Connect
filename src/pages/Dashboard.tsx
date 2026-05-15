import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import { User, WorkerProfile, Job, Review } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hammer, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Bell, 
  Plus, 
  LogOut,
  Calendar,
  Briefcase,
  Clock,
  ChevronRight,
  Navigation,
  Search,
  TrendingUp,
  Award,
  User as UserIcon,
  Heart,
  X,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { SKILLS, SKILL_SECTIONS, SKILL_IMAGES } from '../constants';
import { formatDistance } from 'date-fns';

import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState, EmptyState } from '../components/standard/StateComponents';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<(User & WorkerProfile)[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForTip, setSelectedJobForTip] = useState<Job | null>(null);
  const [showScoreDoctrine, setShowScoreDoctrine] = useState(false);
  const [showBaraza, setShowBaraza] = useState<{ isOpen: boolean, jobId?: string }>({ isOpen: false });
  const [showRatingModal, setShowRatingModal] = useState<{ isOpen: boolean, job: Job | null }>({ isOpen: false, job: null });
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!userId) {
      navigate('/smartphone/auth');
      return;
    }

    const fetchData = async () => {
      try {
        const userData = await api.getUser(userId);
        if (!userData) {
          navigate('/smartphone/onboarding');
          return;
        }
        setUser(userData);

        // Fetch transactions for all users
        const txs = await api.getTransactions(userId);
        setTransactions(txs);

        if (userData.role === 'worker') {
          const profileData = await api.getWorkerProfile(userId);
          if (profileData) {
            setProfile(profileData);
            const allJobs = await api.getJobs();
            const myJobs = allJobs.filter(j => j.workerId === userId);
            setRecentJobs(myJobs.slice(0, 5));
          } else {
            navigate('/smartphone/register-skill');
          }
        } else {
          const allJobs = await api.getJobs();
          const myJobs = allJobs.filter(j => j.clientId === userId);
          setRecentJobs(myJobs.slice(0, 5));

          const workers = await api.getWorkers();
          setNearbyWorkers(workers.slice(0, 4) as any);
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleStartJob = async (job: Job) => {
    try {
      await api.updateJobStatus(job.id, 'in_progress');
      setRecentJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'in_progress' } : j));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteJob = async (job: Job) => {
    try {
      await api.updateJobStatus(job.id, 'completed', job.workerId);
      setRecentJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'completed' } : j));
      if (user?.role === 'client') {
        setSelectedJobForTip(job);
        setShowRatingModal({ isOpen: true, job });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!showRatingModal.job || !user || !showRatingModal.job.workerId) return;
    try {
      await api.createReview({
        id: `rev_${Date.now()}`,
        jobId: showRatingModal.job.id,
        reviewerId: user.id,
        workerId: showRatingModal.job.workerId,
        rating,
        comment
      });
      setShowRatingModal({ isOpen: false, job: null });
      alert("Asante! Your feedback helps the community grow.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating.");
    }
  };

  if (loading) return <LoadingState message="Connecting to SkillMesh..." />;

  const DashboardContent = () => {
    if (user?.role === 'worker') {
      return (
        <WorkerDashboard 
          user={user} 
          profile={profile} 
          jobs={recentJobs} 
          transactions={transactions}
          onStart={handleStartJob}
          onComplete={handleCompleteJob}
          onReport={(id) => setShowBaraza({ isOpen: true, jobId: id })} 
          setShowScoreDoctrine={setShowScoreDoctrine}
        />
      );
    }
    if (user?.role === 'introducer') {
      return <IntroducerDashboard user={user} />;
    }
    return (
      <ClientDashboard 
        user={user!} 
        jobs={recentJobs} 
        nearbyWorkers={nearbyWorkers}
        transactions={transactions}
        onComplete={handleCompleteJob} 
        onReport={(id) => setShowBaraza({ isOpen: true, jobId: id })} 
      />
    );
  };

  return (
    <PageContainer>
      <DashboardContent />

      <AnimatePresence>
        {showBaraza.isOpen && (
          <div className="fixed inset-0 bg-stone-900/95 backdrop-blur-xl z-[70] flex items-center justify-center p-6">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-brand-cream w-full max-w-lg rounded-[64px] p-12 neumorph-raised relative overflow-hidden"
            >
              <div className="absolute inset-0 kanga-pattern opacity-5" />
              <button 
                onClick={() => setShowBaraza({ isOpen: false })}
                className="absolute top-8 right-8 p-3 bg-white rounded-2xl text-stone-300 hover:text-brand-red transition-all shadow-sm border border-stone-100 relative z-10"
               >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 space-y-10 text-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-red text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                    Digital Baraza
                  </div>
                  <h3 className="text-5xl font-black serif tracking-tighter leading-none">Seek Justice.</h3>
                  <p className="text-2xl text-brand-indigo font-black serif italic opacity-80 leading-none">Baraza la Kidijitali linaanza...</p>
                </div>

                <div className="p-8 bg-white/50 rounded-[40px] border border-whiteShadow text-left space-y-6">
                   <p className="text-sm text-stone-500 serif italic leading-relaxed">
                     Your case will be reviewed by three community elders. A verdict will be delivered within 48 hours.
                   </p>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs font-black text-brand-indigo uppercase tracking-widest">
                         <div className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
                         Status: Awaiting Elder Review
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    alert("Issue reported to the Baraza. Trust the process.");
                    setShowBaraza({ isOpen: false });
                  }}
                  className="w-full py-6 bg-brand-indigo text-brand-gold rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-brand-brown transition-all"
                >
                  Submit to Elders
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showScoreDoctrine && (
          <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-brand-cream w-full max-w-lg rounded-[56px] p-12 neumorph-raised relative overflow-hidden"
            >
              <div className="absolute inset-0 kanga-pattern opacity-5" />
              <button 
                onClick={() => setShowScoreDoctrine(false)}
                className="absolute top-8 right-8 p-3 bg-white rounded-2xl text-stone-300 hover:text-brand-red transition-all shadow-sm border border-stone-100 relative z-10"
               >
                <X className="w-5 h-5" />
              </button>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-4 text-center">
                  <h3 className="text-4xl font-black serif tracking-tighter leading-none text-stone-900">The Honor Formula</h3>
                  <p className="text-xl text-brand-red font-black serif italic opacity-80 leading-none">Je, alama yangu inahesabiwaje?</p>
                </div>

                <div className="space-y-6">
                  {[
                    { label: '40% Job Completion', sub: 'Completed / Accepted ratio', color: 'bg-brand-red' },
                    { label: '30% Confirmation Rate', sub: 'MALIZA marked without dispute', color: 'bg-brand-indigo' },
                    { label: '20% Community Vouches', sub: 'Introducer endorsements', color: 'bg-brand-gold' },
                    { label: '10% Active Presence', sub: 'Months of reliability', color: 'bg-brand-brown' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 bg-white rounded-[28px] neumorph-flat border border-white/20">
                      <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white font-black text-xs`}>{item.label.split('%')[0]}%</div>
                      <div>
                        <p className="font-black text-stone-900 serif leading-none">{item.label.split('%')[1].trim()}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] leading-relaxed text-center px-4 italic border-t border-stone-200/50 pt-8">
                  Honor is earned through consistency, not purchased through promotion.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {selectedJobForTip && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-brand-cream w-full max-w-sm rounded-[56px] p-10 neumorph-raised relative overflow-hidden"
            >
              <div className="absolute inset-0 kanga-pattern opacity-[0.03] pointer-events-none" />
              <button 
                onClick={() => setSelectedJobForTip(null)}
                className="absolute top-8 right-8 p-3 bg-white rounded-2xl text-stone-300 hover:text-brand-red transition-all shadow-sm border border-stone-100 relative z-10"
               >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-8 pt-6 relative z-10">
                <div className="w-24 h-24 bg-brand-red/10 rounded-[32px] mx-auto flex items-center justify-center text-brand-red shadow-xl border border-brand-red/5">
                  <Heart className="w-12 h-12 fill-brand-red" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-5xl font-black serif tracking-tighter leading-none">Asante Drop?</h3>
                  <p className="text-xl text-stone-600 serif italic opacity-80 leading-none">Did {recentJobs.find(j => j.id === selectedJobForTip.id)?.workerId === user?.uid ? 'you serve well?' : 'the fundi serve you well?'}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] leading-relaxed italic border-t border-stone-50 pt-8">
                    Your tip keeps FundiConnect free for fundis.
                  </p>
                  <p className="text-[9px] text-brand-red font-black uppercase tracking-[0.2em] leading-relaxed">
                    No fundi takes a cent of this — it's platform survival only.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   {[10, 20, 50].map(amount => (
                     <button
                       key={amount}
                       onClick={() => {
                         const job = recentJobs.find(j => j.id === selectedJobForTip?.id);
                         setSelectedJobForTip(null);
                         navigate(`/smartphone/asante-drop?jobId=${job?.id || ''}&worker=${encodeURIComponent(job?.workerId || 'the fundi')}&amount=${amount}`);
                       }}
                       className="py-6 bg-brand-red text-white rounded-[24px] font-black shadow-2xl hover:bg-brand-brown active:scale-95 transition-all text-xs uppercase tracking-widest border-b-4 border-brand-brown/50"
                     >
                       {amount}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={() => setSelectedJobForTip(null)}
                  className="text-stone-400 font-black uppercase tracking-[0.4em] text-[9px] hover:text-brand-indigo transition-colors"
                >
                  Badaye / Maybe next time
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showRatingModal.isOpen && (
          <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
            <RatingModal 
              onClose={() => setShowRatingModal({ isOpen: false, job: null })}
              onSubmit={handleSubmitRating}
              targetName={user?.role === 'worker' ? 'the client' : 'the fundi'}
            />
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

function RatingModal({ onClose, onSubmit, targetName }: { onClose: () => void, onSubmit: (rating: number, comment: string) => void, targetName: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="bg-brand-cream w-full max-w-sm rounded-[56px] p-10 neumorph-raised relative overflow-hidden"
    >
      <div className="absolute inset-0 kanga-pattern opacity-[0.03] pointer-events-none" />
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 p-3 bg-white rounded-2xl text-stone-300 hover:text-brand-red transition-all shadow-sm border border-stone-100 relative z-10"
       >
        <X className="w-5 h-5" />
      </button>

      <div className="text-center space-y-8 pt-6 relative z-10">
        <div className="w-24 h-24 bg-brand-gold/10 rounded-[32px] mx-auto flex items-center justify-center text-brand-gold shadow-xl border border-brand-gold/5">
          <Star className="w-12 h-12 fill-brand-gold" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-4xl font-black serif tracking-tighter leading-none">Rate {targetName}</h3>
          <p className="text-sm text-stone-600 serif italic opacity-80">Your rating helps build community trust.</p>
        </div>

        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star className={`w-8 h-8 ${star <= rating ? 'fill-brand-gold text-brand-gold' : 'text-stone-200'}`} />
            </button>
          ))}
        </div>

        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional: How was the experience?"
          className="w-full bg-white/50 rounded-[28px] p-6 border border-stone-100 focus:ring-2 focus:ring-brand-red/20 outline-none serif italic text-sm min-h-[100px] resize-none"
        />

        <button 
          onClick={() => onSubmit(rating, comment)}
          className="w-full py-6 bg-brand-indigo text-brand-gold rounded-[24px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-brand-brown transition-all"
        >
          Submit Rating
        </button>
      </div>
    </motion.div>
  );
}

function WorkerDashboard({ user, profile, jobs, transactions, onStart, onComplete, onReport, setShowScoreDoctrine }: { user: User, profile: WorkerProfile | null, jobs: Job[], transactions: any[], onStart: (job: Job) => void, onComplete: (job: Job) => void, onReport: (id: string) => void, setShowScoreDoctrine: (val: boolean) => void }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-12 pb-10">
      <header className="flex justify-between items-center px-1">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] sm:rounded-[32px] bg-brand-cream border-4 border-white shadow-lg overflow-hidden shrink-0">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-brand-red flex items-center justify-center text-white font-black serif italic text-2xl sm:text-3xl`}>
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter serif leading-none text-stone-900">Habari, {user.name.split(' ')[0]}</h1>
            <div className="flex items-center text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] leading-none mt-1">
              <MapPin className="w-3 h-3 mr-1.5 text-brand-red" /> {user.location || "Ruiru"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/smartphone/mesh')}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 rounded-2xl text-stone-400 transition-all active:bg-brand-red active:text-white"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-stone-50 rounded-2xl text-stone-400 transition-all active:bg-brand-red active:text-white">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowScoreDoctrine(true)}
        className="bg-brand-indigo text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden ring-1 ring-white/10 cursor-pointer group active:scale-[0.98] transition-all"
      >
        <div className="absolute inset-0 kanga-pattern opacity-10" />
        <div className="relative z-10 space-y-10">
          <div className="flex justify-between items-center">
            <div 
              onClick={(e) => { e.stopPropagation(); navigate('/smartphone/verify-worker'); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-gold text-brand-indigo rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg"
            >
              <Award className="w-3.5 h-3.5" />
              {profile?.trustLevel === 'verified' ? 'Verified Fundi' : 'Get Verified'}
            </div>
          </div>
          
          <div className="space-y-1 px-1">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter serif leading-none drop-shadow-sm">{profile?.skills?.[0] || 'Unskilled'}</h2>
            <p className="text-white/60 serif italic text-xl px-1">{profile?.isVouched ? 'Vouched by Community' : 'Standard Credibility'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-8 rounded-[36px] border border-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
              <div className="text-4xl font-black leading-none serif">{profile?.completedJobsCount || 0}</div>
              <div className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mt-3">{profile?.completedJobsCount === 1 ? 'Job' : 'Jobs'}</div>
            </div>
            <div className="bg-white/5 p-8 rounded-[36px] border border-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
              <div className="text-4xl font-black leading-none serif text-brand-gold">{profile?.badges?.length || 0}</div>
              <div className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mt-3">Badges</div>
            </div>
          </div>
        </div>
        
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-gold/20 rounded-full blur-[80px]" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-brand-red/20 rounded-full blur-[80px]" />
      </motion.div>

      <section className="grid grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/smartphone/jobs')}
          className="bg-brand-red text-white p-8 rounded-[40px] shadow-xl flex flex-col items-center justify-center space-y-4 hover:bg-stone-900 active:scale-95 active:translate-y-1 transition-all border-b-8 border-black/20"
        >
          <div className="p-4 bg-white/10 rounded-2xl shadow-inner">
            <Briefcase className="w-8 h-8" />
          </div>
          <span className="uppercase tracking-[0.2em] text-[10px] font-black">Find Jobs</span>
        </button>
        <button
          onClick={() => navigate('/smartphone/mesh')}
          className="bg-stone-50 text-stone-900 p-8 rounded-[40px] shadow-sm flex flex-col items-center justify-center space-y-4 hover:bg-white hover:shadow-lg active:scale-95 transition-all border border-stone-100"
        >
          <div className="p-4 bg-white rounded-2xl text-brand-red shadow-sm border border-stone-100">
            <MapPin className="w-8 h-8" />
          </div>
          <span className="uppercase tracking-[0.2em] text-[10px] font-black">Mesh Map</span>
        </button>
      </section>

      <section className="space-y-8 px-1">
        <div className="flex justify-between items-end px-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">Management</p>
            <h3 className="text-2xl font-black tracking-tight serif leading-none">Recent Jobs</h3>
          </div>
        </div>
        
        <div className="grid gap-4">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200">
               <p className="text-stone-400 serif italic text-lg">No assignments yet.</p>
               <button onClick={() => navigate('/smartphone/jobs')} className="mt-4 text-[9px] font-black uppercase tracking-widest text-brand-red underline decoration-2">Browse Board</button>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-[36px] shadow-sm border border-stone-50 flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${['accepted', 'in_progress'].includes(job.status) ? 'bg-brand-indigo/5 text-brand-indigo' : 'bg-brand-red/5 text-brand-red'}`}>
                    {['accepted', 'in_progress'].includes(job.status) ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="font-black text-stone-900 text-lg serif leading-tight capitalize">{job.skillNeeded}</p>
                    <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'in_progress' ? 'bg-brand-gold animate-pulse' : 'bg-stone-300'}`} />
                       {job.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {job.status === 'accepted' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onStart(job); }}
                      className="px-6 py-3 bg-brand-indigo text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                      Anza
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onComplete(job); }}
                      className="px-6 py-3 bg-brand-red text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg active:scale-95 transition-all"
                    >
                      Maliza
                    </button>
                  )}
                  <ChevronRight className="w-5 h-5 text-stone-200" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <TransactionHistory transactions={transactions} />
    </div>
  );
}

function ClientDashboard({ user, jobs, nearbyWorkers, transactions, onComplete, onReport }: { user: User, jobs: Job[], nearbyWorkers: (User & WorkerProfile)[], transactions: any[], onComplete: (job: Job) => void, onReport: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-12 pb-10">
       <header className="flex justify-between items-center px-1">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] sm:rounded-[32px] bg-brand-cream border-4 border-white shadow-lg overflow-hidden shrink-0">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-brand-red flex items-center justify-center text-white font-black serif italic text-2xl sm:text-3xl`}>
                {user.name[0]}
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter serif leading-none text-stone-900">Habari, {user.name.split(' ')[0]}</h1>
            <p className="text-brand-red font-black uppercase tracking-widest text-[9px] bg-brand-red/5 px-2 py-0.5 rounded-full inline-block mt-1">Neighbor · Ruiru</p>
          </div>
        </div>
        <button 
            onClick={() => navigate('/smartphone/mesh')}
            className="w-12 h-12 flex items-center justify-center bg-stone-50 rounded-2xl text-stone-400 transition-all active:bg-brand-red active:text-white"
        >
            <MapPin className="w-5 h-5" />
        </button>
      </header>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/smartphone/request-job')}
        className="w-full bg-brand-indigo text-white p-12 rounded-[56px] shadow-2xl flex flex-col items-center space-y-8 text-center relative overflow-hidden group active:scale-[0.98] transition-all"
      >
        <div className="absolute inset-0 kanga-pattern opacity-10" />
        <div className="relative z-10 space-y-5 flex flex-col items-center">
          <div className="bg-white/10 p-8 rounded-[40px] border border-white/10 group-hover:bg-brand-red transition-all shadow-2xl">
            <Plus className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tighter serif leading-none">Request Fundi</h2>
            <p className="text-brand-gold mt-1 serif italic text-2xl opacity-80 leading-none">Verified neighbors in Ruiru.</p>
          </div>
        </div>
      </motion.button>

      <section className="grid grid-cols-2 gap-6 px-1">
        <button
          onClick={() => navigate('/smartphone/skills')}
          className="bg-stone-50 text-stone-900 p-8 rounded-[40px] shadow-sm flex flex-col items-center justify-center space-y-4 hover:shadow-lg active:scale-95 transition-all border border-stone-100"
        >
          <div className="p-4 bg-white rounded-2xl text-brand-red shadow-sm border border-stone-100">
            <Search className="w-8 h-8" />
          </div>
          <span className="uppercase tracking-[0.2em] text-[10px] font-black">Browse Skills</span>
        </button>
        <button
          onClick={() => navigate('/smartphone/mesh')}
          className="bg-stone-50 text-stone-900 p-8 rounded-[40px] shadow-sm flex flex-col items-center justify-center space-y-4 hover:shadow-lg active:scale-95 transition-all border border-stone-100"
        >
          <div className="p-4 bg-white rounded-2xl text-brand-red shadow-sm border border-stone-100">
            <MapPin className="w-8 h-8" />
          </div>
          <span className="uppercase tracking-[0.2em] text-[10px] font-black">Neighbor Map</span>
        </button>
      </section>

      <section className="space-y-8">
        <div className="flex justify-between items-end px-3">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">Quick Find</p>
            <h3 className="text-2xl font-black tracking-tight serif leading-none">Popular Skills</h3>
          </div>
          <button 
            onClick={() => navigate('/smartphone/skills')}
            className="text-[10px] font-black uppercase tracking-widest text-brand-indigo hover:text-brand-red transition-all underline underline-offset-4 decoration-2"
          >
            All Skills
          </button>
        </div>
        
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 px-4 scrollbar-hide snap-x snap-mandatory">
          {SKILLS.slice(0, 8).map((skill) => (
            <button
              key={skill}
              onClick={() => navigate(`/smartphone/category/${encodeURIComponent(skill)}`)}
              className="flex-shrink-0 w-28 sm:w-32 h-28 sm:h-32 bg-stone-50 rounded-[36px] overflow-hidden snap-center relative group active:scale-95 transition-all shadow-sm border border-white"
            >
              <img 
                src={SKILL_IMAGES[skill] || null} 
                alt={skill} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent flex flex-col items-center justify-end p-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-white leading-tight drop-shadow-md">
                  {skill.split('(')[0].trim()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {nearbyWorkers.length > 0 && (
        <section className="space-y-8 px-1">
          <div className="flex justify-between items-end px-3">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">Verified neighbors</p>
              <h3 className="text-2xl font-black tracking-tight serif leading-none">Neighbor Matching</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {nearbyWorkers.map((worker) => (
              <button
                key={worker.userId}
                onClick={() => navigate(`/smartphone/category/${encodeURIComponent(worker.skills?.[0] || '')}`)}
                className="relative h-[180px] sm:h-[260px] md:h-[320px] overflow-hidden rounded-[32px] sm:rounded-[40px] group active:scale-95 transition-all shadow-xl bg-stone-100"
              >
                <img 
                  src={SKILL_IMAGES[worker.skills?.[0] || ''] || null} 
                  alt={worker.skills?.[0]} 
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.1]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/95 via-stone-900/10 to-transparent flex flex-col justify-end p-6">
                  <p className="text-2xl font-black leading-tight serif text-white drop-shadow-md">{worker.name?.split(' ')[0]}.</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold mt-1.5 opacity-90">
                    {worker.skills?.[0]}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <Star className="w-3 h-3 text-brand-gold fill-brand-gold" />
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{worker.trustScore}% Trust</span>
                  </div>
                </div>
                {worker.trustLevel === 'verified' && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-brand-gold" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-8 px-1">
        <div className="space-y-1 px-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">History</p>
          <h3 className="text-2xl font-black tracking-tight serif leading-none">Your Requests</h3>
        </div>
        <div className="grid gap-4">
          {jobs.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200">
               <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center text-stone-100 shadow-sm">
                 <Briefcase className="w-8 h-8" />
               </div>
               <p className="text-stone-400 serif italic text-lg leading-none">No requests yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-[36px] shadow-sm border border-stone-50 flex items-center justify-between group active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300">
                       <Briefcase className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-lg font-black serif text-stone-900 leading-none capitalize">{job.skillNeeded}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mt-1.5 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${['accepted', 'in_progress'].includes(job.status) ? 'bg-brand-gold animate-pulse' : 'bg-stone-200'}`} />
                          {job.status.replace('_', ' ')}
                       </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {job.status === 'completed' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onComplete(job); }}
                        className="px-6 py-3 bg-brand-indigo text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg active:scale-95 transition-all"
                      >
                        Rate
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-stone-200" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <TransactionHistory transactions={transactions} />
    </div>
  );
}

function TransactionHistory({ transactions }: { transactions: any[] }) {
  return (
    <section className="space-y-8 px-1 mt-12 pb-10">
      <div className="space-y-1 px-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red leading-none">Database Ledger</p>
        <h3 className="text-2xl font-black tracking-tight serif leading-none">M-Pesa Records</h3>
      </div>
      <div className="bg-white rounded-[48px] shadow-sm border border-stone-50 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-stone-400 serif italic">No transactions recorded in Neon DB.</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center text-brand-red">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-black text-stone-900 serif leading-none capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mt-1.5">{tx.mpesa_receipt || 'Pending PIN'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-stone-900 serif leading-none">KES {tx.amount}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-indigo mt-1.5">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {transactions.length > 5 && (
        <p className="text-center text-[9px] font-black uppercase tracking-[0.3em] text-stone-300">Detailed history available in profile</p>
      )}
    </section>
  );
}

function IntroducerDashboard({ user }: { user: User }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col p-6 space-y-10 max-w-4xl mx-auto pb-24">
       <header className="flex justify-between items-center px-2">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[32px] bg-brand-cream neumorph-raised p-1 overflow-hidden border-4 border-white">
            <div className={`w-full h-full bg-brand-gold rounded-[28px] flex items-center justify-center text-brand-indigo font-black serif italic text-3xl`}>
              {user.name[0]}
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter serif leading-none">{user.name}</h1>
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-[0.25em]">Community Introducer / Mwangalizi</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
                onClick={() => navigate('/smartphone/mesh')}
                className="p-4 bg-brand-cream rounded-[24px] neumorph-flat text-stone-400 hover:text-brand-red transition-all"
            >
                <MapPin className="w-6 h-6" />
            </button>
            <button 
                onClick={() => {
                  localStorage.removeItem('mesh_user_id');
                  navigate('/smartphone/auth');
                }}
                className="p-4 bg-brand-cream rounded-[24px] neumorph-flat text-brand-red hover:text-stone-900 transition-all"
            >
                <LogOut className="w-6 h-6" />
            </button>
        </div>
      </header>

      <div className="bg-brand-indigo text-white p-12 rounded-[64px] shadow-2xl relative overflow-hidden">
         <div className="absolute inset-0 kanga-pattern opacity-10" />
         <div className="relative z-10 space-y-10">
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold">Trust Stewardship</p>
               <h2 className="text-6xl font-black serif tracking-tighter leading-none">100% Honor Kept</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                  <p className="text-4xl font-black serif">4</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">Vouched Fundis</p>
               </div>
               <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
                  <p className="text-4xl font-black serif">23</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-2">Community Jobs</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <button 
            onClick={() => navigate('/smartphone/mesh')}
            className="bg-white p-10 rounded-[48px] neumorph-raised flex flex-col items-center gap-4 group"
          >
            <div className="p-5 bg-brand-cream rounded-2xl neumorph-flat text-brand-red group-hover:scale-110 transition-transform">
               <MapPin className="w-10 h-10" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Mesh Map</span>
         </button>
         <button className="bg-white p-10 rounded-[48px] neumorph-raised flex flex-col items-center gap-4 group">
            <div className="p-5 bg-brand-cream rounded-2xl neumorph-flat text-brand-gold group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-10 h-10" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Vouch Fundi</span>
         </button>
         <button className="bg-white p-10 rounded-[48px] neumorph-raised flex flex-col items-center gap-4 group">
            <div className="p-5 bg-brand-cream rounded-2xl neumorph-flat text-brand-indigo group-hover:scale-110 transition-transform">
               <Heart className="w-10 h-10" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Sponsor</span>
         </button>
      </div>

      <section className="space-y-8">
         <h3 className="text-3xl font-black serif tracking-tight px-4">Honor Ledger</h3>
         <div className="bg-brand-cream rounded-[48px] neumorph-raised p-8 border border-white/50 space-y-6">
            <p className="text-stone-400 serif italic text-center py-10 opacity-60 px-8 leading-relaxed">
              When a fundi you vouch for completes a job, your stewardship grows. If they fail, your honor falls.
            </p>
         </div>
      </section>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled }: { icon: ReactNode, label: string, onClick: () => void, disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`bg-white p-8 rounded-[36px] shadow-xl border border-stone-100 flex flex-col items-center space-y-4 transition-all hover:shadow-2xl hover:border-brand-red disabled:opacity-50 text-stone-900 font-black active:scale-95`}
    >
      <div className="bg-brand-cream p-5 rounded-[24px] text-brand-red shadow-inner">
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-[0.25em]">{label}</span>
    </button>
  );
}

