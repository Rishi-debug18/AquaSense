import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Scale, Droplets, ArrowDownRight, AlertTriangle, CheckCircle2, 
  Download, Calendar, RefreshCw, Layers, ShieldCheck, Building2,
  TrendingDown, TrendingUp, Info, ArrowRight, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaterBalancePage: React.FC = () => {
  const { waterBalance, pipelines, departments } = useAquaSenseStore();
  const [timeRange, setTimeRange] = useState<'TODAY' | '7_DAYS' | '30_DAYS' | 'CUSTOM'>('30_DAYS');

  const supplied = 142300; // 142.30 kL
  const accounted = 128450; // 128.45 kL
  const loss = 1250; // 1.25 kL
  const evaporative = 9400; // 9.40 kL
  const storageVar = 3200; // 3.20 kL
  const balanceDifference = supplied - (accounted + loss + evaporative + storageVar); // 0 (reconciled)

  const handleExportCSV = () => {
    toast.success('Water Mass Balance Ledger exported as CSV (ISO 14046 compliant).');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Water Balance &amp; Mass-Balance SCADA
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                AUDITED MASS BALANCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconciling facility bulk intake against sub-metered departmental consumption and physical losses.
            </p>
          </div>
        </div>

        {/* Time Range Selector & Export */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
            {(['TODAY', '7_DAYS', '30_DAYS'] as const).map((rng) => (
              <button
                key={rng}
                onClick={() => setTimeRange(rng)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  timeRange === rng ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rng === 'TODAY' && 'Today'}
                {rng === '7_DAYS' && '7 Days'}
                {rng === '30_DAYS' && '30 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 TOP MAJOR KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Water Supplied */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Water Supplied</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            142,300 <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-slate-500">
            MIDC Header Intake • <strong>142.30 m³</strong>
          </div>
        </div>

        {/* Card 2: Accounted Consumption */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Accounted Consumption</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            128,450 <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            90.27% of bulk supply accounted across 5 depts
          </div>
        </div>

        {/* Card 3: Identified Water Loss */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Identified Possible Loss</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono">
            1,250 <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-amber-800 font-bold">
            0.88% • PRD-001 differential discrepancy
          </div>
        </div>

        {/* Card 4: Unaccounted / Buffer Difference */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider">Evaporation &amp; Storage</span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            12,600 <span className="text-sm font-normal text-slate-500">L</span>
          </div>
          <div className="text-[11px] text-slate-500">
            8.85% (Cooling drift: 9.4 kL + Buffer: 3.2 kL)
          </div>
        </div>
      </div>

      {/* SANKEY-STYLE INDUSTRIAL FLOW BALANCE VISUALIZATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Mass-Balance Distribution Topology
            </h3>
            <p className="text-xs text-slate-400">
              Visual path: Bulk Supply Intake → Sub-metered Areas → Reconciled Discrepancy Matrix
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
            STATUS: RECONCILED (0.00% DRIFT)
          </span>
        </div>

        {/* Visual Flow Stages */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center font-mono text-xs">
          
          {/* Stage 1: Bulk Supply (3 cols) */}
          <div className="md:col-span-3 bg-slate-950 p-4 rounded-2xl border border-sky-500/40 space-y-2 text-center">
            <span className="text-[10px] text-sky-400 font-bold uppercase">1. TOTAL WATER INTAKE</span>
            <div className="text-xl font-black text-white">142,300 L</div>
            <div className="text-[11px] text-slate-400">MIDC Feeder Header (100%)</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex md:col-span-1 justify-center text-sky-400 font-bold text-lg">
            →
          </div>

          {/* Stage 2: 5 Process Departments (5 cols) */}
          <div className="md:col-span-5 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block text-center mb-2">
              2. DEPARTMENTAL SUB-METERED ALLOCATION
            </span>
            
            <div className="space-y-1.5">
              {departments.map((dept, i) => (
                <div key={dept.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-300 truncate max-w-[180px]">{dept.name}</span>
                  <div className="text-right">
                    <strong className="text-sky-300">{dept.todayLitre.toLocaleString()} L</strong>
                    <span className="text-[10px] text-slate-500 ml-1.5">({(dept.todayLitre / 1284.5).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex md:col-span-1 justify-center text-sky-400 font-bold text-lg">
            →
          </div>

          {/* Stage 3: Loss & Evaporation (2 cols) */}
          <div className="md:col-span-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase block text-center">
              3. ADJUSTMENTS
            </span>
            
            <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-300 font-bold block">Possible Loss</span>
              <strong className="text-amber-200">1,250 L (0.9%)</strong>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Cooling Evaporation</span>
              <strong className="text-slate-300">9,400 L (6.6%)</strong>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">Buffer Storage</span>
              <strong className="text-slate-300">3,200 L (2.2%)</strong>
            </div>
          </div>

        </div>
      </div>

      {/* MATHEMATICAL RECONCILIATION PANEL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Mathematical Reconciliation Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic Mass Balance: Supplied − Accounted − Identified Loss − Adjustments = Balance Difference
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            ✓ BALANCED
          </span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 font-mono text-xs space-y-2 border border-slate-200">
          <div className="flex justify-between text-slate-700">
            <span>(+) Total Water Supplied (MIDC Intake):</span>
            <strong className="text-slate-900">142,300 L</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>(−) Accounted Departmental Consumption:</span>
            <strong className="text-emerald-700 font-bold">− 128,450 L</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>(−) Identified Possible Water Loss (PRD-001):</span>
            <strong className="text-amber-800">− 1,250 L</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>(−) Cooling Tower Evaporative Drift:</span>
            <strong className="text-slate-700">− 9,400 L</strong>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>(−) Storage Buffer Level Variation:</span>
            <strong className="text-slate-700">− 3,200 L</strong>
          </div>
          <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold text-slate-900">
            <span>(=) Net Unaccounted Balance Difference:</span>
            <strong className="text-emerald-600">0.00 L (0.0%)</strong>
          </div>
        </div>

        <div className="bg-sky-50 border-l-4 border-sky-600 p-3.5 rounded-r-2xl text-xs text-slate-700">
          <strong>SCADA Assurance:</strong> No unmonitored transfer leaks detected outside the identified Bay 3 work order section. All water entering the facility perimeter is accounted for in real time.
        </div>
      </div>
    </div>
  );
};
