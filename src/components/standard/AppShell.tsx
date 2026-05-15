import React from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { routes } from '../../config/navigation';
import { api } from '../../lib/api';
import { UserRole } from '../../types';
import { motion } from 'motion/react';
import { MoreHorizontal, LogOut, User as UserIcon } from 'lucide-react';

export default function SmartphoneLayout() {
  const location = useLocation();
  const hideNavPaths = ['/smartphone/auth', '/smartphone/onboarding']; 
  const isNavHidden = hideNavPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-brand-indigo/20">
      <main className={`mx-auto min-h-screen w-full bg-white shadow-2xl md:max-w-md lg:max-w-5xl md:pb-8 relative flex flex-col ${!isNavHidden ? 'pb-20' : ''}`}>
        <div className="absolute inset-0 kanga-pattern opacity-5 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
      {!isNavHidden && <BottomNav />}
    </div>
  );
}

// Keep AppShell for explicit wrapping in non-layout contexts if needed
export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavPaths = ['/smartphone/auth', '/smartphone/onboarding'];
  const isNavHidden = hideNavPaths.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-brand-indigo/20">
      <main className={`mx-auto min-h-screen w-full bg-white shadow-2xl md:max-w-md lg:max-w-5xl md:pb-8 relative flex flex-col ${!isNavHidden ? 'pb-20' : ''}`}>
        <div className="absolute inset-0 kanga-pattern opacity-5 pointer-events-none" />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </main>
      {!isNavHidden && <BottomNav />}
    </div>
  );
}

export function PageContainer({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <section className={`w-full px-4 py-5 sm:px-8 md:px-10 md:py-10 animate-in fade-in slide-in-from-bottom-2 duration-500 ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) {
  return (
    <header className="mb-10 flex items-start justify-between px-1">
      <div className="space-y-2">
        <h1 className="text-3xl font-black serif tracking-tight text-stone-900 sm:text-4xl md:text-6xl leading-[0.9]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base font-black serif italic text-brand-red opacity-80 sm:text-lg md:text-xl leading-tight">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = React.useState<UserRole | null>(null);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    const userId = localStorage.getItem('mesh_user_id');
    if (userId) {
      api.getUser(userId).then(userData => {
        if (userData) setRole(userData.role);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mesh_user_id');
    navigate('/smartphone/auth');
    setShowMore(false);
  };

  const activeRoutes = routes.filter(r => r.mobile && (!role || r.roles.includes(role)));
  const moreRoutes = routes.filter(r => !r.mobile && (!role || r.roles.includes(role)));

  const isMoreActive = moreRoutes.some(r => location.pathname === r.path);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-stone-100 bg-white/95 px-2 pb-safe backdrop-blur-xl md:hidden">
        {activeRoutes.slice(0, 4).map((route) => {
          const isActive = location.pathname === route.path;
          return (
            <button
              key={route.path}
              onClick={() => navigate(route.path)}
              className={`relative flex flex-col items-center justify-center space-y-1 transition-all active:scale-90 ${
                isActive ? 'text-brand-red' : 'text-stone-300 hover:text-stone-600'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute -top-4 h-1 w-8 rounded-full bg-brand-red"
                />
              )}
              <route.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {route.label}
              </span>
            </button>
          );
        })}
        
        <button
          onClick={() => setShowMore(true)}
          className={`flex flex-col items-center justify-center space-y-1 transition-all ${
            isMoreActive ? 'text-brand-indigo scale-110' : 'text-stone-300'
          }`}
        >
          <MoreHorizontal className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">More</span>
        </button>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <div 
          className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setShowMore(false)}
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="absolute bottom-0 left-0 right-0 rounded-t-[48px] bg-white p-10 pb-20 space-y-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black serif tracking-tight text-stone-900">Discover More</h3>
              <button 
                onClick={() => setShowMore(false)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {moreRoutes.map(route => (
                <button
                  key={route.path}
                  onClick={() => {
                    navigate(route.path);
                    setShowMore(false);
                  }}
                  className={`flex flex-col items-center justify-center p-8 rounded-[32px] border-4 transition-all gap-4 ${
                    location.pathname === route.path 
                      ? 'border-brand-indigo bg-brand-indigo/5 text-brand-indigo' 
                      : 'border-stone-50 bg-stone-50 text-stone-400'
                  }`}
                >
                  <route.icon className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{route.label}</span>
                </button>
              ))}
              
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center p-8 rounded-[32px] border-4 border-brand-red/10 bg-brand-red/5 text-brand-red gap-4"
              >
                <LogOut className="w-8 h-8" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Logout</span>
              </button>
            </div>
            
            <div className="pt-8 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-200">FundiConnect Africa v1.2</p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
