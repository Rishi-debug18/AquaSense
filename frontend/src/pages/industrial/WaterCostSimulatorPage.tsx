import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Calculator, DollarSign, TrendingDown, Sparkles, Building2, 
  ArrowRight, RefreshCw, CheckCircle2, Info, Layers, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

export const WaterCostSimulatorPage: React.FC = () => {
  const { departments } = useAquaSenseStore();

  const [reductionPercent, setReductionPercent] = useState<number>(10);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  
  // Base numbers (Viraj Profiles monthly totals)
  const currentMonthlyLitre = 3853500; // 3,853.50 kL
  const tariffPerThousandLitre = 68.72; // ₹68.72 per 1,000 L (MIDC Boisar tariff)
  const currentMonthlyCost = (currentMonthlyLitre / 1000) * tariffPerThousandLitre; // ₹264,812.52

  // Projected Calculations
  const projectedMonthlyLitre = currentMonthlyLitre * (1 - reductionPercent / 100);
  const projectedMonthlyCost = (projectedMonthlyLitre / 1000) * tariffPerThousandLitre;
  const estimatedSavingsInr = currentMonthlyCost - projectedMonthlyCost;
  const annualSavingsInr = estimatedSavingsInr * 12;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Water Cost Simulator
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                SCENARIO MODELING
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore the financial impact and utility savings of operational water conservation measures.
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-400 font-mono">
          <span>Active Tariff: <strong>₹68.72 / 1,000 L</strong></span>
          <div className="text-[10px] text-emerald-400">MIDC Boisar Industrial Tier</div>
        </div>
      </div>

      {/* TWO-COLUMN INTERACTIVE SIMULATION ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* LEFT: CURRENT BASELINE SCENARIO */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
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
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Current Monthly Consumption</span>
                <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                  {currentMonthlyLitre.toLocaleString()} <span className="text-sm font-normal text-slate-500">L/mo</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Equivalent to <strong>3,853.50 m³</strong> per month
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
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

          <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-600">
            <strong>Facility Context:</strong> Calculations based on Viraj Profiles Boisar average intake across all 5 production sectors.
          </div>
        </div>

        {/* RIGHT: SIMULATED SCENARIO & SAVINGS PROJECTION */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
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
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-sky-500/40">
                <span className="text-[10px] font-bold text-sky-400 uppercase">Monthly Savings</span>
                <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                  ₹{Math.round(estimatedSavingsInr).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">per month</span>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-sky-500/40">
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
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
  );
};
