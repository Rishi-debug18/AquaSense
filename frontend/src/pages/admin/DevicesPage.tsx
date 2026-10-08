import { useEffect, useState } from 'react'
import api from '../../api/client'
import { Wifi, WifiOff, Cpu, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use general households data to extract device info
    api.get('/admin/households?per_page=200&page=1').then(r => {
      setDevices(r.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const online = devices.filter(d => d.device_status === 'online').length
  const offline = devices.filter(d => d.device_status === 'offline').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">IoT Devices</h1>
        <p className="text-slate-500 text-sm mt-1">ESP32 flow meter devices across all households</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{devices.length}</div>
          <div className="text-xs text-slate-400 mt-1">Total Devices</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{online}</div>
          <div className="text-xs text-green-500 mt-1">Online</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{offline}</div>
          <div className="text-xs text-red-400 mt-1">Offline / No Data</div>
        </div>
      </div>

      {/* Device table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Household</th>
                <th className="text-left px-4 py-3">Area</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Today (L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10"><div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : devices.slice(0, 100).map((d: any) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-sky-700">{d.house_number}</td>
                  <td className="px-4 py-3 text-slate-600">{d.area}</td>
                  <td className="px-4 py-3 text-center">
                    {d.device_status === 'online'
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700"><Wifi className="w-3.5 h-3.5" /> Online</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-red-500"><WifiOff className="w-3.5 h-3.5" /> Offline</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{d.today_consumption_litre?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {devices.length > 100 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400 text-center">
            Showing first 100 devices of {devices.length}
          </div>
        )}
      </div>

      <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sky-700">
        <strong>Hardware-Ready Architecture:</strong> Each device runs on an ESP32 microcontroller with a YF-S201 flow sensor.
        Devices authenticate via <code className="bg-sky-100 px-1 rounded">X-Device-Token</code> header.
        Replace the demo simulator with real hardware — zero code changes required.
      </div>
    </div>
  )
}
