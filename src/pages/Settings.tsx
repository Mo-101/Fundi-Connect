import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../components/standard/AppShell';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, LogOut, ChevronRight } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: Bell, label: 'Notifications', sub: 'M-PESA alerts & Job requests' },
    { icon: Shield, label: 'Privacy & Security', sub: 'Manage your mesh visibility' },
    { icon: Smartphone, label: 'Offline Mode', sub: 'SMS & USSD configurations' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mesh_user_id');
    navigate('/smartphone/auth');
  };

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Control your experience." />
      
      <div className="space-y-8 pb-20">
        <div className="grid gap-2">
          {menuItems.map((item, i) => (
            <button 
              key={i} 
              className="w-full bg-white p-6 rounded-[32px] border border-stone-100 flex items-center justify-between group hover:bg-stone-50 transition-all text-left"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-brand-indigo group-hover:text-white transition-all">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-black serif text-stone-900 leading-tight">{item.label}</p>
                  <p className="text-xs text-stone-400 serif italic">{item.sub}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-200" />
            </button>
          ))}
        </div>

        <div className="pt-8 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 px-6">Account Actions</p>
          <button 
            onClick={handleLogout}
            className="w-full bg-brand-red/5 text-brand-red p-8 rounded-[40px] border-4 border-dashed border-brand-red/10 flex items-center justify-center gap-4 hover:bg-brand-red/10 transition-all group"
          >
            <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-[0.2em] text-xs">Logout Session</span>
          </button>
        </div>

        <div className="text-center pt-12">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-stone-200">FundiConnect Africa v1.2.0-stable</p>
        </div>
      </div>
    </PageContainer>
  );
}
