import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  X, AlertTriangle, CheckCircle2, UserCheck, Wrench, 
  MapPin, Clock, ArrowRight, ShieldAlert, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WaterLossAlertModalProps {
  onClose?: () => void;
}

export const WaterLossAlertModal: React.FC<WaterLossAlertModalProps> = ({ onClose }) => {
  const { 
    alerts, 
    activeAlertModalId, 
    openAlertModal, 
    acknowledgeAlert, 
    assignAlertInspection,
    selectPipeline,
    resolveAlert
  } = useAquaSenseStore();

  const [assigneeTeam, setAssigneeTeam] = useState('Mechanical Maintenance Team Alpha');
  const [assigneeEngineer, setAssigneeEngineer] = useState('Vikas Patil (Senior Tech)');
  const [showAssignForm, setShowAssignForm] = useState(false);

  if (!activeAlertModalId) return null;

  const alert = alerts.find(a => a.id === activeAlertModalId) || alerts[0];

  const handleClose = () => {
    openAlertModal(null);
    if (onClose) onClose();
  };

  const handleAcknowledge = () => {
    acknowledgeAlert(alert.id);
    toast.success(`Alert ${alert.alertCode} acknowledged by management.`);
  };

  const handleAssign = () => {
    assignAlertInspection(alert.id, assigneeTeam, assigneeEngineer);
    setShowAssignForm(false);
    toast.success(`Inspection work order assigned to ${assigneeTeam} (${assigneeEngineer}).`);
  };

  const handleViewPipeline = () => {
    if (alert.pipelineId) {
      selectPipeline(alert.pipelineId);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Water Loss Alert</h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  {alert.alertCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                Detected Today at {alert.time} • Differential Loss Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Main Anomaly Summary */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Affected Pipeline</span>
                <div className="font-bold text-slate-900 text-sm">{alert.pipelineName || 'Production Line A'}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Status</span>
                <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 inline-block mt-0.5">
                  {alert.status === 'OPEN' ? 'REQUIRES VERIFICATION' : alert.status}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
              <span>{alert.exactLocation}</span>
            </div>
          </div>

          {/* Differential Flow Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-500">Inlet Flow</div>
              <div className="text-base font-mono font-bold text-sky-700 mt-0.5">
                {alert.inletFlowLpm ? alert.inletFlowLpm.toFixed(2) : '15.23'} <span className="text-[10px] font-normal text-slate-400">L/m</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-500">Outlet Flow</div>
              <div className="text-base font-mono font-bold text-sky-700 mt-0.5">
                {alert.outletFlowLpm ? alert.outletFlowLpm.toFixed(2) : '14.10'} <span className="text-[10px] font-normal text-slate-400">L/m</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <div className="text-[10px] uppercase font-bold text-amber-800">Difference</div>
              <div className="text-base font-mono font-bold text-amber-700 mt-0.5">
                {alert.differenceLpm ? alert.differenceLpm.toFixed(2) : '1.13'} <span className="text-[10px] font-normal text-amber-800">L/m</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
              <div className="text-[10px] uppercase font-bold text-slate-500">Threshold</div>
              <div className="text-base font-mono font-bold text-slate-800 mt-0.5">
                {alert.thresholdLpm ? alert.thresholdLpm.toFixed(2) : '0.50'} <span className="text-[10px] font-normal text-slate-400">L/m</span>
              </div>
            </div>
          </div>

          {/* Description & Engineering Notice */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-800">Telemetry Analysis:</div>
            <p>
              Difference of <strong className="text-amber-800 font-mono">1.13 L/min</strong> exceeds configured tolerance of <strong className="text-slate-800 font-mono">0.50 L/min</strong> by <strong>+126%</strong>.
            </p>
            <p className="text-slate-500 text-[11px] italic">
              Notice: The platform flags "POSSIBLE WATER LOSS" based on dual sensor telemetry. Physical inspection is required before confirming a pipe rupture or valve packing leak.
            </p>
          </div>

          {/* Recommended Action */}
          <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 text-sky-800 font-semibold">
              <Wrench className="w-4 h-4 text-sky-600" />
              Recommended Action:
            </div>
            <span className="font-bold text-sky-900 uppercase tracking-wide">
              VERIFY PIPELINE &amp; INSPECT BAY 3 RACK
            </span>
          </div>

          {/* Assignment Status */}
          {alert.assignedTeam && (
            <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 font-medium">Assigned Team:</span>
                <div className="font-bold text-slate-800">{alert.assignedTeam}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-medium">Lead Tech:</span>
                <div className="font-semibold text-slate-700">{alert.assignedEngineer || 'Vikas Patil'}</div>
              </div>
            </div>
          )}

          {/* Assignment Form Popup */}
          {showAssignForm && (
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 space-y-3 animate-in fade-in">
              <h5 className="font-bold text-xs text-slate-800 uppercase">Dispatch Field Inspection</h5>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Maintenance Team</label>
                <select 
                  value={assigneeTeam}
                  onChange={(e) => setAssigneeTeam(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                >
                  <option value="Mechanical Maintenance Team Alpha">Mechanical Maintenance Team Alpha</option>
                  <option value="Piping & Valve Inspection Unit">Piping &amp; Valve Inspection Unit</option>
                  <option value="Instrumentation & SCADA Field Ops">Instrumentation &amp; SCADA Field Ops</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Assigned Lead Tech</label>
                <input 
                  type="text"
                  value={assigneeEngineer}
                  onChange={(e) => setAssigneeEngineer(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAssign}
                  className="flex-1 px-3 py-2 bg-sky-600 text-white font-semibold text-xs rounded-lg hover:bg-sky-700 transition"
                >
                  Confirm Dispatch
                </button>
                <button
                  onClick={() => setShowAssignForm(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAcknowledge}
              disabled={alert.status === 'ACKNOWLEDGED' || alert.status === 'IN_PROGRESS'}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {alert.status === 'OPEN' ? 'Acknowledge' : 'Acknowledged'}
            </button>

            <button
              onClick={() => setShowAssignForm(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Assign Inspection
            </button>
          </div>

          <button
            onClick={handleViewPipeline}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            View Pipeline Map <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
