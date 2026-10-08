import React, { useState } from 'react';
import { 
  Cpu, ExternalLink, Maximize2, Sparkles, ShieldAlert, CheckCircle2, 
  HelpCircle, Image as ImageIcon, Code, RefreshCw, Activity, Layers, 
  Terminal, Zap, Info, ArrowUpRight
} from 'lucide-react';

export const HardwareSimulatorPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const openStandaloneWindow = () => {
    window.open('/simulator.html', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                Physical Hardware Digital Twin
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Simulation Mode — Demonstration Data
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold tracking-wider uppercase">
                Dual YF-S201 + ESP32 Edge Core
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Interactive Bench Prototype Demonstrator
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Direct digital twin of the physical AquaSense bench prototype. Recreates water flow dynamics, 
              Hall-effect turbine pulse train generation, ESP32 edge processing on GPIO 18/19, differential loss detection 
              (<code className="bg-slate-800 px-1.5 py-0.5 rounded text-sky-300 font-mono text-xs">Inlet - Outlet = Flask Volume</code>), 
              and authentic 16×2 character LCD output.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={() => setPhotoModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              title="Compare Digital Twin directly with prototype photograph"
            >
              <ImageIcon className="w-4 h-4 text-sky-400" />
              <span>Prototype Photo</span>
            </button>

            <button
              onClick={openStandaloneWindow}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-500/25"
              title="Launch standalone fullscreen simulator in a clean new tab"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open Standalone / Fullscreen</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Flow Sensor 1 (Inlet)</div>
            <div className="font-bold text-sky-400 text-sm mt-0.5">YF-S201 • GPIO 18</div>
            <div className="text-[10px] text-slate-400">Interrupt: <span className="font-mono text-slate-300">RISING</span> (450 p/L)</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Pipeline Section</div>
            <div className="font-bold text-teal-400 text-sm mt-0.5">Transparent Acrylic</div>
            <div className="text-[10px] text-slate-400">Break valve: Controlled Loss</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Flow Sensor 2 (Outlet)</div>
            <div className="font-bold text-cyan-400 text-sm mt-0.5">YF-S201 • GPIO 19</div>
            <div className="text-[10px] text-slate-400">Interrupt: <span className="font-mono text-slate-300">RISING</span> (450 p/L)</div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Collection Flask</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">Graduated Container</div>
            <div className="text-[10px] text-slate-400">Balance Error: <span className="font-mono text-emerald-400 font-bold">0.00 L</span></div>
          </div>
        </div>
      </div>

      {/* Embedded Digital Twin Application Frame */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 ml-2">aquasense-digital-twin-engine v2.4 (HTML5 Canvas + WebAudio + Edge Emulation)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Use the embedded controls or click below for guided walkthrough</span>
            <button
              onClick={openStandaloneWindow}
              className="text-sky-400 hover:text-sky-300 font-semibold text-xs flex items-center gap-1"
            >
              Pop out window <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* The Digital Twin Canvas & Interactive App Frame */}
        <iframe
          src="/simulator.html"
          title="AquaSense Physical Hardware Digital Twin Simulator"
          className="w-full h-[920px] border-0 bg-[#070d18]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        />
      </div>

      {/* Engineering Walkthrough & Evaluation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Scenario A: Normal Flow Balance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In Normal Flow mode, all water entering through Sensor 1 passes intact to Sensor 2. 
            The flow rates (<code className="font-mono text-sky-800">15.00 L/min</code>) match within sensor tolerance. 
            Flow difference is <code className="font-mono text-emerald-700 font-bold">0.00 L/min</code> and system status remains 
            <span className="font-bold text-emerald-700"> "NORMAL FLOW"</span> on both LCD and SCADA telemetry.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Scenario B: Controlled Water Loss</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Activating the break releases fluid into the graduated flask. 
            Sensor 2 immediately registers a flow rate drop. When the difference exceeds tolerance 
            (<code className="font-mono text-slate-800">0.50 L</code>), AquaSense activates the audible alert and marks status as 
            <span className="font-bold text-amber-700"> "POSSIBLE WATER LOSS — REQUIRES VERIFICATION"</span> (never "Confirmed Leak").
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
            <Zap className="w-4 h-4 text-purple-600" />
            <span>Mathematical Conservation Proof</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Notice the live conservation equation:
            <br />
            <span className="font-mono font-bold text-slate-800 block my-1">
              Inlet (10.00 L) − Outlet (8.00 L) = 2.00 L Difference
            </span>
            The volume collected in the transparent flask strictly equals the calculated loss: 
            <span className="font-mono font-bold text-emerald-600"> Balance Error = 0.00 L</span>.
          </p>
        </div>
      </div>

      {/* Hardware Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Physical Bench Prototype Reference</h3>
                <p className="text-xs text-slate-400">Actual AquaSense hardware rig assembled for lab evaluation</p>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[550px] flex items-center justify-center">
              <img
                src="/aquasense_prototype.jpg"
                alt="Physical AquaSense Prototype"
                className="w-full h-auto object-contain max-h-[550px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">1. Microcontroller</span>
                <span className="font-semibold text-sky-400">ESP32 DevKit WROOM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">2. In/Out Sensors</span>
                <span className="font-semibold text-teal-400">Dual YF-S201 Turbines</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">3. Display & Relay</span>
                <span className="font-semibold text-amber-400">16×2 LCD + 5V Relay</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">4. Pipeline Chamber</span>
                <span className="font-semibold text-purple-400">Acrylic Test Line</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
