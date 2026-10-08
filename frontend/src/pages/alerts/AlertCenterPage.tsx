import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { AlertCategory, AlertStatus } from '../../types/aquasense';
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, MapPin, 
  Search, Filter, UserCheck, Wrench, Check, ArrowRight, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AlertCenterPage: React.FC = () => {
  const { 
    alerts, 
    openAlertModal, 
    acknowledgeAlert, 
    assignAlertInspection, 
    resolveAlert,
    selectPipeline 
  } = useAquaSenseStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: AlertCategory[] = [
    'Possible Water Loss',
    'High Usage',
    'Device Offline',
    'Meter Error',
    'Water Supply Interruption',
    'Maintenance',
    'System Warning'
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (selectedCategory !== 'ALL' && a.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.alertCode.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.exactLocation.toLowerCase().includes(q) ||
        (a.pipelineName && a.pipelineName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACKNOWLEDGED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Incident Management
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              SCADA Event Log
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AquaSense Alert Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of possible water loss events, telemetry dropouts, baseline exceedances, and work orders
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="font-bold text-slate-900">{alerts.length} Total Alerts</span>
          <span>•</span>
          <span className="text-amber-700 font-bold">{alerts.filter(a => a.status === 'OPEN').length} Open</span>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Alert ID, pipeline, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600">
              <tr>
                <th className="py-3 px-4">Alert ID &amp; Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Differential</th>
                <th className="py-3 px-4">Physical Location</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No alerts found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50 transition">
                    
                    {/* Alert Code & Timestamp */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sky-600">{alert.alertCode}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{alert.createdAt} • {alert.time}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {alert.category}
                    </td>

                    {/* Description & Flow Diff */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900">{alert.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alert.description}</div>
                      {alert.inletFlowLpm !== undefined && alert.outletFlowLpm !== undefined && (
                        <div className="font-mono text-[10px] text-amber-700 font-semibold mt-1">
                          In: {alert.inletFlowLpm.toFixed(2)} L/m | Out: {alert.outletFlowLpm.toFixed(2)} L/m (Diff: {alert.differenceLpm?.toFixed(2)} L/m &gt; {alert.thresholdLpm?.toFixed(2)})
                        </div>
                      )}
                    </td>

                    {/* Exact Location */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px]">{alert.exactLocation}</span>
                      </div>
                    </td>

                    {/* Assigned Team */}
                    <td className="py-3.5 px-4">
                      {alert.assignedTeam ? (
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">{alert.assignedTeam}</div>
                          <div className="text-[10px] text-slate-500">{alert.assignedEngineer || 'Field Lead'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openAlertModal(alert.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-sky-700 hover:text-sky-800 border border-slate-200 font-semibold rounded-lg text-xs transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
