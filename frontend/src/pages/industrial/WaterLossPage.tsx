import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Building2, Droplets, AlertTriangle, CheckCircle2, ShieldAlert, 
  Wrench, ArrowRight, Sliders, RefreshCw, Layers, Check, Clock, UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaterLossPage: React.FC = () => {
  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    updatePipelineTolerance, 
    openAlertModal,
    acknowledgeAlert,
    assignAlertInspection,
    resolveAlert,
    alerts 
  } = useAquaSenseStore();

  const [toleranceVal, setToleranceVal] = useState<number>(0.50);
  const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];
  const targetAlert = alerts.find(a => a.id === 'alert-0926') || alerts[0];

  const handleToleranceChange = (newVal: number) => {
    setToleranceVal(newVal);
    updatePipelineTolerance(prdPipe.id, newVal);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar Facility
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Differential Mass-Balance Detection
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Two-Sensor Water Loss Detection &amp; Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time differential flow verification ($Q_{'{'}in{'}'} - Q_{'{'}out{'}'} = \Delta &gt; \tau$) across manufacturing branches.
          </p>
        </div>

        {/* Status Tag */}
        <div className="flex items-center gap-2">
          {prdPipe.hasActiveLoss ? (
            <div className="px-3 py-1.5 rounded-xl bg-red-100 text-red-800 border border-red-300 text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>Possible Water Loss: Production Line A</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All 5 Branches Balanced</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Mass-Balance Calculation Diagnostic Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Investigation Loop</span>
            <h2 className="text-lg font-black text-slate-900">
              Production Line A ({prdPipe.code}) — Two-Sensor Mass Balance
            </h2>
          </div>
          <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded text-slate-700 font-bold">
            Sensors: S1 (Inlet) &amp; S2 (Outlet)
          </span>
        </div>

        {/* Visual Dual Sensor Flow Schematic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* SENSOR 1: INLET */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">SENSOR 1 — INLET (S1)</span>
            <div className="text-3xl font-black font-mono text-sky-950">
              {prdPipe.inletFlowLpm.toFixed(2)} <span className="text-sm font-semibold text-sky-700">L/min</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Location: Bay 3 Header Intake</div>
          </div>

          {/* PIPELINE SECTION & DIFFERENTIAL RESULT */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-md">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DIFFERENTIAL FLOW (Δ)</span>
            <div className={`text-3xl font-black font-mono ${prdPipe.hasActiveLoss ? 'text-red-400' : 'text-emerald-400'}`}>
              {prdPipe.differenceLpm.toFixed(2)} <span className="text-sm font-semibold text-slate-300">L/min</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Configured Tolerance (τ): <strong>{toleranceVal.toFixed(2)} L/min</strong>
            </div>
          </div>

          {/* SENSOR 2: OUTLET */}
          <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-2">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">SENSOR 2 — OUTLET (S2)</span>
            <div className="text-3xl font-black font-mono text-sky-950">
              {prdPipe.outletFlowLpm.toFixed(2)} <span className="text-sm font-semibold text-sky-700">L/min</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">Location: Rolling Mill Manifold</div>
          </div>

        </div>

        {/* Evaluation Banner */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          prdPipe.hasActiveLoss
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${prdPipe.hasActiveLoss ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              <div className="font-bold text-sm">
                {prdPipe.hasActiveLoss 
                  ? '⚠ POSSIBLE WATER LOSS — REQUIRES VERIFICATION'
                  : '✓ MASS BALANCE VERIFIED — NO LOSS DETECTED'}
              </div>
              <div className="text-xs opacity-90 mt-0.5">
                {prdPipe.hasActiveLoss
                  ? `Measured difference (${prdPipe.differenceLpm.toFixed(2)} L/min) strictly exceeds configured tolerance (${toleranceVal.toFixed(2)} L/min). Physical verification required before confirmation.`
                  : `Measured delta (${prdPipe.differenceLpm.toFixed(2)} L/min) is within standard operational threshold (${toleranceVal.toFixed(2)} L/min).`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openAlertModal('alert-0926')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Open Incident Modal
            </button>
          </div>
        </div>

        {/* Tolerance Sensitivity Control Slider */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Configured Differential Tolerance Threshold:</span>
            <span className="font-mono text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-200">
              {toleranceVal.toFixed(2)} L/min
            </span>
          </div>
          <input
            type="range"
            min={0.10}
            max={2.00}
            step={0.05}
            value={toleranceVal}
            onChange={(e) => handleToleranceChange(parseFloat(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.10 L/min (High sensitivity)</span>
            <span>0.50 L/min (Standard industrial)</span>
            <span>2.00 L/min (High tolerance)</span>
          </div>
        </div>

      </div>

      {/* 3. Closed-Loop Action Workflow Lifecycle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Closed-Loop Incident Resolution Lifecycle</h2>
          <p className="text-xs text-slate-500">Standard operating procedure for industrial water loss detection and work order audit trail</p>
        </div>

        {/* Step Progression */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '1. DETECTED', desc: 'Dual-sensor delta', done: true },
            { step: '2. GENERATED', desc: 'AQ-ALERT-0926', done: true },
            { step: '3. NOTIFIED', desc: 'Plant SCADA push', done: true },
            { step: '4. ACKNOWLEDGE', desc: 'Admin review', done: targetAlert.status !== 'OPEN' },
            { step: '5. ASSIGN', desc: 'Mechanical team', done: targetAlert.status === 'IN_PROGRESS' || targetAlert.status === 'RESOLVED' },
            { step: '6. VERIFY', desc: 'Acoustic inspection', done: targetAlert.status === 'RESOLVED' },
            { step: '7. RESOLVED', desc: 'Closed-loop audit', done: targetAlert.status === 'RESOLVED' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-xl border ${
                item.done 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="text-[11px] font-black">{item.step}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Action Controls for Target Incident */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                {targetAlert.id.toUpperCase()}
              </span>
              <span className="text-sm font-bold">{targetAlert.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                STATUS: {targetAlert.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">{targetAlert.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {targetAlert.status === 'OPEN' && (
              <button
                onClick={() => {
                  acknowledgeAlert(targetAlert.id);
                  toast.success('Alert acknowledged by Plant Admin.');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Acknowledge Alert
              </button>
            )}

            {targetAlert.status === 'ACKNOWLEDGED' && (
              <button
                onClick={() => {
                  assignAlertInspection(targetAlert.id, 'Mechanical Pipe Crew', 'Vikram Jadhav');
                  toast.success('Assigned work order to Vikram Jadhav (Mechanical Crew).');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Assign Inspection Crew
              </button>
            )}

            {targetAlert.status === 'IN_PROGRESS' && (
              <button
                onClick={() => {
                  resolveAlert(targetAlert.id, 'Flange bolt retorqued. Mass balance verified normal.');
                  toast.success('Incident marked as Resolved & Closed.');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Complete &amp; Resolve Incident
              </button>
            )}

            {targetAlert.status === 'RESOLVED' && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Incident Resolved
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
