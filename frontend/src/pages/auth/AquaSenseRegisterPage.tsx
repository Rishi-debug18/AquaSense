import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { GoogleAuthModal, GoogleProfile } from '../../components/auth/GoogleAuthModal';
import { UserRole } from '../../types/aquasense';
import { 
  Droplets, Shield, Home, Building2, Landmark, 
  Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles, User, Mail, Phone, Lock, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AquaSenseRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useAquaSenseStore();

  const [accountType, setAccountType] = useState<'resident' | 'enterprise'>('resident');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meterId, setMeterId] = useState('MTR-RES-H102');
  const [facilityName, setFacilityName] = useState('Viraj Profiles - Boisar Plant');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Google Modal State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms & telemetry sharing policy');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const roleToAssign: UserRole = accountType === 'resident' ? 'HOUSEHOLD_USER' : 'COMPANY_ADMIN';
      setRole(roleToAssign);

      toast.success(`Account successfully created for ${fullName || 'Resident'}!`);
      
      if (accountType === 'resident') {
        navigate('/household');
      } else {
        navigate('/industrial');
      }
    }, 700);
  };

  const handleGoogleSuccess = (profile: GoogleProfile) => {
    setRole(profile.role);
    toast.success(`Registered & authenticated with Google as ${profile.name}!`);
    if (profile.role === 'HOUSEHOLD_USER') {
      navigate('/household');
    } else {
      navigate('/industrial');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        defaultRole={accountType === 'resident' ? 'HOUSEHOLD_USER' : 'COMPANY_ADMIN'}
      />

      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-600/15 via-sky-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
            <Droplets className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">AquaSense</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                REGISTRATION
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Smart Water Onboarding &amp; Meter Activation</p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">Already registered?</span>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow-md shadow-sky-600/20"
          >
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 z-10">
        <div className="w-full max-w-xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header Title */}
          <div className="p-6 sm:p-8 border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">AquaSense Onboarding</span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Create AquaSense Account
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Connect your smart water meter or industrial facility pipeline telemetry
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
            </div>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                type="button"
                onClick={() => setAccountType('resident')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  accountType === 'resident'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Home className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold leading-tight">Household Resident</div>
                  <div className="text-[10px] text-slate-500">Smart Domestic Meter</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAccountType('enterprise')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                  accountType === 'enterprise'
                    ? 'border-sky-500 bg-sky-50/70 text-sky-950 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold leading-tight">Enterprise / Authority</div>
                  <div className="text-[10px] text-slate-500">Industrial &amp; Municipal</div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            
            {/* Google Fast Sign Up Button */}
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
              Sign up with Google (Instant OAuth)
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Or enter details manually
              </span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                />
              </div>

              {/* Meter ID / Facility Identification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {accountType === 'resident' ? 'Digital Water Meter ID (Barcode / Serial)' : 'Plant Facility / DMA Zone Code'}
                </label>
                <input
                  type="text"
                  required
                  value={accountType === 'resident' ? meterId : facilityName}
                  onChange={(e) => accountType === 'resident' ? setMeterId(e.target.value) : setFacilityName(e.target.value)}
                  placeholder={accountType === 'resident' ? 'MTR-RES-H102' : 'VIRAJ-BOISAR-STEEL-01'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono font-bold bg-slate-50"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>
                    I agree to the <strong className="text-slate-800">AquaSense IoT Telemetry Terms</strong> and consent to real-time water flow data processing.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Activate Account &amp; Connect Meter</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an active login?{' '}
              <Link to="/login" className="text-sky-600 hover:text-sky-700 font-bold hover:underline">
                Sign In to Dashboard
              </Link>
            </div>

          </div>

        </div>
      </main>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        AquaSense Smart Water Management Platform • Secure Cloud Telemetry Ingestion
      </footer>

    </div>
  );
};
