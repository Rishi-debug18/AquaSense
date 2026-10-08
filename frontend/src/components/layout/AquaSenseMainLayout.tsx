import React from 'react';
import { Outlet } from 'react-router-dom';
import { AquaSenseNavbar } from './AquaSenseNavbar';
import { AquaSenseSidebar } from './AquaSenseSidebar';
import { PipelineInspectorDrawer } from '../pipeline/PipelineInspectorDrawer';
import { WaterLossAlertModal } from '../pipeline/WaterLossAlertModal';
import { JudgeDemoTour } from '../demo/JudgeDemoTour';

export const AquaSenseMainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-white">
      {/* Top Operations Navigation */}
      <AquaSenseNavbar />

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Role-Aware Sidebar */}
        <AquaSenseSidebar />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6 md:p-8 min-h-[calc(100vh-76px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Slide-Over Pipeline Inspector */}
      <PipelineInspectorDrawer />

      {/* Global Water Loss Alert Modal */}
      <WaterLossAlertModal />

      {/* 1-Minute Evaluator / Judge Demo Tour Overlay */}
      <JudgeDemoTour />
    </div>
  );
};
