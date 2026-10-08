import { useState, useEffect } from 'react'
import { getSettings, updateSetting } from '../../api/household'
import { Settings, Save, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([])
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      const init: Record<string, string> = {}
      s.forEach((item: any) => { init[item.key] = item.value })
      setEdits(init)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (key: string) => {
    setSaving(key)
    try {
      await updateSetting(key, edits[key])
      toast.success(`✅ Setting "${key}" updated`)
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value: edits[key] } : s))
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const grouped = settings.reduce((acc: Record<string, any[]>, s) => {
    acc[s.category] = acc[s.category] || []
    acc[s.category].push(s)
    return acc
  }, {})

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-500" /> System Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">Configure thresholds, billing parameters, and system behaviour</p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
        ⚠️ <strong>DEMO MODE</strong> — Settings take effect immediately. Changes persist in the database.
        These control alert thresholds, device timeouts, and billing behaviour.
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              {category.replace(/_/g, ' ')}
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {(items as any[]).map((setting) => (
              <div key={setting.key} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-700 text-sm font-mono">{setting.key}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{setting.description}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="text"
                      value={edits[setting.key] ?? setting.value}
                      onChange={e => setEdits(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="w-32 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-right"
                    />
                    <button
                      onClick={() => handleSave(setting.key)}
                      disabled={saving === setting.key || edits[setting.key] === setting.value}
                      className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition disabled:opacity-40"
                      title="Save"
                    >
                      {saving === setting.key
                        ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        : <Save className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
