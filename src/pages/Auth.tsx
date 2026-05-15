import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, PhoneIncoming } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (userId) {
      navigate('/smartphone/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (overrideId?: string) => {
    const numericPhone = phone.replace(/\D/g, '');
    const finalId = overrideId || `user_${numericPhone}`;
    
    if (!overrideId && (!phone || numericPhone.length < 7)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('mesh_user_id', finalId);

      // Check if profile exists in Neon
      const profile = await api.getUser(finalId);

      if (!profile) {
        navigate('/smartphone/onboarding');
      } else {
        navigate('/smartphone/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError('Authentication service error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-brand-cream relative overflow-hidden">
      <div className="absolute inset-0 kanga-pattern opacity-5" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-brand-gold/10 rounded-full blur-[100px]" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-red/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-10 md:p-16 rounded-[32px] sm:rounded-[48px] shadow-2xl border border-black/5 max-w-md w-full text-center space-y-6 sm:space-y-8 relative z-10"
      >
        <div className="flex justify-center">
          <div className="bg-brand-indigo p-6 rounded-[32px] text-brand-gold shadow-2xl group hover:scale-110 transition-transform">
            <Shield className="w-12 h-12" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-stone-900 leading-tight serif">Mesh Auth</h1>
          <p className="text-xl text-brand-red font-black serif italic opacity-80">Karibu kwenye mtandao.</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <input 
              type="tel" 
              placeholder="+254..." 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full bg-stone-50 p-6 rounded-2xl border-2 border-transparent focus:border-brand-red focus:bg-white outline-none font-black text-xl serif transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
              {error}
            </div>
          )}

          <button 
            onClick={() => handleLogin()}
            disabled={loading}
            className="w-full py-6 bg-brand-red text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 hover:bg-brand-brown transition-all shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <PhoneIncoming className="w-5 h-5" />
                <span>Enter Mesh</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleLogin('test_worker')}
            className="p-4 bg-brand-indigo/5 text-brand-indigo rounded-xl text-[9px] font-black uppercase tracking-widest border border-brand-indigo/10 hover:bg-brand-indigo/10"
          >
            Test Worker
          </button>
          <button 
            onClick={() => handleLogin('test_client')}
            className="p-4 bg-brand-gold/5 text-brand-gold rounded-xl text-[9px] font-black uppercase tracking-widest border border-brand-gold/10 hover:bg-brand-gold/10"
          >
            Test Client
          </button>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.25em] px-4 leading-relaxed">
             Verified by Neon Database trust protocol
           </p>
        </div>
      </motion.div>
    </div>
  );
}
