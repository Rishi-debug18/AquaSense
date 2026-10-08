import { useState, useEffect, useRef } from 'react'
import { getPipelines, getPipelineHistory, simulateLeak, getLeakageAlerts } from '../../api/household'
import { AlertTriangle, Droplets, TrendingDown, Activity, Play, Eye } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  normal: { label: 'Normal', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  possible_leak: { label: 'Possible Leak', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
  critical_leak: { label: 'Critical Leak', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' },
  offline: { label: 'Offline', color: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-300' },
}

export default function LeakagePage() {
  const [pipelines, setPipelines] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [simLoading, setSimLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    Promise.all([getPipelines(), getLeakageAlerts()]).then(([pips, als]) => {
      setPipelines(pips)
      setAlerts(als)
      if (pips.length > 0) setSelected(pips[0].id)
    }).finally(() => setLoading(false))

    // WebSocket for real-time pipeline updates
    const token = localStorage.getItem('aquasense_token')
    if (token) {
      try {
        ws.current = new WebSocket(`ws://${window.location.hostname}:8000/ws/admin?token=${token}`)
        ws.current.onmessage = (event) => {
          const msg = JSON.parse(event.data)
          if (msg.event === 'pipeline_update') {
            setPipelines(prev => prev.map(p =>
              p.id === msg.pipeline_id ? { ...p, status: msg.status, latest: msg } : p
            ))
          }
        }
      } catch {}
    }

    return () => ws.current?.close()
  }, [])

  useEffect(() => {
    if (!selected) return
    getPipelineHistory(selected, 24).then(data => setHistory(data))
    const interval = setInterval(() => {
      getPipelineHistory(selected, 24).then(data => setHistory(data))
    }, 30000)
    return () => clearInterval(interval)
  }, [selected])

  const handleSimulateLeak = async (pipelineId: string, pipelineCode: string) => {
    setSimLoading(true)
    try {
      await simulateLeak(pipelineId, 120)
      toast.success(`🚨 Leak simulation started on ${pipelineCode} (2 min)`, { duration: 5000 })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to start simulation')
    } finally {
      setSimLoading(false)
    }
  }

  const selectedPipeline = pipelines.find(p => p.id === selected)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pipeline Leakage Detection</h1>
          <p className="text-slate-500 text-sm mt-1">Dual flow sensor analysis — Inlet vs Outlet comparison</p>
        </div>
      </div>

      {/* Active leakage alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-800 text-sm">{alert.title}</div>
                <div className="text-red-700 text-xs mt-0.5">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-sm text-sky-800">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4" /> How Leakage Detection Works
        </div>
        <div>
          Two YF-S201 flow sensors are placed at different points in each pipeline (Inlet + Outlet).
          <strong> Water Loss = Inlet Volume − Outlet Volume.</strong>
          If loss exceeds <strong>5%</strong> of inlet volume AND inlet flow &gt; 1L (to avoid noise), a leakage alert is triggered.
          Differences within ±5% are normal sensor tolerance.
        </div>
      </div>

      {/* Pipeline cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-3">
        {pipelines.map(pip => {
          const s = STATUS_CONFIG[pip.status] || STATUS_CONFIG.normal
          return (
            <button
              key={pip.id}
              onClick={() => setSelected(pip.id)}
              className={`text-left p-4 rounded-xl border transition ${selected === pip.id ? 'ring-2 ring-sky-500 border-sky-200' : 'border-slate-100 hover:border-slate-200'} bg-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-700 text-sm">{pip.pipeline_code}</span>
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              </div>
              <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.color}`}>
                {s.label}
              </div>
              {pip.latest && (
                <div className="mt-2 text-xs text-slate-500">
                  <div>Inlet: {pip.latest.inlet_volume?.toFixed(1) || '—'} L</div>
                  <div>Outlet: {pip.latest.outlet_volume?.toFixed(1) || '—'} L</div>
                  {pip.latest.difference_percent !== undefined && (
                    <div className={`font-medium ${pip.latest.possible_leak ? 'text-red-600' : 'text-green-600'}`}>
                      Δ {pip.latest.difference_percent?.toFixed(1)}%
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected pipeline detail */}
      {selectedPipeline && (
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{selectedPipeline.pipeline_code}</h3>
              <p className="text-slate-500 text-sm">{selectedPipeline.description}</p>
            </div>
            <button
              onClick={() => handleSimulateLeak(selectedPipeline.id, selectedPipeline.pipeline_code)}
              disabled={simLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {simLoading ? 'Starting...' : 'Simulate Leak (2 min)'}
            </button>
          </div>

          {/* Dual sensor chart */}
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Inlet vs Outlet Flow — Last 24 Hours
            </h4>
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No readings available for selected pipeline
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history} margin={{ left: -15, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="reading_ts"
                    tick={{ fontSize: 10 }}
                    tickFormatter={t => format(new Date(t), 'HH:mm')}
                    interval={Math.floor(history.length / 8)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    labelFormatter={l => format(new Date(l), 'dd MMM HH:mm')}
                    formatter={(v: any, name: string) => [`${v?.toFixed(2)} L`, name]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="inlet_volume" stroke="#0EA5E9" name="Inlet" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="outlet_volume" stroke="#22C55E" name="Outlet" dot={false} strokeWidth={2} />
                  {/* Highlight leakage points */}
                  {history.filter(h => h.possible_leak).map((h, i) => (
                    <ReferenceLine key={i} x={h.reading_ts} stroke="#EF4444" strokeDasharray="4 4" />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Threshold</div>
              <div className="font-bold text-slate-700">{selectedPipeline.leak_threshold_percent}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Leak Events (24h)</div>
              <div className="font-bold text-red-600">{history.filter(h => h.possible_leak).length}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Status</div>
              <div className={`font-bold ${selectedPipeline.status === 'normal' ? 'text-green-600' : 'text-red-600'}`}>
                {STATUS_CONFIG[selectedPipeline.status]?.label || selectedPipeline.status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
