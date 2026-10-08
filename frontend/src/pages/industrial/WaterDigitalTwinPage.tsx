import React, { useState, useRef } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Activity, Droplets, Gauge, AlertTriangle, CheckCircle2, Sliders, 
  Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Search, Layers, 
  Settings, X, ShieldAlert, Cpu, Wrench, RefreshCw, Radio, 
  Building2, Landmark, Check, ArrowRight, Eye, Volume2, Wind,
  Filter, Play, Pause, Thermometer, Database
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaterDigitalTwinPage: React.FC = () => {
  const { 
    pipelines, 
    valves, 
    tanks, 
    departments, 
    devices, 
    alerts,
    selectedDigitalTwinNode,
    selectDigitalTwinNode,
    updateValveState,
    updatePipelineTolerance,
    simulationActive,
    toggleSimulation,
    leakAnomalyActive,
    toggleDemoLeakAnomaly
  } = useAquaSenseStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [flowAnimation, setFlowAnimation] = useState(true);
  
  // Layer visibility filters
  const [showSensors, setShowSensors] = useState(true);
  const [showValves, setShowValves] = useState(true);
  const [showTanks, setShowTanks] = useState(true);
  const [showDepartments, setShowDepartments] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  // Inspector Drawer selection
  const [inspectedType, setInspectedType] = useState<'PIPELINE' | 'SENSOR' | 'VALVE' | 'TANK' | 'DEPARTMENT' | null>('PIPELINE');
  const [inspectedId, setInspectedId] = useState<string>('pipe-prd-001');

  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        toast.error(`Fullscreen request failed: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSelectNode = (type: 'PIPELINE' | 'SENSOR' | 'VALVE' | 'TANK' | 'DEPARTMENT', id: string, data?: any) => {
    setInspectedType(type);
    setInspectedId(id);
    selectDigitalTwinNode({ type, id, data });
  };

  const activePipeline = pipelines.find(p => p.id === inspectedId) || pipelines[0];
  const activeSensor = devices.find(d => d.id === inspectedId || d.deviceCode === inspectedId) || devices[1];
  const activeValve = valves.find(v => v.id === inspectedId) || valves[0];
  const activeTank = tanks.find(t => t.id === inspectedId) || tanks[0];
  const activeDept = departments.find(d => d.id === inspectedId) || departments[0];

  return (
    <div 
      ref={containerRef}
      className={`space-y-6 animate-in fade-in duration-300 ${
        isFullscreen ? 'p-6 bg-slate-950 text-white min-h-screen overflow-y-auto' : ''
      }`}
    >
      {/* Top SCADA Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-sky-500/20">
            <Droplets className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                AquaSense Water Digital Twin
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-950 text-sky-400 border border-sky-800 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE SCADA MODEL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Viraj Profiles Boisar Steel Facility • Hydraulic Network &amp; Mass-Balance Twin • Connection AQ-CONN-001
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={toggleSimulation}
            className={`px-3 py-2 rounded-xl font-bold border transition flex items-center gap-1.5 ${
              simulationActive 
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title="Toggle Live Telemetry Stream"
          >
            {simulationActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{simulationActive ? 'Stream Live' : 'Paused'}</span>
          </button>

          <button
            onClick={() => setFlowAnimation(!flowAnimation)}
            className={`px-3 py-2 rounded-xl font-bold border transition flex items-center gap-1.5 ${
              flowAnimation 
                ? 'bg-sky-600 text-white border-sky-500 shadow-sm' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Pipeline Flow Velocity Particles"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Particles {flowAnimation ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={toggleDemoLeakAnomaly}
            className={`px-3 py-2 rounded-xl font-bold border transition flex items-center gap-1.5 ${
              leakAnomalyActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Inject simulated pipe rack differential discrepancy"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{leakAnomalyActive ? 'Loss Anomaly Active' : 'Normal Flow'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter and Layer Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pipeline, sensor, valve, tank, or area..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-medium text-slate-600">
          <span className="text-[11px] text-slate-400 font-bold uppercase mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Layers:
          </span>

          <button
            onClick={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showSensors ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            Sensors
          </button>

          <button
            onClick={() => setShowValves(!showValves)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showValves ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            Valves
          </button>

          <button
            onClick={() => setShowTanks(!showTanks)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showTanks ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            Tanks
          </button>

          <button
            onClick={() => setShowDepartments(!showDepartments)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showDepartments ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            Departments
          </button>

          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showAlerts ? 'bg-amber-50 text-amber-900 border-amber-200 font-bold' : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            Loss Flags
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.65, prev - 0.1))}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition font-mono text-[10px] font-bold"
            title="Reset Zoom"
          >
            100%
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Canvas + Inspector Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: INTERACTIVE DIGITAL TWIN CANVAS (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative min-h-[680px]">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="flex items-center justify-between relative z-20 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                SCADA TOPOLOGY • HYDRAULIC MASS BALANCE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                142.3 kL/d Header Intake @ 4.8 Bar
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Normal Flow
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" /> Possible Loss (Δ &gt; 0.50 L/m)
              </span>
            </div>
          </div>

          <div 
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            className="transition-transform duration-200 relative z-10 w-full space-y-6 pt-2"
          >
            {/* TIER 1: WATER SOURCE & INTAKE */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => handleSelectNode('TANK', 'tnk-raw-01', tanks[0])}
                className="cursor-pointer group relative bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border-2 border-sky-500/50 hover:border-sky-400 rounded-2xl p-4 text-center shadow-xl transition max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> BULK WATER SOURCE
                  </span>
                  <span className="font-mono bg-sky-900/60 px-1.5 py-0.5 rounded text-white">MIDC Boisar</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                  MIDC Industrial Water Feeder &amp; Raw Buffer Reservoir
                </h3>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-300 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Supply Rate</span>
                    <strong className="text-sky-300">98.8 L/min</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Line Pressure</span>
                    <strong className="text-emerald-400">4.8 Bar</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Buffer Tank</span>
                    <strong className="text-slate-200">205 kL (82%)</strong>
                  </div>
                </div>
              </div>

              <div className="w-1.5 h-7 bg-slate-700 relative overflow-hidden my-1">
                {flowAnimation && <div className="absolute inset-0 w-full bg-sky-400 animate-pulse" />}
              </div>

              {/* Main Meter & Gate Valve */}
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
                <div 
                  onClick={() => handleSelectNode('SENSOR', 'dev-hdr-01', devices.find(d => d.deviceCode === 'ESP32-HDR-01'))}
                  className="cursor-pointer hover:border-sky-400 border border-slate-700 bg-slate-950 p-2.5 rounded-xl flex items-center gap-3 transition"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">MAIN ELECTROMAGNETIC METER</div>
                    <div className="text-xs font-black text-white font-mono">ESP32-HDR-01 • DN100</div>
                    <div className="text-[10px] text-sky-300 font-mono">142,300 L/d Total Intake</div>
                  </div>
                </div>

                {showValves && (
                  <div 
                    onClick={() => handleSelectNode('VALVE', 'vlv-hdr-01', valves[0])}
                    className="cursor-pointer hover:border-sky-400 border border-slate-700 bg-slate-950 p-2.5 rounded-xl flex items-center gap-2 transition"
                  >
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">GATE VALVE</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">VLV-HDR-01: OPEN (100%)</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-1.5 h-6 bg-slate-700 relative overflow-hidden my-1">
                {flowAnimation && <div className="absolute inset-0 w-full bg-sky-400 animate-pulse" />}
              </div>

              <div className="w-full bg-slate-800 border-2 border-sky-500/50 rounded-xl py-2 px-4 text-center text-xs font-bold text-sky-200 tracking-wider shadow-md uppercase">
                Main Plant Distribution Header Manifold
              </div>
            </div>

            {/* TIER 2: 5 PARALLEL PROCESS PIPELINE BRANCHES */}
            <div className="relative">
              <svg className="w-full h-10 overflow-visible" preserveAspectRatio="none">
                <line x1="10%" y1="0" x2="90%" y2="0" stroke="#334155" strokeWidth="4" />
                <line x1="10%" y1="0" x2="10%" y2="40" stroke="#334155" strokeWidth="3" />
                <line x1="30%" y1="0" x2="30%" y2="40" stroke="#334155" strokeWidth="3" />
                <line x1="50%" y1="0" x2="50%" y2="40" stroke="#334155" strokeWidth="3" />
                <line x1="70%" y1="0" x2="70%" y2="40" stroke="#334155" strokeWidth="3" />
                <line x1="90%" y1="0" x2="90%" y2="40" stroke="#334155" strokeWidth="3" />
              </svg>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                {pipelines.map((pipe, index) => {
                  const isSelected = inspectedId === pipe.id;
                  const isLoss = pipe.differenceLpm > pipe.configuredToleranceLpm;
                  const valve = valves.find(v => v.pipelineId === pipe.id);
                  const dept = departments[index];

                  return (
                    <div
                      key={pipe.id}
                      onClick={() => handleSelectNode('PIPELINE', pipe.id, pipe)}
                      className={`cursor-pointer rounded-2xl p-3 border transition-all duration-200 relative flex flex-col justify-between ${
                        isSelected 
                          ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-2xl' 
                          : isLoss
                          ? 'border-amber-500/80 bg-slate-900/90 shadow-lg shadow-amber-950/40'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-sky-400 uppercase">{pipe.code}</span>
                          {isLoss ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" /> LOSS
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> OK
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{pipe.name}</h4>
                        <div className="text-[10px] text-slate-400">{pipe.area}</div>
                      </div>

                      {showSensors && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNode('SENSOR', pipe.inletSensorId);
                          }}
                          className="mt-2 bg-slate-950 p-2 rounded-xl border border-slate-800 hover:border-sky-400 transition"
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 font-bold">SENSOR IN</span>
                            <span className="text-emerald-400 font-mono">{pipe.inletSensorId}</span>
                          </div>
                          <div className="text-sm font-black font-mono text-sky-300 mt-0.5">
                            {pipe.inletFlowLpm.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">L/m</span>
                          </div>
                        </div>
                      )}

                      <div className="my-2 py-1 text-center">
                        {isLoss ? (
                          <div className="bg-amber-950/60 border border-amber-500/70 rounded-lg p-1.5 animate-pulse text-amber-200 text-[10px] font-mono font-bold">
                            <div>Δ {pipe.differenceLpm.toFixed(2)} L/min</div>
                            <div className="text-[8px] text-amber-300 uppercase mt-0.5">Possible Loss Detected</div>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-slate-500">
                            Δ {pipe.differenceLpm.toFixed(2)} L/m (Normal)
                          </div>
                        )}
                      </div>

                      {showSensors && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNode('SENSOR', pipe.outletSensorId);
                          }}
                          className="bg-slate-950 p-2 rounded-xl border border-slate-800 hover:border-sky-400 transition"
                        >
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-400 font-bold">SENSOR OUT</span>
                            <span className="text-emerald-400 font-mono">{pipe.outletSensorId}</span>
                          </div>
                          <div className="text-sm font-black font-mono text-sky-300 mt-0.5">
                            {pipe.outletFlowLpm.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">L/m</span>
                          </div>
                        </div>
                      )}

                      {showValves && valve && (
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNode('VALVE', valve.id, valve);
                          }}
                          className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]"
                        >
                          <span className="text-slate-400 font-mono">{valve.valveCode}</span>
                          <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                            valve.state === 'OPEN' ? 'text-emerald-400 bg-emerald-950' : 'text-amber-400 bg-amber-950'
                          }`}>
                            {valve.state} ({valve.positionPercent}%)
                          </span>
                        </div>
                      )}

                      {showDepartments && dept && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNode('DEPARTMENT', dept.id, dept);
                          }}
                          className="mt-2 w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition truncate text-left flex items-center justify-between"
                        >
                          <span>{dept.name}</span>
                          <ArrowRight className="w-3 h-3 text-sky-400 shrink-0" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TIER 3: ZLD RECOVERY & TANKS */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  ZLD
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Zero Liquid Discharge (ZLD) Recycling Loop</h4>
                  <p className="text-[10px] text-slate-400">92% Permeate Recovery Index • 71.2 kL Recycled Today</p>
                </div>
              </div>

              {showTanks && (
                <div className="flex items-center gap-2">
                  {tanks.map(tank => (
                    <div
                      key={tank.id}
                      onClick={() => handleSelectNode('TANK', tank.id, tank)}
                      className="cursor-pointer hover:border-sky-400 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-[10px] transition"
                    >
                      <div className="text-slate-400 font-bold">{tank.tankCode}</div>
                      <div className="text-sky-300 font-mono font-bold">{tank.currentLevelPercent}% ({tank.currentVolumeKiloLitres} kL)</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: DETAILED INSPECTOR SIDE DRAWER (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                INSPECTOR: {inspectedType}
              </div>
              <h3 className="font-black text-slate-900 text-sm mt-1">
                {inspectedType === 'PIPELINE' && activePipeline.name}
                {inspectedType === 'SENSOR' && `Sensor Node ${inspectedId}`}
                {inspectedType === 'VALVE' && activeValve.name}
                {inspectedType === 'TANK' && activeTank.name}
                {inspectedType === 'DEPARTMENT' && activeDept.name}
              </h3>
            </div>

            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              ● Active Telemetry
            </span>
          </div>

          {inspectedType === 'PIPELINE' && (
            <div className="space-y-4">
              {activePipeline.differenceLpm > activePipeline.configuredToleranceLpm ? (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    POSSIBLE WATER LOSS DETECTED
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    Flow differential (<strong>{activePipeline.differenceLpm.toFixed(2)} L/min</strong>) exceeds configured tolerance threshold (<strong>{activePipeline.configuredToleranceLpm.toFixed(2)} L/min</strong>).
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Location: <strong>{activePipeline.exactLocation}</strong>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-xs">Hydraulic Flow Balanced</strong>
                    <span className="text-[10px] text-slate-600">Within engineering tolerance limits.</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Inlet Sensor</span>
                  <div className="text-lg font-black font-mono text-sky-700 mt-1">
                    {activePipeline.inletFlowLpm.toFixed(2)} <span className="text-xs font-normal">L/m</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{activePipeline.inletSensorId}</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Outlet Sensor</span>
                  <div className="text-lg font-black font-mono text-sky-700 mt-1">
                    {activePipeline.outletFlowLpm.toFixed(2)} <span className="text-xs font-normal">L/m</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{activePipeline.outletSensorId}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Configured Tolerance:</span>
                  <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    ±{activePipeline.configuredToleranceLpm.toFixed(2)} L/min
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="2.00"
                  step="0.05"
                  value={activePipeline.configuredToleranceLpm}
                  onChange={(e) => updatePipelineTolerance(activePipeline.id, parseFloat(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-2.5 flex justify-between bg-slate-50 font-semibold text-slate-700">
                  <span>Today's Consumed:</span>
                  <span className="font-mono text-slate-900">{activePipeline.todayLitre.toLocaleString()} L</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Month-to-Date:</span>
                  <span className="font-mono font-bold text-slate-800">{activePipeline.monthlyLitre.toLocaleString()} L</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="text-slate-500">Daily Baseline Quota:</span>
                  <span className="font-mono text-slate-600">{activePipeline.baselineLitrePerDay.toLocaleString()} L/d</span>
                </div>
              </div>
            </div>
          )}

          {inspectedType === 'SENSOR' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Device Hardware Model:</span>
                  <span className="font-mono font-bold text-sky-700">YF-DN50 Turbine</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Microcontroller:</span>
                  <span className="font-mono">ESP32-WROOM-32D</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Sampling Frequency:</span>
                  <span className="font-mono text-emerald-700 font-bold">1000 Hz Interrupt</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>WiFi Signal (RSSI):</span>
                  <span className="font-mono text-slate-800">-58 dBm (Strong)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Power Supply:</span>
                  <span className="font-mono text-slate-800">24V DC Mains (Battery: 4.1V)</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-900 space-y-1">
                <strong>Calibration Equation:</strong>
                <div className="font-mono text-xs">Q (L/min) = (Pulse_Freq × 60) / 4.5</div>
              </div>
            </div>
          )}

          {inspectedType === 'VALVE' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Actuator Type:</span>
                  <span className="font-mono font-bold text-sky-700">{activeValve.actuatorType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Position:</span>
                  <strong className="font-mono text-sm text-slate-900">{activeValve.positionPercent}%</strong>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-[11px] font-bold text-slate-600">Remote Position Control:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={activeValve.positionPercent}
                    onChange={(e) => {
                      const pos = parseInt(e.target.value);
                      updateValveState(activeValve.id, pos === 0 ? 'CLOSED' : pos === 100 ? 'OPEN' : 'THROTTLED', pos);
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => {
                      updateValveState(activeValve.id, 'OPEN', 100);
                      toast.success(`Valve ${activeValve.valveCode} set to 100% OPEN`);
                    }}
                    className="py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold hover:bg-emerald-100"
                  >
                    OPEN
                  </button>
                  <button
                    onClick={() => {
                      updateValveState(activeValve.id, 'THROTTLED', 50);
                      toast.success(`Valve ${activeValve.valveCode} THROTTLED to 50%`);
                    }}
                    className="py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-bold hover:bg-amber-100"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => {
                      updateValveState(activeValve.id, 'CLOSED', 0);
                      toast.error(`Valve ${activeValve.valveCode} CLOSED`);
                    }}
                    className="py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg font-bold hover:bg-red-100"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </div>
          )}

          {inspectedType === 'TANK' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Storage Capacity:</span>
                  <span className="font-mono font-black text-sky-700">{activeTank.capacityKiloLitres} kL</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Current Volume:</span>
                  <strong className="font-mono text-slate-900">{activeTank.currentVolumeKiloLitres} kL ({activeTank.currentLevelPercent}%)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Water Temperature:</span>
                  <strong className="font-mono text-amber-700">{activeTank.temperatureCelsius} °C</strong>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-400"
                    style={{ width: `${activeTank.currentLevelPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {inspectedType === 'DEPARTMENT' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Lead Manager:</span>
                  <strong className="text-slate-800">{activeDept.leadManager}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Specific Water Index:</span>
                  <strong className="font-mono text-sky-700">{activeDept.specificConsumption}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Monthly Consumption:</span>
                  <strong className="font-mono text-slate-900">{activeDept.monthlyLitre.toLocaleString()} L</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Water Cost:</span>
                  <strong className="font-mono text-emerald-700 font-bold">₹{activeDept.waterCostInr.toLocaleString()}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Quota Utilization:</span>
                  <strong className="font-mono text-slate-800">{activeDept.budgetUtilizationPercent}%</strong>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
