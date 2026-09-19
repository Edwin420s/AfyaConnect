import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { EmergencyModal } from './components/EmergencyModal';
import { BookingSheetModal } from './components/BookingSheetModal';
import { ClaudeConfigModal } from './components/ClaudeConfigModal';

// Patient Views
import { CareFrontdoor } from './components/patient/CareFrontdoor';
import { NearbyFacilities } from './components/patient/NearbyFacilities';
import { MyAppointment } from './components/patient/MyAppointment';

// Hospital Views
import { HospitalDashboard } from './components/hospital/HospitalDashboard';
import { FacilityDetailView } from './components/hospital/FacilityDetailView';

// Doctor & Admin Views
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App: React.FC = () => {
  const { currentRole, activePatientTab } = useApp();
  const [selectedHospitalRequestId, setSelectedHospitalRequestId] = useState<string | null>(null);

  const handleOpenHospitalDetail = (requestId: string) => {
    setSelectedHospitalRequestId(requestId);
  };

  const handleCloseHospitalDetail = () => {
    setSelectedHospitalRequestId(null);
  };

  const renderContent = () => {
    // 1. Doctor View
    if (currentRole === 'doctor') {
      return <DoctorDashboard />;
    }

    // 2. Admin View
    if (currentRole === 'admin') {
      return <AdminDashboard />;
    }

    // 3. Hospital View
    if (currentRole === 'hospital') {
      if (selectedHospitalRequestId) {
        return (
          <FacilityDetailView
            requestId={selectedHospitalRequestId}
            onBack={handleCloseHospitalDetail}
          />
        );
      }
      return <HospitalDashboard onOpenDetail={handleOpenHospitalDetail} />;
    }

    // 4. Patient Views
    switch (activePatientTab) {
      case 'triage':
        return <CareFrontdoor />;
      case 'vituo':
        return <NearbyFacilities />;
      case 'miadi':
        return <MyAppointment />;
      case 'hospital':
        if (selectedHospitalRequestId) {
          return (
            <FacilityDetailView
              requestId={selectedHospitalRequestId}
              onBack={handleCloseHospitalDetail}
            />
          );
        }
        return <HospitalDashboard onOpenDetail={handleOpenHospitalDetail} />;
      default:
        return <CareFrontdoor />;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Fixed Header with Role Switcher, Logo & Language Toggle */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-20">
        {renderContent()}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav />

      {/* Global Modals and Notifications */}
      <Toast />
      <EmergencyModal />
      <BookingSheetModal />
      <ClaudeConfigModal />
    </div>
  );
};
