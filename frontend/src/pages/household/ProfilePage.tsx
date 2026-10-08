import { User, Home, MapPin, Phone, Mail, Users, Calendar, Wifi, WifiOff } from 'lucide-react'

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('aquasense_user') || '{}')

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Account and household information</p>
      </div>

      {/* Avatar card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 border-2 border-sky-100 flex items-center justify-center">
          <User className="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{user.full_name || 'Household User'}</div>
          <div className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <Mail className="w-3.5 h-3.5" />
            {user.email || '—'}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 text-xs font-medium rounded-full border border-sky-100">
            <Home className="w-3 h-3" /> Household Account
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
        ⚠️ <strong>DEMO SYSTEM</strong> — Profile editing and password change are disabled in the prototype.
        In the production system, users can update their contact details and change their password.
      </div>

      {/* Account details */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Account Details</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { icon: Mail, label: 'Email', value: user.email || '—' },
            { icon: User, label: 'Full Name', value: user.full_name || '—' },
            { icon: Home, label: 'Role', value: 'Household User' },
            { icon: Calendar, label: 'User ID', value: user.id ? user.id.slice(0, 8) + '...' : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3.5">
              <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-sm font-medium text-slate-700 mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System info */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">System</h3>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">System</span>
            <span className="font-medium">AquaSense v1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Mode</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">DEMO PROTOTYPE</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Location</span>
            <span className="font-medium">Vangaon / Kumpare, Maharashtra</span>
          </div>
        </div>
      </div>
    </div>
  )
}
