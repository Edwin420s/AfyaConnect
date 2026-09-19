import React from 'react';
import { useApp } from '../context/AppContext';

export const EmergencyModal: React.FC = () => {
  const { isEmergencyModalOpen, setIsEmergencyModalOpen } = useApp();

  if (!isEmergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-error/30 animate-in zoom-in-95 duration-200">
        {/* Header Alert */}
        <div className="bg-error text-on-error p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[26px] animate-pulse">emergency</span>
            <h3 className="font-bold text-lg">Onyo la Dharura • Emergency SOS</h3>
          </div>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/20 text-on-surface">
            <p className="font-semibold text-sm text-error mb-1">
              Hali hii inahitaji uangalizi wa dharura mara moja!
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Kama wewe au mtu unayemsaidia anapata maumivu makali ya kifua, ugumu wa kupumua, kupoteza fahamu au kuvuja damu nyingi, usisubiri miadi ya kawaida.
            </p>
          </div>

          {/* Quick Actions Hotlines */}
          <div className="space-y-2">
            <a
              href="tel:1199"
              className="w-full h-12 rounded-xl bg-error text-on-error font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-error/90 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
              <span>Piga 1199 (Kenya Red Cross Ambulance)</span>
            </a>

            <a
              href="tel:999"
              className="w-full h-11 rounded-xl bg-surface-container-high text-on-surface font-semibold text-xs flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">local_police</span>
              <span>Piga 999 / 112 (National Emergency Hotlines)</span>
            </a>
          </div>

          {/* Nearest Emergency Trauma Center */}
          <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Kituo cha Dharura Kilicho Karibu (Nearest ER)
              </span>
              <span className="text-xs font-bold text-tertiary">1.4 km • 6 min</span>
            </div>
            <h4 className="font-bold text-sm text-on-surface">Aga Khan Univ. Hospital Emergency Wing</h4>
            <p className="text-xs text-on-surface-variant mt-0.5">3rd Parklands Avenue • Open 24/7 Trauma Unit</p>
            <div className="mt-2 flex gap-2">
              <a
                href="https://maps.google.com/?q=Aga+Khan+University+Hospital+Nairobi"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-lg bg-surface-container-lowest text-primary font-bold text-xs flex items-center justify-center gap-1 border border-primary/20 shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">directions</span>
                <span>Pata Maelekezo (Directions)</span>
              </a>
              <a
                href="tel:+254203662000"
                className="py-1.5 px-3 rounded-lg bg-surface-container-lowest text-on-surface font-bold text-xs flex items-center justify-center gap-1 border border-surface-container-high shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">call</span>
                <span>Piga ER Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low p-3 text-center border-t border-surface-container">
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="text-xs text-on-surface-variant hover:text-on-surface font-medium underline"
          >
            Funga na uendelee na mazungumzo ya kawaida (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
