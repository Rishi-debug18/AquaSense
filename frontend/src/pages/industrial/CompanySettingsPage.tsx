import React, { useState } from 'react';
import { 
  Building2, Droplets, Landmark, Sliders, ShieldCheck, 
  Mail, Phone, MapPin, Check, Save, Bell, Cpu, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CompanySettingsPage: React.FC = () => {
  const [companyName, setCompanyName] = useState('Viraj Profiles Pvt. Ltd.');
  const [industryType, setIndustryType] = useState('Stainless Steel Manufacturing & Rolling Plant');
  const [facilityLocation, setFacilityLocation] = useState('Plot G-12, MIDC Boisar Industrial Area, Maharashtra - 401506');
  const [waterProvider, setWaterProvider] = useState('MIDC Boisar Water Supply Division');
  const [connectionId, setConnectionId] = useState('AQ-CONN-001');
  const [billingAccountId, setBillingAccountId] = useState('AQ-COMP-001');
  const [contactEmail, setContactEmail] = useState('utilities.admin@virajprofiles.demo');
  const [contactPhone, setContactPhone] = useState('+91 2525 661000');
  
  // Alert Thresholds
  const [defaultToleranceLpm, setDefaultToleranceLpm] = useState('0.50');
  const [highUsageThresholdPercent, setHighUsageThresholdPercent] = useState('25.0');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Company water profile and telemetry parameters saved successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" /> Enterprise Configuration
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Company Admin RBAC
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Company Profile &amp; Water Telemetry Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage facility demographics, bulk municipal water connection parameters, and alarm thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-600/20 transition self-start md:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* 2. Main Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Facility Profile & Water Service Provider Connection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Company Profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Company &amp; Manufacturing Facility Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Facility Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Facility Address &amp; Coordinates</label>
                <input
                  type="text"
                  value={facilityLocation}
                  onChange={(e) => setFacilityLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Utilities Admin Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plant Control Room Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Water Service Provider Linkage */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-sky-600" />
              Water Service Provider (Supplier &amp; Billing Authority)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Water Service Provider</label>
                <input
                  type="text"
                  value={waterProvider}
                  onChange={(e) => setWaterProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Connection ID (Meter Intake)</label>
                <input
                  type="text"
                  value={connectionId}
                  onChange={(e) => setConnectionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Account Number</label>
                <input
                  type="text"
                  value={billingAccountId}
                  onChange={(e) => setBillingAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-950 flex items-center justify-between">
              <div>
                <span className="font-bold">Bulk Intake Connection Status:</span>
                <span className="ml-2 text-emerald-700 font-bold">ACTIVE (4.8 Bar Header Pressure)</span>
              </div>
              <span className="text-[11px] font-mono text-sky-800">MIDC Boisar Reservoir Feed</span>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Loss Tolerances & Notification Rules */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              Alarm &amp; Tolerance Thresholds
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Differential Tolerance</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    value={defaultToleranceLpm}
                    onChange={(e) => setDefaultToleranceLpm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                  <span className="text-xs text-slate-500">L/min</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Tolerance delta before flagging possible water loss.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">High-Usage Anomaly Threshold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={highUsageThresholdPercent}
                    onChange={(e) => setHighUsageThresholdPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Percentage surge above historical baseline.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              Dispatch Notifications
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailAlertsEnabled}
                  onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span>Email alerts to Control Room</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span>SMS priority push for Possible Water Loss</span>
              </label>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
};
