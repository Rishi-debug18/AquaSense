import React, { useState, useEffect } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { UserRole } from '../../types/aquasense';
import { 
  Droplets, Activity, Play, Pause, FastForward, ShieldAlert, 
  Bell, ChevronDown, User, Sparkles, Building2, Landmark, Home, 
  Wrench, CheckCircle, RefreshCw, Layers, Settings, Receipt, Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AquaSenseNavbar: React.FC = () => {
  const { 
    currentRole, 
    setRole, 
    simulationActive, 
    toggleSimulation, 
    simulationSpeed, 
    setSimulationSpeed,
    tickTelemetry,
    leakAnomalyActive,
    toggleDemoLeakAnomaly,
    startTour,
    alerts,
    notifications
  } = useAquaSenseStore();

  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Real-time telemetry ticker interval
  useEffect(() => {
    const intervalMs = Math.max(1000, 3000 / simulationSpeed);
    const timer = setInterval(() => {
      if (simulationActive) {
        tickTelemetry();
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [simulationActive, simulationSpeed, tickTelemetry]);

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    setRoleDropdownOpen(false);
    
    if (role === 'COMPANY_ADMIN') {
      navigate('/industrial');
      toast.success('Switched to Industrial Admin (Viraj Profiles, Boisar)');
    } else if (role === 'GOVERNMENT_ADMIN') {
      navigate('/government');
      toast.success('Switched to Municipal Admin (Vangaon Water Authority)');
    } else if (role === 'HOUSEHOLD_USER') {
      navigate('/household');
      toast.success('Switched to Resident View (Rajesh Sharma, H-102)');
    } else if (role === 'MAINTENANCE_USER') {
      navigate('/alerts');
      toast.success('Switched to Maintenance & Inspection Field Mode');
    } else {
      navigate('/architecture');
      toast.success('Switched to Super Admin / System Architecture');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'COMPANY_ADMIN':
        return { label: 'Industrial Company Admin', sub: 'Viraj Profiles • Boisar', icon: Building2 };
      case 'GOVERNMENT_ADMIN':
        return { label: 'Municipal / Govt Admin', sub: 'Vangaon Water Authority', icon: Landmark };
      case 'HOUSEHOLD_USER':
        return { label: 'Household Resident', sub: 'H-102 (Rajesh Sharma)', icon: Home };
      case 'MAINTENANCE_USER':
        return { label: 'Maintenance Engineer', sub: 'Field Inspection Ops', icon: Wrench };
      case 'SUPER_ADMIN':
        return { label: 'Super Admin / Architect', sub: 'System & Hardware Level', icon: Layers };
    }
  };

  const activeRoleInfo = getRoleLabel(currentRole);
  const ActiveRoleIcon = activeRoleInfo.icon;

  const openAlertsCount = alerts.filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-sm">
      
      {/* Top Demo Disclaimer Banner */}
      <div className="bg-sky-50 border-b border-sky-100 px-4 py-1 flex items-center justify-between text-[11px] text-sky-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span><strong>DEMO DATA ENVIRONMENT</strong> — Simulated IoT flow telemetry for industrial &amp; municipal evaluation.</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[10px]">
          <span>Current Region: <strong>Boisar / Vangaon, Maharashtra</strong></span>
          <span>Sampling: <strong>1 Hz Real-Time Stream</strong></span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Droplets className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 font-sans">AquaSense</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Operations v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Smart Water Management &amp; Monitoring Platform
            </p>
          </div>
        </div>

        {/* Center: Real-time Telemetry Simulator Controls */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
            <span className={`w-2 h-2 rounded-full ${simulationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="text-[11px] font-medium text-slate-700">
              {simulationActive ? 'Telemetry Stream: Active' : 'Simulator Paused'}
            </span>
            <button
              onClick={toggleSimulation}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
              title={simulationActive ? 'Pause Telemetry' : 'Resume Telemetry'}
            >
              {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-500">Speed:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  simulationSpeed === spd ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={toggleDemoLeakAnomaly}
            className={`ml-2 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 border ${
              leakAnomalyActive
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle simulated water loss condition on Production Line A"
          >
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            {leakAnomalyActive ? 'Leak Simulated (Active)' : 'Simulate Leak'}
          </button>
        </div>

        {/* Right: Actions, Tour Trigger & Role Switcher */}
        <div className="flex items-center gap-2.5">
          
          {/* Hardware Prototype Twin Button */}
          <button
            onClick={() => navigate('/prototype-simulator')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/40 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            title="Launch Interactive Physical Bench Hardware Twin"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Hardware Twin</span>
            <span className="xl:hidden">Twin</span>
          </button>

          {/* 1-Minute Judge Tour Button */}
          <button
            onClick={startTour}
            className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">1-Minute Judge Tour</span>
            <span className="md:hidden">Tour</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={() => navigate('/alerts')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 relative border border-slate-200 transition"
            title="Alert Center"
          >
            <Bell className="w-4 h-4" />
            {openAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {openAlertsCount}
              </span>
            )}
          </button>

          {/* Company Admin Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-bold text-slate-800 leading-tight">Company Admin</div>
                <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
                  Viraj Profiles • Boisar
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-xs">Viraj Profiles Pvt. Ltd.</div>
                  <div className="text-[10px] text-slate-500">Boisar Industrial Plant, Maharashtra</div>
                  <div className="text-[10px] text-sky-700 font-mono font-semibold mt-1">
                    Connection: AQ-CONN-001 • MIDC
                  </div>
                </div>

                <div className="p-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      navigate('/industrial');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-slate-50 font-medium transition"
                  >
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Company Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-slate-50 font-medium transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Facility Settings &amp; Thresholds</span>
                  </button>

                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      navigate('/billing');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-slate-50 font-medium transition"
                  >
                    <Receipt className="w-3.5 h-3.5 text-slate-500" />
                    <span>Service Provider Invoices</span>
                  </button>
                </div>

                <div className="pt-2 mt-1 border-t border-slate-100 px-1">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      navigate('/login');
                      toast.success('Signed out from Company Admin session.');
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left text-red-600 hover:bg-red-50 font-bold text-[11px] transition"
                  >
                    <span>Sign Out</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
