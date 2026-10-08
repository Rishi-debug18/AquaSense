import React from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Droplets, Building2, Network, ArrowRight, 
  ShieldCheck, Activity, Sparkles, CheckCircle2, Server, 
  Sliders, Receipt, Gauge, Cpu, AlertTriangle, Layers, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AquaSenseLandingPage: React.FC = () => {
  const { setRole, startTour } = useAquaSenseStore();
  const navigate = useNavigate();

  const handleEnterCompany = () => {
    setRole('COMPANY_ADMIN');
    navigate('/industrial');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Demo Tag */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span><strong>DEMO PROTOTYPE ENVIRONMENT</strong> — Smart Industrial Water Management &amp; Billing SCADA</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
          <span>Demo Facility: <strong>Viraj Profiles — Boisar, Maharashtra</strong></span>
        </div>
      </div>

      {/* Top Portal Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/industrial')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-sky-500/30">
            <Droplets className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">AquaSense</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                INDUSTRIAL B2B
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Smart Industrial Water Management &amp; Billing Platform</p>
          </div>
        </div>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          <button
            onClick={() => {
              setRole('COMPANY_ADMIN');
              navigate('/industrial');
              startTour();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">1-Minute Tour</span>
            <span className="md:hidden">Tour</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold transition"
          >
            Sign In
          </button>

          <button
            onClick={handleEnterCompany}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow-md shadow-sky-600/20 flex items-center gap-1.5"
          >
            <span>Live SCADA</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-xs font-bold tracking-wide">
            <Building2 className="w-4 h-4" />
            Enterprise IoT Flow Telemetry &amp; Differential Loss SCADA
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            AquaSense
          </h1>
          <p className="text-lg sm:text-xl text-sky-200/90 font-medium max-w-2xl mx-auto">
            Smart Industrial Water Management &amp; Billing Platform
          </p>
          <p className="text-sm text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Connecting physical industrial water infrastructure with digital real-time SCADA monitoring, dual-sensor mass-balance differential loss detection, departmental cost accounting, and transparent utility billing.
          </p>

          {/* Quick CTA */}
          <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={() => {
                setRole('COMPANY_ADMIN');
                navigate('/industrial');
                startTour();
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 transition transform hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-slate-950/30" />
              Launch 1-Minute Judge Demo Tour
            </button>

            <button
              onClick={handleEnterCompany}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-sm border border-slate-700 flex items-center gap-2 transition shadow-sm"
            >
              Explore Company Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Core Business Model & Data Journey Strip */}
      <section className="py-12 px-6 max-w-6xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">End-to-End Industrial Water Architecture</h2>
          <p className="text-xs text-slate-400">From bulk municipal intake to manufacturing departmental cost accounting</p>
        </div>

        {/* 6-Stage Process Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: '1. BULK INTAKE', label: 'MIDC Boisar 4.8 Bar', desc: 'Main connection intake' },
            { step: '2. MAIN METER', label: 'Feeder MTR-01', desc: 'Facility intake volume' },
            { step: '3. DISTRIBUTION', label: '5 Branch Lines', desc: 'Production, Cooling, Utilities' },
            { step: '4. DUAL SENSORS', label: 'S1 & S2 Turbine Nodes', desc: 'Hall-effect pulse flow' },
            { step: '5. ESP32 TELEMETRY', label: '1 Hz JSON Stream', desc: 'Edge calibration math' },
            { step: '6. AQUASENSE SCADA', label: 'Loss & Cost Accounting', desc: 'Actionable intelligence' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-1 text-left">
              <span className="text-[10px] font-mono font-bold text-sky-400">{item.step}</span>
              <div className="text-xs font-bold text-white">{item.label}</div>
              <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 4 Key Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
          
          {/* Card 1: Interactive GIS Map */}
          <div 
            onClick={() => navigate('/network')}
            className="bg-slate-900 border border-slate-800 hover:border-sky-500 rounded-3xl p-5 shadow-xl cursor-pointer transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Interactive Network SCADA Map</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Geographic Leaflet overlay showing all 5 pipeline branches, meters, isolation valves, and animated directional flow pulses.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-sky-400 font-bold flex items-center justify-between mt-4">
              <span>View Map Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Two-Sensor Mass Balance */}
          <div 
            onClick={() => navigate('/loss-detection')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-3xl p-5 shadow-xl cursor-pointer transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Two-Sensor Loss Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time differential mass-balance analysis (Q_in - Q_out = &Delta; &gt; &tau;) with configurable tolerance testing and closed-loop work orders.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-amber-400 font-bold flex items-center justify-between mt-4">
              <span>Inspect Anomaly AQ-0926</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Department Accounting */}
          <div 
            onClick={() => navigate('/departments')}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded-3xl p-5 shadow-xl cursor-pointer transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Department Cost Accounting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sub-metering across Production (42%), Cooling (27%), Processing (18%), and Utilities (9%) with internal cost allocations.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-cyan-400 font-bold flex items-center justify-between mt-4">
              <span>Department Shares</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Transparent Billing */}
          <div 
            onClick={() => navigate('/billing')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-3xl p-5 shadow-xl cursor-pointer transition group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Utility Billing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Step-by-step invoice verification ($9,684 - 8,450 = 1,234 L \rightarrow ₹68.72$) against progressive volumetric commercial slabs.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800 text-xs text-emerald-400 font-bold flex items-center justify-between mt-4">
              <span>View Latest Invoice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

        </div>

        {/* Continuous Efficiency Cycle Ribbon */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            The AquaSense Continuous Industrial Efficiency Cycle
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono font-bold text-xs text-slate-300">
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg">MEASURE</span>
            <span className="text-sky-500">→</span>
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg">MONITOR</span>
            <span className="text-sky-500">→</span>
            <span className="bg-slate-800 px-3 py-1.5 rounded-lg">ANALYZE</span>
            <span className="text-sky-500">→</span>
            <span className="bg-amber-900/80 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-600/60">DETECT</span>
            <span className="text-sky-500">→</span>
            <span className="bg-amber-900/80 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-600/60">ALERT</span>
            <span className="text-sky-500">→</span>
            <span className="bg-emerald-900/80 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-600/60">ACT</span>
            <span className="text-sky-500">→</span>
            <span className="bg-emerald-900/80 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-600/60">IMPROVE</span>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        AquaSense Smart Industrial Water Management Platform • Viraj Profiles Boisar Facility SCADA
      </footer>

    </div>
  );
};
