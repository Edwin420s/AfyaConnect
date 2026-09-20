import React from 'react';
import { useApp } from '../context/AppContext';

interface BottomNavProps {
  onTabSelect?: (tab: 'triage' | 'vituo' | 'miadi' | 'hospital') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onTabSelect }) => {
  const { currentRole, activePatientTab, setActivePatientTab, setCurrentRole, t } = useApp();

  const handleTabClick = (tab: 'triage' | 'vituo' | 'miadi' | 'hospital') => {
    if (onTabSelect) {
      onTabSelect(tab);
    } else {
      if (tab === 'hospital') {
        setCurrentRole('hospital');
        setActivePatientTab('hospital');
      } else {
        setCurrentRole('patient');
        setActivePatientTab(tab);
      }
    }
  };

  const navItems: { id: 'triage' | 'vituo' | 'miadi' | 'hospital'; label: string; icon: string }[] = [
    { id: 'triage', label: t.navTriage, icon: 'forum' },
    { id: 'vituo', label: t.navFacilities, icon: 'local_hospital' },
    { id: 'miadi', label: t.navAppointments, icon: 'calendar_month' },
    { id: 'hospital', label: t.navHospital, icon: 'emergency_heat' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-surface-container-high/60">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(item => {
          const isActive =
            currentRole === 'patient'
              ? activePatientTab === item.id
              : currentRole === 'hospital' && item.id === 'hospital';
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 h-12 transition-all active:scale-95 ${
                isActive
                  ? 'text-primary-container font-bold scale-105'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'text-primary scale-110' : ''
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
