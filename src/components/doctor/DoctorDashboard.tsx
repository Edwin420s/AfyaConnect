import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface DoctorDashboardProps {
  onBack?: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onBack }) => {
  const { careRequests, showToast, setCurrentRole, setActivePatientTab } = useApp();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'schedule' | 'notes'>('queue');
  const [doctorNotes, setDoctorNotes] = useState<Record<string, string>>({
    '#10482': 'Patient presents with Cephalea x 3d, BP: 125/82. Triage Score 4. Recommended basic hemogram and hydration.',
  });

  const doctorPatients = careRequests.filter(
    r => (r.assignedDoctorName && r.assignedDoctorName.includes('Kamau')) || r.status === 'CONFIRMED'
  );

  const handleMarkCompleted = (id: string) => {
    showToast(`Mgonjwa ${id} amekamilisha uchunguzi wa daktari.`);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3.5">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-2 pb-0.5">
        <button
          onClick={onBack || (() => { setCurrentRole('patient'); setActivePatientTab('triage'); })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Rudi kwenye Mgonjwa (Back to Patient View)</span>
        </button>
        <button
          onClick={() => { setCurrentRole('hospital'); setActivePatientTab('hospital'); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">local_hospital</span>
          <span>Mapokezi (Hospital Intake)</span>
        </button>
      </div>

      {/* Doctor Header Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-black text-base shadow-xs">
            WK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-on-surface">Dr. Wanjiku Kamau, MBChB</h2>
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            </div>
            <p className="text-xs text-on-surface-variant">General Outpatient (OPD) • Room 04, Ground Floor</p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsOnDuty(prev => !prev);
            showToast(isOnDuty ? 'Daktari: Hali imebadilishwa kuwa Off Duty' : 'Daktari: Hali imebadilishwa kuwa On Duty');
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
            isOnDuty
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-surface-container text-outline'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOnDuty ? 'bg-emerald-600 animate-pulse' : 'bg-outline'}`}></span>
          <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
        </button>
      </div>

      {/* Doctor Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'queue'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Foleni ya Leo (Today's Queue - {doctorPatients.length})
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'schedule'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Ratiba Yangu (Roster)
        </button>
      </div>

      {/* Queue List */}
      {activeTab === 'queue' && (
        <div className="flex flex-col gap-3">
          {doctorPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                    {patient.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-on-surface">{patient.patientName}</h3>
                      <span className="text-xs text-outline font-semibold">{patient.id}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      Slot: <strong className="text-primary">{patient.assignedSlot || '10:30 AM'}</strong> • Token: {patient.tokenPass || '#AC-NBO-8492'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
                  {patient.status}
                </span>
              </div>

              {/* Triage Brief */}
              <div className="p-2.5 rounded-lg bg-surface-container-low text-xs space-y-1 border border-surface-container-high/40">
                <p className="font-semibold text-on-surface">
                  Chief Concern: <span className="text-primary font-bold">{patient.chiefConcern}</span>
                </p>
                <p className="text-on-surface-variant italic">“{patient.verbatimTranscript}”</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-bold text-on-surface">
                    Triage Score: {patient.triageScore}/5
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-[10px] font-bold text-tertiary">
                    {patient.insurance}
                  </span>
                </div>
              </div>

              {/* Clinical Notes Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-on-surface-variant">
                  Clinical Notes / Maelezo ya Daktari:
                </label>
                <textarea
                  value={doctorNotes[patient.id] || ''}
                  onChange={(e) =>
                    setDoctorNotes(prev => ({ ...prev, [patient.id]: e.target.value }))
                  }
                  rows={2}
                  placeholder="Andika uchunguzi wa daktari hapa..."
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <a
                  href={`tel:${patient.patientPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold flex items-center gap-1 hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                  <span>Piga Mgonjwa</span>
                </a>

                <button
                  onClick={() => handleMarkCompleted(patient.id)}
                  className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs active:scale-95 hover:bg-primary-container"
                >
                  Kamilisha / Mark Attended
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60 space-y-3">
          <h3 className="font-bold text-sm text-on-surface">Ratiba ya Wiki (Weekly Duty Roster)</h3>
          <div className="space-y-2 text-xs">
            {[
              { day: 'Jumatatu (Monday)', hours: '09:00 AM – 01:00 PM', status: 'Active' },
              { day: 'Jumanne (Tuesday)', hours: '09:00 AM – 05:00 PM', status: 'Today (Active)' },
              { day: 'Jumatano (Wednesday)', hours: '02:00 PM – 06:00 PM', status: 'Scheduled' },
              { day: 'Alhamisi (Thursday)', hours: '09:00 AM – 01:00 PM', status: 'Scheduled' },
              { day: 'Ijumaa (Friday)', hours: 'Off Duty / In-patient Ward Rounds', status: 'Ward Duty' },
            ].map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/40">
                <span className="font-bold text-on-surface">{d.day}</span>
                <span className="text-on-surface-variant font-medium">{d.hours}</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-bold">
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
