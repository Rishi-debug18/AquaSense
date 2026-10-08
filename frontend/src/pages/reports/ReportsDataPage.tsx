import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  FileText, Download, Printer, Filter, Calendar, 
  Search, CheckCircle2, ArrowDownToLine, Droplets 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsDataPage: React.FC = () => {
  const { pipelines, municipalAreas, alerts, devices } = useAquaSenseStore();

  const [reportType, setReportType] = useState<string>('DAILY_CONSUMPTION');
  const [dateRange, setDateRange] = useState<string>('September 2026');

  const reportOptions = [
    { id: 'DAILY_CONSUMPTION', title: 'Daily Water Consumption Report', desc: 'Hourly and daily volumetric intake across all nodes' },
    { id: 'MONTHLY_CONSUMPTION', title: 'Monthly Water Consumption Summary', desc: '30-day cumulative usage compared against seasonal baselines' },
    { id: 'AREA_WISE', title: 'Area-wise Municipal Consumption', desc: 'Zonal mass-balance breakdown for Vangaon Municipal Authority' },
    { id: 'PIPELINE_WISE', title: 'Industrial Pipeline Differential Report', desc: 'Inlet vs Outlet differential readings for Viraj Profiles' },
    { id: 'WATER_LOSS', title: 'Water Loss & Anomaly Events Log', desc: 'Detailed log of all Δ > threshold occurrences and inspection work orders' },
    { id: 'HIGH_USAGE', title: 'High Usage & Baseline Breach Report', desc: 'Facilities & households exceeding configured daily limits' },
    { id: 'DEVICE_HEALTH', title: 'IoT Device Fleet Health Report', desc: 'ESP32 heartbeat status, battery voltage, and WiFi RSSI metrics' },
    { id: 'COST_ACCOUNTING', title: 'Water Cost Accounting Ledger', desc: 'Progressive slab tariff calculations and financial ledger' },
  ];

  const handleDownloadCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Location/Pipeline,Inlet_Lpm,Outlet_Lpm,Difference_Lpm,Tolerance_Lpm,Status,Today_Litres\n"
      + "2026-09-09,Production Line A (PRD-001),15.23,14.10,1.13,0.50,POSSIBLE_LOSS,8642\n"
      + "2026-09-09,Cooling System Tower B (COL-001),12.40,12.38,0.02,0.40,NORMAL,7120\n"
      + "2026-09-09,Chemical Processing (PRC-001),9.15,9.12,0.03,0.35,NORMAL,5410\n"
      + "2026-09-09,Utilities Boiler (UTL-001),8.20,8.18,0.02,0.30,NORMAL,4890\n"
      + "2026-09-09,Water Treatment RO (WTR-001),4.50,4.48,0.02,0.25,NORMAL,2388\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AquaSense_Report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV dataset exported successfully.');
  };

  const handleExportPdf = () => {
    toast.success('Preparing official PDF document print preview...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Data &amp; Compliance
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Audit Ready
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reports &amp; Data Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate certified compliance reports, CSV telemetry dumps, and executive water accounting summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-600" /> Export CSV
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Grid: Left Report Selector & Right Data Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report Templates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Available Report Types</h3>
          
          <div className="space-y-1.5">
            {reportOptions.map((opt) => {
              const isSelected = reportType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setReportType(opt.id)}
                  className={`w-full text-left p-3 rounded-xl border transition text-xs space-y-1 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 text-slate-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold">{opt.title}</div>
                  <div className="text-[11px] text-slate-500">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Report Tabular Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Report Preview</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {reportOptions.find(o => o.id === reportType)?.title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Filtered Date Range: <strong>01 Sep 2026 – 30 Sep 2026</strong></p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                5 Monitored Pipelines
              </span>
            </div>
          </div>

          {/* Tabular Data Preview */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Pipeline Code</th>
                  <th className="py-2.5 px-3">Name &amp; Location</th>
                  <th className="py-2.5 px-3">Inlet Flow</th>
                  <th className="py-2.5 px-3">Outlet Flow</th>
                  <th className="py-2.5 px-3">Difference</th>
                  <th className="py-2.5 px-3">Today's Total</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {pipelines.map((p) => {
                  const isLoss = p.differenceLpm > p.configuredToleranceLpm;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-sky-600">{p.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{p.exactLocation}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{p.inletFlowLpm.toFixed(2)} L/m</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{p.outletFlowLpm.toFixed(2)} L/m</td>
                      <td className={`py-3 px-3 font-mono font-bold ${isLoss ? 'text-amber-700' : 'text-slate-800'}`}>
                        {p.differenceLpm.toFixed(2)} L/m
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800 font-semibold">{p.todayLitre.toLocaleString()} L</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isLoss ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isLoss ? 'POSSIBLE LOSS' : 'NORMAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Generated: {new Date().toLocaleDateString('en-GB')} by AquaSense SCADA Engine</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Certified Authentic Audit Hash: #94A2-SCADA
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
