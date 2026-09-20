import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface FacilityDetailViewProps {
  requestId: string;
  onBack: () => void;
}

export const FacilityDetailView: React.FC<FacilityDetailViewProps> = ({ requestId, onBack }) => {
  const {
    careRequests,
    confirmSlotFromHospital,
    addCustomHospitalSlot,
    updateRequestDepartment,
    showToast,
    setActivePatientTab,
    setCurrentRole,
  } = useApp();

  const req = careRequests.find(r => r.id === requestId) || careRequests[0];

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(req.assignedDoctorName || 'Dr. Kamau');
  const [selectedSlot, setSelectedSlot] = useState(req.assignedSlot || '10:30 AM');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmedSuccess, setIsConfirmedSuccess] = useState(req.status === 'CONFIRMED');

  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [customSlotTime, setCustomSlotTime] = useState('04:00 PM');
  const [isChangeDeptModalOpen, setIsChangeDeptModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(req.assignedDepartment);

  // Toggle voice playback simulation
  const togglePlayAudio = () => {
    setIsPlayingAudio(prev => !prev);
    if (!isPlayingAudio) {
      showToast('🔊 Inacheza sauti ya mgonjwa (Playing Kenyan audio note)...');
    }
  };

  const handleSlotSelect = (doc: string, time: string) => {
    setSelectedDoctor(doc);
    setSelectedSlot(time);
    showToast(`Slot imechaguliwa: ${doc} • ${time}`);
  };

  const handleConfirmSlot = () => {
    setIsConfirming(true);

    setTimeout(() => {
      confirmSlotFromHospital(req.id, selectedDoctor, selectedSlot);
      setIsConfirming(false);
      setIsConfirmedSuccess(true);
      showToast(`✓ Miadi Imethibitishwa! SMS na QR pass zimetumwa kwa ${req.patientName}`);
    }, 1200);
  };

  const handleAddSlot = () => {
    if (!customSlotTime.trim()) return;
    addCustomHospitalSlot('doc-kamau-gp', customSlotTime.trim());
    setSelectedSlot(customSlotTime.trim());
    setIsAddSlotModalOpen(false);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3.5">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Rudi kwenye Requests (Back to Inbox)</span>
        </button>

        <button
          onClick={() => {
            onBack();
            setCurrentRole('patient');
            setActivePatientTab('miadi');
          }}
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>Ona Mwonekano wa Mgonjwa (View Patient Pass)</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Subheader Summary Banner with Status */}
      <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-black text-base shadow-xs">
              {req.patientName.split(' ').map(n => n[0]).join('')}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-primary rounded-full ring-2 ring-surface-container-lowest"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-primary font-bold">
                Case {req.id}
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
              <span className="text-[11px] text-on-surface-variant font-medium">{req.insurance}</span>
            </div>
            <h2 className="font-bold text-base text-on-surface truncate">
              {req.patientName} ({req.patientAge}y)
            </h2>
          </div>
        </div>

        {/* Triage Priority Chip */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            <span>Level {req.triageScore} {req.urgency}</span>
          </span>
          <span className="text-[11px] text-on-surface-variant">{req.patientLocation}</span>
        </div>
      </div>

      {/* Dual-Pane Clinical Comparison Card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container-high/60">
        {/* Header of Comparison */}
        <div className="bg-surface-container-low px-4 py-2.5 flex items-center justify-between border-b border-surface-container-high/40">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">sync_alt</span>
            <span className="text-xs text-on-surface font-bold">Triage Triangulation</span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container-highest px-2.5 py-0.5 rounded-full text-on-surface-variant text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Bilingual AI Intake</span>
          </div>
        </div>

        {/* Verbatim Voice & Transcript Module */}
        <div className="p-4 bg-surface-container-lowest flex flex-col space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">record_voice_over</span>
              <span className="text-xs text-on-surface font-bold">Patient Verbatim Transcript</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
              {req.languageMode}
            </span>
          </div>

          {/* Voice Player Mock */}
          <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3 border border-surface-container-high/40">
            <button
              onClick={togglePlayAudio}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform shadow-xs hover:bg-primary-container"
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlayingAudio ? 'pause' : 'play_arrow'}
              </span>
            </button>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-on-surface-variant font-medium">Kenyan Audio Note</span>
                <span className={`text-xs text-primary font-bold ${isPlayingAudio ? 'animate-pulse' : ''}`}>
                  {isPlayingAudio ? 'Playing...' : '0:24s'}
                </span>
              </div>

              {/* Waveform SVG Simulation */}
              <div className="flex items-center gap-1 h-5 w-full">
                {[
                  'h-2', 'h-4', 'h-5', 'h-3', 'h-5', 'h-2', 'h-4', 'h-3', 'h-5', 'h-4', 'h-2', 'h-3', 'h-4', 'h-2', 'h-4', 'h-5', 'h-3', 'h-2'
                ].map((hClass, idx) => (
                  <div
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isPlayingAudio ? 'bg-primary animate-pulse' : 'bg-primary/50'
                    } ${hClass}`}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative bg-surface-container-low/60 rounded-lg p-3 border border-surface-container-high/30">
            <p className="text-xs text-on-surface italic leading-relaxed">
              {req.verbatimTranscript}
            </p>
          </div>
        </div>

        {/* Divider Bar */}
        <div className="h-0.5 bg-surface-container-high"></div>

        {/* AI Structured Clinical Summary Module */}
        <div className="p-4 bg-surface-container-low flex flex-col space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary-container text-[18px]">neurology</span>
              <span className="text-xs text-on-surface font-bold">AI Structured Clinical Summary</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>Validated</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/50">
              <span className="text-[10px] text-on-surface-variant font-semibold block uppercase">Chief Concern</span>
              <span className="text-xs font-bold text-on-surface block mt-0.5">{req.chiefConcern}</span>
              <span className="text-[10px] text-outline block">Duration: {req.symptomDuration}</span>
            </div>

            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/50">
              <span className="text-[10px] text-on-surface-variant font-semibold block uppercase">Secondary Symptoms</span>
              <span className="text-xs font-bold text-on-surface block mt-0.5">
                {req.secondarySymptoms.join(', ')}
              </span>
              <span className="text-[10px] text-outline block">Postural trigger</span>
            </div>

            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/50">
              <span className="text-[10px] text-on-surface-variant font-semibold block uppercase">Coverage Verification</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[14px]">shield_with_heart</span>
                <span className="text-xs font-bold text-on-surface">{req.insurance}</span>
              </div>
              <span className="text-[10px] text-outline block">#602931-B Active</span>
            </div>

            <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high/50">
              <span className="text-[10px] text-on-surface-variant font-semibold block uppercase">Facility Distance</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-tertiary-container text-[14px]">distance</span>
                <span className="text-xs font-bold text-on-surface">{req.distanceKm} km Away</span>
              </div>
              <span className="text-[10px] text-outline block">Nairobi Westlands</span>
            </div>
          </div>
        </div>
      </div>

      {/* Doctor Availability Controller Section */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col space-y-3.5 border border-surface-container-high/60">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">clinical_notes</span>
              <h3 className="font-bold text-sm text-on-surface">Doctor Schedule Control</h3>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Source-of-truth hospital duty roster (Anti-Hallucination Lock)
            </p>
          </div>
          <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
            Kesho (Tomorrow)
          </span>
        </div>

        {/* Department Selector Badge */}
        <div className="flex items-center justify-between bg-surface-container-low px-3 py-2 rounded-lg border border-surface-container-high/40">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">apartment</span>
            <span className="text-xs font-bold text-on-surface">{req.assignedDepartment}</span>
          </div>
          <button
            onClick={() => {
              setSelectedDept(req.assignedDepartment);
              setIsChangeDeptModalOpen(true);
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            Change
          </button>
        </div>

        {/* Doctor Slots Stack */}
        <div className="flex flex-col space-y-2.5">
          {/* Doctor 1: Dr. Kamau */}
          <div
            className={`rounded-xl p-3 flex flex-col space-y-2 border transition-all ${
              selectedDoctor.includes('Kamau')
                ? 'bg-surface-container-low border-primary/30'
                : 'bg-surface-container-low/60 border-surface-container-high'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs">
                  DK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Dr. Kamau, MBChB</h4>
                  <span className="text-[11px] text-primary font-medium">On Duty • Room 04</span>
                </div>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                2 Slots Free
              </span>
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => handleSlotSelect('Dr. Kamau', '10:30 AM')}
                className={`slot-pill flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 ${
                  selectedDoctor.includes('Kamau') && selectedSlot === '10:30 AM'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {selectedDoctor.includes('Kamau') && selectedSlot === '10:30 AM' ? 'check_circle' : 'schedule'}
                </span>
                <span>10:30 AM {selectedDoctor.includes('Kamau') && selectedSlot === '10:30 AM' ? '(Selected)' : ''}</span>
              </button>

              <button
                onClick={() => handleSlotSelect('Dr. Kamau', '02:30 PM')}
                className={`slot-pill flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 ${
                  selectedDoctor.includes('Kamau') && selectedSlot === '02:30 PM'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {selectedDoctor.includes('Kamau') && selectedSlot === '02:30 PM' ? 'check_circle' : 'schedule'}
                </span>
                <span>02:30 PM {selectedDoctor.includes('Kamau') && selectedSlot === '02:30 PM' ? '(Selected)' : ''}</span>
              </button>
            </div>
          </div>

          {/* Doctor 2: Dr. Achieng */}
          <div
            className={`rounded-xl p-3 flex flex-col space-y-2 border transition-all ${
              selectedDoctor.includes('Achieng')
                ? 'bg-surface-container-low border-primary/30'
                : 'bg-surface-container-low/60 border-surface-container-high'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed font-bold text-xs">
                  DA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Dr. Achieng, MD</h4>
                  <span className="text-[11px] text-secondary font-medium">On Duty • Room 08</span>
                </div>
              </div>
              <span className="text-[11px] bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded-full font-medium">
                1 Slot Free
              </span>
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => handleSlotSelect('Dr. Achieng', '11:15 AM')}
                className={`slot-pill flex-1 py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-transform active:scale-95 ${
                  selectedDoctor.includes('Achieng') && selectedSlot === '11:15 AM'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {selectedDoctor.includes('Achieng') && selectedSlot === '11:15 AM' ? 'check_circle' : 'schedule'}
                </span>
                <span>11:15 AM (Available)</span>
              </button>

              <div className="flex-1 py-2 px-2.5 rounded-lg bg-surface-container-highest text-outline text-xs font-medium flex items-center justify-center gap-1 opacity-60">
                <span className="material-symbols-outlined text-[16px]">block</span>
                <span>03:00 PM (Booked)</span>
              </div>
            </div>
          </div>

          {/* Doctor 3: Dr. Otieno (Off duty) */}
          <div className="bg-surface-container-low/50 rounded-xl p-3 flex items-center justify-between opacity-70 border border-surface-container-high/40">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-outline font-bold text-xs">
                DO
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface">Dr. Otieno, Clinical Officer</h4>
                <span className="text-[11px] text-outline">Off Duty Tomorrow</span>
              </div>
            </div>
            <span className="text-[11px] bg-surface-container-highest text-outline px-2 py-0.5 rounded-full font-semibold">
              Kesho Off
            </span>
          </div>
        </div>

        {/* Custom Slot Override Button */}
        <button
          onClick={() => setIsAddSlotModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-lg bg-surface-container text-primary text-xs font-bold flex items-center justify-center gap-1.5 active:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Add Custom Hospital Slot / Override</span>
        </button>
      </div>

      {/* Notification Preview Toast Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-start gap-3 border border-surface-container-high/60">
        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed flex-shrink-0 mt-0.5 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">sms</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface">Automated Dispatch Preview</span>
            <span className="text-[11px] text-primary font-bold">SMS & WhatsApp</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 leading-normal">
            “Habari {req.patientName.split(' ')[0]}, miadi yako imepangwa na{' '}
            <strong className="text-on-surface font-bold">{selectedDoctor}</strong> kesho saa{' '}
            <strong className="text-on-surface font-bold">{selectedSlot}</strong>. Hakikisha umebeba kitambulisho.”
          </p>
        </div>
      </div>

      {/* Sticky Action Control Footer */}
      <div className="flex flex-col space-y-2 pt-1">
        {/* Primary Confirmation Button */}
        <button
          onClick={handleConfirmSlot}
          disabled={isConfirming}
          className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 ${
            isConfirmedSuccess
              ? 'bg-emerald-700 text-white'
              : isConfirming
              ? 'bg-primary/80 text-on-primary cursor-wait'
              : 'bg-primary text-on-primary hover:bg-primary-container'
          }`}
        >
          {isConfirming ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
              <span>Slot Dispatched to SHA & SMS...</span>
            </>
          ) : isConfirmedSuccess ? (
            <>
              <span className="material-symbols-outlined text-[20px]">done_all</span>
              <span>Miadi Imethibitishwa! (Pass Dispatched)</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[22px]">verified_user</span>
              <span className="truncate">
                Confirm Slot: {selectedDoctor} • {selectedSlot}
              </span>
            </>
          )}
        </button>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`tel:${req.patientPhone}`}
            className="min-h-[44px] py-2.5 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-surface-container active:scale-95 transition-all text-center border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">call</span>
            <span>Piga / Call {req.patientName.split(' ')[0]}</span>
          </a>

          <button
            onClick={() => {
              updateRequestDepartment(req.id, 'ENT');
              setSelectedDept('ENT');
            }}
            className="min-h-[44px] py-2.5 px-3 rounded-lg bg-surface-container-lowest text-on-surface text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-surface-container active:scale-95 transition-all border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-tertiary-container text-[18px]">forward_to_inbox</span>
            <span>Refer to ENT Dept</span>
          </button>
        </div>
      </div>

      {/* Add Custom Slot Modal */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-4 shadow-2xl border border-surface-container-high space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface">Weka Nafasi ya Ziada (Custom Slot)</h3>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Saa (Time):
              </label>
              <input
                type="text"
                value={customSlotTime}
                onChange={(e) => setCustomSlotTime(e.target.value)}
                placeholder="e.g. 04:30 PM"
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-xs font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddSlot}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs active:scale-95"
              >
                Ongeza Kwenye Ratiba
              </button>
              <button
                onClick={() => setIsAddSlotModalOpen(false)}
                className="px-3 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold"
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Department Modal */}
      {isChangeDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-4 shadow-2xl border border-surface-container-high space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-on-surface">Badilisha Idara (Change Department)</h3>
              <button
                onClick={() => setIsChangeDeptModalOpen(false)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {[
                'General Consultation',
                'Dermatology',
                'ENT',
                'Pediatrics',
                'Dental',
                'Obstetrics & Gynecology',
                'Internal Medicine',
                'Orthopedics',
              ].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all ${
                    selectedDept === dept
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <span>{dept}</span>
                  {selectedDept === dept && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  updateRequestDepartment(req.id, selectedDept);
                  setIsChangeDeptModalOpen(false);
                }}
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs active:scale-95 hover:bg-primary-container transition-all"
              >
                Thibitisha Idara
              </button>
              <button
                onClick={() => setIsChangeDeptModalOpen(false)}
                className="px-3 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold"
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
