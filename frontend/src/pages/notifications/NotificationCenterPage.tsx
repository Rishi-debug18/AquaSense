import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Send, Bell, Users, MapPin, Building2, AlertTriangle, 
  CheckCircle2, Clock, Plus, Sparkles, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const NotificationCenterPage: React.FC = () => {
  const { notifications, createNotification, municipalAreas } = useAquaSenseStore();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'ALL_HOUSEHOLDS' | 'SPECIFIC_AREA' | 'SELECTED_HOUSEHOLD' | 'COMPANY_DEPT' | 'PIPELINE_TEAM'>('ALL_HOUSEHOLDS');
  const [targetDetail, setTargetDetail] = useState('All Vangaon Municipal Residents');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  const templates = [
    {
      label: 'Water Supply Maintenance Notice',
      title: 'Scheduled Water Supply Interruption Notice',
      message: 'Water supply will be unavailable tomorrow from 10:00 AM to 2:00 PM due to scheduled municipal pipeline maintenance.',
      audience: 'ALL_HOUSEHOLDS' as const,
      detail: 'All Vangaon Municipal Sectors',
      priority: 'HIGH' as const,
    },
    {
      label: 'Baseline Usage Exceedance Alert',
      title: 'Excessive Consumption Baseline Advisory',
      message: 'Your water consumption has exceeded the configured weekly baseline. Please check for unintentional fixture leaks.',
      audience: 'SPECIFIC_AREA' as const,
      detail: 'Area B — Central Vangaon',
      priority: 'MEDIUM' as const,
    },
    {
      label: 'Industrial Pipeline Loss Verification',
      title: 'Urgent: Possible Water Loss Detected in Production Line A',
      message: 'Possible water loss detected in Production Line A (Bay 3 Rack). Mechanical inspection team verification required immediately.',
      audience: 'PIPELINE_TEAM' as const,
      detail: 'Viraj Profiles — Mechanical Maintenance Alpha',
      priority: 'URGENT' as const,
    },
  ];

  const handleApplyTemplate = (tmpl: typeof templates[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setAudience(tmpl.audience);
    setTargetDetail(tmpl.detail);
    setPriority(tmpl.priority);
    toast.success(`Template applied: ${tmpl.label}`);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter a notification title and message.');
      return;
    }

    createNotification({
      title,
      message,
      targetAudience: audience,
      targetDetail,
      priority,
      scheduledAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'SENT',
      createdBy: 'Municipal Water Board Dispatch Desk',
    });

    setTitle('');
    setMessage('');
    toast.success('Broadcast notification dispatched successfully!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Communication &amp; Alerts
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Multi-Channel Broadcast
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Notification &amp; Broadcast Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish municipal maintenance advisories, baseline breach notices, and industrial emergency work alerts
          </p>
        </div>
      </div>

      {/* Grid: Composer on Left, Sent History on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Notification Composer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-600" />
              Compose Broadcast
            </h3>
            <span className="text-xs text-slate-500 font-medium">Instant Dispatch</span>
          </div>

          {/* Quick Pre-made Templates */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 block">Quick Notice Templates</span>
            <div className="flex flex-col gap-1.5">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.label}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition flex items-center justify-between group"
                >
                  <span className="truncate">{tmpl.label}</span>
                  <Sparkles className="w-3 h-3 text-sky-600 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL_HOUSEHOLDS">All Households (Municipal Wide)</option>
                <option value="SPECIFIC_AREA">Specific Municipal Area</option>
                <option value="SELECTED_HOUSEHOLD">Selected Household Resident</option>
                <option value="COMPANY_DEPT">Industrial Company Department</option>
                <option value="PIPELINE_TEAM">Specific Pipeline / Maintenance Team</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Scope / Detail</label>
              <input
                type="text"
                value={targetDetail}
                onChange={(e) => setTargetDetail(e.target.value)}
                placeholder="e.g. Area A — North Vangaon or Rolling Mill Team"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Notification Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water Supply Will Be Unavailable..."
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Message Body</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your official announcement or maintenance instructions here..."
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" /> Dispatch Broadcast Notice
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Sent Notifications Log */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Broadcast Delivery History</h3>
              <p className="text-xs text-slate-500">Chronological broadcast log and recipient reach status</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{notifications.length} Sent</span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        notif.priority === 'URGENT'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : notif.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {notif.priority}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-3">
                    <span>Audience: <strong className="text-slate-800">{notif.targetDetail || notif.targetAudience}</strong></span>
                    <span>•</span>
                    <span>Sent: <strong className="text-slate-700">{notif.sentAt}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered ({notif.readCount} Acknowledged)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
