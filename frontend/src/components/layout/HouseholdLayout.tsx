import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Gauge, History, Receipt,
  AlertTriangle, MessageSquare, Bot, User, LogOut
} from 'lucide-react'
import { logout } from '../../api/household'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/household/dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/household/consumption', label: 'Live Usage',   icon: Gauge },
  { to: '/household/history',     label: 'History',      icon: History },
  { to: '/household/bills',       label: 'Bills',        icon: Receipt },
  { to: '/household/alerts',      label: 'Alerts',       icon: AlertTriangle },
  { to: '/household/messages',    label: 'Messages',     icon: MessageSquare },
  { to: '/household/feedback',    label: 'AI Assistant', icon: Bot },
  { to: '/household/profile',     label: 'Profile',      icon: User },
]

const baseLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-slate-500 hover:bg-sky-50 hover:text-sky-700'
const activeLinkClass = 'bg-sky-50 text-sky-700 font-medium border border-sky-100'

export default function HouseholdLayout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('aquasense_user') || '{}')

  const handleLogout = async () => {
    try { await logout() } catch {}
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-sky-50/30 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <img src="/logo.png" alt="AquaSense" className="w-9 h-9 object-contain" />
          <div>
            <div className="font-bold text-sm text-slate-800">AquaSense</div>
            <div className="text-xs text-sky-500">My Water Account</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
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
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center">
              <span className="text-xs font-bold text-sky-500">
                {user.full_name?.[0] || 'H'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-700 truncate">{user.full_name || 'Household'}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-6 py-3">
          <div className="text-sm text-slate-500">AquaSense — Smart Water Management</div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
