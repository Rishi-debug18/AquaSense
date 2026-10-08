import React, { useState, useEffect } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { LeafletPipelineMap } from '../../components/map/LeafletPipelineMap';
import { InteractiveWaterNetwork } from '../../components/pipeline/InteractiveWaterNetwork';
import { 
  Droplets, AlertTriangle, CheckCircle2, Activity, Cpu, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, FileText, 
  RefreshCw, TrendingUp, BarChart2, Check, ArrowRight, Gauge,
  Radio, Zap, Compass, Filter, Sparkles, Building2, MapPin,
  Layers, Sliders, UserCheck, Wrench, ChevronRight, Info, Eye,
  Landmark, MessageSquare, Send, Bot, HelpCircle, Scale, Flame,
  Calculator, User, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Cell, AreaChart, Area, Line, Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AREA_DISTRIBUTION_DATA = [
  { name: 'Production & Rolling Mill', value: 42, color: '#0284c7', litres: 53950, budget: 65000 },
  { name: 'Cooling Tower B', value: 27, color: '#0ea5e9', litres: 34680, budget: 43000 },
  { name: 'Chemical Processing', value: 18, color: '#06b6d4', litres: 23120, budget: 28000 },
  { name: 'Boiler & Utilities', value: 9, color: '#64748b', litres: 11560, budget: 15000 },
  { name: 'RO & ZLD Recycle', value: 4, color: '#10b981', litres: 5140, budget: 6500 },
];

const DIURNAL_24H_DATA = [
  { time: '00:00', inflow: 3800, consumed: 3750, loss: 50 },
  { time: '02:00', inflow: 3400, consumed: 3350, loss: 50 },
  { time: '04:00', inflow: 3600, consumed: 3500, loss: 100 },
  { time: '06:00', inflow: 5800, consumed: 5200, loss: 600 },
  { time: '08:00', inflow: 6400, consumed: 5800, loss: 600 },
  { time: '10:00', inflow: 7200, consumed: 6450, loss: 750 },
  { time: '12:00', inflow: 7900, consumed: 7050, loss: 850 },
  { time: '14:00', inflow: 8100, consumed: 7200, loss: 900 },
  { time: '16:00', inflow: 8642, consumed: 7680, loss: 962 },
  { time: '18:00', inflow: 8400, consumed: 7500, loss: 900 },
  { time: '20:00', inflow: 6100, consumed: 5500, loss: 600 },
  { time: '22:00', inflow: 4500, consumed: 4100, loss: 400 },
];

export const IndustrialDashboard: React.FC = () => {
  const { 
    industrialKpis, 
    pipelines, 
    alerts, 
    actionItems,
    departments,
    devices,
    selectedPipelineId, 
    selectPipeline, 
    openAlertModal, 
    updatePipelineTolerance, 
    startTour,
    acknowledgeActionItem,
    assignActionItem,
    resolveActionItem
  } = useAquaSenseStore();

  const navigate = useNavigate();
  const [liveTime, setLiveTime] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];
  const pendingActions = actionItems.filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HEADER: BRANDING, STATUS & GLOBAL SHORTCUTS                           */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> AquaSense Industrial Water SCADA
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              DEMO ENVIRONMENT
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {liveTime ? `${liveTime} IST` : '18:32:45 IST'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Viraj Profiles — Boisar Facility
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manufacturing &amp; Rolling Plant • Central Industrial Water Operations Dashboard • Connection AQ-CONN-001
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/digital-twin')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Twin</span>
          </button>

          <button
            onClick={() => navigate('/water-balance')}
            className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Water Balance</span>
          </button>

          <button
            onClick={startTour}
            className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Min Tour</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP 6 KPI CARDS                                                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Water Supplied</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">142,300 <span className="text-xs font-normal text-slate-500">L</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Today • MIDC Header</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-sky-600 h-1.5 rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Water Consumed</span>
            <Activity className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">128,450 <span className="text-xs font-normal text-slate-500">L</span></div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> -7.7% vs baseline
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: '74%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Current Flow</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {prdPipe.inletFlowLpm.toFixed(2)} <span className="text-xs font-normal text-slate-500">L/min</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Live • Feeder Line</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '62%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Water Cost</span>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">INR</span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">₹68.72</div>
          <div className="text-[11px] text-slate-500 mt-1">Current period (1,234 L)</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '38%' }} />
          </div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/20 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Possible Loss</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700 font-mono">1,250 <span className="text-xs font-normal text-amber-600">L</span></div>
          <div className="text-[11px] text-amber-800 font-semibold mt-1">Requires verification</div>
          <div className="w-full bg-amber-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '22%' }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Devices</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">12 / 12</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Online Nodes</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SECOND SECTION: INTERACTIVE WATER NETWORK + TODAY'S WATER BRIEF        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT 7 COLS: INTERACTIVE WATER NETWORK */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                Live Hydraulic SCADA Network
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mass-balance dual-sensor telemetry across all 5 plant pipeline branches
              </p>
            </div>
            <button
              onClick={() => navigate('/digital-twin')}
              className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Full Digital Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <InteractiveWaterNetwork compact={true} />
          </div>
        </div>

        {/* RIGHT 5 COLS: TODAY'S WATER BRIEF & EXECUTIVE INTELLIGENCE */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-sky-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> TODAY'S WATER BRIEF
              </span>
              <span className="text-[10px] font-mono bg-sky-900/60 px-2 py-0.5 rounded text-sky-200">
                Shift A • Automated
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
                <strong className="text-white block">Intake &amp; Pressure:</strong>
                <span className="text-slate-300">142,300 L received today at nominal 4.8 Bar feeder pressure.</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
                <strong className="text-white block">Highest Consumer:</strong>
                <span className="text-slate-300">Production &amp; Rolling Mill (53,950 L • 42.0% of facility volume).</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 space-y-0.5">
                <strong className="text-amber-300 block flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Discrepancy Flag:
                </strong>
                <span className="text-amber-100">PRD-001 has 1.13 L/min differential (&gt; 0.50 L/m tolerance). Inspection required.</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-0.5">
                <strong className="text-white block">Quota Status:</strong>
                <span className="text-emerald-400 font-semibold">72.4% utilization with 7 days remaining in cycle.</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/daily-brief')}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <span>View Full Daily Water Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. THIRD SECTION: WATER BALANCE RECONCILIATION + CONSUMPTION + COST       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 7 Cols: Water Balance & Flow Reconciliation */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-600" />
                Water Mass-Balance Reconciliation
              </h3>
              <p className="text-xs text-slate-500">Supplied (142.3 kL) − Consumed (128.45 kL) − Loss (1.25 kL) = Reconciled</p>
            </div>
            <button
              onClick={() => navigate('/water-balance')}
              className="text-xs text-sky-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Balance Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
              <span className="text-[10px] text-sky-800 uppercase font-bold block">Water Supplied</span>
              <div className="text-lg font-black text-sky-950 mt-1">142,300 L</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Accounted Flow</span>
              <div className="text-lg font-black text-emerald-950 mt-1">128,450 L</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] text-amber-800 uppercase font-bold block">Possible Loss</span>
              <div className="text-lg font-black text-amber-950 mt-1">1,250 L</div>
            </div>
          </div>

          {/* Diurnal Trend Preview */}
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DIURNAL_24H_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowDash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="inflow" name="Inflow (L/h)" stroke="#0284c7" strokeWidth={2} fill="url(#inflowDash)" />
                <Area type="monotone" dataKey="consumed" name="Consumed (L/h)" stroke="#10b981" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Water Cost Simulator Quick Preview */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  Water Cost &amp; Savings Simulator
                </h3>
                <p className="text-xs text-slate-500">Model financial impact of demand reduction</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                ₹68.72 / kL
              </span>
            </div>

            <div className="space-y-3 pt-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                <span className="text-slate-600">Current Monthly Bill:</span>
                <strong className="font-mono text-base text-slate-900">₹264,812</strong>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="text-emerald-800 font-bold block">Target: −10% Conservation</span>
                  <span className="text-[10px] text-slate-500">Projected savings</span>
                </div>
                <strong className="font-mono text-lg text-emerald-700 font-black">₹26,481 /mo</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/cost-simulator')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Scenario Cost Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. FOURTH SECTION: WATER LOSS HEATMAP + ACTION CENTER TASKS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 6 Cols: Water Loss Heatmap Link Card */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600" />
                  Water Loss Spatial Heatmap
                </h3>
                <p className="text-xs text-slate-500">GIS spatial mapping of physical discrepancy pins</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                1 Active Anomaly
              </span>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-amber-900">PRD-001 • Bay 3 Hot Rolling Header</span>
                <span className="text-[10px] font-mono font-black text-red-600">Δ 1.13 L/min</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Inlet sensor ESP32-H002 vs Outlet ESP32-H002B discrepancy exceeds 0.50 L/min tolerance threshold.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/loss-heatmap')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Spatial Heatmap Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right 6 Cols: Action Center Task Queue */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Action Center ({pendingActions.length} Pending Tasks)
                </h3>
                <p className="text-xs text-slate-500">Closed-loop field maintenance &amp; inspection assignments</p>
              </div>
              <button
                onClick={() => navigate('/action-center')}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                All Actions →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {pendingActions.slice(0, 2).map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                        {item.priority}
                      </span>
                      <strong className="text-slate-900">{item.title}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{item.recommendedAction}</p>
                  </div>

                  <button
                    onClick={() => {
                      resolveActionItem(item.id);
                      toast.success(`Task ${item.taskCode} resolved`);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-700 shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/action-center')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <span>Manage All Closed-Loop Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 6. FIFTH SECTION: DEPARTMENT BREAKDOWN + DEVICE FLEET HEALTH + BUDGETS    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Department Consumption & Budget Utilization */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Consumption &amp; Monthly Water Budget
              </h3>
              <p className="text-xs text-slate-500">Sub-metered breakdown across 5 production units</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs text-sky-600 font-bold hover:underline"
            >
              Departments Page →
            </button>
          </div>

          <div className="space-y-3">
            {AREA_DISTRIBUTION_DATA.map((dept, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{dept.name}</span>
                  <div className="font-mono text-slate-700">
                    <strong className="text-slate-900">{dept.litres.toLocaleString()} L</strong> / {dept.budget.toLocaleString()} L ({((dept.litres / dept.budget) * 100).toFixed(0)}%)
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (dept.litres / dept.budget) * 100)}%`, backgroundColor: dept.color }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Fleet Status & Diagnostics */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">IoT Device Fleet</h3>
                <p className="text-xs text-slate-500">12 ESP32 SCADA nodes online</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">Heartbeat Rate:</span>
                <strong className="font-mono text-slate-900">1 Hz Continuous</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">Average RSSI Signal:</span>
                <strong className="font-mono text-emerald-700">-58 dBm (Strong)</strong>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-slate-600">Firmware Fleet:</span>
                <strong className="font-mono text-slate-800">v3.1.0-ind (Latest)</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/devices')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition"
          >
            Manage Device Fleet
          </button>
        </div>

      </div>

    </div>
  );
};
