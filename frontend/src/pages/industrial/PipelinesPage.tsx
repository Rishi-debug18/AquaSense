import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Building2, Droplets, AlertTriangle, CheckCircle2, Sliders, 
  ArrowRight, ShieldAlert, Activity, Cpu, RefreshCw, Layers, 
  FileText, ArrowUpRight, ArrowDownRight, Eye, Wrench, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PipelinesPage: React.FC = () => {
  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    updatePipelineTolerance, 
    openAlertModal 
  } = useAquaSenseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('ALL');

  const selectedPipe = pipelines.find(p => p.id === (selectedPipelineId || 'pipe-prd-001')) || pipelines[0];

  const filteredPipelines = pipelines.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.exactLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'ALL' || p.area === areaFilter;
    return matchesSearch && matchesArea;
  });

  const handleToleranceSlider = (id: string, val: number) => {
    updatePipelineTolerance(id, val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar Plant
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              5 Monitored Branches
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pipeline Network &amp; Mass-Balance Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-sensor dual-point differential flow monitoring across all manufacturing, cooling, and utility branches.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search branch code or location..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* 2. Mass-Balance Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Branches</span>
          <div className="text-2xl font-black text-slate-900 mt-1">5 Lines</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4 Normal • 1 Loss Investigation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Inflow</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {pipelines.reduce((acc, p) => acc + p.inletFlowLpm, 0).toFixed(2)} <span className="text-sm font-semibold text-slate-500">L/min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">10 Sensors Telemetry Active</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Day Loss</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {pipelines.reduce((acc, p) => acc + p.estimatedLossLitre, 0).toLocaleString()} <span className="text-sm font-semibold text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">Production Line A (PRD-001)</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Difference</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {(pipelines.reduce((acc, p) => acc + p.differenceLpm, 0) / pipelines.length).toFixed(2)} <span className="text-sm font-semibold text-slate-500">L/min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Baseline Tolerance: 0.50 L/min</div>
        </div>
      </div>

      {/* 3. Pipeline Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Pipeline Cards Table / List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Pipeline Mass-Balance Inventory</h2>
              
              {/* Area Filters */}
              <div className="flex items-center gap-1 text-xs">
                {['ALL', 'Production', 'Cooling', 'Processing', 'Utilities', 'Water Treatment'].map((area) => (
                  <button
                    key={area}
                    onClick={() => setAreaFilter(area)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      areaFilter === area
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredPipelines.map((pipe) => {
                const isSelected = pipe.id === selectedPipe.id;
                const isLoss = pipe.status === 'possible_loss';

                return (
                  <div
                    key={pipe.id}
                    onClick={() => selectPipeline(pipe.id)}
                    className={`p-4 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected ? 'bg-sky-50/60 border-l-4 border-l-sky-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {pipe.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{pipe.name}</h3>
                        
                        {isLoss ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Possible Loss
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Normal
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>Area: <strong>{pipe.area}</strong></span>
                        <span>•</span>
                        <span>Location: <strong>{pipe.exactLocation}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">Today: {pipe.todayLitre.toLocaleString()} L</span>
                      </div>
                    </div>

                    {/* Differential Flow Stats */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500 font-medium">Inlet → Outlet</div>
                        <div className="text-xs font-mono font-bold text-slate-900">
                          {pipe.inletFlowLpm.toFixed(2)} → {pipe.outletFlowLpm.toFixed(2)} <span className="text-[10px] text-slate-500">L/m</span>
                        </div>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-xs text-slate-500 font-medium">Delta (Δ)</div>
                        <div className={`text-sm font-mono font-black ${isLoss ? 'text-red-600' : 'text-slate-800'}`}>
                          {pipe.differenceLpm > 0 ? `+${pipe.differenceLpm.toFixed(2)}` : pipe.differenceLpm.toFixed(2)} <span className="text-[10px]">L/m</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectPipeline(pipe.id);
                        }}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-400 text-slate-600 hover:text-sky-700 shadow-sm transition"
                        title="Select pipeline for telemetry inspection"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Detailed Selected Pipeline Inspector & Tolerance Adjuster */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 sticky top-24">
            
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                  {selectedPipe.code}
                </span>
                <span className="text-xs text-slate-400 font-mono">Last updated: {selectedPipe.lastUpdated}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">{selectedPipe.name}</h2>
              <p className="text-xs text-slate-500">{selectedPipe.description}</p>
            </div>

            {/* Mass-Balance Two-Sensor Comparison Card */}
            <div className={`p-4 rounded-xl border ${
              selectedPipe.hasActiveLoss 
                ? 'bg-amber-50/70 border-amber-300' 
                : 'bg-slate-50 border-slate-200'
            } space-y-3`}>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Two-Sensor Mass Balance</span>
                {selectedPipe.hasActiveLoss ? (
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeds Tolerance
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Inlet (Sensor S1)</span>
                  <div className="text-base font-black font-mono text-slate-900">{selectedPipe.inletFlowLpm.toFixed(2)} L/m</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Outlet (Sensor S2)</span>
                  <div className="text-base font-black font-mono text-slate-900">{selectedPipe.outletFlowLpm.toFixed(2)} L/m</div>
                </div>
              </div>

              {/* Mass Balance Math */}
              <div className="text-xs bg-white/90 p-2.5 rounded-lg border border-slate-200 space-y-1 font-mono text-slate-800">
                <div className="flex justify-between">
                  <span>Measured Delta (Δ):</span>
                  <strong className={selectedPipe.hasActiveLoss ? 'text-red-600' : 'text-slate-900'}>
                    {selectedPipe.differenceLpm.toFixed(2)} L/min
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Configured Tolerance (τ):</span>
                  <span>{selectedPipe.configuredToleranceLpm.toFixed(2)} L/min</span>
                </div>
              </div>
            </div>

            {/* Tolerance Adjuster Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" /> Loss Detection Tolerance
                </span>
                <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {selectedPipe.configuredToleranceLpm.toFixed(2)} L/min
                </span>
              </div>
              
              <input
                type="range"
                min={0.10}
                max={2.00}
                step={0.05}
                value={selectedPipe.configuredToleranceLpm}
                onChange={(e) => handleToleranceSlider(selectedPipe.id, parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.10 L/m (High Sensitivity)</span>
                <span>2.00 L/m (Broad)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {selectedPipe.hasActiveLoss && (
                <button
                  onClick={() => openAlertModal('alert-0926')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Investigate Loss Alert AQ-0926</span>
                </button>
              )}

              <button
                onClick={() => toast.success(`Diagnostic ping dispatched to ${selectedPipe.code} IoT node.`)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Real-Time Calibration Ping</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
