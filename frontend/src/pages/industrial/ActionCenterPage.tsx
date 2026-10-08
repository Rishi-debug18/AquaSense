import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  CheckCircle2, AlertTriangle, Clock, Wrench, ShieldAlert, 
  Search, Filter, Check, User, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const ActionCenterPage: React.FC = () => {
  const { actionItems, acknowledgeActionItem, assignActionItem, resolveActionItem } = useAquaSenseStore();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = actionItems.filter(item => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && !item.taskCode.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-500 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                AquaSense Action Center
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                CLOSED-LOOP WORKFLOW
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized operational tasks, incident mitigation, and field inspection dispatch.
            </p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                filterStatus === st
                  ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {st === 'ALL' && 'All Actions'}
              {st === 'OPEN' && 'Open'}
              {st === 'IN_PROGRESS' && 'In Progress'}
              {st === 'RESOLVED' && 'Resolved'}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition space-y-4 ${
              item.status === 'RESOLVED' 
                ? 'border-slate-200 opacity-75' 
                : item.priority === 'CRITICAL'
                ? 'border-red-300 ring-1 ring-red-300/50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top Row: Priority, Code & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                  item.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-300' :
                  item.priority === 'HIGH' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-sky-100 text-sky-800 border border-sky-300'
                }`}>
                  {item.priority} PRIORITY
                </span>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {item.taskCode}
                </span>
                <span className="text-xs text-slate-400">• Source: {item.source}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  item.status === 'OPEN' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  item.status === 'IN_PROGRESS' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                  'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {item.status}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">{item.timestamp}</span>
              </div>
            </div>

            {/* Task Title & Description */}
            <div className="space-y-1 text-xs">
              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </div>

            {/* Operational Recommendation Callout */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <strong className="text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-600" /> Recommended Action:
              </strong>
              <p className="text-slate-600 text-[11px]">{item.recommendedAction}</p>
            </div>

            {/* Assignment & Action Triggers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span>Assigned: <strong>{item.assignedPerson || 'Unassigned'}</strong> ({item.assignedTeam || 'None'})</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {item.status === 'OPEN' && (
                  <button
                    onClick={() => {
                      acknowledgeActionItem(item.id);
                      toast.success(`Task ${item.taskCode} Acknowledged`);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Acknowledge
                  </button>
                )}

                {item.status !== 'RESOLVED' && (
                  <>
                    <button
                      onClick={() => {
                        assignActionItem(item.id, 'Mechanical Alpha', 'Senior Tech Vikas Patil');
                        toast.success(`Task ${item.taskCode} assigned to Senior Tech Vikas Patil`);
                      }}
                      className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold rounded-xl transition"
                    >
                      Assign Tech
                    </button>

                    <button
                      onClick={() => {
                        resolveActionItem(item.id);
                        toast.success(`Task ${item.taskCode} marked as RESOLVED`);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition"
                    >
                      Mark Resolved
                    </button>
                  </>
                )}

                {item.targetRoute && (
                  <button
                    onClick={() => item.targetRoute && navigate(item.targetRoute)}
                    className="p-2 text-slate-400 hover:text-slate-800 transition"
                    title="View related module"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
