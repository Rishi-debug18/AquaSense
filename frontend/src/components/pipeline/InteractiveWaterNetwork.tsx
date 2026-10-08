import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  AlertTriangle, CheckCircle2, Droplets, Info, ZoomIn, ZoomOut, 
  RotateCcw, Sliders, Activity, ShieldAlert, ArrowRight, Gauge,
  Layers, Map, Network, Eye, Volume2, Wind
} from 'lucide-react';

interface InteractiveWaterNetworkProps {
  onOpenAlertModal?: (alertId: string) => void;
  compact?: boolean;
}

export const InteractiveWaterNetwork: React.FC<InteractiveWaterNetworkProps> = ({ 
  onOpenAlertModal,
  compact = false 
}) => {
  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    openAlertModal,
    simulationActive,
    leakAnomalyActive,
    updatePipelineTolerance
  } = useAquaSenseStore();

  const [viewMode, setViewMode] = useState<'SCHEMATIC' | 'GIS'>('GIS');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [globalTolerance, setGlobalTolerance] = useState<number>(0.50);

  const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];
  const colPipe = pipelines.find(p => p.id === 'pipe-col-001') || pipelines[1];
  const prcPipe = pipelines.find(p => p.id === 'pipe-prc-001') || pipelines[2];
  const utlPipe = pipelines.find(p => p.id === 'pipe-utl-001') || pipelines[3];
  const wtrPipe = pipelines.find(p => p.id === 'pipe-wtr-001') || pipelines[4];

  const handleSelect = (pipeId: string) => {
    selectPipeline(pipeId);
  };

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenAlertModal) {
      onOpenAlertModal('alert-0926');
    } else {
      openAlertModal('alert-0926');
    }
  };

  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setGlobalTolerance(val);
    pipelines.forEach(p => updatePipelineTolerance(p.id, val));
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
      
      {/* Network Header & Controls */}
      <div className="bg-slate-950/90 backdrop-blur border-b border-slate-800/90 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm tracking-wide">
                {viewMode === 'GIS' ? 'GIS Spatial Water Network & Flow Map' : 'SCADA Topology & Mass-Balance Schematic'}
              </h3>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                SCADA Level 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live dual-sensor differential flow telemetry • Viraj Profiles — Boisar Facility
            </p>
          </div>
        </div>

        {/* View Controls & Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Dual View Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1 text-xs text-slate-300">
            <button
              onClick={() => setViewMode('GIS')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition font-semibold ${
                viewMode === 'GIS' ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              GIS Spatial Map
            </button>
            <button
              onClick={() => setViewMode('SCHEMATIC')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition font-semibold ${
                viewMode === 'SCHEMATIC' ? 'bg-sky-600 text-white shadow-sm' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              SCADA Schematic
            </button>
          </div>

          {/* Toggle Metrics & Animation */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1 text-xs text-slate-300">
            <button 
              onClick={() => setShowMetrics(!showMetrics)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${showMetrics ? 'bg-sky-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Toggle Live Sensor Gauges"
            >
              <Gauge className="w-3.5 h-3.5" />
              Gauges
            </button>
            <button 
              onClick={() => setShowVectors(!showVectors)}
              className={`px-2 py-1 rounded flex items-center gap-1 transition ${showVectors ? 'bg-sky-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-400'}`}
              title="Toggle Flow Animation"
            >
              <Droplets className="w-3.5 h-3.5" />
              Pulses
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-1">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(1.3, prev + 0.1))} 
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.1))} 
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(1)} 
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Network Toolbar & Sensitivity Slider (Inspired by Kamstrup Leak Detector) */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-5 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" /> Balanced Flow (Normal)
          </span>
          <span className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse ring-2 ring-amber-500/40" /> Possible Water Loss (Δ &gt; Threshold)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Intake Meter (4.8 Bar)
          </span>
        </div>

        {/* Dynamic Sensitivity Threshold Slider */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-lg px-3 py-1">
          <Sliders className="w-3 h-3 text-sky-400" />
          <span className="text-[11px] font-semibold text-slate-300">Tolerance Sensitivity:</span>
          <input
            type="range"
            min="0.10"
            max="1.50"
            step="0.05"
            value={globalTolerance}
            onChange={handleToleranceChange}
            className="w-24 accent-sky-500 cursor-pointer h-1.5"
            title="Adjust differential flow tolerance"
          />
          <span className="font-mono font-bold text-sky-300 text-[11px]">
            ±{globalTolerance.toFixed(2)} L/m
          </span>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes waterFlowPulse {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        .animated-water-pipe {
          stroke-dasharray: 8, 8;
          animation: waterFlowPulse 1.2s linear infinite;
        }
        .animated-water-pipe-slow {
          stroke-dasharray: 8, 8;
          animation: waterFlowPulse 2s linear infinite;
        }
        .animated-water-pipe-warning {
          stroke-dasharray: 8, 8;
          animation: waterFlowPulse 0.9s linear infinite;
        }
      `}</style>

      {/* MAP CANVAS CONTAINER */}
      <div className="relative p-5 overflow-x-auto min-h-[500px] flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
        
        <div 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200 w-full max-w-5xl mx-auto relative"
        >
          {viewMode === 'GIS' ? (
            /* ========================================================================= */
            /* MODE 1: GIS SPATIAL WATER NETWORK MAP (AquaMonitor / Kamstrup Style)      */
            /* ========================================================================= */
            <div className="space-y-4">
              
              {/* GIS Map Container with Facility Zones & Pipeline Overlays */}
              <div className="relative bg-slate-950/90 border border-slate-800 rounded-2xl p-6 shadow-2xl min-h-[460px] overflow-hidden">
                
                {/* Background GIS Grid & Zone Outlines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Floating Map Legend (Top Right) */}
                <div className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700/80 rounded-xl p-3 shadow-lg text-[11px] space-y-1.5 pointer-events-auto">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Map Layers &amp; Telemetry
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded bg-sky-400" />
                    <span>Inlet Header (142.3 kL/d)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="w-2 h-2 rounded bg-emerald-400" />
                    <span>Balanced Pipelines (4/5)</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <span className="w-2 h-2 rounded bg-amber-400 animate-pulse" />
                    <span>Leak Risk Pin (Bay 3 Rack)</span>
                  </div>
                  <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-500">
                    Acoustic Correlation: <strong className="text-sky-300">88% Conf.</strong>
                  </div>
                </div>

                {/* TOP: MAIN WATER INTAKE STATION */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3 bg-slate-900/90 border border-sky-500/40 rounded-xl p-3 shadow-md max-w-sm">
                    <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                      IN-01
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-sky-400 uppercase">MIDC Boisar Water Header Intake</div>
                      <div className="font-mono text-sm font-black text-white">142,300 L/day • 4.8 Bar</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 flex items-center gap-1">● ESP32-HDR-01 Online</span>
                        <span>Instant: 98.8 L/m</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2 text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Facility Status</span>
                    <div className="text-xs font-bold text-amber-300 mt-0.5 flex items-center gap-1.5 justify-end">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      1 Loss Alert Under Verification
                    </div>
                  </div>
                </div>

                {/* GIS SPATIAL PIPELINE SVG OVERLAY */}
                <div className="relative my-4 z-10">
                  <svg className="w-full h-48 overflow-visible">
                    <defs>
                      <linearGradient id="gisPipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                      <linearGradient id="gisPipeLossGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="70%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>

                    {/* Main Backbone Feeder */}
                    <path d="M 80 10 L 80 40 L 920 40" fill="none" stroke="#1e293b" strokeWidth="8" />
                    <path d="M 80 10 L 80 40 L 920 40" fill="none" stroke="#0284c7" strokeWidth="4" />
                    {showVectors && (
                      <path d="M 80 10 L 80 40 L 920 40" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe" />
                    )}

                    {/* Branch 1: Production (Bay 3 / PRD-001) with Leak Highlight */}
                    <path d="M 120 40 L 120 160" fill="none" stroke="#334155" strokeWidth="6" />
                    <path d="M 120 40 L 120 160" fill="none" stroke={prdPipe.hasActiveLoss ? "url(#gisPipeLossGrad)" : "#0284c7"} strokeWidth="4" />
                    {showVectors && (
                      <path d="M 120 40 L 120 160" fill="none" stroke={prdPipe.hasActiveLoss ? "#f59e0b" : "#38bdf8"} strokeWidth="2.5" className={prdPipe.hasActiveLoss ? "animated-water-pipe-warning" : "animated-water-pipe"} />
                    )}

                    {/* Branch 2: Cooling Tower Loop */}
                    <path d="M 320 40 L 320 160" fill="none" stroke="#334155" strokeWidth="6" />
                    <path d="M 320 40 L 320 160" fill="none" stroke="#0284c7" strokeWidth="4" />
                    {showVectors && (
                      <path d="M 320 40 L 320 160" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe" />
                    )}

                    {/* Branch 3: Chemical Processing */}
                    <path d="M 520 40 L 520 160" fill="none" stroke="#334155" strokeWidth="6" />
                    <path d="M 520 40 L 520 160" fill="none" stroke="#0284c7" strokeWidth="4" />
                    {showVectors && (
                      <path d="M 520 40 L 520 160" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe" />
                    )}

                    {/* Branch 4: High Pressure Boiler */}
                    <path d="M 720 40 L 720 160" fill="none" stroke="#334155" strokeWidth="6" />
                    <path d="M 720 40 L 720 160" fill="none" stroke="#0284c7" strokeWidth="4" />
                    {showVectors && (
                      <path d="M 720 40 L 720 160" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe" />
                    )}

                    {/* Branch 5: RO Recycle Skid */}
                    <path d="M 900 40 L 900 160" fill="none" stroke="#334155" strokeWidth="6" />
                    <path d="M 900 40 L 900 160" fill="none" stroke="#0284c7" strokeWidth="4" />
                    {showVectors && (
                      <path d="M 900 40 L 900 160" fill="none" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe-slow" />
                    )}
                  </svg>
                </div>

                {/* 5 GIS OPERATIONAL DESTINATION CARDS WITH FLOW TELEMETRY */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
                  
                  {/* ZONE 1: HOT ROLLING MILL A (DEMO LEAK PIN) */}
                  <div 
                    onClick={() => handleSelect('pipe-prd-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-prd-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : prdPipe.hasActiveLoss
                        ? 'border-amber-500/80 bg-slate-900/90 shadow-lg shadow-amber-950/40'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    {/* LEAK DETECTED CALLOUT BANNER (AquaMonitor style) */}
                    {prdPipe.hasActiveLoss && (
                      <div 
                        onClick={handleAlertClick}
                        className="mb-2 bg-amber-500 text-slate-950 px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-wide flex items-center justify-between shadow-md shadow-amber-500/30 animate-pulse hover:bg-amber-400"
                      >
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> LEAK DETECTED
                        </span>
                        <span>Bay 3 Rack →</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{prdPipe.code}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          4.4 Bar
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">Production Line A</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Flow: <strong className="text-sky-300">{prdPipe.inletFlowLpm.toFixed(2)} L/m</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">Δ Loss:</span>
                      <span className={`font-mono font-bold ${prdPipe.hasActiveLoss ? 'text-amber-300' : 'text-slate-300'}`}>
                        {prdPipe.differenceLpm.toFixed(2)} L/m
                      </span>
                    </div>
                  </div>

                  {/* ZONE 2: COOLING TOWER */}
                  <div 
                    onClick={() => handleSelect('pipe-col-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-col-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{colPipe.code}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          4.6 Bar
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">Cooling Tower Loop</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Flow: <strong className="text-sky-300">{colPipe.inletFlowLpm.toFixed(2)} L/m</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">Δ Loss:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {colPipe.differenceLpm.toFixed(2)} L/m (OK)
                      </span>
                    </div>
                  </div>

                  {/* ZONE 3: CHEMICAL PROCESSING */}
                  <div 
                    onClick={() => handleSelect('pipe-prc-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-prc-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{prcPipe.code}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          4.5 Bar
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">Pickling & Neutral.</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Flow: <strong className="text-sky-300">{prcPipe.inletFlowLpm.toFixed(2)} L/m</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">Δ Loss:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {prcPipe.differenceLpm.toFixed(2)} L/m (OK)
                      </span>
                    </div>
                  </div>

                  {/* ZONE 4: UTILITIES & BOILER */}
                  <div 
                    onClick={() => handleSelect('pipe-utl-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-utl-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{utlPipe.code}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          5.1 Bar
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">High Pressure Boiler</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Flow: <strong className="text-sky-300">{utlPipe.inletFlowLpm.toFixed(2)} L/m</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">Δ Loss:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {utlPipe.differenceLpm.toFixed(2)} L/m (OK)
                      </span>
                    </div>
                  </div>

                  {/* ZONE 5: RO RECYCLE */}
                  <div 
                    onClick={() => handleSelect('pipe-wtr-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-wtr-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase font-mono">{wtrPipe.code}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          4.7 Bar
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">RO Recycle Skid</h4>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Flow: <strong className="text-sky-300">{wtrPipe.inletFlowLpm.toFixed(2)} L/m</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between">
                      <span className="text-slate-400">Δ Loss:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {wtrPipe.differenceLpm.toFixed(2)} L/m (OK)
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* MODE 2: SCADA DUAL-SENSOR MASS-BALANCE SCHEMATIC                          */
            /* ========================================================================= */
            <div>
              {/* TOP TIER: WATER SOURCE */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border border-sky-600/50 rounded-xl px-6 py-3 shadow-lg shadow-sky-950/40 text-center relative group">
                  <div className="flex items-center justify-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest mb-0.5">
                    <Droplets className="w-3.5 h-3.5" />
                    Main Water Supply Source
                  </div>
                  <div className="text-slate-100 font-semibold text-sm">
                    MIDC Industrial Water Feeder Line (Boisar Intake)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-center gap-3">
                    <span>Supply Status: <strong className="text-emerald-400">ACTIVE</strong></span>
                    <span>Pressure: <strong>4.8 Bar</strong></span>
                  </div>
                </div>

                {/* Vertical Pipe */}
                <div className="w-1 h-6 bg-slate-700 relative overflow-hidden my-1">
                  {showVectors && <div className="absolute inset-0 w-full bg-sky-400 animate-pulse" />}
                </div>

                {/* MAIN FLOW METER */}
                <div className="bg-slate-800/90 border border-slate-700 rounded-xl px-5 py-2.5 text-center shadow-md min-w-[240px]">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    MAIN INTAKE FLOW METER (ESP32-HDR-01)
                  </div>
                  <div className="text-lg font-bold text-sky-300 font-mono">
                    142,300 <span className="text-xs font-normal text-slate-400">L/day</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                    <span>Instant: <strong className="text-slate-200">98.8 L/min</strong></span>
                    <span className="text-emerald-400 flex items-center gap-1">● Online</span>
                  </div>
                </div>

                {/* Pipe to Header */}
                <div className="w-1 h-6 bg-slate-700 relative overflow-hidden my-1">
                  {showVectors && <div className="absolute inset-0 w-full bg-sky-400 animate-pulse" />}
                </div>

                {/* MAIN DISTRIBUTION HEADER */}
                <div className="bg-slate-800 border-2 border-sky-500/40 rounded-lg px-8 py-2 text-center text-xs font-bold text-sky-200 tracking-wider shadow-md uppercase">
                  Main Facility Distribution Header (Manifold)
                </div>
              </div>

              {/* 5 BRANCH SCHEMATIC */}
              <div className="relative">
                <svg className="w-full h-12 overflow-visible" preserveAspectRatio="none">
                  <line x1="8%" y1="0" x2="92%" y2="0" stroke="#334155" strokeWidth="4" />
                  {showVectors && (
                    <line x1="8%" y1="0" x2="92%" y2="0" stroke="#38bdf8" strokeWidth="2.5" className="animated-water-pipe" />
                  )}
                  <line x1="10%" y1="0" x2="10%" y2="48" stroke="#334155" strokeWidth="3" />
                  {showVectors && (
                    <line x1="10%" y1="0" x2="10%" y2="48" stroke={prdPipe.hasActiveLoss ? "#f59e0b" : "#38bdf8"} strokeWidth="2" className={prdPipe.hasActiveLoss ? "animated-water-pipe-warning" : "animated-water-pipe"} />
                  )}
                  <line x1="30%" y1="0" x2="30%" y2="48" stroke="#334155" strokeWidth="3" />
                  {showVectors && (
                    <line x1="30%" y1="0" x2="30%" y2="48" stroke="#38bdf8" strokeWidth="2" className="animated-water-pipe" />
                  )}
                  <line x1="50%" y1="0" x2="50%" y2="48" stroke="#334155" strokeWidth="3" />
                  {showVectors && (
                    <line x1="50%" y1="0" x2="50%" y2="48" stroke="#38bdf8" strokeWidth="2" className="animated-water-pipe" />
                  )}
                  <line x1="70%" y1="0" x2="70%" y2="48" stroke="#334155" strokeWidth="3" />
                  {showVectors && (
                    <line x1="70%" y1="0" x2="70%" y2="48" stroke="#38bdf8" strokeWidth="2" className="animated-water-pipe" />
                  )}
                  <line x1="90%" y1="0" x2="90%" y2="48" stroke="#334155" strokeWidth="3" />
                  {showVectors && (
                    <line x1="90%" y1="0" x2="90%" y2="48" stroke="#38bdf8" strokeWidth="2" className="animated-water-pipe-slow" />
                  )}
                </svg>

                {/* 5 PARALLEL PIPELINE BRANCH CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
                  
                  {/* BRANCH 1: PRODUCTION LINE A */}
                  <div 
                    onClick={() => handleSelect('pipe-prd-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-prd-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : prdPipe.hasActiveLoss
                        ? 'border-amber-500/80 bg-slate-900/90 shadow-lg shadow-amber-950/30'
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{prdPipe.code}</span>
                        {prdPipe.hasActiveLoss ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" /> LOSS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-2.5 h-2.5" /> BALANCED
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{prdPipe.name}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">Area: {prdPipe.area}</p>
                    </div>

                    {/* SENSOR 1: INLET */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 1 (INLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H002</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{prdPipe.inletFlowLpm.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">L/min</span></span>
                      </div>
                      <div className="flex items-baseline justify-between text-[10px] text-slate-400">
                        <span>TODAY:</span>
                        <span className="font-mono text-slate-200">{prdPipe.todayLitre.toLocaleString()} L</span>
                      </div>
                    </div>

                    {/* LOSS CALLOUT */}
                    <div className="my-1 relative">
                      {prdPipe.hasActiveLoss ? (
                        <div 
                          onClick={handleAlertClick}
                          className="bg-amber-950/70 border-2 border-amber-500/80 rounded-lg p-2 text-center transition-all hover:bg-amber-900/80 group cursor-pointer shadow-md shadow-amber-950/40"
                        >
                          <div className="flex items-center justify-center gap-1 text-amber-300 font-bold text-[10px] uppercase tracking-wide animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            POSSIBLE WATER LOSS
                          </div>
                          <div className="text-[11px] font-mono font-bold text-amber-200 mt-0.5">
                            Δ {prdPipe.differenceLpm.toFixed(2)} L/min
                          </div>
                          <div className="text-[8px] text-slate-400 mt-1 truncate" title={prdPipe.exactLocation}>
                            Loc: Bay 3 Rack
                          </div>
                          <div className="mt-1.5 pt-1 border-t border-amber-500/30 text-[9px] font-bold text-amber-300 group-hover:text-white flex items-center justify-center gap-1">
                            Inspect Alert AQ-0926 <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-6 flex items-center justify-center">
                          <div className="w-full border-t border-dashed border-slate-700 relative">
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-slate-900 px-1 text-[9px] text-slate-500">
                              Δ 0.04 L/min (OK)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SENSOR 2: OUTLET */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mt-1 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 2 (OUTLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H002B</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{prdPipe.outletFlowLpm.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">L/min</span></span>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 text-center text-[10px] text-slate-300 font-medium">
                      → Hot Rolling Unit A
                    </div>
                  </div>

                  {/* BRANCH 2: COOLING */}
                  <div 
                    onClick={() => handleSelect('pipe-col-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-col-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{colPipe.code}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> BALANCED
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{colPipe.name}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">Area: {colPipe.area}</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 4 (INLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H004</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{colPipe.inletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="my-2 text-center text-[9px] text-slate-500 py-1 border-y border-slate-800/60 font-mono">
                      Δ {colPipe.differenceLpm.toFixed(2)} L/min (Within ±0.40)
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 5 (OUTLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H005</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{colPipe.outletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 text-center text-[10px] text-slate-300 font-medium">
                      → Cooling Tower Loop
                    </div>
                  </div>

                  {/* BRANCH 3: PROCESSING */}
                  <div 
                    onClick={() => handleSelect('pipe-prc-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-prc-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{prcPipe.code}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> BALANCED
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{prcPipe.name}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">Area: {prcPipe.area}</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 6 (INLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H006</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{prcPipe.inletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="my-2 text-center text-[9px] text-slate-500 py-1 border-y border-slate-800/60 font-mono">
                      Δ {prcPipe.differenceLpm.toFixed(2)} L/min (Within ±0.35)
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 7 (OUTLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H007</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{prcPipe.outletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 text-center text-[10px] text-slate-300 font-medium">
                      → Pickling & Neutral.
                    </div>
                  </div>

                  {/* BRANCH 4: UTILITIES */}
                  <div 
                    onClick={() => handleSelect('pipe-utl-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-utl-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{utlPipe.code}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> BALANCED
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{utlPipe.name}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">Area: {utlPipe.area}</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 8 (INLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H008</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{utlPipe.inletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="my-2 text-center text-[9px] text-slate-500 py-1 border-y border-slate-800/60 font-mono">
                      Δ {utlPipe.differenceLpm.toFixed(2)} L/min (Within ±0.30)
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 9 (OUTLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H009</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{utlPipe.outletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 text-center text-[10px] text-slate-300 font-medium">
                      → High Pressure Boiler
                    </div>
                  </div>

                  {/* BRANCH 5: RO RECYCLE */}
                  <div 
                    onClick={() => handleSelect('pipe-wtr-001')}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all duration-200 relative flex flex-col justify-between ${
                      selectedPipelineId === 'pipe-wtr-001' 
                        ? 'ring-2 ring-sky-400 border-sky-400 bg-slate-800/95 shadow-xl' 
                        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{wtrPipe.code}</span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-2.5 h-2.5" /> BALANCED
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-100 text-xs">{wtrPipe.name}</h4>
                      <p className="text-[10px] text-slate-400 mb-2">Area: {wtrPipe.area}</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 10 (INLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H010</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{wtrPipe.inletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="my-2 text-center text-[9px] text-slate-500 py-1 border-y border-slate-800/60 font-mono">
                      Δ {wtrPipe.differenceLpm.toFixed(2)} L/min (Within ±0.25)
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-2 mb-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Sensor 11 (OUTLET)</span>
                        <span className="text-[9px] text-emerald-400 font-mono">ESP32-H011</span>
                      </div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs text-slate-400">FLOW:</span>
                        <span className="font-mono font-bold text-sky-300 text-sm">{wtrPipe.outletFlowLpm.toFixed(2)} L/m</span>
                      </div>
                    </div>

                    <div className="bg-slate-800/80 border border-slate-700/60 rounded px-2 py-1 text-center text-[10px] text-slate-300 font-medium">
                      → RO Permeate Skid
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400">Active Pipelines: </span>
            <span className="font-bold text-slate-200">5 / 5 Monitored</span>
          </div>
          <div>
            <span className="text-slate-400">Telemetry Nodes: </span>
            <span className="font-bold text-emerald-400">12 Online ESP32s (100%)</span>
          </div>
          <div>
            <span className="text-slate-400">Total Instant Flow: </span>
            <span className="font-bold text-sky-400 font-mono">
              {(prdPipe.inletFlowLpm + colPipe.inletFlowLpm + prcPipe.inletFlowLpm + utlPipe.inletFlowLpm + wtrPipe.inletFlowLpm).toFixed(2)} L/min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prdPipe.hasActiveLoss && (
            <button
              onClick={handleAlertClick}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 transition text-xs shadow-md shadow-amber-500/20"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Investigate Alert AQ-0926
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
