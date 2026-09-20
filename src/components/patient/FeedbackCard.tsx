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

  const isEng = languagePreference === 'eng';
  const isSwa = languagePreference === 'swa';

  // 1. Appointment Request Received Card
  if (type === 'request_received') {
    const cardTitle = isEng ? 'Appointment Request Received' : isSwa ? 'Ombi la Miadi Limepokelewa' : 'Appointment Request Received (Limepokelewa)';
    const cardDesc = isEng
      ? 'Your request for a medical consultation has been received by the hospital.'
      : isSwa
      ? 'Ombi lako la mashauriano ya matibabu limepokelewa na hospitali.'
      : 'Ombi lako la mashauriano ya matibabu limepokelewa na hospitali (Received).';
    const deptLabel = isEng ? 'Department:' : isSwa ? 'Kitengo:' : 'Department (Kitengo):';
    const reqLabel = isEng ? 'Requested:' : isSwa ? 'Muda Ulioombwa:' : 'Requested Time:';
    const statusLbl = isEng ? 'Status:' : isSwa ? 'Hali:' : 'Status (Hali):';
    const defaultStatus = isEng ? 'Checking availability' : isSwa ? 'Inakaguliwa' : 'Checking availability';
    const defaultReq = isEng ? 'Tomorrow morning' : isSwa ? 'Kesho asubuhi' : 'Tomorrow morning (Kesho)';

    return (
      <div className="rounded-xl bg-surface-container-low p-3.5 border border-primary/25 shadow-xs space-y-2.5 my-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">
              pending_actions
            </span>
            <h4 className="text-xs font-bold text-on-surface">{cardTitle}</h4>
          </div>
          <span className="text-[10px] bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-bold">
            {statusText || defaultStatus}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          {cardDesc}
        </p>
        <div className="p-2 rounded-lg bg-surface-container-lowest text-xs space-y-1 border border-surface-container-high/60">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{deptLabel}</span>
            <span className="font-bold text-on-surface">{department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{reqLabel}</span>
            <span className="font-bold text-primary">{requestedTime || defaultReq}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">{statusLbl}</span>
            <span className="font-bold text-tertiary">{statusText || defaultStatus}</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Doctor Availability Card with [Confirm Appointment]
  if (type === 'doctor_availability') {
    const cardTitle = isEng ? 'Doctor Availability' : isSwa ? 'Upatikanaji wa Daktari' : 'Doctor Availability (Upatikanaji)';
    const badgeText = isEng ? 'Verified Slot' : isSwa ? 'Nafasi Imethibitishwa' : 'Verified Slot';
    const doc = doctorName || (isEng ? 'Dr. Kamau' : 'Daktari Kamau');
    const dDate = date || (isEng ? 'tomorrow' : isSwa ? 'kesho' : 'tomorrow (kesho)');
    const dTime = time || '10:30 AM';
    const hosp = facilityName || (isEng ? 'Aga Khan Hospital' : 'Hospitali ya Aga Khan');
    const promptText = isEng
      ? 'Would you like to book this appointment?'
      : isSwa
      ? 'Je, ungependa kuthibitisha miadi hii?'
      : 'Je, ungependa ku-book appointment hii?';
    const confirmBtn = isEng ? 'Confirm Appointment' : isSwa ? 'Thibitisha Miadi' : 'Confirm Appointment (Thibitisha)';

    return (
      <div className="rounded-xl bg-surface-container-low p-3.5 border border-primary/30 shadow-xs space-y-2.5 my-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">
              event_available
            </span>
            <h4 className="text-xs font-bold text-on-surface">{cardTitle}</h4>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
            {badgeText}
          </span>
        </div>

        <p className="text-xs text-on-surface leading-relaxed">
          {isEng ? (
            <>
              <strong className="text-primary font-bold">{doc}</strong> is available{' '}
              <strong className="text-on-surface font-bold">{dDate}</strong> at{' '}
              <strong className="text-primary font-bold">{dTime}</strong> at{' '}
              <strong className="text-on-surface font-semibold">{hosp}</strong>.
            </>
          ) : isSwa ? (
            <>
              <strong className="text-primary font-bold">{doc}</strong> anapatikana{' '}
              <strong className="text-on-surface font-bold">{dDate}</strong> saa{' '}
              <strong className="text-primary font-bold">{dTime}</strong> katika{' '}
              <strong className="text-on-surface font-semibold">{hosp}</strong>.
            </>
          ) : (
            <>
              <strong className="text-primary font-bold">{doc}</strong> is available{' '}
              <strong className="text-on-surface font-bold">{dDate}</strong> at{' '}
              <strong className="text-primary font-bold">{dTime}</strong> katika{' '}
              <strong className="text-on-surface font-semibold">{hosp}</strong>.
            </>
          )}
        </p>

        <p className="text-xs text-on-surface-variant">{promptText}</p>

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
            <span>{confirmBtn}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Appointment Confirmed ✓ Card
  const confirmedTitle = isEng ? 'Appointment Confirmed ✓' : isSwa ? 'Miadi Imethibitishwa ✓' : 'Appointment Confirmed ✓';
  const passBadge = isEng ? 'Pass Issued' : isSwa ? 'Pasi Imetolewa' : 'Pass Issued';
  const docLbl = isEng ? 'Doctor:' : isSwa ? 'Daktari:' : 'Doctor (Daktari):';
  const deptLbl = isEng ? 'Department:' : isSwa ? 'Kitengo:' : 'Department:';
  const dateLbl = isEng ? 'Date:' : isSwa ? 'Tarehe:' : 'Date:';
  const timeLbl = isEng ? 'Time:' : isSwa ? 'Saa:' : 'Time:';
  const confirmedDesc = isEng
    ? 'Your appointment has been successfully booked.'
    : isSwa
    ? 'Miadi yako imekamilishwa na kuthibitishwa kikamilifu.'
    : 'Your appointment has been successfully booked (Imethibitishwa).';

  return (
    <div className="rounded-xl bg-primary-fixed/25 p-3.5 border border-primary/40 shadow-xs space-y-2.5 my-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <h4 className="text-xs font-bold text-primary">{confirmedTitle}</h4>
        </div>
        <span className="text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded-full font-bold">
          {passBadge}
        </span>
      </div>

      <div className="p-2.5 rounded-lg bg-surface-container-lowest text-xs space-y-1.5 border border-surface-container-high/60">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{docLbl}</span>
          <span className="font-bold text-on-surface">{doctorName || 'Dr. Kamau'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{deptLbl}</span>
          <span className="font-bold text-on-surface">{department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{dateLbl}</span>
          <span className="font-bold text-on-surface">{date || (isEng ? 'Tomorrow, 24 Sept' : 'Kesho, 24 Sept')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">{timeLbl}</span>
          <span className="font-extrabold text-primary">{time || '10:30 AM'}</span>
        </div>
      </div>

      <p className="text-[11px] text-on-surface-variant">
        {confirmedDesc}
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
