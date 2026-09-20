import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface NearbyFacilitiesProps {
  onBack?: () => void;
}

export const NearbyFacilities: React.FC<NearbyFacilitiesProps> = ({ onBack }) => {
  const {
    facilities,
    selectSlotForBooking,
    userLocationText,
    isGpsActive,
    toggleGps,
    showToast,
    setActivePatientTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSlotMap, setSelectedSlotMap] = useState<Record<string, string>>({
    'f-agakhan': 'Leo 3:30 PM',
    'f-mpshah': 'Leo 4:15 PM',
    'f-westlands': 'Kesho 08:30 AM',
    'f-avenue': 'Leo 2:30 PM',
  });

  const categories = [
    { id: 'all', label: 'All Facilities (14)', icon: 'domain' },
    { id: 'general', label: 'General Consultation', icon: 'stethoscope' },
    { id: 'pediatrics', label: 'Pediatrics', icon: 'child_care' },
    { id: 'dental', label: 'Dental', icon: 'dentistry' },
    { id: 'maternity', label: 'Maternity / Linda Mama', icon: 'pregnant_woman' },
  ];

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.doctors.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'general') return matchesSearch && f.services.includes('General Consultation');
    if (selectedCategory === 'pediatrics') return matchesSearch && f.services.includes('Pediatrics');
    if (selectedCategory === 'dental') return matchesSearch && f.services.includes('Dental');
    if (selectedCategory === 'maternity') return matchesSearch && (f.accreditation.includes('Linda Mama') || f.services.includes('Maternal & Child Health'));
    return matchesSearch;
  });

  const handleSlotSelect = (facilityId: string, slotTime: string) => {
    setSelectedSlotMap(prev => ({ ...prev, [facilityId]: slotTime }));
    showToast(`Slot imechaguliwa: ${slotTime}`);
  };

  const handleOpenBooking = (facility: typeof facilities[0], doctor: typeof facilities[0]['doctors'][0]) => {
    const chosenSlot = selectedSlotMap[facility.id] || 'Leo 3:30 PM';
    selectSlotForBooking(facility.name, doctor.name, chosenSlot, facility.id);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-3 sm:px-4 pt-2 pb-24 space-y-3">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between gap-2 pb-0.5">
        <button
          onClick={onBack || (() => setActivePatientTab('triage'))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Rudi kwenye Mazungumzo (Back to Triage)</span>
        </button>
        <button
          onClick={() => setActivePatientTab('miadi')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary text-xs font-bold hover:bg-surface-container-high active:scale-95 transition-all shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
          <span>Miadi Yangu (Passes)</span>
        </button>
      </div>

      {/* Top Location Card */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container-high/60">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              near_me
            </span>
            <h2 className="font-bold text-base text-on-surface truncate">Vituo Vilivyo Karibu</h2>
          </div>
          <button
            onClick={toggleGps}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isGpsActive ? 'bg-primary animate-ping' : 'bg-outline'}`}></span>
            <span>{isGpsActive ? 'Live GPS' : 'Manual GPS'}</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-2.5">
          Kupata vituo vya afya vilivyo tayari kuhudumia na madaktari wa zamu.
        </p>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low mb-3 border border-surface-container-high/40">
          <span className="material-symbols-outlined text-tertiary-container text-[18px]">location_on</span>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-on-surface truncate">Westlands & Parklands Sub-County</span>
            <span className="text-[11px] text-on-surface-variant truncate">
              {isGpsActive ? 'Eneo limetambuliwa kiotomatiki • 3.2km radius' : 'Eneo limeteuliwa kwa mkono'}
            </span>
          </div>
          <button
            onClick={toggleGps}
            className="px-2.5 py-1 rounded bg-surface-container text-primary text-xs font-bold hover:bg-surface-variant active:scale-95 transition-all shadow-xs"
          >
            Badili
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafuta hospitali, daktari au huduma..."
            className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all border border-surface-container-high/50"
          />
          <button
            onClick={() => showToast('Filters: Level 4, Level 5, Level 6 & SHA Verified')}
            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[20px]"
          >
            tune
          </button>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 w-max">
          {categories.map((cat) => {
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 h-9 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
                  isSel
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Street Map Preview Card */}
      <div
        onClick={() => showToast('Interactive Map: 4 participating clinics within 3.2km')}
        className="w-full h-28 rounded-xl bg-surface-container-high relative overflow-hidden flex items-end p-3 shadow-sm cursor-pointer group"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCzw_dutFA5ntkMUnYbok-ymwPrrgxB1wDWM_exj2rSw9U7REaPJj8mMnRZjZna1UA9IeTcfsNtL9Fm6kjIBwK2YP726VqemnNfAkvzcAUok6lgFGI8aK5BwD3MaJVPGYyTJswFgv-qLHn0chndhcP7eamMXdafmvpJyUPuFeag2Kl_9ci70C54uUtY7WH9TnGTHv-VlXqcUEhN1cmQVx4-EzpzRY_gEUUacq9yfOaqIC5LZ6CnTuK')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent group-hover:from-inverse-surface/90 transition-all"></div>
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-inverse-on-surface">
            <span className="material-symbols-outlined text-[18px] text-primary-fixed">map</span>
            <span className="text-xs font-bold">Onyesha kwenye Ramani ya Mtaa (Nairobi Westlands)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest/90 text-on-surface text-xs font-bold shadow-sm">
            Tazama Ramani →
          </span>
        </div>
      </div>

      {/* Facilities Cards List */}
      <div className="flex flex-col gap-3">
        {filteredFacilities.map((facility) => {
          const mainDoctor = facility.doctors[0] || {
            name: 'Clinical Staff On Duty',
            specialty: 'General Consultation',
            room: 'Triage 1',
            freeSlotsCount: 2,
            slots: [],
          };
          const activeSlot = selectedSlotMap[facility.id] || (mainDoctor.slots[0]?.time || 'Leo 3:30 PM');

          return (
            <div
              key={facility.id}
              className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden border border-surface-container-high/60 transition-all hover:shadow-md"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-bold">
                      {facility.level}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      {facility.accreditation}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface truncate">{facility.name}</h3>
                  <p className="text-xs text-on-surface-variant truncate">{facility.address}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{facility.distanceKm} km</span>
                  <p className="text-[11px] text-tertiary font-medium">{facility.driveTime}</p>
                </div>
              </div>

              {/* Doctor Details Bar */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low mb-3 border border-surface-container-high/40">
                <img
                  src={facility.imageUrl}
                  alt={mainDoctor.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-surface-container shadow-xs"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-on-surface truncate">{mainDoctor.name}</span>
                    <span className="material-symbols-outlined text-primary text-[14px]">verified_user</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant truncate">{mainDoctor.specialty}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest text-tertiary text-xs font-semibold shadow-xs">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">schedule</span>
                  <span>Foleni: {facility.queueCount}</span>
                </div>
              </div>

              {/* Available Slots Row */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="text-on-surface-variant font-medium">Nafasi za Leo & Kesho (Available Slots):</span>
                  <span className="text-primary font-bold">Chagua Moja</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {mainDoctor.slots && mainDoctor.slots.length > 0 ? (
                    mainDoctor.slots.map((slot) => {
                      const isSelected = activeSlot === slot.time;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(facility.id, slot.time)}
                          className={`h-11 px-2 rounded-lg text-xs flex flex-col items-center justify-center transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-primary text-on-primary font-bold shadow-sm'
                              : 'bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high'
                          }`}
                        >
                          <span className="leading-tight truncate">{slot.time}</span>
                          <span className="text-[9px] opacity-80">
                            {slot.remainingCount ? `${slot.remainingCount} zimebaki` : 'Nafasi ipo'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <button
                      onClick={() => handleSlotSelect(facility.id, 'Kesho 08:30 AM')}
                      className={`col-span-3 h-11 px-3 rounded-lg text-xs flex items-center justify-between transition-all active:scale-95 ${
                        activeSlot === 'Kesho 08:30 AM'
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">alarm</span>
                        <span>Kesho 08:30 AM (Digital Walk-in Pass)</span>
                      </div>
                      <span className="font-bold">Bure / Free</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Payment & Booking Action */}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/40">
                <div className="flex items-center gap-1 text-on-surface-variant text-[11px] font-medium min-w-0">
                  <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">
                    health_and_safety
                  </span>
                  <span className="truncate">{facility.paymentBadges.slice(0, 3).join(' • ')}</span>
                </div>
                <button
                  onClick={() => handleOpenBooking(facility, mainDoctor)}
                  className="h-10 px-4 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-sm active:scale-95 hover:bg-primary-container transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Chagua Slot Hii</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informative Guidance Banner */}
      <div className="rounded-xl bg-surface-container p-4 flex items-center gap-3 border border-surface-container-high/60">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary flex-shrink-0 shadow-xs">
          <span className="material-symbols-outlined text-[22px]">verified</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-on-surface">3 vituo vina madaktari tayari</span>
          <p className="text-[11px] text-on-surface-variant leading-normal">
            You choose the facility you trust best. All verified under Kenyan Ministry of Health & SHA guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
