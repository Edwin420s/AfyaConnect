import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { facilities, careRequests, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'facilities' | 'audit'>('overview');

  const totalFacilities = facilities.length;
  const totalDoctors = facilities.reduce((acc, f) => acc + f.doctors.length, 0);
  const totalRequests = careRequests.length;
  const urgentRequests = careRequests.filter(r => r.urgency === 'Urgent').length;
  const confirmedRequests = careRequests.filter(r => r.status === 'CONFIRMED').length;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-4">
      {/* Admin Header Banner */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-black text-lg shadow-xs">
            <span className="material-symbols-outlined text-[26px]">admin_panel_settings</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-on-surface">Nairobi Metropolis Health Authority</h2>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold">
                Platform Admin
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">System Configuration, Facility Oversight & Audit Logs</p>
          </div>
        </div>

        <button
          onClick={() => showToast('Platform settings synced with Kenyan MOH standards')}
          className="px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-1">sync</span>
          Sync MOH
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high/60 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'facilities'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Participating Facilities ({totalFacilities})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Audit & Security Trail
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container-high/60 shadow-xs">
              <span className="text-[11px] font-semibold text-on-surface-variant">Active Facilities</span>
              <p className="text-2xl font-black text-on-surface mt-1">{totalFacilities}</p>
              <span className="text-[10px] text-primary font-bold">100% Online</span>
            </div>
            <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container-high/60 shadow-xs">
              <span className="text-[11px] font-semibold text-on-surface-variant">Rostered Doctors</span>
              <p className="text-2xl font-black text-on-surface mt-1">{totalDoctors}</p>
              <span className="text-[10px] text-tertiary font-bold">8 on duty now</span>
            </div>
            <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container-high/60 shadow-xs">
              <span className="text-[11px] font-semibold text-on-surface-variant">Today's Intake</span>
              <p className="text-2xl font-black text-on-surface mt-1">{totalRequests}</p>
              <span className="text-[10px] text-primary font-bold">+{urgentRequests} Urgent</span>
            </div>
            <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-surface-container-high/60 shadow-xs">
              <span className="text-[11px] font-semibold text-on-surface-variant">Confirmed Passes</span>
              <p className="text-2xl font-black text-primary mt-1">{confirmedRequests}</p>
              <span className="text-[10px] text-on-primary-fixed-variant font-bold">SHA Verified</span>
            </div>
          </div>

          {/* AI & Infrastructure SLA Status */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-on-surface">AI Engine & System Performance</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-semibold text-on-surface">Automated Clinical Triage Gateway</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Operational (99.98%)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-semibold text-on-surface">Bilingual Audio Engine (Kiswahili / Sheng / English)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">2.4s Latency</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-semibold text-on-surface">Kenyan SHA / NHIF Health Information Exchange (HIE) API</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Synced</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                <span className="font-semibold text-on-surface">Africa's Talking SMS & USSD Gateway (*384#)</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facilities Tab */}
      {activeTab === 'facilities' && (
        <div className="space-y-3">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={fac.imageUrl}
                  alt={fac.name}
                  className="w-12 h-12 rounded-lg object-cover bg-surface-container flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-on-surface">{fac.name}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      {fac.level}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{fac.address}</p>
                  <p className="text-[11px] text-outline mt-0.5">
                    Doctors: {fac.doctors.length} • Services: {fac.services.slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => showToast(`Kituo ${fac.name} kimechaguliwa kwa ukaguzi`)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high"
                >
                  Manage Roster
                </button>
                <button
                  onClick={() => showToast(`Mipangilio ya ${fac.name} imehifadhiwa`)}
                  className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-bold"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-container-high/60 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-on-surface">Security & Clinical Audit Trail</h3>
          <div className="space-y-2 text-xs">
            {[
              { time: '10:11 AM', event: 'APPOINTMENT_CONFIRMED', detail: 'Pass #AC-NBO-8492 issued to Jane M. with Dr. Kamau at Aga Khan', actor: 'Aga Khan Reception Desk' },
              { time: '10:09 AM', event: 'SLOT_PROPOSED', detail: 'Slot Kesho 10:30 AM reserved for request #10482', actor: 'HMIS Schedule System' },
              { time: '10:07 AM', event: 'DOCTOR_CHECK', detail: 'Dr. Kamau duty calendar verified for OPD Suite 04', actor: 'Clinical Tool Agent' },
              { time: '10:04 AM', event: 'TRIAGE_COMPLETED', detail: 'Patient voice note categorized: Abdominal pain x 48h, Level 4 urgency', actor: 'Clinical AI Engine' },
              { time: '10:02 AM', event: 'REQUEST_CREATED', detail: 'Inbound chat from Westlands (+254 712 345 678)', actor: 'AfyaConnect Frontdoor' },
            ].map((log, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-surface-container-low border border-surface-container-high/40 flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{log.event}</span>
                    <span className="text-[10px] text-outline font-semibold">Actor: {log.actor}</span>
                  </div>
                  <p className="text-on-surface text-xs font-medium">{log.detail}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant font-semibold flex-shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
