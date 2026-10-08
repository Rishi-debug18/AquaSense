import React, { useState, useMemo } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  BarChart3, TrendingUp, AlertTriangle, Droplets, Calendar, 
  Clock, Activity, ArrowUpRight, ArrowDownRight, Filter, Download, 
  Info, Building2, Layers, CheckCircle2, ChevronDown, Sparkles, Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, 
  YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area, Cell 
} from 'recharts';
import toast from 'react-hot-toast';

// 1. REALTIME (1 Hz telemetry data points)
const REALTIME_TELEMETRY = [
  { time: '18:25', prd: 15.21, col: 12.40, prc: 9.15, utl: 8.20, rec: 4.10, total: 49.06 },
  { time: '18:26', prd: 15.25, col: 12.38, prc: 9.14, utl: 8.19, rec: 4.08, total: 49.04 },
  { time: '18:27', prd: 15.30, col: 12.42, prc: 9.16, utl: 8.21, rec: 4.12, total: 49.21 },
  { time: '18:28', prd: 15.22, col: 12.39, prc: 9.15, utl: 8.20, rec: 4.09, total: 49.05 },
  { time: '18:29', prd: 15.28, col: 12.41, prc: 9.15, utl: 8.18, rec: 4.11, total: 49.13 },
  { time: '18:30', prd: 15.23, col: 12.40, prc: 9.15, utl: 8.20, rec: 4.10, total: 49.08 },
  { time: '18:31', prd: 15.31, col: 12.38, prc: 9.14, utl: 8.22, rec: 4.09, total: 49.14 },
  { time: '18:32', prd: 15.23, col: 12.40, prc: 9.15, utl: 8.20, rec: 4.10, total: 49.08 },
];

// 2. DAILY (24-Hour hourly profile for today)
const HOURLY_24H_DATA = [
  { hour: '00:00', litres: 3750, yesterday: 3600, baseline: 3500, peak: false },
  { hour: '02:00', litres: 3350, yesterday: 3400, baseline: 3500, peak: false },
  { hour: '04:00', litres: 3500, yesterday: 3450, baseline: 3500, peak: false },
  { hour: '06:00', litres: 5200, yesterday: 5000, baseline: 4800, peak: false },
  { hour: '08:00', litres: 5800, yesterday: 5500, baseline: 5200, peak: false },
  { hour: '10:00', litres: 6450, yesterday: 6100, baseline: 5600, peak: false },
  { hour: '12:00', litres: 7050, yesterday: 6800, baseline: 6000, peak: false },
  { hour: '14:00', litres: 7200, yesterday: 6900, baseline: 6200, peak: false },
  { hour: '16:00', litres: 7680, yesterday: 7100, baseline: 6400, peak: true }, // Peak hour
  { hour: '18:00', litres: 7500, yesterday: 7200, baseline: 6200, peak: false },
  { hour: '20:00', litres: 5500, yesterday: 5300, baseline: 5000, peak: false },
  { hour: '22:00', litres: 4100, yesterday: 3950, baseline: 4000, peak: false },
];

// 3. WEEKLY (7-Day aggregation Mon-Sun)
const WEEKLY_7DAYS_DATA = [
  { day: 'Mon', litres: 8420, prevWeek: 7900, baseline: 8000, cost: 578.62 },
  { day: 'Tue', litres: 8650, prevWeek: 8100, baseline: 8000, cost: 594.43 },
  { day: 'Wed', litres: 8900, prevWeek: 8350, baseline: 8000, cost: 611.61 },
  { day: 'Thu', litres: 8750, prevWeek: 8200, baseline: 8000, cost: 601.30 },
  { day: 'Fri', litres: 9450, prevWeek: 8700, baseline: 8000, cost: 649.40 }, // Peak day
  { day: 'Sat', litres: 7620, prevWeek: 7200, baseline: 7500, cost: 523.65 },
  { day: 'Sun', litres: 6630, prevWeek: 5730, baseline: 6500, cost: 455.61 }, // Lowest day
];

// 4. MONTHLY (30-Day day-by-day and 6-month historical aggregation)
const MONTHLY_30DAYS_DATA = [
  { day: '01 Sep', litres: 8120, prevMonth: 7800 },
  { day: '05 Sep', litres: 8350, prevMonth: 7950 },
  { day: '10 Sep', litres: 8640, prevMonth: 8100 },
  { day: '15 Sep', litres: 8290, prevMonth: 8050 },
  { day: '20 Sep', litres: 8780, prevMonth: 8200 },
  { day: '25 Sep', litres: 8642, prevMonth: 8120 },
  { day: '30 Sep', litres: 8420, prevMonth: 7950 },
];

const DEPARTMENT_OPTIONS = [
  { id: 'ALL', name: 'All Areas (Whole Plant)', factor: 1.0 },
  { id: 'PRD', name: 'Production & Rolling Mill', factor: 0.42 },
  { id: 'COL', name: 'Cooling Tower B', factor: 0.27 },
  { id: 'PRC', name: 'Chemical Processing', factor: 0.18 },
  { id: 'UTL', name: 'Boiler & Utilities', factor: 0.09 },
  { id: 'REC', name: 'RO & ZLD Recycle', factor: 0.04 },
];

export const ConsumptionAnalyticsPage: React.FC = () => {
  const { departments } = useAquaSenseStore();
  const [timeRange, setTimeRange] = useState<'REALTIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const deptObj = DEPARTMENT_OPTIONS.find(d => d.id === selectedDept) || DEPARTMENT_OPTIONS[0];
  const factor = deptObj.factor;

  // Filtered data based on department factor
  const filteredHourlyData = useMemo(() => {
    return HOURLY_24H_DATA.map(d => ({
      ...d,
      litres: Math.round(d.litres * factor),
      yesterday: Math.round(d.yesterday * factor),
      baseline: Math.round(d.baseline * factor),
    }));
  }, [factor]);

  const filteredWeeklyData = useMemo(() => {
    return WEEKLY_7DAYS_DATA.map(d => ({
      ...d,
      litres: Math.round(d.litres * factor),
      prevWeek: Math.round(d.prevWeek * factor),
      baseline: Math.round(d.baseline * factor),
      cost: Number((d.cost * factor).toFixed(2)),
    }));
  }, [factor]);

  const filteredMonthlyData = useMemo(() => {
    return MONTHLY_30DAYS_DATA.map(d => ({
      ...d,
      litres: Math.round(d.litres * factor),
      prevMonth: Math.round(d.prevMonth * factor),
    }));
  }, [factor]);

  // Aggregate metrics
  const totalWeeklyLitre = filteredWeeklyData.reduce((acc, curr) => acc + curr.litres, 0);
  const prevWeeklyLitre = filteredWeeklyData.reduce((acc, curr) => acc + curr.prevWeek, 0);
  const weeklyChangePct = (((totalWeeklyLitre - prevWeeklyLitre) / prevWeeklyLitre) * 100).toFixed(1);

  const totalMonthlyLitre = Math.round(248450 * factor);
  const prevMonthlyLitre = Math.round(231200 * factor);
  const monthlyChangePct = (((totalMonthlyLitre - prevMonthlyLitre) / prevMonthlyLitre) * 100).toFixed(1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Title & Filter Selectors */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              High Resolution SCADA
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Simulated Data
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Water Consumption &amp; Flow Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-timeframe volumetric trends, period-over-period comparisons, peak hours, and department distribution
          </p>
        </div>

        {/* Control Bar: Department Dropdown + Timeframe Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Department Filter Dropdown */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <span className="text-slate-500 font-semibold mr-2">Area:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              {DEPARTMENT_OPTIONS.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timeRange === range ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range.charAt(0) + range.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* MULTI-PERIOD SUMMARY KPI CARDS (DYNAMICALLY CALCULATED)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Primary Consumption Metric */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {timeRange === 'REALTIME' && 'Current Flow Rate'}
            {timeRange === 'DAILY' && 'Today\'s Total Volume'}
            {timeRange === 'WEEKLY' && '7-Day Weekly Volume'}
            {timeRange === 'MONTHLY' && 'Current Month Volume'}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {timeRange === 'REALTIME' && `${(49.08 * factor).toFixed(2)} L/min`}
            {timeRange === 'DAILY' && `${Math.round(8642 * factor).toLocaleString()} L`}
            {timeRange === 'WEEKLY' && `${totalWeeklyLitre.toLocaleString()} L`}
            {timeRange === 'MONTHLY' && `${totalMonthlyLitre.toLocaleString()} L`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Scope: <strong>{deptObj.name}</strong></span>
          </div>
        </div>

        {/* Card 2: Period-over-Period Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {timeRange === 'REALTIME' && 'Flow Stability'}
            {timeRange === 'DAILY' && 'Day-over-Day (DoD)'}
            {timeRange === 'WEEKLY' && 'Week-over-Week (WoW)'}
            {timeRange === 'MONTHLY' && 'Month-over-Month (MoM)'}
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1 flex items-center gap-1.5">
            {timeRange === 'REALTIME' && '±0.12%'}
            {timeRange === 'DAILY' && '+6.4%'}
            {timeRange === 'WEEKLY' && `+${weeklyChangePct}%`}
            {timeRange === 'MONTHLY' && `+${monthlyChangePct}%`}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {timeRange === 'REALTIME' && 'Nominal continuous flow'}
              {timeRange === 'DAILY' && 'vs yesterday (8,120 L)'}
              {timeRange === 'WEEKLY' && `vs prev week (${prevWeeklyLitre.toLocaleString()} L)`}
              {timeRange === 'MONTHLY' && `vs Aug (${prevMonthlyLitre.toLocaleString()} L)`}
            </span>
          </div>
        </div>

        {/* Card 3: Peak / Extreme Consumption */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {timeRange === 'REALTIME' && 'Peak Active Line'}
            {timeRange === 'DAILY' && 'Peak Usage Window'}
            {timeRange === 'WEEKLY' && 'Highest Consumption Day'}
            {timeRange === 'MONTHLY' && 'Daily Average Intake'}
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {timeRange === 'REALTIME' && 'Rolling Mill A'}
            {timeRange === 'DAILY' && '16:00 – 17:00'}
            {timeRange === 'WEEKLY' && `Friday (${Math.round(9450 * factor).toLocaleString()} L)`}
            {timeRange === 'MONTHLY' && `${Math.round(8282 * factor).toLocaleString()} L/day`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {timeRange === 'REALTIME' && '15.23 L/min (42% share)'}
            {timeRange === 'DAILY' && `Surge: ${Math.round(7680 * factor)} L/h`}
            {timeRange === 'WEEKLY' && `Lowest: Sunday (${Math.round(6630 * factor).toLocaleString()} L)`}
            {timeRange === 'MONTHLY' && '30-day smoothed mean'}
          </div>
        </div>

        {/* Card 4: Estimated Water Cost Impact */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {timeRange === 'REALTIME' && 'Active Tariff'}
            {timeRange === 'DAILY' && 'Today\'s Water Cost'}
            {timeRange === 'WEEKLY' && '7-Day Water Cost'}
            {timeRange === 'MONTHLY' && 'Monthly Incurred Cost'}
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {timeRange === 'REALTIME' && '₹68.72 / kL'}
            {timeRange === 'DAILY' && `₹${(68.72 * factor).toFixed(2)}`}
            {timeRange === 'WEEKLY' && `₹${Math.round(totalWeeklyLitre * 0.06872).toLocaleString()}`}
            {timeRange === 'MONTHLY' && `₹${Math.round(totalMonthlyLitre * 0.06872).toLocaleString()}`}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            MIDC Industrial Tariff Rate
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* PRIMARY TIME SERIES CHART (ADAPTS ACCORDING TO TIMEFRAME & DEPARTMENT)     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span>Water Flow &amp; Consumption Trend</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {timeRange === 'REALTIME' && 'Live 1-minute telemetry stream (L/min) across dual-sensor node points'}
              {timeRange === 'DAILY' && '24-hour diurnal consumption curve (Litres) vs yesterday & baseline'}
              {timeRange === 'WEEKLY' && '7-day daily aggregation (Mon–Sun) with period-over-period comparison'}
              {timeRange === 'MONTHLY' && '30-day cumulative consumption history & month-over-month trajectory'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-sky-600 font-semibold">
              <span className="w-3 h-1 bg-sky-600 rounded" /> Current Period
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <span className="w-3 h-1 bg-slate-400 stroke-dashed rounded" /> Prior / Baseline
            </span>
            <button
              onClick={() => toast.success('Exporting consumption time-series data to CSV...')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <Download className="w-3 h-3" /> Export
            </button>
          </div>
        </div>

        {/* Dynamic Charts Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {timeRange === 'REALTIME' ? (
              <LineChart data={REALTIME_TELEMETRY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" L/m" domain={[0, 60]} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {selectedDept === 'ALL' ? (
                  <>
                    <Line type="monotone" dataKey="total" name="Total Plant Inflow" stroke="#0284c7" strokeWidth={3} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="prd" name="Production Mill" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="col" name="Cooling Tower" stroke="#10b981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="prc" name="Processing" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="utl" name="Boiler Utilities" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </>
                ) : (
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name={`${deptObj.name} (L/min)`} 
                    stroke="#0284c7" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                  />
                )}
              </LineChart>
            ) : timeRange === 'DAILY' ? (
              <AreaChart data={filteredHourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any, name: string) => [`${v.toLocaleString()} Litres`, name === 'litres' ? 'Today (L)' : name === 'yesterday' ? 'Yesterday (L)' : 'Baseline (L)']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="litres" name="Today's Hourly Flow" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHourly)" />
                <Line type="monotone" dataKey="yesterday" name="Yesterday Profile" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline" name="Configured Baseline" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
              </AreaChart>
            ) : timeRange === 'WEEKLY' ? (
              <BarChart data={filteredWeeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any, name: string) => [`${v.toLocaleString()} Litres`, name === 'litres' ? 'This Week (L)' : 'Last Week (L)']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="litres" name="This Week (L)" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="prevWeek" name="Last Week (L)" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={filteredMonthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: any, name: string) => [`${v.toLocaleString()} Litres`, name === 'litres' ? 'September 2026' : 'August 2026']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="litres" name="Current Month (Sep 2026)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMonthly)" />
                <Line type="monotone" dataKey="prevMonth" name="Prior Month (Aug 2026)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TWO-COLUMN LOWER SECTION: AREA BREAKDOWN & BASELINE DETECTION              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Consumption by Area Proportion */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Facility Consumption Distribution</h3>
              <p className="text-xs text-slate-500">Volumetric partition across 5 key manufacturing units</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700">
              100% Accounted
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {DEPARTMENT_OPTIONS.filter(d => d.id !== 'ALL').map((item) => {
              const sharePct = Math.round(item.factor * 100);
              const volLitre = Math.round(128450 * item.factor);
              const isSelected = selectedDept === item.id;
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedDept(item.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected 
                      ? 'bg-sky-50/70 border-sky-300 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {sharePct}% • {volLitre.toLocaleString()} L/day
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-sky-600"
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIGH USAGE MONITORING & DETERMINISTIC BASELINE ENGINE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Baseline Threshold Monitoring</h3>
                <p className="text-xs text-slate-500">Deterministic rule-based variance against nominal engineering limits</p>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Active Anomaly
              </span>
            </div>

            {/* High Usage Detection Alert Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Production &amp; Rolling Mill — HIGH USAGE DETECTED
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  +31.3% Deviation
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Measured Volume</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">9,850 <span className="text-xs font-normal text-slate-500">L/day</span></span>
                </div>
                <div className="bg-white border border-amber-200 rounded-lg p-2.5">
                  <span className="text-slate-500 block text-[10px] uppercase">Configured Baseline</span>
                  <span className="text-lg font-bold text-slate-700 font-mono">7,500 <span className="text-xs font-normal text-slate-500">L/day</span></span>
                </div>
              </div>

              <div className="text-[11px] text-amber-900 leading-relaxed">
                Status: <strong className="text-amber-800 font-bold">ABOVE BASELINE THRESHOLD</strong>. Measured daily flow exceeded nominal engineering baseline by 2,350 Litres. Requires valve check on Header Bay 3.
              </div>
            </div>
          </div>

          {/* Architecture Transparency Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
              <Info className="w-3.5 h-3.5 text-sky-600" /> Detection Engine Rationale
            </div>
            <p className="text-[11px] leading-relaxed">
              Detection is deterministic: computed from dual-sensor telemetry variance and configured operational baselines. No artificial claims of black-box ML are made for arithmetic threshold math.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
