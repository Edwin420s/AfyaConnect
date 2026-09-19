import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    languagePreference,
    toggleLanguagePreference,
    setActivePatientTab,
    setIsClaudeConfigOpen,
  } = useApp();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; icon: string }> = {
    patient: { title: 'Mgonjwa / Patient', badge: 'Patient App', icon: 'person' },
    hospital: { title: 'Mapokezi / Hospital Intake', badge: 'Hospital Staff', icon: 'local_hospital' },
    doctor: { title: 'Daktari / Doctor Roster', badge: 'Doctor OPD', icon: 'stethoscope' },
    admin: { title: 'Usimamizi / Admin', badge: 'Metropolis Admin', icon: 'admin_panel_settings' },
  };

  const handleRoleSelect = (role: UserRole) => {
    setCurrentRole(role);
    setIsRoleDropdownOpen(false);
    if (role === 'hospital') {
      setActivePatientTab('hospital');
    } else if (role === 'patient') {
      setActivePatientTab('triage');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/50">
      <div className="h-16 md:h-20 px-4 md:px-6 max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Connected Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Official AfyaConnect SVG Logo with teal rounded rect, heart + cross and amber pulse dot */}
          <div className="h-10 w-10 flex-shrink-0 relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" className="w-full h-full shadow-sm rounded-xl">
              <rect width="120" height="120" rx="28" fill="#0D9488" />
              <circle cx="60" cy="60" r="44" fill="#0F766E" opacity="0.4" />
              <path d="M60 32C52 24 38 24 30 34C22 44 24 58 36 72L60 92L84 72C96 58 98 44 90 34C82 24 68 24 60 32Z" fill="white" fillOpacity="0.18" />
              <rect x="53" y="38" width="14" height="44" rx="7" fill="#FFFFFF" />
              <rect x="38" y="53" width="44" height="14" rx="7" fill="#FFFFFF" />
              <circle cx="60" cy="60" r="5" fill="#0D9488" />
              <circle cx="82" cy="42" r="6" fill="#F59E0B" />
            </svg>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-on-surface tracking-tight">AfyaConnect</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-primary-fixed text-on-primary-fixed-variant">
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse flex-shrink-0"></span>
              <span className="text-xs text-on-surface-variant truncate font-medium">
                Connected • Nairobi Central
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Role Switcher Pill & Language Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Interactive Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(prev => !prev)}
              className="h-8 md:h-9 px-2.5 md:px-3 rounded-full bg-primary-fixed/40 text-on-primary-fixed-variant hover:bg-primary-fixed/60 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs font-semibold text-xs"
              title="Badili Wajibu / Switch Role"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {roleLabels[currentRole].icon}
              </span>
              <span className="hidden sm:inline">{roleLabels[currentRole].badge}</span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-60 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-high p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-outline border-b border-surface-container mb-1">
                    Badili Mwonekano (Switch View)
                  </div>
                  {(['patient', 'hospital', 'doctor', 'admin'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        currentRole === role
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">
                          {roleLabels[role].icon}
                        </span>
                        <span>{roleLabels[role].title}</span>
                      </div>
                      {currentRole === role && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Claude AI Settings Button */}
          <button
            onClick={() => setIsClaudeConfigOpen(true)}
            className="h-8 md:h-9 px-2.5 rounded-full bg-surface-container flex items-center gap-1 text-primary hover:text-primary-container active:bg-surface-container-high transition-colors shadow-xs"
            title="Claude AI Clinical Engine Settings"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">smart_toy</span>
            <span className="text-xs font-bold hidden md:inline">Claude AI</span>
          </button>

          {/* Bilingual Toggle Button */}
          <button
            onClick={toggleLanguagePreference}
            className="h-8 md:h-9 px-2.5 rounded-full bg-surface-container flex items-center gap-1 text-on-surface-variant hover:text-on-surface active:bg-surface-container-high transition-colors shadow-xs"
            title="Badili Lugha / Toggle Language Mode"
          >
            <span className="material-symbols-outlined text-[15px] text-primary">translate</span>
            <span className="text-xs font-bold uppercase">
              {languagePreference === 'swa_eng'
                ? 'ENG / SWA'
                : languagePreference === 'swa'
                ? 'SWA'
                : 'ENG'}
            </span>
          </button>

          {/* User Profile Badge */}
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-xs text-on-primary">
            <span className="material-symbols-outlined text-[18px]">
              {currentRole === 'patient' ? 'person' : currentRole === 'hospital' ? 'local_hospital' : currentRole === 'doctor' ? 'stethoscope' : 'settings'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
