import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const MyAppointment: React.FC = () => {
  const {
    activeRequest,
    rescheduleBooking,
    cancelBooking,
    showToast,
    setActivePatientTab,
  } = useApp();

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedNewSlot, setSelectedNewSlot] = useState('Kesho 2:00 PM');

  const handleConfirmReschedule = () => {
    rescheduleBooking(selectedNewSlot);
    setIsRescheduling(false);
    showToast(`✓ Saa ya miadi imebadilishwa: ${selectedNewSlot}`);
  };

  const handleCancel = () => {
    if (window.confirm('Una uhakika unataka kughairi miadi yako ya ' + (activeRequest.assignedSlot || '10:30 AM') + '?')) {
      cancelBooking();
      showToast('Miadi imeghairiwa. Hospitali imejulishwa.');
    }
  };

  const isConfirmed = activeRequest.status === 'CONFIRMED';
  const isCancelled = activeRequest.status === 'CANCELLED';

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3.5">
      {/* Top Hero Status Greeting Card */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-surface-container-high/60">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-primary-fixed/20 pointer-events-none blur-xl"></div>
        
        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                isCancelled
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-primary-fixed text-on-primary-fixed-variant'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-error' : 'bg-primary animate-ping'}`}></span>
              <span>
                {isCancelled
                  ? 'Miadi Imeghairiwa • Cancelled'
                  : 'Miadi Imethibitishwa • Confirmed'}
              </span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-semibold">
            {activeRequest.insurance.includes('SHA') ? 'SHA / NHIF ✓' : activeRequest.insurance}
          </span>
        </div>

        {/* Facility & Medical Officer */}
        <div className="space-y-1 relative z-10">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base text-on-surface truncate">
                {activeRequest.assignedFacilityName || 'Aga Khan University Hospital'}
              </h2>
              <p className="text-xs text-on-surface-variant">Parklands Main Campus • Level 6 Referral</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[22px]">local_hospital</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-on-surface">
            <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center text-xs font-bold text-on-primary-fixed">
              {activeRequest.assignedDoctorName
                ? activeRequest.assignedDoctorName.split(' ').map(n => n[0]).join('').slice(0, 2)
                : 'WK'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">
                {activeRequest.assignedDoctorName || 'Dr. Wanjiku Kamau'}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">
                {activeRequest.assignedDepartment || 'General Internal Medicine Consultation'}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Slot Chip */}
        <div className="mt-3 p-3 rounded-lg bg-surface-container-low flex items-center justify-between border border-surface-container-high/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs border border-surface-container-high/40">
              <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
            </div>
            <div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                Tarehe na Saa / Slot
              </p>
              <p className="text-xs font-bold text-on-surface">
                {activeRequest.preferredDate || 'Kesho, Jumanne 24 Sept'} • {activeRequest.assignedSlot || '10:30 AM'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary text-[11px] font-bold">
              Ghorofa ya 2 (2nd Flr)
            </span>
          </div>
        </div>
      </div>

      {/* Digital Check-In Pass (QR Matrix Card with Coupon Divider) */}
      {!isCancelled && (
        <div className="relative bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-surface-container-high/60">
          {/* Top Pass Details */}
          <div className="p-4 space-y-3 bg-gradient-to-b from-primary-fixed/25 to-surface-container-lowest">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Hospital Token Pass
                </span>
                <p className="text-xl text-primary font-black tracking-tight">
                  {activeRequest.tokenPass || '#AC-NBO-8492'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-on-surface-variant font-medium">Gate Express Lane</span>
                <div className="flex items-center justify-end gap-1 text-primary">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span className="text-xs font-bold">Pre-Cleared</span>
                </div>
              </div>
            </div>

            {/* Scannable Simulated QR Matrix with Glowing Halo */}
            <div className="relative py-1 flex flex-col items-center justify-center">
              <div className="relative p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center border border-surface-container-high">
                {/* Outer Scanning Ring Effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse pointer-events-none"></div>

                {/* Dynamic SVG QR Code Simulation */}
                <svg className="w-40 h-40 text-on-surface" fill="currentColor" viewBox="0 0 100 100">
                  {/* Corner Finder 1 (Top Left) */}
                  <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="5"></rect>
                  <rect fill="#ffffff" height="20" rx="2" width="20" x="9" y="9"></rect>
                  <rect fill="currentColor" height="12" rx="1" width="12" x="13" y="13"></rect>
                  {/* Corner Finder 2 (Top Right) */}
                  <rect fill="currentColor" height="28" rx="4" width="28" x="67" y="5"></rect>
                  <rect fill="#ffffff" height="20" rx="2" width="20" x="71" y="9"></rect>
                  <rect fill="currentColor" height="12" rx="1" width="12" x="75" y="13"></rect>
                  {/* Corner Finder 3 (Bottom Left) */}
                  <rect fill="currentColor" height="28" rx="4" width="28" x="5" y="67"></rect>
                  <rect fill="#ffffff" height="20" rx="2" width="20" x="9" y="71"></rect>
                  <rect fill="currentColor" height="12" rx="1" width="12" x="13" y="75"></rect>
                  {/* Data Bits Grid */}
                  <rect height="5" rx="1" width="5" x="37" y="7"></rect>
                  <rect height="5" rx="1" width="5" x="46" y="7"></rect>
                  <rect height="5" rx="1" width="5" x="55" y="7"></rect>
                  <rect height="5" rx="1" width="5" x="37" y="16"></rect>
                  <rect height="7" rx="1" width="7" x="46" y="24"></rect>
                  <rect height="5" rx="1" width="5" x="57" y="20"></rect>
                  <rect height="5" rx="1" width="5" x="7" y="37"></rect>
                  <rect height="7" rx="1" width="7" x="16" y="44"></rect>
                  <rect height="5" rx="1" width="5" x="25" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="37" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="47" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="57" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="67" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="77" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="87" y="37"></rect>
                  <rect height="6" rx="1" width="6" x="37" y="47"></rect>
                  <rect className="text-primary" fill="#005c55" height="8" rx="2" width="8" x="47" y="47"></rect>
                  <rect height="6" rx="1" width="6" x="67" y="47"></rect>
                  <rect height="6" rx="1" width="6" x="87" y="47"></rect>
                  <rect height="6" rx="1" width="6" x="37" y="57"></rect>
                  <rect height="6" rx="1" width="6" x="57" y="57"></rect>
                  <rect height="6" rx="1" width="6" x="77" y="57"></rect>
                  <rect height="5" rx="1" width="5" x="37" y="67"></rect>
                  <rect height="6" rx="1" width="6" x="46" y="74"></rect>
                  <rect height="5" rx="1" width="5" x="57" y="67"></rect>
                  <rect height="7" rx="1" width="7" x="67" y="77"></rect>
                  <rect height="5" rx="1" width="5" x="77" y="67"></rect>
                  <rect height="6" rx="1" width="6" x="87" y="74"></rect>
                  <rect height="6" rx="1" width="6" x="87" y="87"></rect>
                  <rect height="6" rx="1" width="6" x="72" y="87"></rect>
                  <rect height="6" rx="1" width="6" x="42" y="87"></rect>
                </svg>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[15px] text-primary">qr_code_scanner</span>
                Onyesha kwenye mapokezi ya geti (Offline scannable)
              </p>
            </div>
          </div>

          {/* Perforated Coupon Divider */}
          <div className="relative w-full h-4 bg-surface flex items-center justify-between overflow-hidden">
            <div className="w-4 h-8 rounded-full bg-surface -ml-2"></div>
            <div className="flex-1 flex justify-evenly items-center px-2">
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
              <span className="w-1.5 h-0.5 bg-surface-container-high rounded"></span>
            </div>
            <div className="w-4 h-8 rounded-full bg-surface -mr-2"></div>
          </div>

          {/* Pass Actions */}
          <div className="p-3.5 bg-surface-container-lowest grid grid-cols-2 gap-2">
            <a
              href="https://maps.google.com/?q=Aga+Khan+University+Hospital+Nairobi"
              target="_blank"
              rel="noreferrer"
              className="h-11 px-3 rounded-lg bg-surface-container flex items-center justify-center gap-1.5 text-on-surface hover:bg-surface-container-high active:scale-95 transition-all text-center text-xs font-bold"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">directions_car</span>
              <span>Directions</span>
            </a>
            <a
              href="tel:+254203662000"
              className="h-11 px-3 rounded-lg bg-surface-container flex items-center justify-center gap-1.5 text-on-surface hover:bg-surface-container-high active:scale-95 transition-all text-center text-xs font-bold"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">call</span>
              <span>Wasiliana Nasi</span>
            </a>
          </div>
        </div>
      )}

      {/* Realtime 7-Step Appointment Sync Progress Timeline */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3.5 border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-on-surface">Hali ya Maombi (Status)</h3>
            <p className="text-xs text-on-surface-variant">Live Referral Synchronization ({activeRequest.timeline.filter(t => t.completed).length}/{activeRequest.timeline.length})</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-container text-on-primary text-xs font-bold shadow-xs">
            <span className="material-symbols-outlined text-[14px]">done_all</span>
            <span>Synced</span>
          </span>
        </div>

        {/* Timeline Stepper List */}
        <div className="relative pl-6 space-y-3.5">
          {/* Vertical Bar */}
          <div className="absolute left-2.5 top-2 bottom-3 w-0.5 bg-primary-container"></div>

          {activeRequest.timeline.map((step) => {
            const isDone = step.completed;
            const isActive = step.active;

            return (
              <div key={step.step} className="relative flex items-start justify-between gap-2 group">
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-xs text-xs font-bold ${
                    isActive
                      ? 'bg-primary text-on-primary ring-4 ring-primary-fixed/40'
                      : isDone
                      ? 'bg-primary-container text-on-primary'
                      : 'bg-surface-container text-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {isActive ? 'lock' : isDone ? 'check' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div className={isActive ? 'bg-primary-fixed/20 p-2 rounded-lg w-full -mt-1' : ''}>
                  <p className={`text-xs font-bold ${isActive ? 'text-on-primary-fixed font-extrabold' : 'text-on-surface'}`}>
                    {step.title}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">{step.description}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant flex-shrink-0 font-medium">{step.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Preparation Guide (Bilingual Swahili & English) */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3 border border-surface-container-high/60">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary-container text-[22px]">
            assignment_turned_in
          </span>
          <h3 className="font-bold text-sm text-on-surface">Maagizo Muhimu • Instructions</h3>
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-3 border border-surface-container-high/40">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[16px]">badge</span>
            </div>
            <div className="text-on-surface">
              <p className="text-xs font-bold">Beba Kitambulisho / Identification</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Beba kitambulisho cha Taifa (Original National ID) au kadi ya kidijitali ya SHA/NHIF kwa ajili ya uthibitisho wa bima.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-3 border border-surface-container-high/40">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
            </div>
            <div className="text-on-surface">
              <p className="text-xs font-bold">Fika Mapema / Early Arrival</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Tafadhali fika dakika 15 kabla ya saa 10:30 AM ili kupimwa shinikizo la damu (Triage Vitals Check) kwenye kaunta ya mapokezi.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-start gap-3 border border-surface-container-high/40">
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[16px]">medication</span>
            </div>
            <div className="text-on-surface">
              <p className="text-xs font-bold">Dawa za Sasa / Current Prescriptions</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Kama unatumia dawa zozote za kudumu, beba pakiti zake au picha ya maagizo ya daktari wa awali.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Thumbnail Snapshot */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-2 border border-surface-container-high/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
            <span className="text-xs font-bold text-on-surface">Eneo la Kliniki (Facility Map)</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">Nairobi Central • 4.2 km</span>
        </div>

        <div
          className="w-full h-36 bg-cover bg-center rounded-lg relative overflow-hidden flex items-end p-2.5 shadow-xs"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-unse0L1tiBaxYTmjpdbkO4z_va32utjhSHH2TnMKQi8goAeH36fHN5ZRJzkpMv3mW-ko_7BPSAR9mNBugaknkAkm_3UwGBJpbsHrq2y3OfbPGvOKovKg_hHt1Y9BW7z9jA9Jru0o__RQ0wl30le_h2f6k0ifyxrBfb4qbhFsano-NH5qTRpb4WsYCcCCchQ8dwqrHAQZzypfnGl6VgEfVc8h-Au50U-611r_xaNDWxZVzeI9nF9T')`,
          }}
        >
          <div className="w-full p-2 rounded-md bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-between shadow-xs">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-on-surface truncate">3rd Parklands Avenue, Gate 2</p>
              <p className="text-[10px] text-on-surface-variant truncate">Nafasi za maegesho zipo (Parking available)</p>
            </div>
            <a
              href="https://maps.google.com/?q=Aga+Khan+University+Hospital+Nairobi"
              target="_blank"
              rel="noreferrer"
              className="material-symbols-outlined text-primary text-[18px]"
            >
              open_in_new
            </a>
          </div>
        </div>
      </div>

      {/* Reschedule & Cancel Controls */}
      <div className="space-y-2 pt-1">
        {isRescheduling ? (
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary/30 space-y-3">
            <h4 className="text-xs font-bold text-on-surface">Chagua Muda Mpya (Select New Slot):</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Kesho 09:00 AM', 'Kesho 02:00 PM', 'Jumatano 10:30 AM', 'Jumatano 03:30 PM'].map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedNewSlot(slot)}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    selectedNewSlot === slot
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary font-bold text-xs active:scale-98 transition-all"
              >
                Thibitisha Wakati Mpya
              </button>
              <button
                onClick={() => setIsRescheduling(false)}
                className="px-3 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-bold"
              >
                Ghairi
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsRescheduling(true)}
            className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-variant active:scale-98 transition-all flex items-center justify-center gap-2 text-on-surface text-xs font-bold shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">update</span>
            <span>Omba Kubadilisha Wakati (Reschedule)</span>
          </button>
        )}

        {!isCancelled && (
          <button
            onClick={handleCancel}
            className="w-full h-11 rounded-lg bg-surface-container-low hover:bg-error-container hover:text-on-error-container active:scale-98 transition-all flex items-center justify-center gap-2 text-on-surface-variant text-xs font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">event_busy</span>
            <span>Ghairi Miadi Hii (Cancel Booking)</span>
          </button>
        )}
      </div>

      {/* Emergency Assistance Footer */}
      <div className="p-3 rounded-lg bg-surface-container-low text-center border border-surface-container-high/40">
        <p className="text-[11px] text-on-surface-variant">
          Usaidizi wa dharura? Piga{' '}
          <a className="text-primary font-bold underline" href="tel:1199">
            1199 (Red Cross)
          </a>{' '}
          au wasiliana na AfyaConnect Support kwa WhatsApp.
        </p>
      </div>
    </div>
  );
};
