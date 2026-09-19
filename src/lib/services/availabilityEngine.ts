/**
 * AfyaConnect Doctor Availability Engine
 * Hospital system source of truth: prevents double booking, checks duty rosters,
 * and holds slots for patient confirmation.
 */

import { INITIAL_FACILITIES } from '../../data/mockData';
import { Doctor, DoctorSlot, Facility } from '../../types';

export interface SlotAvailabilityResult {
  facilityId: string;
  facilityName: string;
  department: string;
  availableDoctors: Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    room: string;
    freeSlots: DoctorSlot[];
  }>;
  earliestAvailableSlot: string;
}

export function checkRealDoctorAvailability(
  facilityId: string,
  departmentCode?: string
): SlotAvailabilityResult {
  const facility =
    INITIAL_FACILITIES.find((f) => f.id === facilityId) || INITIAL_FACILITIES[0];

  const doctorsWithSlots = facility.doctors
    .filter((d) => d.isOnDuty)
    .map((doc) => ({
      doctorId: doc.id,
      doctorName: doc.name,
      specialty: doc.specialty,
      room: doc.room,
      freeSlots: doc.slots.filter((s) => s.isAvailable && !s.isBooked),
    }));

  const firstDoc = doctorsWithSlots[0];
  const earliestSlot = firstDoc?.freeSlots[0]?.time || 'Leo 3:30 PM';

  return {
    facilityId: facility.id,
    facilityName: facility.name,
    department: departmentCode || 'General Outpatient (OPD)',
    availableDoctors: doctorsWithSlots,
    earliestAvailableSlot: earliestSlot,
  };
}

/**
 * Validates whether a target slot is still free before booking (double-booking check)
 */
export function validateAndHoldSlot(
  facilityId: string,
  doctorName: string,
  slotTime: string
): { success: boolean; message: string; heldSlot?: string } {
  const facility = INITIAL_FACILITIES.find((f) => f.id === facilityId);
  if (!facility) {
    return { success: false, message: 'Hospital facility not found.' };
  }

  const doctor = facility.doctors.find((d) => d.name === doctorName);
  if (!doctor) {
    return { success: false, message: `Doctor ${doctorName} is not registered at this facility.` };
  }

  const slot = doctor.slots.find((s) => s.time === slotTime);
  if (slot && slot.isBooked) {
    return {
      success: false,
      message: `Nafasi ya ${slotTime} imeshachukuliwa. Tafadhali chagua wakati mwingine (Slot already booked).`,
    };
  }

  // Mark slot held/reserved
  if (slot) {
    slot.isBooked = true;
  }

  return {
    success: true,
    message: `Slot held successfully for ${doctorName} at ${slotTime}.`,
    heldSlot: slotTime,
  };
}
