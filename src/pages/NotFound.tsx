import { Link } from 'react-router-dom';
import { AppShell, PageContainer } from '../components/standard/AppShell';
import { Ghost, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <AppShell>
      <PageContainer className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
        <div className="relative">
          <Ghost className="w-32 h-32 text-stone-100 animate-bounce" />
          <div className="absolute inset-x-0 -bottom-4 h-4 bg-stone-900/5 blur-xl rounded-full" />
        </div>
        <div className="space-y-2">
          <h1 className="text-6xl font-black serif tracking-tighter text-stone-900">404</h1>
          <p className="text-2xl font-black serif italic text-brand-indigo">Lost in the Mesh</p>
          <p className="text-stone-400 max-w-xs mx-auto mt-4 serif italic">
            This path doesn't seem to lead to any fundi or neighbor. 
            Better head back to the main baraza.
          </p>
        </div>
        <Link 
          to="/smartphone/dashboard" 
          className="flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-indigo transition-all shadow-xl"
        >
          <Home className="w-4 h-4" />
          Back Home
        </Link>
      </PageContainer>
    </AppShell>
  );
}
