import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { InteractiveWaterNetwork } from '../../components/pipeline/InteractiveWaterNetwork';
import { 
  Network, Droplets, AlertTriangle, CheckCircle2, Sliders, 
  MapPin, Activity, ShieldAlert, Cpu, ArrowRight, Gauge
} from 'lucide-react';

export const InteractiveWaterNetworkPage: React.FC = () => {
  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    openAlertModal,
    simulationActive,
    toggleDemoLeakAnomaly,
    leakAnomalyActive
  } = useAquaSenseStore();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'POSSIBLE_LOSS' | 'NORMAL'>('ALL');

  const filteredPipelines = pipelines.filter((p) => {
    if (activeFilter === 'POSSIBLE_LOSS') return p.status === 'possible_loss';
    if (activeFilter === 'NORMAL') return p.status === 'normal';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              SCADA Pipeline Network
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Interactive Topology Map
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Facility Water Distribution Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual mass-balance monitoring across continuous production lines, cooling towers, chemical processing, and boilers.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Pipelines (5)
          </button>
          <button
            onClick={() => setActiveFilter('POSSIBLE_LOSS')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              activeFilter === 'POSSIBLE_LOSS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Possible Loss (1)
          </button>
          <button
            onClick={() => setActiveFilter('NORMAL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === 'NORMAL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Balanced (4)
          </button>
        </div>
      </div>

      {/* Main SCADA Interactive Map */}
      <InteractiveWaterNetwork />

      {/* DETAILED PIPELINE SECTION CARDS WITH EXACT LOCATION BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pipeline Section Diagnostics &amp; Physical Locations</h3>
            <p className="text-xs text-slate-500">Click any card to inspect dual sensor calibration, tolerance limits, and telemetry logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPipelines.map((pipe) => {
            const isLoss = pipe.differenceLpm > pipe.configuredToleranceLpm;
            return (
              <div
                key={pipe.id}
                onClick={() => selectPipeline(pipe.id)}
                className={`bg-white border rounded-xl p-5 shadow-sm cursor-pointer transition hover:border-sky-500 relative flex flex-col justify-between ${
                  selectedPipelineId === pipe.id 
                    ? 'ring-2 ring-sky-500 border-sky-500' 
                    : isLoss
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {pipe.code}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLoss
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {isLoss ? 'POSSIBLE WATER LOSS' : 'BALANCED FLOW'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{pipe.name}</h4>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">{pipe.description}</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate text-slate-700">{pipe.exactLocation}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Inlet Flow:</span>
                        <span className="font-mono font-bold text-sky-700">{pipe.inletFlowLpm.toFixed(2)} L/min</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Outlet Flow:</span>
                        <span className="font-mono font-bold text-sky-700">{pipe.outletFlowLpm.toFixed(2)} L/min</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Difference (Δ):</span>
                      <span className={`font-mono font-bold ${isLoss ? 'text-amber-700' : 'text-slate-800'}`}>
                        {pipe.differenceLpm.toFixed(2)} L/min (Tol: {pipe.configuredToleranceLpm.toFixed(2)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-[10px]">Today: {pipe.todayLitre.toLocaleString()} L</span>
                  <button className="text-sky-600 hover:text-sky-700 font-semibold text-xs flex items-center gap-1">
                    Inspect Drawer <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
