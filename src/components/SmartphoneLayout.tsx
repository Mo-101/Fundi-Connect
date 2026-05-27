import { ReactNode } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Map as MapIcon, Briefcase, MessageSquare, Users2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function SmartphoneLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/smartphone/dashboard' },
    { icon: <MapIcon className="w-5 h-5" />, label: 'Mesh', path: '/smartphone/mesh' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'Chat', path: '/smartphone/messages' },
    { icon: <Users2 className="w-5 h-5" />, label: 'Community', path: '/smartphone/community' },
  ];

  const hideNavPaths = ['/smartphone/auth', '/smartphone/onboarding', '/smartphone/register-skill'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);
  const isMapPath = location.pathname === '/smartphone/mesh';

  return (
    <div className={`min-h-screen bg-brand-cream relative overflow-x-hidden ${isMapPath ? '' : 'pb-32'}`}>
      {!isMapPath && (
        <>
          <div className="pointer-events-none fixed left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-brand-indigo/10 blur-3xl float-slow" />
          <div className="pointer-events-none fixed right-[-10rem] top-32 h-96 w-96 rounded-full bg-brand-olive/10 blur-3xl float-slow" />
          <div className="pointer-events-none fixed inset-0 kanga-pattern" />
        </>
      )}
      <div className={`${isMapPath ? 'w-full h-full' : 'max-w-4xl mx-auto min-h-screen relative'}`}>
        <Outlet />
      </div>

      {!shouldHideNav && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-md">
          <div className="glass-panel holo-border rounded-[32px] p-2 flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative p-4 group flex flex-col items-center gap-1"
                >
                  <div className={`transition-all duration-300 ${isActive ? 'text-brand-indigo scale-110 drop-shadow-sm' : 'text-slate-400 group-hover:text-brand-indigo'}`}>
                    {item.icon}
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-2xl bg-brand-indigo/10 -z-10 pulse-glow"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActive ? 'text-brand-black' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
