import { useState, useEffect } from 'react'
import { getHouseholds } from '../../api/household'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, Wifi, WifiOff, AlertTriangle, Home, ChevronLeft } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  NORMAL:    'bg-green-100 text-green-700',
  HIGH:      'bg-yellow-100 text-yellow-700',
  VERY_HIGH: 'bg-red-100 text-red-700',
  ANOMALY:   'bg-red-100 text-red-900',
}

export default function HouseholdsPage() {
  const [data, setData] = useState<any>({ total: 0, data: [] })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const PER_PAGE = 25

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getHouseholds({ page, per_page: PER_PAGE, search: search || undefined })
      setData(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [search, page])

  const totalPages = Math.ceil(data.total / PER_PAGE)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Households</h1>
        <p className="text-slate-500 text-sm mt-1">{data.total} registered households across 5 areas</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by house number (e.g. H-102)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">House No.</th>
                <th className="text-left px-4 py-3">Area</th>
                <th className="text-left px-4 py-3">Residents</th>
                <th className="text-right px-4 py-3">Today (L)</th>
                <th className="text-right px-4 py-3">Month (L)</th>
                <th className="text-center px-4 py-3">Usage</th>
                <th className="text-center px-4 py-3">Device</th>
                <th className="text-center px-4 py-3">Leak</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="w-7 h-7 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : data.data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Home className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                    No households found
                  </td>
                </tr>
              ) : (
                data.data.map((hh: any) => (
                  <tr key={hh.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-sky-700">{hh.house_number}</td>
                    <td className="px-4 py-3 text-slate-600">{hh.area}</td>
                    <td className="px-4 py-3 text-slate-600">{hh.resident_count}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{hh.today_consumption_litre?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">{hh.month_consumption_litre?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[hh.usage_status] || STATUS_COLORS.NORMAL}`}>
                        {hh.usage_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hh.device_status === 'online'
                        ? <Wifi className="w-4 h-4 text-green-500 mx-auto" />
                        : <WifiOff className="w-4 h-4 text-red-400 mx-auto" />
                      }
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hh.leakage_alert && <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/households/${hh.id}`} className="text-sky-500 hover:text-sky-700 transition">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, data.total)} of {data.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600">Page {page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
