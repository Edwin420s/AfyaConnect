/**
 * AfyaConnect Location Service & Privacy Layer
 * Resolves patient device location, computes distance, and filters nearby facilities.
 * Adheres strictly to the Privacy Rule: Raw GPS coordinates are never fed to Claude directly.
 */

import { Facility } from '../../types';
import { INITIAL_FACILITIES } from '../../data/mockData';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

// Default reference coordinates: Westlands / Parklands, Nairobi
export const DEFAULT_NAIROBI_LOCATION: GeoCoordinate = {
  latitude: -1.2675,
  longitude: 36.8121,
};

export interface ResolvedLocation {
  areaName: string;
  subCounty: string;
  city: string;
  radiusKm: number;
  isSimulatedOrGps: 'gps' | 'manual' | 'simulated';
}

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
export function calculateHaversineDistance(
  coord1: GeoCoordinate,
  coord2: GeoCoordinate
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Resolves patient's current location with device permission
 */
export async function getPatientLocation(): Promise<{
  coord: GeoCoordinate;
  resolved: ResolvedLocation;
}> {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coord: GeoCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          resolve({
            coord,
            resolved: {
              areaName: 'Westlands & Parklands',
              subCounty: 'Westlands',
              city: 'Nairobi',
              radiusKm: 3.5,
              isSimulatedOrGps: 'gps',
            },
          });
        },
        () => {
          // Graceful fallback to Nairobi central default
          resolve({
            coord: DEFAULT_NAIROBI_LOCATION,
            resolved: {
              areaName: 'Westlands, Nairobi',
              subCounty: 'Westlands',
              city: 'Nairobi',
              radiusKm: 3.5,
              isSimulatedOrGps: 'simulated',
            },
          });
        },
        { timeout: 4000 }
      );
    } else {
      resolve({
        coord: DEFAULT_NAIROBI_LOCATION,
        resolved: {
          areaName: 'Westlands, Nairobi',
          subCounty: 'Westlands',
          city: 'Nairobi',
          radiusKm: 3.5,
          isSimulatedOrGps: 'simulated',
        },
      });
    }
  });
}

/**
 * Finds nearby facilities and returns structured summaries suitable for Claude
 * (Never exposes raw coordinates to Claude).
 */
export function findNearbyFacilitiesForClaude(
  carePathway?: string,
  maxRadiusKm: number = 5.0
): {
  facilities: Array<{
    id: string;
    name: string;
    subCounty: string;
    distanceKm: number;
    driveTime: string;
    level: string;
    accreditation: string;
    availableServices: string[];
    earliestSlot: string;
    leadDoctor: string;
  }>;
} {
  const matching = INITIAL_FACILITIES.filter((f) => {
    if (!carePathway || carePathway === 'All') return f.distanceKm <= maxRadiusKm;
    return (
      f.distanceKm <= maxRadiusKm &&
      (f.services.some((s) => s.toLowerCase().includes(carePathway.toLowerCase())) ||
        carePathway.includes('General'))
    );
  });

  return {
    facilities: matching.map((f) => ({
      id: f.id,
      name: f.name,
      subCounty: f.subCounty,
      distanceKm: f.distanceKm,
      driveTime: f.driveTime,
      level: f.level,
      accreditation: f.accreditation,
      availableServices: f.services,
      earliestSlot: f.doctors[0]?.slots[0]?.time || 'Kesho 09:00 AM',
      leadDoctor: f.doctors[0]?.name || 'On Duty Medical Officer',
    })),
  };
}
