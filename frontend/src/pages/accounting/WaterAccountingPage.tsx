import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Receipt, IndianRupee, Calculator, Download, Printer, 
  FileText, CheckCircle2, Sliders, Info, ShieldCheck, ArrowRight,
  TrendingDown, Sparkles, Building2, Calendar, CreditCard,
  AlertCircle, History, Filter, ArrowUpRight, BarChart3, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaterAccountingPage: React.FC = () => {
  const { currentRole, industrialAccounting, householdBill, departments } = useAquaSenseStore();
  
  // Navigation tabs for Consolidated Water Accounting & Cost module
  const [activeTab, setActiveTab] = useState<'USAGE_COST' | 'BILLING' | 'SIMULATOR' | 'HISTORY'>('USAGE_COST');

  // Interactive tariff calculator state (Usage tab)
  const [calcVolume, setCalcVolume] = useState<number>(1234);

  // Simulator state (Simulator tab)
  const [reductionPercent, setReductionPercent] = useState<number>(10);

  // History filter state
  const [historyPeriod, setHistoryPeriod] = useState<'ALL' | 'MONTHLY' | 'WEEKLY' | 'DAILY'>('ALL');

  // Slab calculation logic for Usage tab
  const calculateCost = (vol: number) => {
    let remaining = vol;
    let slab1Vol = Math.min(remaining, 1000);
    let slab1Cost = slab1Vol * 0.05;
    remaining -= slab1Vol;

    let slab2Vol = Math.min(remaining, 1000);
    let slab2Cost = slab2Vol * 0.08;
    remaining -= slab2Vol;

    let slab3Vol = Math.max(0, remaining);
    let slab3Cost = slab3Vol * 0.12;

    return {
      slab1Vol, slab1Cost,
      slab2Vol, slab2Cost,
      slab3Vol, slab3Cost,
      total: slab1Cost + slab2Cost + slab3Cost,
    };
  };

  const calculated = calculateCost(calcVolume);

  // Base numbers for MIDC Boisar facility monthly billing & simulation
  const currentMonthlyLitre = 3853500; // 3,853.50 kL
  const tariffPerThousandLitre = 68.72; // ₹68.72 per 1,000 L (MIDC Boisar industrial tariff)
  const currentMonthlyCost = (currentMonthlyLitre / 1000) * tariffPerThousandLitre; // ₹264,812.52
  const fixedConnectionCess = 8500.00;
  const totalBillAmount = currentMonthlyCost + fixedConnectionCess;

  // Simulator calculations
  const projectedMonthlyLitre = currentMonthlyLitre * (1 - reductionPercent / 100);
  const projectedMonthlyCost = (projectedMonthlyLitre / 1000) * tariffPerThousandLitre;
  const estimatedSavingsInr = currentMonthlyCost - projectedMonthlyCost;
  const annualSavingsInr = estimatedSavingsInr * 12;

  // Sample historical ledger records
  const historicalLedger = [
    { id: 'REC-2026-09', period: '01 Sep 2026 – 30 Sep 2026', type: 'Monthly', opening: '8,450 L', closing: '9,684 L', consumption: '3,853,500 L', rate: '₹68.72 / kL', cost: '₹273,312.52', status: 'DUE', invoiceNo: 'AQ-BILL-2026-0930' },
    { id: 'REC-2026-08', period: '01 Aug 2026 – 31 Aug 2026', type: 'Monthly', opening: '7,120 L', closing: '8,450 L', consumption: '3,680,200 L', rate: '₹68.72 / kL', cost: '₹261,398.24', status: 'PAID', invoiceNo: 'AQ-BILL-2026-0831' },
    { id: 'REC-2026-07', period: '01 Jul 2026 – 31 Jul 2026', type: 'Monthly', opening: '5,800 L', closing: '7,120 L', consumption: '3,912,000 L', rate: '₹68.72 / kL', cost: '₹277,332.64', status: 'PAID', invoiceNo: 'AQ-BILL-2026-0731' },
    { id: 'REC-2026-W38', period: '15 Sep 2026 – 21 Sep 2026', type: 'Weekly', opening: '9,120 L', closing: '9,450 L', consumption: '892,400 L', rate: '₹68.72 / kL', cost: '₹61,325.73', status: 'SETTLED', invoiceNo: 'AUD-2026-W38' },
    { id: 'REC-2026-W37', period: '08 Sep 2026 – 14 Sep 2026', type: 'Weekly', opening: '8,790 L', closing: '9,120 L', consumption: '884,100 L', rate: '₹68.72 / kL', cost: '₹60,755.35', status: 'SETTLED', invoiceNo: 'AUD-2026-W37' },
    { id: 'REC-2026-D26', period: '25 Sep 2026', type: 'Daily', opening: '9,560 L', closing: '9,684 L', consumption: '128,450 L', rate: 'Tier Slabs', cost: '₹68.72', status: 'VERIFIED', invoiceNo: 'DAY-2026-0925' },
    { id: 'REC-2026-D25', period: '24 Sep 2026', type: 'Daily', opening: '9,430 L', closing: '9,560 L', consumption: '131,200 L', rate: 'Tier Slabs', cost: '₹70.15', status: 'VERIFIED', invoiceNo: 'DAY-2026-0924' },
  ];

  const filteredLedger = historyPeriod === 'ALL' 
    ? historicalLedger 
    : historicalLedger.filter(item => item.type.toUpperCase() === historyPeriod);

  const handleDownloadPdf = () => {
    toast.success('Generating Water Accounting & Billing PDF report...');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Viraj Profiles — Boisar
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Connection: AQ-CONN-001
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Demo Data
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Water Accounting &amp; Cost Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated industrial volumetric cost allocation, supplier billing, what-if savings simulator, and financial history ledger
          </p>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('USAGE_COST')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'USAGE_COST' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-sky-600" />
            <span>Usage &amp; Cost</span>
          </button>

          <button
            onClick={() => setActiveTab('BILLING')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'BILLING' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-sky-600" />
            <span>Supplier Billing</span>
          </button>

          <button
            onClick={() => setActiveTab('SIMULATOR')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'SIMULATOR' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cost Simulation</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>History Ledger</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USAGE & COST (VOLUMETRIC PROGRESSIVE SLAB ACCOUNTING)               */}
      {/* ========================================================================= */}
      {activeTab === 'USAGE_COST' && (
        <div className="space-y-6">
          
          {/* Main Accounting Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Viraj Profiles — Boisar Facility
                </span>
                <h2 className="text-xl font-bold text-slate-900">Current Period Water Usage Accounting</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accounting Cycle: <strong className="text-slate-700">{industrialAccounting.periodStart} – {industrialAccounting.periodEnd}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  DEMO CALCULATION • CONFIGURABLE TARIFF
                </span>
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-sky-600" /> Print / PDF
                </button>
              </div>
            </div>

            {/* Meter Reading Math Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Opening Reading</span>
                <div className="text-2xl font-mono font-bold text-slate-800 mt-1">
                  {industrialAccounting.openingReadingLitre.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">01 Sep 2026, 00:00</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Closing Reading</span>
                <div className="text-2xl font-mono font-bold text-slate-800 mt-1">
                  {industrialAccounting.closingReadingLitre.toLocaleString()} <span className="text-xs font-normal text-slate-500">L</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">30 Sep 2026, 23:59</div>
              </div>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-200">
                <span className="text-[10px] font-bold text-sky-700 uppercase">Net Billed Consumption</span>
                <div className="text-2xl font-mono font-bold text-sky-900 mt-1">
                  {industrialAccounting.totalConsumptionLitre.toLocaleString()} <span className="text-xs font-normal text-sky-700">L</span>
                </div>
                <div className="text-[11px] text-sky-600 mt-1 font-mono font-semibold">
                  9,684 − 8,450 = 1,234 L
                </div>
              </div>
            </div>

            {/* Slabs Breakdown Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Progressive Tariff Slab Calculation</h3>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600">
                    <tr>
                      <th className="py-2.5 px-4">Tariff Tier</th>
                      <th className="py-2.5 px-4">Volume Sliced</th>
                      <th className="py-2.5 px-4">Rate (₹/Litre)</th>
                      <th className="py-2.5 px-4 text-right">Computed Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">Tier 1: 0 – 1,000 L</td>
                      <td className="py-3 px-4 font-mono text-slate-600">1,000 L</td>
                      <td className="py-3 px-4 font-mono text-slate-600">₹0.05 / L</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">₹50.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-semibold text-slate-800">Tier 2: 1,001 – 2,000 L</td>
                      <td className="py-3 px-4 font-mono text-slate-600">234 L</td>
                      <td className="py-3 px-4 font-mono text-slate-600">₹0.08 / L</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">₹18.72</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td colSpan={3} className="py-3.5 px-4 text-slate-800 text-sm">
                        Total Water Usage Cost:
                      </td>
                      <td className="py-3.5 px-4 font-mono text-lg text-emerald-700 text-right">
                        ₹68.72
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                Note: This volumetric cost ledger reflects internal cost allocation across rolling mills and utility headers for efficiency auditing.
              </span>
            </div>
          </div>

          {/* Interactive Tariff Sandbox Calculator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-sky-600" />
                  Interactive Tariff Calculator Sandbox
                </h3>
                <p className="text-xs text-slate-500">Test different water consumption volumes against configurable tariff slabs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 block">
                  Simulated Volume: <span className="font-mono text-sky-600 font-bold">{calcVolume.toLocaleString()} Litres</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(parseInt(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>100 L</span>
                  <span>2,500 L</span>
                  <span>5,000 L</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>First 1,000 L (@ ₹0.05):</span>
                  <span className="font-mono font-semibold text-slate-900">₹{calculated.slab1Cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Next 1,000 L (@ ₹0.08):</span>
                  <span className="font-mono font-semibold text-slate-900">₹{calculated.slab2Cost.toFixed(2)}</span>
                </div>
                {calculated.slab3Vol > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Above 2,000 L (@ ₹0.12):</span>
                    <span className="font-mono font-semibold text-slate-900">₹{calculated.slab3Cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-emerald-700">
                  <span>Calculated Cost:</span>
                  <span className="font-mono">₹{calculated.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BILLING / SUPPLIER ACCOUNTING (MIDC BOISAR OFFICIAL INVOICE)       */}
      {/* ========================================================================= */}
      {activeTab === 'BILLING' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-4xl mx-auto">
          
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                MIDC Industrial Water Supply Authority
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">Industrial Water Supply Bill</h2>
              <div className="text-xs text-slate-500 mt-1 space-x-2">
                <span>Invoice: <strong className="font-mono text-slate-700">AQ-BILL-2026-0930</strong></span>
                <span>•</span>
                <span>Period: <strong className="text-slate-700">01 Sep 2026 – 30 Sep 2026</strong></span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                PAYMENT DUE
              </span>
              <div className="text-xs text-slate-500 mt-1">Due Date: <strong>15 Oct 2026</strong></div>
            </div>
          </div>

          {/* Enterprise Customer & Connection Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Billed Enterprise</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">Viraj Profiles Ltd — Boisar Facility</div>
              <div className="text-slate-600">Plot G-1, MIDC Tarapur Industrial Area, Boisar, Maharashtra 401506</div>
              <div className="text-slate-500 mt-1 font-mono">Company Account: AQ-COMP-001 | Connection: AQ-CONN-001</div>
            </div>

            <div className="sm:text-right">
              <span className="text-slate-500 font-bold uppercase block text-[10px]">Header Meter Details</span>
              <div className="font-mono font-bold text-sky-600 mt-0.5">MTR-MIDC-BOISAR-01 (Feeder Header)</div>
              <div className="text-slate-600 mt-1">
                Intake Volume: <strong className="text-slate-800">3,853,500 Litres (3,853.50 m³)</strong>
              </div>
              <div className="text-emerald-700 font-bold mt-1">Tariff Schedule: MIDC Boisar Heavy Industrial (₹68.72 / kL)</div>
            </div>
          </div>

          {/* Itemized Charges Breakdown Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Itemized Charges Breakdown</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Line Item Description</th>
                    <th className="py-2.5 px-4">Volume (kL)</th>
                    <th className="py-2.5 px-4">Rate (₹/kL)</th>
                    <th className="py-2.5 px-4 text-right">Computed Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  <tr>
                    <td className="py-3 px-4 text-slate-800 font-medium">
                      Primary Industrial Water Supply (Volumetric Bulk)
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">3,853.50 kL</td>
                    <td className="py-3 px-4 font-mono text-slate-600">₹68.72</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">₹264,812.52</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-slate-600">
                      Industrial Pipeline Infrastructure &amp; Maintained Pressure Cess:
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-800 text-right">₹8,500.00</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2.5 px-4 text-slate-600">
                      Environmental &amp; Boisar CETP Discharge Regulatory Charge (Waived - ZLD Verified):
                    </td>
                    <td className="py-2.5 px-4 font-mono text-emerald-600 text-right">₹0.00</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td colSpan={3} className="py-3 px-4 text-slate-900 text-sm">Total Invoiced Amount Payable:</td>
                    <td className="py-3 px-4 font-mono text-lg text-emerald-700 text-right">
                      ₹{totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Download Official PDF Invoice
            </button>

            <button
              onClick={() => toast.success('Redirecting to Corporate NetBanking / RTGS Portal for MIDC Water Bill...')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay ₹{totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Online</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COST SIMULATION ("WHAT-IF" DEMAND REDUCTION SCENARIOS)              */}
      {/* ========================================================================= */}
      {activeTab === 'SIMULATOR' && (
        <div className="space-y-6">
          
          {/* TWO-COLUMN INTERACTIVE SIMULATION ENGINE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* LEFT: CURRENT BASELINE SCENARIO */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Current Operational Baseline
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Status Quo
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500">Current Monthly Consumption</span>
                    <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                      {currentMonthlyLitre.toLocaleString()} <span className="text-sm font-normal text-slate-500">L/mo</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Equivalent to <strong>3,853.50 m³</strong> per month
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500">Current Monthly Water Bill</span>
                    <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                      ₹{Math.round(currentMonthlyCost).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Annual Water Expenditure: <strong>₹{Math.round(currentMonthlyCost * 12).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 text-xs text-slate-600">
                <strong>Facility Context:</strong> Calculations based on Viraj Profiles Boisar average intake across all 5 production sectors at active MIDC tariff of ₹68.72 / kL.
              </div>
            </div>

            {/* RIGHT: SIMULATED SCENARIO & SAVINGS PROJECTION */}
            <div className="bg-gradient-to-br from-slate-900 to-sky-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Simulated Scenario
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-900 text-sky-200 border border-sky-700">
                    Target: −{reductionPercent}%
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">
                    Target Demand Reduction Percentage:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setReductionPercent(pct)}
                        className={`py-2 rounded-xl text-xs font-black transition border ${
                          reductionPercent === pct
                            ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/30'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        −{pct}%
                      </button>
                    ))}
                  </div>

                  {/* Slider */}
                  <div className="pt-2">
                    <input
                      type="range"
                      min="1"
                      max="35"
                      value={reductionPercent}
                      onChange={(e) => setReductionPercent(parseInt(e.target.value))}
                      className="w-full accent-sky-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>1%</span>
                      <span>Target: −{reductionPercent}%</span>
                      <span>35% Max</span>
                    </div>
                  </div>
                </div>

                {/* Projected Savings Metrics */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-500/40">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Monthly Savings</span>
                    <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                      ₹{Math.round(estimatedSavingsInr).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">per month</span>
                  </div>

                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-500/40">
                    <span className="text-[10px] font-bold text-sky-400 uppercase">Annualized Savings</span>
                    <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                      ₹{Math.round(annualSavingsInr).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">per fiscal year</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-sky-950/50 border border-sky-800/60 rounded-xl text-[11px] text-sky-200">
                <strong>Demonstration Projection:</strong> Simulated estimate based on linear tariff multipliers and steady-state volumetric assumptions.
              </div>
            </div>

          </div>

          {/* DEPARTMENT-LEVEL REDUCTION BREAKDOWN TABLE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Departmental Water Demand Simulation (at −{reductionPercent}% Target)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Department Unit</th>
                    <th className="py-3 px-4">Current Monthly Volume</th>
                    <th className="py-3 px-4">Projected (−{reductionPercent}%)</th>
                    <th className="py-3 px-4">Water Saved</th>
                    <th className="py-3 px-4 text-right">Projected Cost Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {departments.map((dept) => {
                    const savedLitres = dept.monthlyLitre * (reductionPercent / 100);
                    const savedCost = (savedLitres / 1000) * tariffPerThousandLitre;
                    return (
                      <tr key={dept.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">{dept.name}</td>
                        <td className="py-3 px-4 text-slate-700">{dept.monthlyLitre.toLocaleString()} L</td>
                        <td className="py-3 px-4 text-sky-700 font-bold">{Math.round(dept.monthlyLitre - savedLitres).toLocaleString()} L</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">−{Math.round(savedLitres).toLocaleString()} L</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-700">₹{Math.round(savedCost).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HISTORY (AUDIT LEDGER OF WATER CONSUMPTION & COST)                  */}
      {/* ========================================================================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Historical Water Cost &amp; Accounting Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of historical meter reconciliations, monthly supplier bills, and internal cost allocations
              </p>
            </div>

            {/* History Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {(['ALL', 'MONTHLY', 'WEEKLY', 'DAILY'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setHistoryPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    historyPeriod === p ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Period / Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Invoice / Audit ID</th>
                  <th className="py-3 px-4">Opening / Closing</th>
                  <th className="py-3 px-4">Net Volume</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">{row.period}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sky-700 font-semibold">{row.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-600">{row.opening} $\rightarrow$ {row.closing}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.consumption}</td>
                    <td className="py-3 px-4 text-slate-600 font-sans">{row.rate}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">{row.cost}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.status === 'PAID' || row.status === 'SETTLED' || row.status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
            <span>Showing {filteredLedger.length} reconciliation records</span>
            <button
              onClick={() => toast.success('Exporting historical ledger to CSV...')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit CSV
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
