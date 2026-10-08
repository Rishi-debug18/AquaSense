import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Home, Droplets, Activity, Receipt, IndianRupee, ShieldCheck, 
  Wifi, TrendingDown, Clock, AlertTriangle, LifeBuoy, FileText, 
  CheckCircle2, ArrowRight, User, PhoneCall, Send, Sparkles, Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, AreaChart, Area, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LAST_7_DAYS_CONSUMPTION = [
  { day: 'Mon', litres: 340, target: 360 },
  { day: 'Tue', litres: 362, target: 360 },
  { day: 'Wed', litres: 310, target: 360 },
  { day: 'Thu', litres: 355, target: 360 },
  { day: 'Fri', litres: 380, target: 360 },
  { day: 'Sat', litres: 410, target: 360 },
  { day: 'Sun', litres: 338.7, target: 360 },
];

export const HouseholdResidentDashboard: React.FC = () => {
  const { currentHousehold, householdBill, createSupportTicket } = useAquaSenseStore();
  const navigate = useNavigate();

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNote, setReportNote] = useState('');

  const handleReportLeakage = (e: React.FormEvent) => {
    e.preventDefault();
    createSupportTicket({
      category: 'Leakage',
      subject: `Resident Reported Water Leakage at ${currentHousehold.address}`,
      description: reportNote || 'Resident noted abnormal flow reading or visible dampness around water meter fixture.',
      userName: currentHousehold.residentName,
      location: currentHousehold.address,
      priority: 'HIGH',
      status: 'OPEN',
    });
    setShowReportModal(false);
    setReportNote('');
    toast.success('Leakage report submitted to Vangaon Municipal Water Authority.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Resident Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-sky-600" /> Resident Water Dashboard
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Household {currentHousehold.householdCode}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentHousehold.residentName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentHousehold.address} • Meter ID: <span className="font-mono text-slate-700 font-semibold">{currentHousehold.meterId}</span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Report Leakage
          </button>
          <button
            onClick={() => navigate('/accounting')}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Receipt className="w-4 h-4" />
            View Water Bill
          </button>
        </div>
      </div>

      {/* COMPARISON CALLOUT BANNER */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-sky-50 border border-emerald-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Great Job! You used 8% less water than your previous month.
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              This month: <strong>{currentHousehold.thisMonthLitre.toLocaleString()} L</strong> vs Previous month: <strong>{currentHousehold.prevMonthLitre.toLocaleString()} L</strong> (Saved 450 Litres).
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 self-start sm:self-center">
          Eco Tier Status: Efficient
        </span>
      </div>

      {/* TOP 6 HOUSEHOLD KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* KPI 1: CURRENT FLOW */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Flow</span>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 font-mono">
            {currentHousehold.currentFlowLpm.toFixed(2)} <span className="text-xs font-normal text-slate-500">L/m</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Active Fixture Stream
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full w-[45%]" />
          </div>
        </div>

        {/* KPI 2: TODAY'S CONSUMPTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Total</span>
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {currentHousehold.todayLitre.toFixed(1)} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Baseline: 360 L/day
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-[70%]" />
          </div>
        </div>

        {/* KPI 3: THIS MONTH */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">This Month</span>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {currentHousehold.thisMonthLitre.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
            -8% vs Prev Month
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[60%]" />
          </div>
        </div>

        {/* KPI 4: METER READING */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Meter Reading</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono">
            {currentHousehold.meterReadingLitre.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Cumulative Total
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-slate-400 h-full rounded-full w-full" />
          </div>
        </div>

        {/* KPI 5: BILL AMOUNT */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Current Bill</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            ₹{householdBill.totalAmount.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Due: {householdBill.dueDate}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[80%]" />
          </div>
        </div>

        {/* KPI 6: STATUS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Meter &amp; Leak</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-black text-emerald-600">
            NORMAL
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> IoT Node Online
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* TWO MAIN COLUMNS: 7-DAY CONSUMPTION & BILL SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 7-Day Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Consumption (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Litres consumed per day at Household H-102</p>
            </div>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              Avg: 356 L/day
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LAST_7_DAYS_CONSUMPTION} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  formatter={(val: any) => [`${val} Litres`, 'Consumption']}
                />
                <Bar dataKey="litres" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {LAST_7_DAYS_CONSUMPTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.day === 'Sun' ? '#0ea5e9' : '#0284c7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Water Bill Overview Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Latest Water Bill</h3>
                <p className="text-xs text-slate-500">Bill ID: {householdBill.billId} • Period: {householdBill.period}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                PAYMENT DUE
              </span>
            </div>

            {/* Slab Calculation Breakdown */}
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tariff Slab Calculation
              </div>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                {householdBill.tariffSlabs.map((s) => (
                  <div key={s.slab} className="flex justify-between pt-1.5 first:pt-0">
                    <span className="text-slate-700">{s.slab} ({s.litres} L @ ₹{s.rate}/L)</span>
                    <span className="font-mono font-bold text-slate-900">₹{s.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 text-slate-500">
                  <span>Meter Rent &amp; Sewerage Charge:</span>
                  <span className="font-mono font-semibold text-slate-700">₹{(householdBill.meterRent + householdBill.sewerageCharge).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-emerald-600">
                  <span>Total Payable:</span>
                  <span className="font-mono">₹{householdBill.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/accounting')}
              className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <FileText className="w-4 h-4" />
              Detailed Breakdown &amp; PDF
            </button>
            <button
              onClick={() => navigate('/support')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              Raise Question
            </button>
          </div>
        </div>
      </div>

      {/* REPORT LEAKAGE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Report Household Water Leakage
              </h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If you notice continuous flow while all fixtures are off, or observe physical dampness near the inlet meter, submit a report for immediate municipal field technician dispatch.
            </p>

            <form onSubmit={handleReportLeakage} className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 font-semibold block mb-1">Observation Notes / Description</label>
                <textarea
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="e.g. Meter continues to tick when main stopcock is closed..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Submit Leakage Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
