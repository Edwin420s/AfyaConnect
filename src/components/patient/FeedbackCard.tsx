import React from 'react';
import { FeedbackCardData } from '../../types';
import { useApp } from '../../context/AppContext';

interface FeedbackCardProps {
  data: FeedbackCardData;
  onConfirm: (doctor: string, slot: string, hospital: string) => void;
  onViewTimeline?: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  data,
  onConfirm,
  onViewTimeline,
}) => {
  const { languagePreference } = useApp();
  const {
    type,
    department,
    requestedTime,
    statusText,
    doctorName,
    date,
    time,
    facilityName,
    requestId,
  } = data;

  // 1. Appointment Request Received Card
  if (type === 'request_received') {
    return (
      <div className="rounded-xl bg-surface-container-low p-3.5 border border-primary/25 shadow-xs space-y-2.5 my-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">
              pending_actions
            </span>
            <h4 className="text-xs font-bold text-on-surface">Appointment Request Received</h4>
          </div>
          <span className="text-[10px] bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-bold">
            {statusText || 'Checking availability'}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Your request for a medical consultation has been received by the hospital.
        </p>
        <div className="p-2 rounded-lg bg-surface-container-lowest text-xs space-y-1 border border-surface-container-high/60">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Department:</span>
            <span className="font-bold text-on-surface">{department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Requested:</span>
            <span className="font-bold text-primary">{requestedTime || 'Tomorrow morning'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Status:</span>
            <span className="font-bold text-tertiary">{statusText || 'Checking availability'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Doctor Availability Card with [Confirm Appointment]
  if (type === 'doctor_availability') {
    return (
      <div className="rounded-xl bg-surface-container-low p-3.5 border border-primary/30 shadow-xs space-y-2.5 my-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">
              event_available
            </span>
            <h4 className="text-xs font-bold text-on-surface">Doctor Availability</h4>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            Verified Slot
          </span>
        </div>

        <p className="text-xs text-on-surface leading-relaxed">
          <strong className="text-primary font-bold">{doctorName || 'Dr. Kamau'}</strong> is available{' '}
          <strong className="text-on-surface font-bold">{date || 'tomorrow'}</strong> at{' '}
          <strong className="text-primary font-bold">{time || '10:30 AM'}</strong> at{' '}
          <strong className="text-on-surface font-semibold">{facilityName || 'Aga Khan Hospital'}</strong>.
        </p>

        <p className="text-xs text-on-surface-variant">Would you like to book this appointment?</p>

        <div className="pt-1">
          <button
            onClick={() =>
              onConfirm(
                doctorName || 'Dr. Kamau',
                time || '10:30 AM',
                facilityName || 'Aga Khan Univ. Hospital'
              )
            }
            className="w-full h-10 px-3 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 hover:bg-primary-container transition-all"
          >
            <span className="material-symbols-outlined text-[17px]">check_circle</span>
            <span>Confirm Appointment</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Appointment Confirmed ✓ Card
  return (
    <div className="rounded-xl bg-primary-fixed/25 p-3.5 border border-primary/40 shadow-xs space-y-2.5 my-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <h4 className="text-xs font-bold text-primary">Appointment Confirmed ✓</h4>
        </div>
        <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">
          Pass Issued
        </span>
      </div>

      <div className="p-2.5 rounded-lg bg-surface-container-lowest text-xs space-y-1.5 border border-surface-container-high/60">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Doctor:</span>
          <span className="font-bold text-on-surface">{doctorName || 'Dr. Kamau'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Department:</span>
          <span className="font-bold text-on-surface">{department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Date:</span>
          <span className="font-bold text-on-surface">{date || 'Kesho, 24 Sept'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Time:</span>
          <span className="font-extrabold text-primary">{time || '10:30 AM'}</span>
        </div>
      </div>

      <p className="text-[11px] text-on-surface-variant">
        Your appointment has been successfully booked.
      </p>

      {onViewTimeline && (
        <button
          onClick={onViewTimeline}
          className="text-xs text-primary font-bold flex items-center gap-1 hover:underline pt-0.5"
        >
          <span>
            {languagePreference === 'eng'
              ? 'View Appointment Timeline'
              : languagePreference === 'swa'
              ? 'Tazama Hatua za Miadi'
              : 'View Timeline (Tazama Hatua)'}
          </span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      )}
    </div>
  );
};
