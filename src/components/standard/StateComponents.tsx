import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-4 p-8">
      <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" />
      <p className="text-sm font-black uppercase tracking-widest text-stone-400">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-6 p-8 text-center">
      <div className="rounded-full bg-brand-red/10 p-4">
        <AlertCircle className="h-10 w-10 text-brand-red" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black serif text-stone-900">Oops! Something went wrong</h3>
        <p className="text-sm text-stone-500 max-w-xs mx-auto">{message}</p>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="rounded-xl bg-stone-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-indigo transition-all"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, actionLabel, onAction, icon: Icon = Inbox }: { 
  message: string, 
  actionLabel?: string, 
  onAction?: () => void,
  icon?: any
}) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center space-y-6 p-12 text-center bg-white/5 rounded-[48px] border-4 border-dashed border-stone-100">
      <div className="rounded-full bg-brand-cream p-6">
        <Icon className="h-12 w-12 text-stone-300" />
      </div>
      <p className="text-xl serif italic text-stone-400 max-w-sm">{message}</p>
      {onAction && actionLabel && (
        <button 
          onClick={onAction}
          className="rounded-2xl bg-brand-indigo px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl hover:bg-brand-red transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
