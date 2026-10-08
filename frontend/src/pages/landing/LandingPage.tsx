import { Link } from 'react-router-dom'
import { Droplets, BarChart3, AlertTriangle, Bot, Wifi, Receipt, ChevronRight, Shield, Activity } from 'lucide-react'

const features = [
  { icon: Droplets, title: 'Real-time Monitoring', desc: 'Live flow rate and consumption data from IoT sensors updated every 10 seconds.' },
  { icon: Receipt, title: 'Transparent Billing', desc: 'See exactly how your bill is calculated — every slab, rate, and charge made visible.' },
  { icon: AlertTriangle, title: 'Leakage Detection', desc: 'Dual flow sensors detect pipeline leaks before they become costly problems.' },
  { icon: Bot, title: 'AI Feedback Assistant', desc: 'Get instant answers about your bill, consumption, and meter from our AI assistant.' },
  { icon: BarChart3, title: 'Municipal Analytics', desc: 'Administrators see area-wise consumption, high usage trends, and billing totals.' },
  { icon: Wifi, title: 'ESP32 IoT Ready', desc: 'Real hardware connection ready — plug in ESP32 + flow sensor without code changes.' },
]

const stats = [
  { value: '550+', label: 'Households Monitored' },
  { value: '2,025', label: 'Residents' },
  { value: '5', label: 'Areas Covered' },
  { value: '90 Days', label: 'Demo Data Generated' },
]

const steps = [
  { num: '01', title: 'Measure', desc: 'ESP32 + YF-S201 flow sensors record water consumption in real time.' },
  { num: '02', title: 'Analyze', desc: 'Backend calculates consumption, detects anomalies, and identifies leakage.' },
  { num: '03', title: 'Act', desc: 'Alerts, bills, and insights reach households and municipal administrators instantly.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0C1F3F] text-white font-sans">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0C1F3F]/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AquaSense" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight">AquaSense</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#demo" className="hover:text-white transition">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition"
            >
              Household Login
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-sm bg-sky-500 rounded-lg hover:bg-sky-400 transition font-medium"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Demo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            🔬 DEMO PROTOTYPE — Vangaon / Kumpare, Maharashtra
          </div>

          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="AquaSense" className="h-28 w-28 object-contain drop-shadow-2xl" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            Smart Water.{' '}
            <span className="text-sky-400">Fair Billing.</span>
            <br />Sustainable Future.
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            AquaSense is an IoT-based water monitoring platform that measures household
            consumption in real time, generates transparent usage-based bills, detects
            pipeline leakage, and provides municipal administrators a centralized management hub.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0C1F3F] rounded-xl font-bold text-lg hover:bg-slate-100 transition shadow-lg"
            >
              Household Login <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 text-white rounded-xl font-bold text-lg hover:bg-sky-400 transition shadow-lg"
            >
              <Shield className="w-5 h-5" /> Admin Portal
            </Link>
          </div>

          {/* Flow indicator */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-sm text-slate-400">
            <Activity className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Live demo data streaming — 550 households, 90 days of readings</span>
          </div>
        </div>
      </section>

      {/* ── Stats Banner ─────────────────────────────────────────────────── */}
      <section className="py-12 bg-sky-500/10 border-y border-sky-500/20">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-white mb-1">{s.value}</div>
              <div className="text-sm text-sky-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From sensor to dashboard — a complete water management ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-sky-500/30 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/30 transition">
                  <Icon className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How AquaSense Works</h2>
            <p className="text-slate-400">Measure → Verify → Bill → Detect → Inform → Conserve</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="text-6xl font-black text-sky-500/30 mb-4">{step.num}</div>
                <h3 className="text-2xl font-bold mb-3 text-sky-400">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo CTA ─────────────────────────────────────────────────────── */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/30">
            <h2 className="text-4xl font-bold mb-4">Try the Live Demo</h2>
            <p className="text-slate-300 mb-8">
              Explore the full system with pre-loaded demo data — no hardware required.
            </p>
            <div className="bg-[#0C1F3F]/80 rounded-xl p-6 mb-8 text-left font-mono text-sm">
              <div className="text-slate-400 mb-3 text-xs uppercase tracking-wider">Demo Credentials</div>
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Admin:</span>
                  <span className="text-sky-400">admin@aquasense.demo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Password:</span>
                  <span className="text-green-400">AquaSense@Admin2026</span>
                </div>
                <div className="border-t border-white/10 my-2" />
                <div className="flex justify-between">
                  <span className="text-slate-400">Household:</span>
                  <span className="text-sky-400">h102@aquasense.demo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Password:</span>
                  <span className="text-green-400">House@102Demo</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="px-8 py-3 bg-white text-[#0C1F3F] rounded-xl font-bold hover:bg-slate-100 transition">
                Household Login
              </Link>
              <Link to="/login" className="px-8 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-400 transition">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AquaSense" className="h-8 w-8 object-contain" />
            <span className="font-bold">AquaSense</span>
            <span className="text-slate-500 text-sm">— Smart Water. Fair Billing. Sustainable Future.</span>
          </div>
          <div className="text-slate-500 text-sm text-center">
            ⚠️ DEMO PROTOTYPE — All data is simulated. Not an actual government system.
          </div>
        </div>
      </footer>
    </div>
  )
}
