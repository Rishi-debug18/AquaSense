import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AquaSenseMainLayout } from './components/layout/AquaSenseMainLayout';
import { AquaSenseLandingPage } from './pages/landing/AquaSenseLandingPage';

// Main Views
import { IndustrialDashboard } from './pages/industrial/IndustrialDashboard';
import { GovernmentDashboard } from './pages/government/GovernmentDashboard';
import { HouseholdResidentDashboard } from './pages/household/HouseholdResidentDashboard';
import { InteractiveWaterNetworkPage } from './pages/network/InteractiveWaterNetworkPage';
import { ConsumptionAnalyticsPage } from './pages/analytics/ConsumptionAnalyticsPage';
import { WaterAccountingPage } from './pages/accounting/WaterAccountingPage';
import { AlertCenterPage } from './pages/alerts/AlertCenterPage';
import { DeviceManagementPage } from './pages/devices/DeviceManagementPage';
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';
import { SupportCenterPage } from './pages/support/SupportCenterPage';
import { ReportsDataPage } from './pages/reports/ReportsDataPage';
import { ArchitectureApiPage } from './pages/architecture/ArchitectureApiPage';
import { AquaSenseLoginPage } from './pages/auth/AquaSenseLoginPage';
import { AquaSenseRegisterPage } from './pages/auth/AquaSenseRegisterPage';
import { PipelinesPage } from './pages/industrial/PipelinesPage';
import { LiveMonitoringPage } from './pages/industrial/LiveMonitoringPage';
import { DepartmentsPage } from './pages/industrial/DepartmentsPage';
import { WaterLossPage } from './pages/industrial/WaterLossPage';
import { CompanySettingsPage } from './pages/industrial/CompanySettingsPage';
import { WaterDigitalTwinPage } from './pages/industrial/WaterDigitalTwinPage';
import { WaterBalancePage } from './pages/industrial/WaterBalancePage';
import { WaterLossHeatmapPage } from './pages/industrial/WaterLossHeatmapPage';
import { WaterCostSimulatorPage } from './pages/industrial/WaterCostSimulatorPage';
import { DailyWaterBriefPage } from './pages/industrial/DailyWaterBriefPage';
import { ActionCenterPage } from './pages/industrial/ActionCenterPage';
import { HardwareSimulatorPage } from './pages/simulator/HardwareSimulatorPage';
import { useAquaSenseStore } from './store/aquaSenseStore';

const TourAutoLauncher: React.FC = () => {
  const { startTour, setRole } = useAquaSenseStore();
  React.useEffect(() => {
    setRole('COMPANY_ADMIN');
    startTour();
  }, [setRole, startTour]);
  return <Navigate to="/industrial" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            fontSize: '12px',
            borderRadius: '12px',
          }
        }} 
      />
      
      <Routes>
        {/* Landing Portal & Auth Gates */}
        <Route path="/" element={<AquaSenseLandingPage />} />
        <Route path="/login" element={<AquaSenseLoginPage />} />
        <Route path="/signin" element={<AquaSenseLoginPage />} />
        <Route path="/register" element={<AquaSenseRegisterPage />} />
        <Route path="/signup" element={<AquaSenseRegisterPage />} />
        <Route path="/admin/login" element={<AquaSenseLoginPage />} />
        <Route path="/security" element={<AquaSenseLoginPage />} />
        <Route path="/tour" element={<TourAutoLauncher />} />
        <Route path="/demo" element={<TourAutoLauncher />} />

        {/* Main Enterprise Application */}
        <Route element={<AquaSenseMainLayout />}>
          {/* Business Model B: Industrial Company Dashboard */}
          <Route path="/industrial" element={<IndustrialDashboard />} />
          <Route path="/dashboard" element={<IndustrialDashboard />} />
          
          {/* Central Feature: Full Interactive Water Network Architecture & Digital Twin */}
          <Route path="/digital-twin" element={<WaterDigitalTwinPage />} />
          <Route path="/prototype-simulator" element={<HardwareSimulatorPage />} />
          <Route path="/simulator" element={<HardwareSimulatorPage />} />
          <Route path="/network" element={<InteractiveWaterNetworkPage />} />

          {/* 5 Major Industrial Water Management Modules */}
          <Route path="/water-balance" element={<WaterBalancePage />} />
          <Route path="/loss-heatmap" element={<WaterLossHeatmapPage />} />
          <Route path="/cost-simulator" element={<WaterCostSimulatorPage />} />
          <Route path="/daily-brief" element={<DailyWaterBriefPage />} />
          <Route path="/action-center" element={<ActionCenterPage />} />

          {/* Dedicated Industrial Operations Pages */}
          <Route path="/monitoring" element={<LiveMonitoringPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/loss-detection" element={<WaterLossPage />} />
          <Route path="/billing" element={<WaterAccountingPage />} />
          <Route path="/costs" element={<WaterAccountingPage />} />
          <Route path="/settings" element={<CompanySettingsPage />} />

          {/* Business Model A: Government / Municipal Dashboard */}
          <Route path="/government" element={<GovernmentDashboard />} />

          {/* Business Model A: Household Resident Dashboard */}
          <Route path="/household" element={<HouseholdResidentDashboard />} />

          {/* Core Analytics & Usage Monitoring */}
          <Route path="/consumption" element={<ConsumptionAnalyticsPage />} />

          {/* Water Usage Cost Accounting & Municipal Bills */}
          <Route path="/accounting" element={<WaterAccountingPage />} />

          {/* Alert Center */}
          <Route path="/alerts" element={<AlertCenterPage />} />

          {/* IoT Device Fleet Management */}
          <Route path="/devices" element={<DeviceManagementPage />} />

          {/* Multi-channel Broadcast Notifications */}
          <Route path="/notifications" element={<NotificationCenterPage />} />

          {/* Support & Complaints Center */}
          <Route path="/support" element={<SupportCenterPage />} />

          {/* Reports & Compliance */}
          <Route path="/reports" element={<ReportsDataPage />} />

          {/* Architecture, REST API & ESP32 Code */}
          <Route path="/architecture" element={<ArchitectureApiPage />} />

          {/* Fallback Aliases */}
          <Route path="/admin" element={<Navigate to="/industrial" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/industrial" replace />} />
          <Route path="/admin/leakage" element={<Navigate to="/network" replace />} />
          <Route path="/admin/billing" element={<Navigate to="/accounting" replace />} />
          <Route path="/household/dashboard" element={<Navigate to="/household" replace />} />
          <Route path="/household/bills" element={<Navigate to="/accounting" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
