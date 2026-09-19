import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const BookingSheetModal: React.FC = () => {
  const {
    isBookingSheetOpen,
    setIsBookingSheetOpen,
    pendingBooking,
    confirmBooking,
  } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('712 345 678');

  if (!isBookingSheetOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-t-2xl shadow-2xl p-5 pb-safe max-w-md w-full mx-auto border-t border-surface-container-high animate-in slide-in-from-bottom duration-250">
        <div className="w-12 h-1 bg-surface-variant rounded-full mx-auto mb-3"></div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">event_available</span>
            <h3 className="font-bold text-base text-on-surface">Thibitisha Miadi (Book Slot)</h3>
          </div>
          <button
            onClick={() => setIsBookingSheetOpen(false)}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Chosen Slot Summary */}
        <div className="p-3 rounded-xl bg-surface-container-low mb-4 space-y-2 border border-surface-container-high/50 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Kituo / Facility:</span>
            <span className="font-bold text-on-surface">{pendingBooking.hospital}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Mtoa Huduma:</span>
            <span className="font-bold text-primary">{pendingBooking.doctor}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Muda / Selected Time:</span>
            <span className="font-extrabold text-tertiary">{pendingBooking.slot}</span>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold text-on-surface-variant">
            Nambari ya Simu (M-PESA / SMS Pass)
          </label>
          <div className="flex items-center px-3 h-12 rounded-lg bg-surface-container text-on-surface border border-surface-container-high/60 focus-within:ring-1 focus-within:ring-primary">
            <span className="text-xs font-bold text-outline mr-2">+254</span>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="712 345 678"
              className="bg-transparent w-full focus:outline-none text-sm font-semibold text-on-surface"
            />
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => confirmBooking(phoneNumber)}
          className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all hover:bg-primary-container"
        >
          <span>Kamilisha Miadi (Book Slot)</span>
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
        </button>
        <p className="text-[11px] text-on-surface-variant text-center mt-2.5 font-medium">
          Msimbo wa QR na SMS ya uthibitisho vitatumwa mara moja.
        </p>
      </div>
    </div>
  );
};
