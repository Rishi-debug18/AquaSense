import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Building2, Droplets, AlertTriangle, CheckCircle2, TrendingUp, 
  Layers, ArrowUpRight, ArrowDownRight, Sliders, PieChart, 
  ArrowRight, ShieldAlert, Cpu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart as RechartsPie, Pie } from 'recharts';

interface DepartmentData {
  id: string;
  name: string;
  code: string;
  percentage: number;
  currentFlowLpm: number;
  todayLitres: number;
  monthlyLitres: number;
  baselineLitresPerDay: number;
  deviationPercent: number;
  pipelineCount: number;
  sensorCount: number;
  costInr: number;
  hasLoss: boolean;
  color: string;
  description: string;
}

const DEPARTMENTS: DepartmentData[] = [
  {
    id: 'dept-prd',
    name: 'Production & Rolling Mill',
    code: 'DEPT-01',
    percentage: 42,
    currentFlowLpm: 15.23,
    todayLitres: 53950,
    monthlyLitres: 1420500,
    baselineLitresPerDay: 48000,
    deviationPercent: +12.4,
    pipelineCount: 1,
    sensorCount: 2,
    costInr: 28500,
    hasLoss: true,
    color: '#0284c7',
    description: 'Continuous billet reheating, rolling mills, hot quench cooling, and scale-washing nozzles.'
  },
  {
    id: 'dept-col',
    name: 'Cooling Towers & Heat Exchangers',
    code: 'DEPT-02',
    percentage: 27,
    currentFlowLpm: 12.38,
    todayLitres: 34680,
    monthlyLitres: 980200,
    baselineLitresPerDay: 35000,
    deviationPercent: -0.9,
    pipelineCount: 1,
    sensorCount: 2,
    costInr: 18200,
    hasLoss: false,
    color: '#0ea5e9',
    description: 'Evaporative cooling towers, furnace jacket loops, and recirculating heat exchangers.'
  },
  {
    id: 'dept-prc',
    name: 'Pickling & Chemical Processing',
    code: 'DEPT-03',
    percentage: 18,
    currentFlowLpm: 8.45,
    todayLitres: 23120,
    monthlyLitres: 645100,
    baselineLitresPerDay: 24000,
    deviationPercent: -3.6,
    pipelineCount: 1,
    sensorCount: 2,
    costInr: 12100,
    hasLoss: false,
    color: '#06b6d4',
    description: 'Acid rinse tanks, neutralization cascade, wire drawing lubrication baths.'
  },
  {
    id: 'dept-utl',
    name: 'Boiler Utilities & Steam Generation',
    code: 'DEPT-04',
    percentage: 9,
    currentFlowLpm: 4.10,
    todayLitres: 11560,
    monthlyLitres: 320400,
    baselineLitresPerDay: 11000,
    deviationPercent: +5.1,
    pipelineCount: 1,
    sensorCount: 2,
    costInr: 6050,
    hasLoss: false,
    color: '#64748b',
    description: 'High-pressure steam boilers, condensate return loops, and plant utility blowdowns.'
  },
  {
    id: 'dept-trt',
    name: 'RO Treatment & Zero Liquid Discharge',
    code: 'DEPT-05',
    percentage: 4,
    currentFlowLpm: 1.80,
    todayLitres: 5140,
    monthlyLitres: 145000,
    baselineLitresPerDay: 5000,
    deviationPercent: +2.8,
    pipelineCount: 1,
    sensorCount: 2,
    costInr: 2700,
    hasLoss: false,
    color: '#94a3b8',
    description: 'Membrane reverse osmosis, effluent recycling, and zero liquid discharge (ZLD) recovery.'
  }
];

export const DepartmentsPage: React.FC = () => {
  const { openAlertModal } = useAquaSenseStore();
  const [selectedDept, setSelectedDept] = useState<DepartmentData>(DEPARTMENTS[0]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar Facility
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              5 Production Departments
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Department-Wise Water Accounting &amp; Monitoring
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal sub-metering, baseline deviations, and departmental water cost allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Internal Water Cost</span>
            <div className="text-xl font-black font-mono text-slate-900">₹67,550 <span className="text-xs text-slate-500 font-normal">/ period</span></div>
          </div>
        </div>
      </div>

      {/* 2. Top Consumption Breakdown Chart & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Bar Chart of Department Shares */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Water Consumption by Manufacturing Department</h2>
              <p className="text-xs text-slate-500">Today's Litres &amp; Share of Total Facility Inflow</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 px-2.5 py-1 rounded border border-sky-200">
              128,450 L Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENTS} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit=" L" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} width={140} />
                <Tooltip 
                  formatter={(val: number) => [`${val.toLocaleString()} Litres`, "Today's Consumption"]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="todayLitres" radius={[0, 8, 8, 0]}>
                  {DEPARTMENTS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Internal Cost Accounting Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Internal Cost Allocation</h2>
            <p className="text-xs text-slate-500 mb-4">Proportional water tariff allocation per unit</p>

            <div className="space-y-3">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{dept.name}</span>
                    <strong className="font-mono text-slate-900">₹{dept.costInr.toLocaleString()} ({dept.percentage}%)</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${dept.percentage}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <strong>Accounting Note:</strong> Rates derived from MIDC Boisar progressive commercial slab schedule.
          </div>
        </div>

      </div>

      {/* 3. Detailed Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            onClick={() => setSelectedDept(dept)}
            className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 cursor-pointer transition ${
              selectedDept.id === dept.id ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {dept.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{dept.name}</h3>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: dept.color }}>
                {dept.percentage}% Share
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{dept.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Current Flow</span>
                <div className="text-sm font-black font-mono text-slate-900">{dept.currentFlowLpm.toFixed(2)} L/m</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Today's Vol</span>
                <div className="text-sm font-black font-mono text-slate-900">{dept.todayLitres.toLocaleString()} L</div>
              </div>
            </div>

            {/* Baseline Deviation */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Baseline Deviation:</span>
              <span className={`font-bold font-mono ${dept.deviationPercent > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {dept.deviationPercent > 0 ? `+${dept.deviationPercent}%` : `${dept.deviationPercent}%`} vs Baseline
              </span>
            </div>

            {dept.hasLoss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openAlertModal('alert-0926');
                }}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Loss Anomaly Detected (PRD-001)</span>
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
