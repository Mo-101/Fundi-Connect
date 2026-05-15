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
    <div className={`min-h-screen bg-brand-cream ${isMapPath ? '' : 'pb-32'}`}>
      <div className={`${isMapPath ? 'w-full h-full' : 'max-w-4xl mx-auto min-h-screen relative'}`}>
        <Outlet />
      </div>

      {!shouldHideNav && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-3rem)] max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-2 flex justify-around items-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/50 ring-1 ring-black/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative p-4 group flex flex-col items-center gap-1"
                >
                  <div className={`transition-all duration-300 ${isActive ? 'text-brand-red scale-110' : 'text-stone-300 group-hover:text-stone-600'}`}>
                    {item.icon}
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-red/5 rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActive ? 'text-stone-900' : 'text-stone-300'}`}>
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
