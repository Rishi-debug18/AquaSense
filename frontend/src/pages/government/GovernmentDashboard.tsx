import React, { useState, useEffect } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Landmark, Droplets, AlertTriangle, CheckCircle2, Users, 
  Gauge, TrendingUp, TrendingDown, MapPin, Search, ChevronRight, 
  Send, FileText, ArrowRight, ShieldAlert, Activity, GitFork,
  Radio, Compass, ShieldCheck, Home
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, LineChart, Line, AreaChart, Area, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MUNICIPAL_TREND_DATA = [
  { day: '01 Sep', supplied: 2.80, consumed: 2.51, loss: 0.29 },
  { day: '02 Sep', supplied: 2.82, consumed: 2.53, loss: 0.29 },
  { day: '03 Sep', supplied: 2.85, consumed: 2.54, loss: 0.31 },
  { day: '04 Sep', supplied: 2.84, consumed: 2.52, loss: 0.32 },
  { day: '05 Sep', supplied: 2.86, consumed: 2.55, loss: 0.31 },
  { day: '06 Sep', supplied: 2.90, consumed: 2.58, loss: 0.32 },
  { day: '07 Sep', supplied: 2.88, consumed: 2.56, loss: 0.32 },
  { day: '08 Sep', supplied: 2.85, consumed: 2.54, loss: 0.31 },
];

export const GovernmentDashboard: React.FC = () => {
  const { 
    municipalKpis, 
    municipalAreas, 
    selectedAreaId, 
    selectArea,
    alerts 
  } = useAquaSenseStore();

  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [liveTime, setLiveTime] = useState<string>('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All Vangaon Residents');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedArea = municipalAreas.find(a => a.id === selectedAreaId) || municipalAreas[0];

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBroadcastModal(false);
    toast.success(`Area notice dispatched via SMS/WhatsApp to ${broadcastTarget}.`);
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-sky-600" /> Municipal Water Authority
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ZONAL TELEMETRY ACTIVE
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {liveTime || '18:32:45'} IST
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Vangaon Municipal Water Authority
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Zonal supply distribution, household smart metering, non-revenue water (NRW) accounting &amp; leakage tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            Broadcast Area Notice
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            NRW Water Loss Report
          </button>
        </div>
      </div>

      {/* TOP 7 MUNICIPAL KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        
        {/* KPI 1: TOTAL WATER SUPPLIED */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total Water Supplied
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {municipalKpis.totalWaterSuppliedMlDay} <span className="text-xs font-normal text-slate-500">ML/d</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            From MIDC Reservoir
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full w-[92%]" />
          </div>
        </div>

        {/* KPI 2: TOTAL CONSUMPTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Billed Consumption
          </div>
          <div className="text-xl font-black text-sky-700 font-mono">
            {municipalKpis.totalConsumptionMlDay} <span className="text-xs font-normal text-slate-500">ML/d</span>
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-semibold">
            89.2% Billed Volume
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[89%]" />
          </div>
        </div>

        {/* KPI 3: ESTIMATED SYSTEM LOSS */}
        <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-1">
            Estimated System Loss
          </div>
          <div className="text-xl font-black text-amber-700 font-mono">
            {municipalKpis.estimatedSystemLossMlDay} <span className="text-xs font-normal text-slate-500">ML/d</span>
          </div>
          <div className="text-[10px] text-amber-700 mt-1 font-semibold">
            10.8% Non-Revenue Water
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-[55%]" />
          </div>
        </div>

        {/* KPI 4: HOUSEHOLDS CONNECTED */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Connected Homes
          </div>
          <div className="text-xl font-black text-slate-900 font-mono">
            {municipalKpis.householdsConnected}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            3 Zonal Sectors
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full w-full" />
          </div>
        </div>

        {/* KPI 5: ACTIVE METERS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Active Meters
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {municipalKpis.activeMeters}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            98.1% IoT Uptime
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-[98%]" />
          </div>
        </div>

        {/* KPI 6: LEAKAGE ALERTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Leakage Alerts
          </div>
          <div className="text-xl font-black text-amber-600 font-mono">
            0{municipalKpis.leakageAlertsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Distribution Mains
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full w-[30%]" />
          </div>
        </div>

        {/* KPI 7: HIGH USAGE ALERTS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            High Usage Alerts
          </div>
          <div className="text-xl font-black text-yellow-600 font-mono">
            {municipalKpis.highUsageAlertsCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            &gt; 150% Baseline
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-yellow-400 h-full rounded-full w-[45%]" />
          </div>
        </div>
      </div>

      {/* MUNICIPAL SCADA GAUGES & ZONAL SUPPLY OVERVIEW */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Zonal Water Supply Routes &amp; Mass Balance</h3>
            <p className="text-xs text-slate-500">Bulk supply distribution from Vangaon Headworks Reservoir to residential zonal headers</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Feeder Lines Online
          </span>
        </div>

        {/* Route Scheme */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition">
            <div className="text-[10px] font-bold text-sky-700 uppercase">Primary Reservoir Source</div>
            <div className="font-bold text-slate-900 text-sm mt-1">Surya Dam / MIDC Intake</div>
            <div className="text-xs font-mono text-slate-700 mt-1">2.85 ML/day (4.8 Bar)</div>
            <div className="text-[10px] text-emerald-600 mt-1 font-semibold">ESP32-RES-01 Active</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition">
            <div className="text-[10px] font-bold text-sky-700 uppercase">Area A Feeder Line</div>
            <div className="font-bold text-slate-900 text-sm mt-1">North Vangaon Header</div>
            <div className="text-xs font-mono text-emerald-600 mt-1 font-semibold">920 kL/day (90.2% eff.)</div>
            <div className="text-[10px] text-slate-500 mt-1">420 Households</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 hover:border-slate-300 transition">
            <div className="text-[10px] font-bold text-sky-700 uppercase">Area B Feeder Line</div>
            <div className="font-bold text-slate-900 text-sm mt-1">Central Vangaon Header</div>
            <div className="text-xs font-mono text-emerald-600 mt-1 font-semibold">1,080 kL/day (90.7% eff.)</div>
            <div className="text-[10px] text-slate-500 mt-1">510 Households</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-3.5 hover:border-amber-400 transition">
            <div className="text-[10px] font-bold text-amber-800 uppercase">Area C Feeder Line</div>
            <div className="font-bold text-slate-900 text-sm mt-1">South / Commercial Belt</div>
            <div className="text-xs font-mono text-amber-700 mt-1 font-bold">850 kL/day (87.1% eff.)</div>
            <div className="text-[10px] text-amber-700 mt-1">1 Loss Alert Triggered</div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE AREA TREE & GEOGRAPHICAL DRILL-DOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Zonal Tree Navigator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vangaon Municipal Areas</h3>
              <p className="text-xs text-slate-500">Select an area to view telemetry &amp; households</p>
            </div>
          </div>

          {/* Area List */}
          <div className="space-y-2.5">
            {municipalAreas.map((area) => {
              const isSelected = area.id === selectedArea.id;
              return (
                <div
                  key={area.id}
                  onClick={() => selectArea(area.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 text-sm">{area.name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-sky-700 border border-slate-200">
                      {area.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Supply:</span>
                      <span className="font-mono text-slate-700 font-bold">{area.waterSuppliedKld} kL</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Consumed:</span>
                      <span className="font-mono text-slate-700 font-bold">{area.waterConsumedKld} kL</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Loss (NRW):</span>
                      <span className="font-mono text-amber-700 font-bold">{area.lossPercent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                    <span>{area.householdsCount} Households Connected</span>
                    <span className="text-sky-600 font-semibold flex items-center gap-1">
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Area In-Depth Metrics & Household List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedArea.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {selectedArea.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed telemetry breakdown and connected resident smart meters
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                {selectedArea.activeAlerts} Active Alerts
              </span>
            </div>
          </div>

          {/* Area Telemetry KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Water Supplied</span>
              <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">{selectedArea.waterSuppliedKld} kL/day</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Water Consumed</span>
              <div className="text-lg font-mono font-bold text-sky-700 mt-0.5">{selectedArea.waterConsumedKld} kL/day</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated Loss</span>
              <div className="text-lg font-mono font-bold text-amber-700 mt-0.5">{selectedArea.estimatedLossKld} kL/day</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">High-Usage Homes</span>
              <div className="text-lg font-mono font-bold text-yellow-700 mt-0.5">{selectedArea.highUsageCount} Units</div>
            </div>
          </div>

          {/* Connected Households in Selected Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Connected Households in {selectedArea.name}</h4>
              <span className="text-xs text-slate-500">Sample Smart Meters</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-2 px-2.5">House ID</th>
                    <th className="py-2 px-2.5">Resident</th>
                    <th className="py-2 px-2.5">IoT Node</th>
                    <th className="py-2 px-2.5">Live Flow</th>
                    <th className="py-2 px-2.5">Today (L)</th>
                    <th className="py-2 px-2.5">Month (L)</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedArea.households.map((hh) => (
                    <tr key={hh.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-2.5 font-mono font-bold text-sky-700">{hh.householdCode}</td>
                      <td className="py-2.5 px-2.5 text-slate-800 font-medium">
                        <div>{hh.residentName}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{hh.address}</div>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-600 text-[11px]">{hh.deviceId}</td>
                      <td className="py-2.5 px-2.5 font-mono font-bold text-sky-700">{hh.currentFlowLpm.toFixed(2)} L/m</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-800">{hh.todayLitre.toFixed(1)}</td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-800">{hh.thisMonthLitre.toLocaleString()}</td>
                      <td className="py-2.5 px-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          hh.leakageStatus === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {hh.leakageStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right">
                        <button
                          onClick={() => {
                            useAquaSenseStore.getState().setRole('HOUSEHOLD_USER');
                            navigate('/household');
                          }}
                          className="text-sky-600 hover:text-sky-700 font-semibold text-xs"
                        >
                          View Resident →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* BROADCAST MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-sky-700">
                <Send className="w-5 h-5 text-sky-600" />
                Broadcast Municipal Water Notice
              </h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                >
                  <option value="All Vangaon Residents">All Vangaon Residents (1,280 Households)</option>
                  <option value="Area A (North Vangaon)">Area A Residents (420 Households)</option>
                  <option value="Area B (Central Vangaon)">Area B Residents (510 Households)</option>
                  <option value="Area C (South / Commercial)">Area C Residents (350 Households)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Notice Content</label>
                <textarea
                  rows={3}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. Scheduled pipeline maintenance on Saturday from 10:00 to 14:00..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Dispatch via SMS &amp; WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
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
