import React, { useState } from 'react';
import { X, Check, Shield, User, Plus, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types/aquasense';

export interface GoogleProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  roleLabel: string;
  badge: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: GoogleProfile) => void;
  defaultRole?: UserRole;
}

const GOOGLE_DEMO_ACCOUNTS: GoogleProfile[] = [
  {
    id: 'g-1',
    name: 'Rajesh Sharma',
    email: 'rajesh.sharma.water@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    role: 'HOUSEHOLD_USER',
    roleLabel: 'Household Resident (H-102)',
    badge: 'Resident Account',
  },
  {
    id: 'g-2',
    name: 'Viraj SCADA Admin',
    email: 'scada.operations.viraj@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    role: 'COMPANY_ADMIN',
    roleLabel: 'Industrial Plant Admin (Viraj Profiles)',
    badge: 'Enterprise Google Workspace',
  },
  {
    id: 'g-3',
    name: 'Vangaon Municipal Council',
    email: 'water.authority.vangaon@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    role: 'GOVERNMENT_ADMIN',
    roleLabel: 'Municipal Water Authority',
    badge: 'Govt Enterprise ID',
  },
  {
    id: 'g-4',
    name: 'Vikram Jadhav',
    email: 'vikram.field.maintenance@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    role: 'MAINTENANCE_USER',
    roleLabel: 'Field Inspection Engineer',
    badge: 'Operations Crew',
  },
];

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole = 'HOUSEHOLD_USER',
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleSelectPredefined = (account: GoogleProfile) => {
    setSelectedAccountId(account.id);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess(account);
      onClose();
    }, 900);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsAuthenticating(true);
    const customProfile: GoogleProfile = {
      id: `g-custom-${Date.now()}`,
      name: customName || customEmail.split('@')[0],
      email: customEmail,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      role: defaultRole,
      roleLabel: defaultRole === 'COMPANY_ADMIN' ? 'Industrial Enterprise' : 'Household Resident',
      badge: 'Google Account',
    };

    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess(customProfile);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
        
        {/* Top Google Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-sm">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500">to continue to <strong className="text-sky-700 font-semibold">AquaSense SCADA</strong></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {isAuthenticating ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">Verifying Google Credentials...</p>
                <p className="text-xs text-slate-500 mt-1">Exchanging secure OAuth 2.0 token with AquaSense backend</p>
              </div>
            </div>
          ) : !showCustomForm ? (
            <>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Choose an account to sign in:
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {GOOGLE_DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleSelectPredefined(acc)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition flex items-center gap-3.5 group shadow-sm hover:shadow-md"
                  >
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-inner"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-slate-900 truncate group-hover:text-sky-700">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {acc.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate font-mono">{acc.email}</div>
                      <div className="text-[11px] text-sky-600 font-medium mt-0.5">{acc.roleLabel}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Google Account Option */}
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-sky-500 hover:bg-slate-50 transition text-xs font-semibold text-slate-600 hover:text-sky-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                Use another Google Account
              </button>
            </>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="text-xs text-slate-600">
                Enter your Google Account email to authenticate via OAuth:
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Anand Mahindra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  Authorize Google <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            TLS 1.3 256-Bit Encrypted OAuth
          </span>
          <span className="text-slate-400">AquaSense Auth v2.4</span>
        </div>

      </div>
    </div>
  );
};
