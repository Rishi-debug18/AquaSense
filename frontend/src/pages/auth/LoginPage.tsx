import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/household'
import toast from 'react-hot-toast'
import { Droplets, Eye, EyeOff, Shield, Home } from 'lucide-react'

type Tab = 'household' | 'admin'

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('household')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, password)
      localStorage.setItem('aquasense_token', data.access_token)
      localStorage.setItem('aquasense_user', JSON.stringify({
        id: data.user_id, email: data.email, role: data.role, full_name: data.full_name,
      }))
      toast.success(`Welcome, ${data.full_name || data.email}!`)
      if (data.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/household/dashboard')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (type: 'admin' | 'household') => {
    if (type === 'admin') {
      setEmail('admin@aquasense.demo')
      setPassword('AquaSense@Admin2026')
      setTab('admin')
    } else {
      setEmail('h102@aquasense.demo')
      setPassword('House@102Demo')
      setTab('household')
    }
  }

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3 group">
            <img src="/logo.png" alt="AquaSense" className="h-14 w-14 object-contain" />
            <div className="text-left">
              <div className="text-2xl font-bold text-[#0C1F3F]">AquaSense</div>
              <div className="text-xs text-slate-500">Smart Water Management System</div>
            </div>
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setTab('household')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition ${
                tab === 'household'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Home className="w-4 h-4" /> Household Login
            </button>
            <button
              onClick={() => setTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition ${
                tab === 'admin'
                  ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin Portal
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {tab === 'admin' ? 'Municipal Administrator Login' : 'Household Login'}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {tab === 'admin'
                ? 'Access the AquaSense admin dashboard'
                : 'View your consumption, bills, and alerts'}
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={tab === 'admin' ? 'admin@aquasense.demo' : 'h102@aquasense.demo'}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800 placeholder:text-slate-300 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800 placeholder:text-slate-300 transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : (
                  <><Droplets className="w-4 h-4" /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="text-xs font-bold text-amber-700 mb-3 uppercase tracking-wider">
            ⚠️ DEMO CREDENTIALS — For Demonstration Only
          </div>
          <div className="space-y-2">
            <button
              onClick={() => fillDemo('admin')}
              className="w-full text-left p-3 bg-white border border-amber-100 rounded-lg hover:bg-amber-50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> ADMIN
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">admin@aquasense.demo</div>
                  <div className="text-xs text-slate-400 font-mono">AquaSense@Admin2026</div>
                </div>
                <span className="text-xs text-sky-500 group-hover:underline">Use →</span>
              </div>
            </button>
            <button
              onClick={() => fillDemo('household')}
              className="w-full text-left p-3 bg-white border border-amber-100 rounded-lg hover:bg-amber-50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Home className="w-3 h-3" /> HOUSEHOLD H-102
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">h102@aquasense.demo</div>
                  <div className="text-xs text-slate-400 font-mono">House@102Demo</div>
                </div>
                <span className="text-xs text-sky-500 group-hover:underline">Use →</span>
              </div>
            </button>
          </div>
          <div className="text-xs text-amber-600 mt-3 text-center">
            Click a credential block to auto-fill the form
          </div>
        </div>
      </div>
    </div>
  )
}
