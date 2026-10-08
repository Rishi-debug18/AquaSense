import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  X, AlertTriangle, CheckCircle2, Droplets, Activity, Sliders, 
  MapPin, ShieldAlert, Cpu, RefreshCw, Send, Check, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PipelineInspectorDrawer: React.FC = () => {
  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    updatePipelineTolerance, 
    openAlertModal,
    toggleDemoLeakAnomaly
  } = useAquaSenseStore();

  const [verifying, setVerifying] = useState<boolean>(false);

  if (!selectedPipelineId) return null;

  const pipeline = pipelines.find(p => p.id === selectedPipelineId);
  if (!pipeline) return null;

  const isPossibleLoss = pipeline.differenceLpm > pipeline.configuredToleranceLpm;

  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updatePipelineTolerance(pipeline.id, val);
  };

  const handleVerifyPipeline = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      toast.success(`Verification telemetry packet dispatched to ${pipeline.code}. Field check logged.`);
    }, 800);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-800 transition-transform duration-300 animate-in slide-in-from-right">
      
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              {pipeline.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Area: {pipeline.area}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{pipeline.name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span className="truncate">{pipeline.exactLocation}</span>
          </div>
        </div>
        <button
          onClick={() => selectPipeline(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
        
        {/* Status Callout Banner */}
        {isPossibleLoss ? (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
              STATUS: POSSIBLE WATER LOSS
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Inlet flow exceeds outlet flow by <strong className="text-amber-800 font-mono">{pipeline.differenceLpm.toFixed(2)} L/min</strong>, exceeding configured tolerance of <strong className="text-slate-800 font-mono">{pipeline.configuredToleranceLpm.toFixed(2)} L/min</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => openAlertModal('alert-0926')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                View Alert AQ-ALERT-0926
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              STATUS: BALANCED FLOW
            </div>
            <p className="text-[11px] text-slate-600">
              Differential flow is within normal operating tolerance (Δ {pipeline.differenceLpm.toFixed(2)} L/min ≤ {pipeline.configuredToleranceLpm.toFixed(2)} L/min).
            </p>
          </div>
        )}

        {/* Live Dual Sensor Comparison Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-600" /> Dual Sensor Measurement
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Updated: {pipeline.lastUpdated}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Inlet Gauge */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Inlet Sensor (S1)</div>
              <div className="text-xl font-mono font-black text-sky-700 mt-1">
                {pipeline.inletFlowLpm.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">L/min</div>
              <div className="text-[10px] text-emerald-600 font-mono mt-1">Node: {pipeline.inletSensorId}</div>
            </div>

            {/* Outlet Gauge */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-center shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Outlet Sensor (S2)</div>
              <div className="text-xl font-mono font-black text-sky-700 mt-1">
                {pipeline.outletFlowLpm.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">L/min</div>
              <div className="text-[10px] text-emerald-600 font-mono mt-1">Node: {pipeline.outletSensorId}</div>
            </div>
          </div>

          {/* Differential Calculation Strip */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Difference (Inlet − Outlet):</span>
              <span className={`font-mono font-bold ${isPossibleLoss ? 'text-amber-800 text-sm' : 'text-slate-800'}`}>
                Δ {pipeline.differenceLpm.toFixed(2)} L/min
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Configured Tolerance:</span>
              <span className="font-mono font-semibold text-slate-700">
                ±{pipeline.configuredToleranceLpm.toFixed(2)} L/min
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${isPossibleLoss ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (pipeline.differenceLpm / Math.max(pipeline.configuredToleranceLpm, 0.01)) * 50)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Configured Tolerance Slider */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-600" />
              Adjust Tolerance Threshold
            </label>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-200">
              ±{pipeline.configuredToleranceLpm.toFixed(2)} L/min
            </span>
          </div>
          <input
            type="range"
            min="0.10"
            max="2.00"
            step="0.05"
            value={pipeline.configuredToleranceLpm}
            onChange={handleToleranceChange}
            className="w-full accent-sky-600 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Alert triggers when Inlet − Outlet &gt; threshold. Prevents false alarms due to normal calibration drift.
          </p>
        </div>

        {/* Volumetric Metrics Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-100/70 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-800">
            Cumulative Consumption &amp; Loss
          </div>
          <div className="divide-y divide-slate-100 bg-white text-xs">
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Today's Total Consumed:</span>
              <span className="font-semibold text-slate-900 font-mono">{pipeline.todayLitre.toLocaleString()} L</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Month-to-Date Volume:</span>
              <span className="font-semibold text-slate-900 font-mono">{pipeline.monthlyLitre.toLocaleString()} L</span>
            </div>
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Estimated Unaccounted Loss:</span>
              <span className={`font-mono font-bold ${pipeline.estimatedLossLitre > 100 ? 'text-amber-700' : 'text-slate-700'}`}>
                {pipeline.estimatedLossLitre.toLocaleString()} L
              </span>
            </div>
            <div className="px-4 py-2.5 flex justify-between">
              <span className="text-slate-500">Daily Baseline Limit:</span>
              <span className="font-semibold text-slate-600 font-mono">{pipeline.baselineLitrePerDay.toLocaleString()} L/day</span>
            </div>
          </div>
        </div>

        {/* Connected IoT Hardware info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-sky-600" />
            <div>
              <div className="font-semibold text-slate-800">Dual ESP32 Telemetry Nodes</div>
              <div className="text-[10px] text-slate-500 font-mono">Firmware v3.1.0-ind • RSSI -62 dBm</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ● ONLINE
          </span>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
        <button
          onClick={handleVerifyPipeline}
          disabled={verifying}
          className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition"
        >
          {verifying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Verifying Telemetry...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              VERIFY PIPELINE
            </>
          )}
        </button>

        <button
          onClick={() => selectPipeline(null)}
          className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
