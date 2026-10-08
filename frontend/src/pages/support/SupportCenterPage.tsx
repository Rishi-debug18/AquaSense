import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { SupportTicket } from '../../types/aquasense';
import { 
  LifeBuoy, Plus, MessageSquare, Clock, MapPin, 
  Send, CheckCircle2, User, AlertCircle, Filter, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SupportCenterPage: React.FC = () => {
  const { supportTickets, createSupportTicket, updateTicketStatus, addTicketResponse, currentHousehold } = useAquaSenseStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(supportTickets[0]?.id || '');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('Leakage');
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('HIGH');
  const [replyMessage, setReplyMessage] = useState('');

  const activeTicket = supportTickets.find(t => t.id === selectedTicketId) || supportTickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDesc.trim()) {
      toast.error('Please enter a ticket subject and description.');
      return;
    }

    createSupportTicket({
      category: newCategory,
      subject: newSubject,
      description: newDesc,
      userName: currentHousehold.residentName,
      location: currentHousehold.address,
      priority: newPriority,
      status: 'OPEN',
    });

    setShowNewTicketModal(false);
    setNewSubject('');
    setNewDesc('');
    toast.success('Support ticket submitted successfully. Ticket ID generated.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    addTicketResponse(
      activeTicket.id,
      'Support Desk Engineer',
      'Municipal Liaison Officer',
      replyMessage
    );

    setReplyMessage('');
    toast.success('Response added to ticket thread.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              Citizen &amp; Industrial Assistance
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Ticketing Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            AquaSense Support &amp; Complaint Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lodge billing inquiries, physical leakage reports, meter calibration requests, and emergency supply issues
          </p>
        </div>

        <button
          onClick={() => setShowNewTicketModal(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Raise Support Ticket
        </button>
      </div>

      {/* 2 Columns: Tickets List & Active Ticket Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets Queue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Tickets Queue ({supportTickets.length})</h3>
            <span className="text-xs text-slate-500">All Categories</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {supportTickets.map((tkt) => {
              const isSelected = activeTicket && activeTicket.id === tkt.id;
              return (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicketId(tkt.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sky-700 text-[11px]">{tkt.ticketCode}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      tkt.status === 'OPEN'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : tkt.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {tkt.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs truncate">{tkt.subject}</h4>
                  <div className="text-[11px] text-slate-500 truncate">{tkt.userName} • {tkt.category}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Ticket Conversation & Resolution */}
        {activeTicket && (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sky-700 text-xs bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {activeTicket.ticketCode}
                    </span>
                    <span className="text-xs text-slate-500">Category: <strong className="text-slate-800">{activeTicket.category}</strong></span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{activeTicket.subject}</h2>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{activeTicket.location}</span>
                    <span>•</span>
                    <span>Created: {activeTicket.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e) => {
                      updateTicketStatus(activeTicket.id, e.target.value as any);
                      toast.success(`Ticket status updated to ${e.target.value}`);
                    }}
                    className="bg-slate-50 border border-slate-200 text-xs text-slate-800 px-3 py-1.5 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Initial Issue Description */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  {activeTicket.userName} wrote:
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeTicket.description}
                </p>
              </div>

              {/* Responses Thread */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Responses &amp; Audit Thread</h4>
                {activeTicket.responses.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                    No officer replies posted yet. Type a message below to respond to the resident/team.
                  </div>
                ) : (
                  activeTicket.responses.map((resp, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-sky-700">{resp.author} ({resp.role})</span>
                        <span className="text-slate-400 font-mono">{resp.timestamp}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pt-1">{resp.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an official response or investigation note..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* NEW TICKET MODAL */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-sky-700">
                <LifeBuoy className="w-5 h-5 text-sky-600" />
                Raise AquaSense Support Ticket
              </h3>
              <button onClick={() => setShowNewTicketModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">Issue Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="Meter Issue">Meter Issue</option>
                  <option value="Leakage">Physical Leakage / Seepage</option>
                  <option value="Water Supply">Water Supply Interruption</option>
                  <option value="High Consumption">High Consumption Inquiry</option>
                  <option value="Technical Problem">IoT / Technical Problem</option>
                  <option value="General Complaint">General Complaint</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Water meter reading abnormal after power flicker"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what you observed, meter readings, or physical location..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
