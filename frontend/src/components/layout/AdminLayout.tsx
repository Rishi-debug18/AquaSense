import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Droplets, Receipt, AlertTriangle,
  MessageSquare, Ticket, Settings, MapPin, Cpu, ClipboardList,
  Play, FileBarChart, LogOut,
} from 'lucide-react'
import { logout } from '../../api/household'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/households',  label: 'Households',      icon: Users },
  { to: '/admin/areas',       label: 'Areas',           icon: MapPin },
  { to: '/admin/leakage',     label: 'Leakage',         icon: Droplets },
  { to: '/admin/billing',     label: 'Billing',         icon: Receipt },
  { to: '/admin/alerts',      label: 'Alerts',          icon: AlertTriangle },
  { to: '/admin/messages',    label: 'Messages',        icon: MessageSquare },
  { to: '/admin/feedback',    label: 'Feedback',        icon: Ticket },
  { to: '/admin/devices',     label: 'Devices',         icon: Cpu },
  { to: '/admin/demo',        label: '🔬 Demo Control', icon: Play },
  { to: '/admin/reports',     label: 'Reports',         icon: FileBarChart },
  { to: '/admin/audit',       label: 'Audit Log',       icon: ClipboardList },
  { to: '/admin/settings',    label: 'Settings',        icon: Settings },
]

const baseLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-slate-300 hover:bg-white/10 hover:text-white'
const activeLinkClass = 'bg-sky-500/20 text-sky-300 border border-sky-500/30'

export default function AdminLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('aquasense_user') || '{}')

  const handleLogout = async () => {
    try { await logout() } catch {}
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0C1F3F] text-white flex flex-col flex-shrink-0 border-r border-white/5">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <img src="/logo.png" alt="AquaSense" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-bold text-sm">AquaSense</div>
            <div className="text-xs text-sky-400">Admin Portal</div>
          </div>
        </div>

        {/* Demo badge */}
        <div className="mx-3 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="text-xs text-amber-300 font-medium text-center">⚠️ DEMO PROTOTYPE</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${baseLinkClass} ${isActive ? activeLinkClass : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-sky-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-sky-400">
                {user.full_name?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.full_name || 'Admin'}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            AquaSense — Smart Water Management System
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full font-medium">
              DEMO MODE
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
