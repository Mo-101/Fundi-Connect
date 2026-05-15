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
    if (!role || !userId) return;
    
    setLoading(true);
    try {
      const userData = {
        id: userId,
        name: 'Anonymous', // Could add name input later
        phone: userId.replace('user_', ''),
        role: role,
        location: '',
        accessType: 'smartphone' as const,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      };

      await api.saveUser(userData);
      
      if (role === 'worker') {
        navigate('/smartphone/register-skill');
      } else {
        navigate('/smartphone/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-6 bg-brand-cream space-y-16 relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      
      <div className="text-center space-y-6 relative z-10">
        <h1 className="text-6xl md:text-8xl font-black text-stone-900 serif leading-none tracking-tighter">Your Role in the Mesh</h1>
        <p className="text-2xl text-brand-red font-black serif italic opacity-80 leading-none">Je, utashiriki vipi katika jumuiya?</p>
        <p className="text-stone-500 font-medium italic max-w-sm mx-auto">Choose how you want to build and benefit from the community.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl relative z-10 px-4">
        <RoleCard 
          selected={role === 'worker'}
          onClick={() => setRole('worker')}
          icon={<Hammer className="w-10 h-10" />}
          title="I Have a Skill"
          subtitle="Nina ujuzi / Fundi"
          description="Register your jua kali skills and find local job opportunities."
          color="bg-brand-indigo"
        />
        <RoleCard 
          selected={role === 'client'}
          onClick={() => setRole('client')}
          icon={<User className="w-10 h-10" />}
          title="I Need Help"
          subtitle="Nahitaji huduma"
          description="Find trusted local fundis for repairs, cleaning, and more."
          color="bg-brand-red"
        />
        <RoleCard 
          selected={role === 'introducer'}
          onClick={() => setRole('introducer')}
          icon={<ShieldCheck className="w-10 h-10" />}
          title="Community Introducer"
          subtitle="Mwangalizi"
          description="Elders, Pastors, or Chama heads who vouch for skills & ensure trust."
          color="bg-brand-gold"
        />
      </div>

      <button
        onClick={handleComplete}
        disabled={!role || loading}
        className={`px-16 py-6 rounded-[32px] font-black uppercase tracking-[0.3em] text-xs flex items-center space-x-4 disabled:opacity-50 shadow-2xl transition-all active:scale-95 relative z-10 ${role === 'worker' ? 'bg-brand-indigo text-white' : role === 'client' ? 'bg-brand-red text-white' : role === 'introducer' ? 'bg-brand-gold text-brand-indigo' : 'bg-stone-300 text-white shadow-none'} neumorph-raised`}
      >
        <span>Endelea (Continue)</span>
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
    <div 
      onClick={onClick}
      className={`p-12 rounded-[48px] cursor-pointer transition-all border-2 flex flex-col items-center text-center space-y-6 ${
        selected ? `${color} text-white border-transparent shadow-2xl scale-105` : 'bg-white border-stone-100 hover:border-brand-red/20 hover:scale-[1.02]'
      }`}
    >
      <div className={`p-6 rounded-[24px] ${selected ? 'bg-white/10' : 'bg-brand-cream text-stone-900 border border-black/5 shadow-inner'}`}>
        {icon}
      </div>
      <div className="space-y-3">
        <h3 className="text-3xl font-black serif leading-none">{title}</h3>
        <p className={`text-xl font-black serif italic leading-none ${selected ? 'text-brand-gold' : 'text-brand-red opacity-80'}`}>{subtitle}</p>
        <p className={`text-sm serif italic leading-relaxed px-2 ${selected ? 'text-white/60' : 'text-stone-500'}`}>{description}</p>
      </div>
    </div>
  );
}
