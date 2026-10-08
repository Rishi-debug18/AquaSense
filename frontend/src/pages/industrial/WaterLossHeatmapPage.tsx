import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { LeafletPipelineMap } from '../../components/map/LeafletPipelineMap';
import { 
  Flame, AlertTriangle, ShieldCheck, MapPin, Sliders, Filter, 
  Eye, CheckCircle2, ArrowRight, ExternalLink, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const WaterLossHeatmapPage: React.FC = () => {
  const { pipelines, selectedPipelineId, selectPipeline, openAlertModal } = useAquaSenseStore();
  const navigate = useNavigate();

  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'NORMAL' | 'WARNING' | 'LOSS' | 'CRITICAL'>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];

  const handleInspectLossEvent = (pipe: any) => {
    setSelectedEvent(pipe);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Water Loss Spatial Heatmap
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SCADA HEATMAP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identify areas requiring inspection based on continuous dual-sensor mass-balance differentials.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['ALL', 'LOSS', 'WARNING', 'NORMAL'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterSeverity(lvl)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                filterSeverity === lvl
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {lvl === 'ALL' && 'All Zones'}
              {lvl === 'LOSS' && 'Possible Loss (1)'}
              {lvl === 'WARNING' && 'Warning (0)'}
              {lvl === 'NORMAL' && 'Balanced (4)'}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Side Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: LEAFLET GIS HEATMAP CANVAS (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Boisar Industrial Facility Spatial GIS Map
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Coordinates: 19.8037° N, 72.7533° E
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
            <LeafletPipelineMap 
              height="480px"
              mode="INDUSTRIAL"
              onOpenAlertModal={(id) => openAlertModal(id)}
              onSelectPipeline={(id) => {
                selectPipeline(id);
                const p = pipelines.find(item => item.id === id);
                if (p) setSelectedEvent(p);
              }}
            />
          </div>

          {/* Heatmap Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-500" /> Normal Flow (No Loss)
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" /> High Differential (Δ &gt; Tolerance)
              </span>
              <span className="flex items-center gap-1.5 text-red-700 font-bold">
                <span className="w-3 h-3 rounded-full bg-red-500" /> Critical Anomaly
              </span>
            </div>
            <span className="text-[10px] text-slate-400 italic">
              Click any pin or pipeline to inspect verification work order
            </span>
          </div>
        </div>

        {/* RIGHT: WATER LOSS EVENT DETAILS CARD (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <Activity className="w-4 h-4 text-amber-600" />
              Water Loss Event Inspection
            </div>
            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              AQ-ALERT-0926
            </span>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-900 text-xs">Pipeline: {prdPipe.code}</span>
                <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-black text-[10px]">
                  POSSIBLE LOSS
                </span>
              </div>
              <h4 className="font-bold text-slate-900">{prdPipe.name}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dual-sensor mass balance flagged sustained flow differential across Bay 3 hot rolling header.
              </p>
            </div>

            {/* Differential Flow Stats */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Inlet Sensor (S1):</span>
                <strong className="text-sky-700">{prdPipe.inletFlowLpm.toFixed(2)} L/min</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outlet Sensor (S2):</span>
                <strong className="text-sky-700">{prdPipe.outletFlowLpm.toFixed(2)} L/min</strong>
              </div>
              <div className="flex justify-between text-amber-900 font-bold pt-1 border-t border-slate-200">
                <span>Discrepancy (Δ):</span>
                <span>{prdPipe.differenceLpm.toFixed(2)} L/min</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Configured Tolerance:</span>
                <span>±{prdPipe.configuredToleranceLpm.toFixed(2)} L/min</span>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
              <strong className="text-slate-800 block">Recommended Operational Action:</strong>
              <p className="text-[11px] text-slate-600">
                Inspect pipe rack elevation +4.2m at Bay 3 for flange seal degradation or spray nozzle seating leaks.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/pipelines')}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>View Full Pipeline Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => openAlertModal('alert-0926')}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <span>Create Incident / Work Order</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
