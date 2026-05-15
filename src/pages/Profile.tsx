import React from 'react';
import { api } from '../lib/api';
import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { LoadingState } from '../components/standard/StateComponents';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, ShieldCheck, MapPin, Phone, Mail, Award, Clock, Star, Briefcase, Heart, CreditCard, HelpCircle, Settings, ChevronRight, LogOut } from 'lucide-react';
import { WorkerProfile } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = React.useState<any>(null);
  const [workerProfile, setWorkerProfile] = React.useState<WorkerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (userId) {
      const fetchData = async () => {
        try {
          const ud = await api.getUser(userId);
          if (ud) {
            setUserData(ud);
            if (ud.role === 'worker') {
              const wp = await api.getWorkerProfile(userId);
              if (wp) setWorkerProfile(wp);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      navigate('/smartphone/auth');
    }
  }, [navigate]);

  if (loading) return <LoadingState />;

  const handleLogout = () => {
    localStorage.removeItem('mesh_user_id');
    navigate('/smartphone/auth');
  };

  const skill = workerProfile?.skills?.[0] || '';

  return (
    <PageContainer>
      <div className="pb-32">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-brand-indigo to-stone-900 text-white p-8 pt-12 pb-16 rounded-b-[48px] shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 kanga-pattern opacity-10" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/30 p-1 shadow-2xl overflow-hidden shrink-0">
              {userData?.photoUrl ? (
                <img src={userData.photoUrl} alt="" className="w-full h-full object-cover rounded-[20px]" />
              ) : (
                <div className="w-full h-full bg-brand-red rounded-[20px] flex items-center justify-center text-white text-3xl font-black serif italic">
                  {userData?.name?.[0]}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black serif text-white tracking-tight leading-none">{userData?.name}</h2>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold" /> {userData?.location || 'Ruiru, Kenya'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="px-6 -mt-8 relative z-20">
          <div className="bg-white rounded-[32px] shadow-xl border border-stone-100 p-6 grid grid-cols-3 gap-4 text-center divide-x divide-stone-50">
            <div>
              <p className="text-2xl font-black text-stone-900 serif leading-none">{workerProfile?.completedJobsCount || 0}</p>
              <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.1em] mt-2">Bookings</p>
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 serif leading-none">0</p>
              <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.1em] mt-2">Reviews</p>
            </div>
            <div>
              <p className="text-2xl font-black text-stone-900 serif leading-none">{workerProfile?.trustScore || 0}%</p>
              <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.1em] mt-2">Trust</p>
            </div>
          </div>
        </div>

        {/* Worker Badge */}
        {userData?.role === 'worker' && (
          <div className="px-6 mt-8">
            <div className="bg-brand-gold/10 border border-brand-gold/20 p-6 rounded-[32px] flex items-center gap-5">
              <div className="w-14 h-14 bg-brand-gold rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 shrink-0">
                <Award className="w-8 h-8 text-brand-indigo" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-stone-900 leading-none">Verified {skill || 'Fundi'}</h4>
                <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-2">{workerProfile?.isVouched ? 'Vouched by Community' : 'Standard Credibility'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="px-6 mt-10 space-y-3">
          {[
            { label: 'Saved Fundis', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', path: '/smartphone/saved' },
            { label: 'Payments', icon: CreditCard, color: 'text-brand-indigo', bg: 'bg-brand-indigo/5', path: '/smartphone/payments' },
            { label: 'Help & Support', icon: HelpCircle, color: 'text-stone-600', bg: 'bg-stone-50', path: '/smartphone/support' },
            { label: 'Settings', icon: Settings, color: 'text-stone-400', bg: 'bg-stone-50', path: '/smartphone/settings' }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => navigate(item.path)}
              className="w-full bg-white border border-stone-50 rounded-[28px] p-4 flex items-center gap-5 text-left hover:bg-stone-50 active:scale-[0.98] transition-all shadow-sm group"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="font-black serif text-stone-900 text-lg flex-1 tracking-tight">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-stone-200 group-hover:text-stone-900 transition-colors" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 mt-12 space-y-6">
           <div className="bg-stone-50 rounded-[40px] p-8 border border-stone-100 flex flex-col items-center text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Identity Status</p>
              <ShieldCheck className="w-10 h-10 text-brand-gold" />
              <p className="font-black text-stone-900 text-xl serif leading-none">{userData?.isVerified ? 'Identity Verified' : 'Standard Account'}</p>
              <button 
                onClick={() => navigate('/smartphone/verify-worker')}
                className="text-[9px] font-black uppercase tracking-widest text-brand-indigo underline underline-offset-4 decoration-2"
              >
                {userData?.isVerified ? 'View Credentials' : 'Verify My Identity'}
              </button>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 py-6 text-brand-red font-black uppercase tracking-widest text-xs hover:bg-brand-red/5 rounded-[28px] transition-colors"
           >
             <LogOut className="w-5 h-5" />
             Log Out Account
           </button>
        </div>
      </div>
    </PageContainer>
  );
}
