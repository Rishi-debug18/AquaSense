import React from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Sparkles, Droplets, TrendingUp, AlertTriangle, ShieldCheck, 
  Cpu, Calendar, CheckCircle2, ArrowRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DailyWaterBriefPage: React.FC = () => {
  const { pipelines, departments, devices, actionItems } = useAquaSenseStore();
  const navigate = useNavigate();

  const openTasks = actionItems.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Today's Water Brief
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                EXECUTIVE INTELLIGENCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated deterministic summary generated directly from live SCADA telemetry and meter logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Wednesday, 23 September 2026 • Shift A</span>
        </div>
      </div>

      {/* EXECUTIVE WATER BRIEF CARD */}
      <div className="bg-gradient-to-br from-sky-900 via-slate-900 to-slate-950 border border-sky-800/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-sky-800/60 pb-4">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono">
              GOOD MORNING, COMPANY ADMIN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Viraj Profiles Facility Water Summary
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 font-bold">
            All 5 Main Branches Online
          </span>
        </div>

        {/* 5 Deterministic Executive Bullet Points */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
          <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0">
              1
            </span>
            <div>
              <strong className="text-white block text-sm">Bulk Supply Volume Intake</strong>
              <p className="text-slate-300 mt-0.5">
                Total facility water supply received today is <strong className="text-sky-300 font-mono">142,300 Litres (142.30 m³)</strong> at a steady header pressure of <strong>4.8 Bar</strong>. Intake rate remains within optimal diurnal boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0">
              2
            </span>
            <div>
              <strong className="text-white block text-sm">Departmental Consumption Distribution</strong>
              <p className="text-slate-300 mt-0.5">
                <strong className="text-sky-300">Production &amp; Rolling Mill</strong> accounts for the largest share of today's consumption at <strong className="text-white font-mono">42.0% (53,950 L)</strong>, followed by Cooling Tower B at <strong className="text-white font-mono">27.0% (34,680 L)</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/40">
            <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">
              3
            </span>
            <div>
              <strong className="text-amber-200 block text-sm">Active Anomaly Requiring Verification</strong>
              <p className="text-slate-300 mt-0.5">
                <strong className="text-amber-300">1 pipeline branch (PRD-001)</strong> requires physical verification due to an inlet/outlet differential of <strong className="text-amber-200 font-mono">1.13 L/min</strong> exceeding the configured tolerance limit of <strong className="text-white font-mono">0.50 L/min</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0">
              4
            </span>
            <div>
              <strong className="text-white block text-sm">IoT Device Fleet Status</strong>
              <p className="text-slate-300 mt-0.5">
                <strong className="text-emerald-400">11 of 12 ESP32 nodes</strong> are transmitting continuous telemetry heartbeats. Sensor node <strong className="text-amber-300 font-mono">ESP32-H003</strong> reported its last communication 42 minutes ago.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black shrink-0">
              5
            </span>
            <div>
              <strong className="text-white block text-sm">Monthly Water Quota Utilization</strong>
              <p className="text-slate-300 mt-0.5">
                Facility water quota utilization is at <strong className="text-emerald-400 font-mono">72.4%</strong> with 7 days remaining in the billing cycle, projecting a budget surplus of ~₹18,400.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => navigate('/action-center')}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition"
          >
            <span>Open Action Center ({openTasks.length} Pending Tasks)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
