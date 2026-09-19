import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast.visible) return null;

  return (
    <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/10 transition-all animate-in fade-in slide-in-from-top-4 duration-200 max-w-[90vw]">
      <span className="material-symbols-outlined text-primary-fixed text-[18px] flex-shrink-0">
        done_all
      </span>
      <span className="text-xs font-semibold truncate">{toast.message}</span>
    </div>
  );
};
