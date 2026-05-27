import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Hammer, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { UserRole } from '../types';

export default function Onboarding() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    const userId = localStorage.getItem('mesh_user_id');
    if (!role) return;
    if (!userId) { navigate('/smartphone/auth'); return; }

    setLoading(true);

    // Persist role locally so navigation always works regardless of API status
    localStorage.setItem('mesh_user_role', role);

    const userData = {
      id: userId,
      name: 'Anonymous',
      phone: userId.replace('user_', ''),
      role: role,
      location: '',
      accessType: 'smartphone' as const,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    };

    // Best-effort sync to DB — don't block navigation on failure
    api.saveUser(userData).catch(err => console.warn('[onboarding] saveUser failed:', err));

    setLoading(false);
    if (role === 'worker') {
      navigate('/smartphone/register-skill');
    } else {
      // Clients see the voluntary Asante Drop page before entering the app
      navigate('/smartphone/asante-drop?next=/smartphone/dashboard&entry=true');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center bg-brand-cream px-4 py-5 sm:px-6 sm:py-14 md:py-20 relative overflow-y-auto">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      
      <div className="text-center space-y-2 sm:space-y-4 relative z-10 w-full max-w-sm sm:max-w-2xl">
        <h1 className="text-[28px] sm:text-5xl md:text-7xl font-black text-stone-900 serif leading-[0.92] tracking-tight">Your Role in the Mesh</h1>
        <p className="text-base sm:text-xl md:text-2xl text-brand-red font-black serif italic opacity-80 leading-tight">Je, utashiriki vipi katika jumuiya?</p>
        <p className="text-xs sm:text-base text-stone-500 font-medium italic max-w-sm mx-auto leading-relaxed">Choose how you want to build and benefit from the community.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6 w-full max-w-5xl relative z-10 mt-5 sm:mt-10">
        <RoleCard 
          selected={role === 'worker'}
          onClick={() => setRole('worker')}
          icon={<Hammer className="w-6 h-6 sm:w-9 sm:h-9" />}
          title="I Have a Skill"
          subtitle="Nina ujuzi / Fundi"
          description="Register your jua kali skills and find local job opportunities."
          color="bg-brand-indigo"
        />
        <RoleCard 
          selected={role === 'client'}
          onClick={() => setRole('client')}
          icon={<User className="w-6 h-6 sm:w-9 sm:h-9" />}
          title="I Need Help"
          subtitle="Nahitaji huduma"
          description="Find trusted local fundis for repairs, cleaning, and more."
          color="bg-brand-red"
        />
        <RoleCard 
          selected={role === 'introducer'}
          onClick={() => setRole('introducer')}
          icon={<ShieldCheck className="w-6 h-6 sm:w-9 sm:h-9" />}
          title="Community Introducer"
          subtitle="Mwangalizi"
          description="Elders, Pastors, or Chama heads who vouch for skills & ensure trust."
          color="bg-brand-gold"
        />
      </div>

      <button
        onClick={handleComplete}
        disabled={!role || loading}
        className={`mt-5 sm:mt-10 w-full max-w-sm sm:w-auto sm:max-w-none px-6 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[28px] font-black uppercase tracking-[0.18em] sm:tracking-[0.28em] text-[10px] sm:text-xs flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl transition-all active:scale-95 relative z-10 ${role === 'worker' ? 'bg-brand-indigo text-white' : role === 'client' ? 'bg-brand-red text-white' : role === 'introducer' ? 'bg-brand-gold text-brand-indigo' : 'bg-stone-300 text-white shadow-none'} neumorph-raised`}
      >
        <span className="whitespace-nowrap">Endelea (Continue)</span>
        {loading ? (
             <div className="w-5 h-5 border-2 border-brand-indigo/30 border-t-brand-indigo rounded-full animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

function RoleCard({ selected, onClick, icon, title, subtitle, description, color }: { selected: boolean, onClick: () => void, icon: ReactNode, title: string, subtitle: string, description: string, color: string }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full p-4 sm:p-8 md:p-10 rounded-[24px] sm:rounded-[36px] md:rounded-[40px] cursor-pointer transition-all border-2 flex items-center sm:flex-col text-left sm:text-center gap-4 sm:gap-5 ${
        selected ? `${color} text-white border-transparent shadow-xl sm:shadow-2xl sm:scale-[1.03]` : 'bg-white border-stone-100 hover:border-brand-red/20 hover:scale-[1.01]'
      }`}
    >
      <div className={`shrink-0 p-3 sm:p-5 rounded-2xl sm:rounded-[22px] ${selected ? 'bg-white/10' : 'bg-brand-cream text-stone-900 border border-black/5 shadow-inner'}`}>
        {icon}
      </div>
      <div className="min-w-0 space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl md:text-[28px] font-black serif leading-tight">{title}</h3>
        <p className={`text-sm sm:text-lg font-black serif italic leading-tight ${selected ? 'text-brand-gold' : 'text-brand-red opacity-80'}`}>{subtitle}</p>
        <p className={`text-[11px] sm:text-sm serif italic leading-snug sm:leading-relaxed ${selected ? 'text-white/70' : 'text-stone-500'}`}>{description}</p>
      </div>
    </button>
  );
}
