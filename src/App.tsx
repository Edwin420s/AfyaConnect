import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { EmergencyModal } from './components/EmergencyModal';
import { BookingSheetModal } from './components/BookingSheetModal';

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
  const { currentRole, activePatientTab, setCurrentRole, setActivePatientTab } = useApp();
  const [selectedHospitalRequestId, setSelectedHospitalRequestId] = useState<string | null>(null);

  // Browser Back/Forward navigation integration
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.selectedHospitalRequestId !== undefined) {
          setSelectedHospitalRequestId(event.state.selectedHospitalRequestId);
        }
        if (event.state.role) {
          setCurrentRole(event.state.role);
        }
        if (event.state.tab) {
          setActivePatientTab(event.state.tab);
        }
      } else {
        setSelectedHospitalRequestId(null);
        setCurrentRole('patient');
        setActivePatientTab('triage');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCurrentRole, setActivePatientTab]);

  const handleOpenHospitalDetail = (requestId: string) => {
    setSelectedHospitalRequestId(requestId);
    window.history.pushState(
      { role: 'hospital', tab: 'hospital', selectedHospitalRequestId: requestId },
      ''
    );
  };

  const handleCloseHospitalDetail = () => {
    setSelectedHospitalRequestId(null);
  };

  const handleTabSelect = (tab: 'triage' | 'vituo' | 'miadi' | 'hospital') => {
    setSelectedHospitalRequestId(null);
    if (tab === 'hospital') {
      setCurrentRole('hospital');
      setActivePatientTab('hospital');
      window.history.pushState({ role: 'hospital', tab: 'hospital', selectedHospitalRequestId: null }, '');
    } else {
      setCurrentRole('patient');
      setActivePatientTab(tab);
      window.history.pushState({ role: 'patient', tab, selectedHospitalRequestId: null }, '');
    }
  };

  const handleBackToPatientTriage = () => {
    setSelectedHospitalRequestId(null);
    setCurrentRole('patient');
    setActivePatientTab('triage');
    window.history.pushState({ role: 'patient', tab: 'triage', selectedHospitalRequestId: null }, '');
  };

  const renderContent = () => {
    // 1. Doctor View
    if (currentRole === 'doctor') {
      return <DoctorDashboard onBack={handleBackToPatientTriage} />;
    }

    // 2. Admin View
    if (currentRole === 'admin') {
      return <AdminDashboard onBack={handleBackToPatientTriage} />;
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
      return (
        <HospitalDashboard
          onOpenDetail={handleOpenHospitalDetail}
          onBack={handleBackToPatientTriage}
        />
      );
    }

    // 4. Patient Views
    switch (activePatientTab) {
      case 'triage':
        return <CareFrontdoor />;
      case 'vituo':
        return <NearbyFacilities onBack={handleBackToPatientTriage} />;
      case 'miadi':
        return <MyAppointment onBack={handleBackToPatientTriage} />;
      case 'hospital':
        if (selectedHospitalRequestId) {
          return (
            <FacilityDetailView
              requestId={selectedHospitalRequestId}
              onBack={handleCloseHospitalDetail}
            />
          );
        }
        return (
          <HospitalDashboard
            onOpenDetail={handleOpenHospitalDetail}
            onBack={handleBackToPatientTriage}
          />
        );
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
      <BottomNav onTabSelect={handleTabSelect} />

      {/* Global Modals and Notifications */}
      <Toast />
      <EmergencyModal />
      <BookingSheetModal />
    </div>
  );
};
