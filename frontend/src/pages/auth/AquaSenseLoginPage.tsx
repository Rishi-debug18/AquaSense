import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { GoogleAuthModal, GoogleProfile } from '../../components/auth/GoogleAuthModal';
import { 
  Droplets, Shield, Building2, Lock, KeyRound, 
  Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight, 
  Sparkles, RefreshCw, Cpu, Check, Terminal, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AquaSenseLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useAquaSenseStore();

  const [activeTab, setActiveTab] = useState<'company' | 'superadmin'>('company');

  // Form Fields
  const [email, setEmail] = useState('industrial.admin@virajprofiles.demo');
  const [password, setPassword] = useState('Viraj@Aqua2026');
  const [facilityCode, setFacilityCode] = useState('VIRAJ-BOISAR-STEEL-01');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Super Admin 2FA State
  const [superAdminStep, setSuperAdminStep] = useState<'credentials' | '2fa'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState(['9', '2', '6', '4', '0', '1']);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // Quick Demo Auto-fill Helper
  const fillVirajDemo = () => {
    setActiveTab('company');
    setFacilityCode('VIRAJ-BOISAR-STEEL-01');
    setEmail('industrial.admin@virajprofiles.demo');
    setPassword('Viraj@Aqua2026');
    toast.success('Loaded Viraj Profiles Company Admin credentials');
  };

  const fillSuperAdminDemo = () => {
    setActiveTab('superadmin');
    setEmail('security.admin@aquasense.io');
    setPassword('AquaAdmin#2026!MasterKey');
    setSuperAdminStep('credentials');
    toast.success('Loaded Super Admin Security credentials');
  };

  // Submit Handler for Company Admin Login
  const handleCompanyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setRole('COMPANY_ADMIN');
      toast.success('Authenticated as Industrial Company Admin (Viraj Profiles, Boisar)');
      navigate('/industrial');
    }, 600);
  };

  // Submit Handler for Super Admin Security Gateway
  const handleSuperAdminFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter Super Admin security email and master password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuperAdminStep('2fa');
      toast.success('Primary Master Key Accepted. Please verify 2FA Security Token.');
    }, 700);
  };

  const handleSuperAdminVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const code = twoFactorCode.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit 2FA security code');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRole('SUPER_ADMIN');
      toast.success('🛡️ High-Security Clearance Granted. Elevated to Super Admin.');
      navigate('/architecture');
    }, 800);
  };

  const handleGoogleSuccess = (profile: GoogleProfile) => {
    setRole('COMPANY_ADMIN');
    toast.success(`Signed in with Google Workspace as ${profile.name} (${profile.email})`);
    navigate('/industrial');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Google OAuth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        defaultRole="COMPANY_ADMIN"
      />

      {/* Background Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-600/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <Link to="/industrial" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
            <Droplets className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">AquaSense</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                COMPANY SCADA AUTH
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Smart Industrial Water Management &amp; Billing Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <Link
            to="/tour"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            1-Min Judge Tour
          </Link>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT 7 COLS: COMPANY LOGIN CARD */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            
            {/* Top 2-Tab Selector */}
            <div className="bg-slate-100/80 p-1.5 border-b border-slate-200 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'company'
                    ? 'bg-white text-sky-700 shadow-md shadow-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Company Admin Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('superadmin')}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'superadmin'
                    ? 'bg-slate-900 text-sky-400 shadow-md shadow-slate-900/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>🛡️ Super Admin Gate</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              
              {activeTab === 'company' ? (
                <div className="space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                      <Building2 className="w-3.5 h-3.5" /> Enterprise Water Operations
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Company Sign In</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Access Viraj Profiles Boisar facility water network telemetry, two-sensor loss detection, and billing invoices.
                    </p>
                  </div>

                  {/* Google Workspace Button */}
                  <button
                    type="button"
                    onClick={() => setIsGoogleModalOpen(true)}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center gap-3 transition shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                    </svg>
                    Continue with Google Workspace (Enterprise SSO)
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Or Enterprise Credentials
                    </span>
                  </div>

                  <form onSubmit={handleCompanyLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="industrial.admin@virajprofiles.demo"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Facility / Org Code</label>
                        <input
                          type="text"
                          required
                          value={facilityCode}
                          onChange={(e) => setFacilityCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono font-bold bg-slate-50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-sky-600 focus:ring-sky-500"
                        />
                        <span>Remember facility console</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toast('Password reset link sent to registered enterprise admin.', { icon: 'ℹ️' })}
                        className="text-sky-600 font-bold hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Building2 className="w-4 h-4" />
                          <span>Authorize Company SCADA Access</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* SUPER ADMIN SECURITY GATEWAY */
                <div className="space-y-5">
                  <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                          Special Security Gateway
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          CLEARANCE LEVEL 5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Privileged access to System Architecture, REST API keys, database schemas, and firmware telemetry overrides.
                      </p>
                    </div>
                  </div>

                  {superAdminStep === 'credentials' ? (
                    <form onSubmit={handleSuperAdminFirstStep} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Master Security Email</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="security.admin@aquasense.io"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm font-mono font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Master Security Password</label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-sm font-mono font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 rounded-2xl text-xs font-bold shadow-lg shadow-slate-900/30 flex items-center justify-center gap-2 transition"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Verify Master Security Key →</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSuperAdminVerify2FA} className="space-y-4">
                      <div className="text-center space-y-1">
                        <h3 className="text-sm font-bold text-slate-900">2FA Security Token</h3>
                        <p className="text-xs text-slate-500">Enter the 6-digit PIN: <strong className="font-mono text-amber-600">926 401</strong></p>
                      </div>

                      <div className="flex justify-center gap-2">
                        {twoFactorCode.map((digit, idx) => (
                          <input
                            key={idx}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = [...twoFactorCode];
                              updated[idx] = val;
                              setTwoFactorCode(updated);
                            }}
                            className="w-10 h-11 text-center font-mono text-base font-black rounded-xl border-2 border-sky-400 bg-sky-50/50 text-slate-900 focus:outline-none"
                          />
                        ))}
                      </div>

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setSuperAdminStep('credentials')}
                          className="py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-bold text-slate-600"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition"
                        >
                          Unlock Super Admin
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Security Footer */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  Industrial SCADA Role Isolation Active
                </span>
                <span className="font-mono">AquaSense B2B v2.4</span>
              </div>

            </div>
          </div>

          {/* RIGHT 5 COLS: 1-CLICK DEMO SHORTCUTS */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Quick Demo Evaluation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  1-Click Fill
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to auto-populate the Viraj Profiles Boisar plant credentials or launch the direct dashboard:
              </p>

              <button
                type="button"
                onClick={fillVirajDemo}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500 transition text-left group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-sky-300">
                      Viraj Profiles Company Admin
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">industrial.admin@virajprofiles.demo</div>
                  </div>
                </div>
                <span className="text-xs text-sky-400 font-bold group-hover:translate-x-1 transition">
                  Use →
                </span>
              </button>

              <button
                type="button"
                onClick={fillSuperAdminDemo}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 transition text-left group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                      Super Admin Security
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">security.admin@aquasense.io</div>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-bold group-hover:translate-x-1 transition">
                  Unlock →
                </span>
              </button>
            </div>

            <div className="bg-gradient-to-br from-sky-950/40 to-slate-900 border border-sky-800/30 rounded-3xl p-5 text-xs text-slate-300 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Cpu className="w-4 h-4" />
                <span>Direct Access Shortcut</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Skip login and open the full interactive demonstration directly:
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRole('COMPANY_ADMIN');
                    navigate('/industrial');
                  }}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-center font-bold text-xs transition shadow-md shadow-sky-600/20"
                >
                  Open SCADA Dashboard
                </button>
                <Link
                  to="/tour"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 text-center font-black text-xs transition flex items-center justify-center gap-1 shadow-md shadow-sky-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  1-Min Tour
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        AquaSense Smart Industrial Water Management Platform • Viraj Profiles Boisar SCADA
      </footer>

    </div>
  );
};
