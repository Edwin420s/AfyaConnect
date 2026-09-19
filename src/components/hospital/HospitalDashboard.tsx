import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CareRequest } from '../../types';

interface HospitalDashboardProps {
  onOpenDetail: (requestId: string) => void;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onOpenDetail }) => {
  const {
    careRequests,
    assignDoctorToRequest,
    confirmSlotFromHospital,
    updateRequestDepartment,
    setActiveRequestId,
    showToast,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'awaiting' | 'checking' | 'confirmed' | 'urgent' | 'rescheduling' | 'completed'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptModalReq, setSelectedDeptModalReq] = useState<CareRequest | null>(null);
  const [modalNewDept, setModalNewDept] = useState<string>('');

  const filteredRequests = careRequests.filter((req) => {
    // Status / urgency filter
    if (activeFilter === 'awaiting' && req.status !== 'AWAITING_REVIEW') return false;
    if (activeFilter === 'checking' && req.status !== 'CHECKING_AVAILABILITY' && req.status !== 'SLOT_PROPOSED') return false;
    if (activeFilter === 'confirmed' && req.status !== 'CONFIRMED') return false;
    if (activeFilter === 'urgent' && req.urgency !== 'Urgent') return false;
    if (activeFilter === 'rescheduling' && req.status !== 'RESCHEDULING') return false;
    if (activeFilter === 'completed' && req.status !== 'COMPLETED') return false;

    // Department filter
    if (departmentFilter !== 'all' && !req.assignedDepartment.toLowerCase().includes(departmentFilter.toLowerCase())) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.patientName.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      const matchConcern = req.chiefConcern.toLowerCase().includes(q);
      const matchDept = req.assignedDepartment.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchConcern && !matchDept) return false;
    }

    return true;
  });

  const totalCount = careRequests.length;
  const awaitingCount = careRequests.filter(r => r.status === 'AWAITING_REVIEW').length;
  const checkingCount = careRequests.filter(r => r.status === 'CHECKING_AVAILABILITY' || r.status === 'SLOT_PROPOSED').length;
  const confirmedCount = careRequests.filter(r => r.status === 'CONFIRMED').length;
  const urgentCount = careRequests.filter(r => r.urgency === 'Urgent').length;
  const reschedulingCount = careRequests.filter(r => r.status === 'RESCHEDULING').length;
  const completedCount = careRequests.filter(r => r.status === 'COMPLETED').length;

  const handleReviewClick = (req: CareRequest) => {
    setActiveRequestId(req.id);
    onOpenDetail(req.id);
  };

  const handleQuickAssign = (req: CareRequest) => {
    assignDoctorToRequest(req.id, 'Dr. Kamau', '10:30 AM');
    showToast(`Daktari Dr. Kamau amepangiwa ombi ${req.id}`);
  };

  const handleAssignDept = (req: CareRequest, newDept: string) => {
    updateRequestDepartment(req.id, newDept);
    setSelectedDeptModalReq(null);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3.5">
      {/* Live Clinical WebSocket Status Banner */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-primary-container/10 rounded-xl shadow-xs border border-primary/15">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary animate-ping opacity-75"></span>
            <span className="relative inline-flex w-2 h-2 rounded-full bg-primary"></span>
          </div>
          <span className="text-xs text-primary truncate font-bold">
            Live AI Intake: Claude triage engine online
          </span>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-lowest px-2.5 py-0.5 rounded-full shadow-xs border border-surface-container-high flex-shrink-0">
          <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
          <span className="text-xs text-on-surface font-bold">2.4s latency</span>
        </div>
      </div>

      {/* Administrative Sub-Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-primary tracking-wide uppercase">Kituo cha Hospitali</p>
          <h1 className="text-lg md:text-xl font-black text-on-surface">
            Nairobi Metropolis Health Network
          </h1>
          <p className="text-xs text-on-surface-variant">
            Central Intake & Triage Stream • Shift: Morning (07:00–15:00)
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-xs border border-surface-container-high flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">local_hospital</span>
          <span className="text-xs text-on-surface font-bold">L5 Regional</span>
        </div>
      </div>

      {/* Metrics Rail (Horizontal Scrollable) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1 flex gap-2.5">
        {/* Metric 1 */}
        <div
          onClick={() => setActiveFilter('all')}
          className={`min-w-[135px] flex-shrink-0 rounded-xl p-3 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            activeFilter === 'all'
              ? 'bg-surface-container-lowest ring-2 ring-primary'
              : 'bg-surface-container-lowest border border-surface-container-high hover:border-primary/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-on-surface-variant">Total Requests</span>
            <span className="material-symbols-outlined text-[18px] text-primary">inbox</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-on-surface">{totalCount}</span>
            <span className="text-[11px] text-primary block font-bold">+6 in last hr</span>
          </div>
        </div>

        {/* Metric 2 (Amber / Awaiting) */}
        <div
          onClick={() => setActiveFilter('awaiting')}
          className={`min-w-[135px] flex-shrink-0 rounded-xl p-3 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            activeFilter === 'awaiting'
              ? 'bg-tertiary-fixed/40 ring-2 ring-tertiary'
              : 'bg-tertiary-fixed/20 border border-tertiary/20 hover:bg-tertiary-fixed/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-tertiary font-bold">Awaiting Review</span>
            <span className="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-tertiary">{awaitingCount}</span>
            <span className="text-[11px] text-tertiary-container font-bold">Requires triage</span>
          </div>
        </div>

        {/* Metric 3 (Checking Slots) */}
        <div className="min-w-[135px] flex-shrink-0 bg-secondary-container/40 rounded-xl p-3 shadow-xs flex flex-col justify-between border border-secondary/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary font-bold">Slot Checking</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">sync</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-on-secondary-fixed">{checkingCount}</span>
            <span className="text-[11px] text-on-secondary-container font-semibold">Matching Dr.</span>
          </div>
        </div>

        {/* Metric 4 (Confirmed) */}
        <div
          onClick={() => setActiveFilter('confirmed')}
          className={`min-w-[135px] flex-shrink-0 rounded-xl p-3 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            activeFilter === 'confirmed'
              ? 'bg-primary-fixed/40 ring-2 ring-primary'
              : 'bg-primary-fixed/25 border border-primary/20 hover:bg-primary-fixed/35'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-on-primary-fixed-variant font-bold">Confirmed</span>
            <span className="material-symbols-outlined text-[18px] text-primary">verified</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-primary">{confirmedCount}</span>
            <span className="text-[11px] text-on-primary-fixed-variant font-semibold">Passes sent</span>
          </div>
        </div>

        {/* Metric 5 (Done/Moved) */}
        <div className="min-w-[135px] flex-shrink-0 bg-surface-container-lowest rounded-xl p-3 shadow-xs flex flex-col justify-between border border-surface-container-high">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-on-surface-variant font-semibold">Done / Moved</span>
            <span className="material-symbols-outlined text-[18px] text-outline">history</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-on-surface">{completedCount + 2}</span>
            <span className="text-[11px] text-on-surface-variant font-medium">2 reschedule</span>
          </div>
        </div>
      </div>

      {/* Search & Department Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, case #, complaint, or department..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-surface-container text-xs text-on-surface placeholder:text-outline border border-surface-container-high focus:outline-none focus:border-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]"
            >
              close
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-on-surface-variant whitespace-nowrap hidden sm:inline">
            Department:
          </span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface-container text-xs font-semibold text-on-surface border border-surface-container-high focus:outline-none focus:border-primary w-full sm:w-auto"
          >
            <option value="all">All Departments</option>
            <option value="General">General Consultation</option>
            <option value="Dermatology">Dermatology</option>
            <option value="ENT">ENT</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Dental">Dental</option>
          </select>
        </div>
      </div>

      {/* Filter Navigation Segment */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
            activeFilter === 'all'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          Zote / All ({totalCount})
        </button>
        <button
          onClick={() => setActiveFilter('awaiting')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1 transition-all ${
            activeFilter === 'awaiting'
              ? 'bg-tertiary text-on-tertiary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span>Awaiting Review ({awaitingCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('checking')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1 transition-all ${
            activeFilter === 'checking'
              ? 'bg-secondary text-on-secondary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">sync</span>
          <span>Checking Availability ({checkingCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('urgent')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs flex items-center gap-1 transition-all ${
            activeFilter === 'urgent'
              ? 'bg-error text-on-error'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">priority_high</span>
          <span>Urgent Triage ({urgentCount})</span>
        </button>
        <button
          onClick={() => setActiveFilter('confirmed')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
            activeFilter === 'confirmed'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          Confirmed ({confirmedCount})
        </button>
        <button
          onClick={() => setActiveFilter('rescheduling')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
            activeFilter === 'rescheduling'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          Rescheduling ({reschedulingCount})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-xs transition-all ${
            activeFilter === 'completed'
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Real-time Patient Queue Cards List */}
      <div className="flex flex-col gap-3">
        {filteredRequests.map((req) => {
          const isUrgent = req.urgency === 'Urgent';
          const isConfirmed = req.status === 'CONFIRMED';
          const isChecking = req.status === 'CHECKING_AVAILABILITY' || req.status === 'SLOT_PROPOSED';

          return (
            <div
              key={req.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden transition-all hover:shadow-md border border-surface-container-high/60"
            >
              {/* Severity Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  isUrgent ? 'bg-error' : isConfirmed ? 'bg-primary' : 'bg-secondary'
                }`}
              ></div>

              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs ${
                      isUrgent
                        ? 'bg-error-container text-on-error-container'
                        : isConfirmed
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {req.patientName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-on-surface truncate">{req.patientName}</h3>
                      <span className="text-xs font-bold text-on-surface-variant">{req.id}</span>
                    </div>
                    <p className="text-[11px] text-outline flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary">near_me</span>
                      <span>{req.patientLocation} • {req.insurance}</span>
                    </p>
                  </div>
                </div>

                {/* Priority Flag Badge */}
                {isUrgent ? (
                  <span className="bg-error-container text-on-error-container px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 flex-shrink-0 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                    <span>URGENT TRIAGE</span>
                  </span>
                ) : isConfirmed ? (
                  <span className="bg-primary-fixed/40 text-primary px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>CONFIRMED</span>
                  </span>
                ) : (
                  <span className="bg-secondary-container/60 text-secondary px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0">
                    <span className="material-symbols-outlined text-[13px]">pending</span>
                    <span>STANDARD</span>
                  </span>
                )}
              </div>

              {/* Linguistic Mode Badge & Patient Transcript */}
              <div className="mt-3 bg-surface-container-low rounded-xl p-2.5 border border-surface-container-high/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">chat</span>
                    <span>Patient Intake Transcript</span>
                  </span>
                  <span className="bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {req.languageMode}
                  </span>
                </div>
                <p className="text-xs text-on-surface italic font-medium leading-relaxed">
                  {req.verbatimTranscript}
                </p>
              </div>

              {/* AI Clinical Extraction Summary */}
              <div className="mt-2.5 bg-primary-fixed/20 rounded-xl p-3 border border-primary/15">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                    <span className="text-xs font-bold text-primary">Claude Clinical Summary</span>
                  </div>
                  <span className="text-xs font-bold text-tertiary-container">
                    Triage Score: {req.triageScore}/5 ({req.urgency})
                  </span>
                </div>
                <p className="text-xs text-on-surface font-medium leading-snug">
                  {req.clinicalSummary}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {req.flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-container-lowest px-2 py-0.5 rounded text-[10px] font-bold text-on-surface border border-surface-container-high"
                    >
                      {flag}
                    </span>
                  ))}
                  <span className="bg-surface-container-lowest px-2 py-0.5 rounded text-[10px] font-bold text-primary border border-primary/20">
                    Preferred: {req.preferredTime}
                  </span>
                </div>
              </div>

              {/* Workflow Status & Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-surface-container-high/40 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline font-medium">Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      isConfirmed
                        ? 'bg-primary-fixed text-on-primary-fixed-variant'
                        : isUrgent
                        ? 'bg-tertiary-fixed text-tertiary'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {req.status === 'CONFIRMED'
                      ? `Booked: ${req.assignedDoctorName || 'Dr. Kamau'} • ${req.assignedSlot || '10:30 AM'}`
                      : req.status === 'SLOT_PROPOSED'
                      ? `Slot Proposed: ${req.assignedDoctorName} (${req.assignedSlot})`
                      : 'Awaiting Doctor Availability'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  <button
                    onClick={() => handleReviewClick(req)}
                    className="h-10 bg-primary text-on-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 hover:bg-primary-container transition-all"
                  >
                    <span className="material-symbols-outlined text-[17px]">event_available</span>
                    <span>Check Availability</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDeptModalReq(req);
                      setModalNewDept(req.assignedDepartment);
                    }}
                    className="h-10 bg-surface-container text-on-surface rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[17px] text-secondary">apartment</span>
                    <span>Assign Dept</span>
                  </button>

                  <button
                    onClick={() => handleQuickAssign(req)}
                    className="h-10 bg-surface-container text-primary rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[17px]">assignment_ind</span>
                    <span>Assign Dr. Kamau</span>
                  </button>

                  <a
                    href={`tel:${req.patientPhone}`}
                    className="h-10 bg-surface-container text-on-surface rounded-lg text-xs font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all text-center border border-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[17px] text-tertiary">call</span>
                    <span>Contact</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Duty Triage Lead Status */}
      <div className="p-3.5 bg-surface-container-highest/60 rounded-xl flex items-center justify-between shadow-xs border border-surface-container-high">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-xs">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">Duty Triage Lead: Dr. Odhiambo</p>
            <p className="text-[11px] text-on-surface-variant">Auto-escalation threshold: 3 min review SLA</p>
          </div>
        </div>
        <button
          onClick={() => showToast('Shift Log: 27 triaged, 9 confirmed, 0 dropoffs')}
          className="px-3 py-1.5 bg-surface-container-lowest text-primary rounded-lg text-xs font-bold shadow-xs hover:bg-surface-container border border-surface-container-high"
        >
          Shift Log
        </button>
      </div>

      {/* Department Reassignment Modal */}
      {selectedDeptModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-5 shadow-2xl border border-surface-container-high space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">apartment</span>
                <h3 className="font-bold text-sm text-on-surface">Badilisha Idara (Reassign Dept)</h3>
              </div>
              <button
                onClick={() => setSelectedDeptModalReq(null)}
                className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-lg text-xs">
              <p className="text-on-surface font-semibold">
                Mgonjwa / Patient: <span className="font-bold text-primary">{selectedDeptModalReq.patientName}</span>
              </p>
              <p className="text-on-surface-variant text-[11px] mt-0.5">
                Ombi: {selectedDeptModalReq.id} • Idara ya Sasa:{' '}
                <strong className="text-on-surface">{selectedDeptModalReq.assignedDepartment}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant block">
                Chagua Idara Mpya (Target Department):
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {[
                  'General Consultation',
                  'Dermatology',
                  'ENT (Ear, Nose & Throat)',
                  'Pediatrics',
                  'Dental',
                  'Obstetrics & Gynecology',
                  'Internal Medicine',
                  'Orthopedics',
                ].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setModalNewDept(dept)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-left flex items-center justify-between transition-all ${
                      modalNewDept === dept
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{dept}</span>
                    {modalNewDept === dept && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() =>
                  handleAssignDept(
                    selectedDeptModalReq,
                    modalNewDept || selectedDeptModalReq.assignedDepartment
                  )
                }
                className="flex-1 h-10 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-xs active:scale-95 hover:bg-primary-container transition-all"
              >
                Thibitisha Idara
              </button>
              <button
                onClick={() => setSelectedDeptModalReq(null)}
                className="px-4 h-10 rounded-lg bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high"
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
