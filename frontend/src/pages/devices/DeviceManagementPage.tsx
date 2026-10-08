import React, { useState } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  Cpu, Wifi, WifiOff, Battery, RefreshCw, Activity, 
  Search, ShieldCheck, Terminal, Check, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DeviceManagementPage: React.FC = () => {
  const { devices, updateDeviceStatus, simulationActive, tickTelemetry } = useAquaSenseStore();
  const [selectedDevice, setSelectedDevice] = useState<string>(devices[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const activeDevice = devices.find(d => d.id === selectedDevice) || devices[0];

  const handlePingDevice = (deviceCode: string) => {
    toast.success(`Ping acknowledged by ${deviceCode} (Latency: 28ms, RSSI: -58dBm)`);
  };

  const handleToggleStatus = (devId: string, current: string) => {
    const next = current === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    updateDeviceStatus(devId, next as any);
    toast.success(`Device status updated to ${next}`);
  };

  const filteredDevices = devices.filter(d => 
    d.deviceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sensorModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              IoT Hardware Fleet
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              ESP32 Flow Nodes
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Device Management &amp; Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Microcontroller health, WiFi signal RSSI, pulse counter calibration, and live JSON packets
          </p>
        </div>

        <button
          onClick={() => {
            tickTelemetry();
            toast.success('Triggered manual heartbeat poll across all 12 ESP32 nodes.');
          }}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Poll Fleet Heartbeats
        </button>
      </div>

      {/* Grid: Left Table & Right Raw Packet Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Devices Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 max-w-sm text-xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search device ID, pipeline, sensor model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none w-full"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium">
              {filteredDevices.filter(d => d.status === 'ONLINE').length} / {filteredDevices.length} Online
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Device ID</th>
                  <th className="py-2.5 px-3">Assigned Location</th>
                  <th className="py-2.5 px-3">Sensor Model</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Reading</th>
                  <th className="py-2.5 px-3">Signal / Battery</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDevices.map((dev) => {
                  const isOnline = dev.status === 'ONLINE';
                  return (
                    <tr 
                      key={dev.id} 
                      onClick={() => setSelectedDevice(dev.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition ${selectedDevice === dev.id ? 'bg-sky-50/70' : ''}`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-sky-600">
                        {dev.deviceCode}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{dev.assignedTo}</div>
                        <div className="text-[10px] text-slate-500">{dev.ipAddress}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {dev.sensorModel}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {dev.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-900 font-semibold">
                        {dev.currentFlowLpm.toFixed(2)} L/min
                        <div className="text-[10px] text-slate-500 font-normal">{dev.lastHeartbeat}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Wifi className="w-3 h-3 text-emerald-600" />
                          <span className="font-mono text-[11px]">{dev.signalRssi} dBm</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Battery className="w-3 h-3 text-sky-600" />
                          <span>{dev.batteryVoltage}V</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(dev.id, dev.status);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Telemetry Packet Inspector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-600" />
              Live JSON Packet Stream
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HTTP 200 OK
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-600">Inspecting Node: <strong className="text-sky-600 font-mono">{activeDevice.deviceCode}</strong></div>
            <div className="text-slate-500 text-[11px]">Assigned to: {activeDevice.assignedTo}</div>
          </div>

          {/* Raw JSON Code Block */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
            <span className="text-slate-400">// POST /api/v1/readings Payload</span>
            <br />
            {`{
  "device_token": "tok_${activeDevice.deviceCode.toLowerCase()}_sec",
  "device_id": "${activeDevice.deviceCode}",
  "timestamp": "${new Date().toISOString()}",
  "flow_rate_lpm": ${activeDevice.currentFlowLpm.toFixed(2)},
  "total_volume_litre": ${activeDevice.cumulativeLitre},
  "pulse_count": 450,
  "signal_rssi_dbm": ${activeDevice.signalRssi},
  "battery_voltage_v": ${activeDevice.batteryVoltage},
  "firmware": "${activeDevice.firmwareVersion}"
}`}
          </div>

          <div className="pt-2">
            <button
              onClick={() => handlePingDevice(activeDevice.deviceCode)}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-sky-700 hover:text-sky-800 border border-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Activity className="w-3.5 h-3.5" /> Ping {activeDevice.deviceCode}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
