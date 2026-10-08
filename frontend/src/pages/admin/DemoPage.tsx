import { useState, useEffect } from 'react'
import {
  startSimulation, stopSimulation, simulateLeak, getSimulationStatus, getPipelines
} from '../../api/household'
import { Play, Square, AlertTriangle, Activity, Droplets, Zap, Info } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DemoPage() {
  const [status, setStatus] = useState<any>({ active_household_simulations: [], active_leak_simulations: [] })
  const [pipelines, setPipelines] = useState<any[]>([])
  const [simHousehold, setSimHousehold] = useState('H-001')
  const [simCategory, setSimCategory] = useState('normal')
  const [leakPipeline, setLeakPipeline] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = () => getSimulationStatus().then(setStatus)

  useEffect(() => {
    refresh()
    getPipelines().then(p => {
      setPipelines(p)
      if (p.length > 0) setLeakPipeline(p[0].pipeline_code)
    })
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleStart = async () => {
    setLoading(true)
    try {
      const r = await startSimulation(simHousehold, simCategory)
      toast.success(`▶ Simulation ${r.status} for ${r.household}`)
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to start')
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async (id: string) => {
    try {
      await stopSimulation(id)
      toast.success('⏹ Simulation stopped')
      refresh()
    } catch { toast.error('Failed to stop') }
  }

  const handleLeak = async () => {
    setLoading(true)
    try {
      const pip = pipelines.find(p => p.pipeline_code === leakPipeline)
      if (!pip) { toast.error('Pipeline not found'); return }
      const r = await simulateLeak(pip.id, 120)
      toast.success(`🚨 Leak simulation ${r.status} on ${pip.pipeline_code} (2 min)`, { duration: 5000 })
      refresh()
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to simulate leak')
    } finally {
      setLoading(false)
    }
  }

  const CATEGORIES = [
    { value: 'normal', label: 'Normal', desc: '150–350 L/day', color: 'text-green-600' },
    { value: 'high', label: 'High Usage', desc: '500–900 L/day', color: 'text-amber-600' },
    { value: 'very_high', label: 'Very High', desc: '1000–1800 L/day', color: 'text-red-600' },
    { value: 'anomaly', label: 'Anomaly', desc: 'Random spikes', color: 'text-red-800' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Demo Simulator</h1>
        <p className="text-slate-500 text-sm mt-1">Simulate real-time sensor data for demonstration without physical hardware</p>
      </div>

      {/* Architecture note */}
      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-800">
        <div className="font-semibold mb-1 flex items-center gap-2"><Info className="w-4 h-4" /> Architecture Note</div>
        The simulator uses the <strong>exact same API endpoint</strong> as real ESP32 hardware
        (<code className="bg-sky-100 px-1 rounded">POST /api/v1/readings</code>).
        Switching to real hardware requires zero code changes — just stop the simulator and connect the device.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Household simulation */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-500" /> Household Water Simulation
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Household</label>
            <input
              type="text"
              value={simHousehold}
              onChange={e => setSimHousehold(e.target.value)}
              placeholder="e.g. H-001, H-102, H-300"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-400 mt-1">Enter house number (H-XXX) or UUID</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Usage Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSimCategory(cat.value)}
                  className={`p-2.5 rounded-lg border text-left transition ${
                    simCategory === cat.value
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`text-xs font-bold ${cat.color}`}>{cat.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !simHousehold.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Start Simulation (10s interval)
          </button>

          {/* Active simulations */}
          {status.active_household_simulations.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" /> Active Simulations ({status.active_household_simulations.length})
              </div>
              <div className="space-y-1.5">
                {status.active_household_simulations.map((id: string) => (
                  <div key={id} className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-mono text-green-800">{id.slice(0, 12)}...</span>
                    </div>
                    <button onClick={() => handleStop(id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Square className="w-3 h-3" /> Stop
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leak simulation */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Pipeline Leak Simulation
          </h3>

          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
            ⚠️ This will simulate a <strong>20% water loss</strong> on the selected pipeline for 2 minutes.
            Watch the Leakage Detection page for live alerts.
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Pipeline</label>
            <select
              value={leakPipeline}
              onChange={e => setLeakPipeline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.pipeline_code}>{p.pipeline_code} — {p.description}</option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
            <strong>How the simulation works:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Inlet sensor: ~100 L/min</li>
              <li>Outlet sensor: ~78–82 L/min (simulated loss)</li>
              <li>Difference ≈ 20% → triggers POSSIBLE_LEAK alert</li>
              <li>Broadcasts to admin WebSocket in real time</li>
            </ul>
          </div>

          <button
            onClick={handleLeak}
            disabled={loading || !leakPipeline}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50"
          >
            <Zap className="w-4 h-4" /> Simulate Leak (2 min)
          </button>

          {status.active_leak_simulations.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-sm text-red-700 font-medium">
                🚨 Leak simulation active on {status.active_leak_simulations.length} pipeline(s)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-sky-400" /> Demo Instructions for Faculty</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700 mb-1">1. Start a Simulation</div>
            Enter household number → choose "High Usage" → click Start. Watch the Household Dashboard for real-time flow updates.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700 mb-1">2. Trigger a Leak</div>
            Click "Simulate Leak" on any pipeline. Navigate to the Leakage page to see the dual-sensor chart diverge and the alert fire.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700 mb-1">3. Generate Bills</div>
            Go to Billing → click "Generate Bills". Each bill shows the complete slab-by-slab calculation for full transparency.
          </div>
        </div>
      </div>
    </div>
  )
}
