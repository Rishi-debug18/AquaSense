import React, { useState, useEffect } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Building2, Activity, Play, Pause, RefreshCw, 
  ShieldAlert, CheckCircle2, AlertTriangle, Radio, 
  Cpu, Droplets, Zap, Clock, ArrowUpRight, Gauge
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

export const LiveMonitoringPage: React.FC = () => {
  const { 
    pipelines, 
    simulationActive, 
    toggleSimulation, 
    simulationSpeed, 
    setSimulationSpeed,
    leakAnomalyActive,
    toggleDemoLeakAnomaly
  } = useAquaSenseStore();

  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [liveClock, setLiveClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update live chart history
  useEffect(() => {
    const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];
    const totalInflow = pipelines.reduce((acc, p) => acc + p.inletFlowLpm, 0);
    const totalOutflow = pipelines.reduce((acc, p) => acc + p.outletFlowLpm, 0);

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    setTelemetryHistory(prev => {
      const updated = [...prev, {
        time: timeStr,
        inflow: parseFloat(totalInflow.toFixed(2)),
        outflow: parseFloat(totalOutflow.toFixed(2)),
        prdInlet: parseFloat(prdPipe.inletFlowLpm.toFixed(2)),
        prdOutlet: parseFloat(prdPipe.outletFlowLpm.toFixed(2)),
      }];
      if (updated.length > 20) updated.shift();
      return updated;
    });
  }, [pipelines]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar Plant
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              1 Hz LIVE SCADA STREAM
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Live Flow Monitoring &amp; Telemetry Stream
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time differential waveform and valve actuation status across the Boisar steel plant.
          </p>
        </div>

        {/* Telemetry Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
            <button
              onClick={toggleSimulation}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
              title={simulationActive ? 'Pause Telemetry' : 'Resume Telemetry'}
            >
              {simulationActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="font-semibold text-slate-700">
              {simulationActive ? 'Stream: Active' : 'Stream: Paused'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[11px]">Speed:</span>
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  simulationSpeed === spd ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={toggleDemoLeakAnomaly}
            className={`ml-2 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
              leakAnomalyActive
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            {leakAnomalyActive ? 'Leak Simulated' : 'Simulate Leak'}
          </button>
        </div>
      </div>

      {/* 2. Top Metric Dials */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {pipelines.map((pipe) => {
          const isLoss = pipe.status === 'possible_loss';
          return (
            <div 
              key={pipe.id}
              className={`bg-white border rounded-2xl p-4 shadow-sm space-y-2 transition ${
                isLoss ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-slate-500">{pipe.code}</span>
                <span className={`w-2 h-2 rounded-full ${isLoss ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 truncate">{pipe.name}</h3>
                <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                  {pipe.inletFlowLpm.toFixed(2)} <span className="text-xs font-normal text-slate-500">L/m</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] flex justify-between text-slate-500 font-mono">
                <span>Δ {pipe.differenceLpm.toFixed(2)} L/m</span>
                <span className={isLoss ? 'text-amber-700 font-bold' : 'text-emerald-600'}>
                  {isLoss ? 'Anomaly' : 'Balanced'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Real-Time Telemetry Waveform Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Dual-Sensor Flow Waveform (L/min)</h2>
            <p className="text-xs text-slate-500">Continuous 1-second pulse telemetry showing Total Header Intake vs Production Line A</p>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-semibold">
            {liveClock ? `${liveClock} IST` : '18:32:10 IST'}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetryHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="prdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
              <Area type="monotone" dataKey="inflow" name="Total Facility Intake (L/m)" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#inflowGrad)" />
              <Area type="monotone" dataKey="prdInlet" name="Production Line A Inlet (L/m)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#prdGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Actuation Gate Valves & Hardware Loop Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Isolation Gate Valve &amp; Solenoid Loop Actuation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {pipelines.map((pipe, idx) => (
            <div key={pipe.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-slate-400 font-bold">VALVE-0{idx + 1}</span>
                <div className="text-xs font-bold text-slate-800">{pipe.code}</div>
                <div className="text-[10px] text-slate-500">Manual / Solenoid</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                OPEN 100%
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
