import React, { useState } from 'react';
import { 
  Server, Database, Code, Cpu, Terminal, CheckCircle2, 
  Send, Copy, Play, ArrowRight, Layers, FileCode 
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ArchitectureApiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'API' | 'DATABASE' | 'ESP32_CODE'>('API');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('POST_READINGS');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loadingApi, setLoadingApi] = useState(false);

  const endpoints = [
    {
      id: 'POST_READINGS',
      method: 'POST',
      path: '/api/v1/readings',
      desc: 'ESP32 IoT sensor telemetry ingestion endpoint',
      sampleBody: {
        device_token: "tok_esp32_h002_sec",
        device_id: "ESP32-H002",
        flow_rate_lpm: 15.23,
        total_volume_litre: 128450.0,
        pulse_count: 450,
        signal_rssi_dbm: -62,
        battery_voltage_v: 24.0
      },
      response: {
        status: "success",
        reading_id: "rdg_9482710",
        timestamp: "2026-09-09T18:32:04Z",
        anomaly_detected: true,
        alert_triggered: "AQ-ALERT-0926",
        difference_lpm: 1.13,
        threshold_lpm: 0.50,
        message: "Telemetry ingested. Possible water loss flagged."
      }
    },
    {
      id: 'GET_PIPELINES',
      method: 'GET',
      path: '/api/v1/pipelines',
      desc: 'List all operational pipelines with dual-sensor flow balance',
      response: {
        company: "Viraj Profiles, Boisar",
        count: 5,
        pipelines: [
          { code: "PRD-001", name: "Production Line A", inlet: 15.23, outlet: 14.10, diff: 1.13, status: "possible_loss" },
          { code: "COL-001", name: "Cooling System", inlet: 12.40, outlet: 12.38, diff: 0.02, status: "normal" },
          { code: "PRC-001", name: "Chemical Unit", inlet: 9.15, outlet: 9.12, diff: 0.03, status: "normal" }
        ]
      }
    },
    {
      id: 'GET_CONSUMPTION',
      method: 'GET',
      path: '/api/v1/consumption?period=30d',
      desc: 'Aggregated volumetric consumption trends & zonal distribution',
      response: {
        total_consumed_litre: 128450,
        today_consumed_litre: 8642,
        areas: { production: 42, cooling: 27, processing: 18, utilities: 9, other: 4 }
      }
    },
    {
      id: 'GET_ALERTS',
      method: 'GET',
      path: '/api/v1/alerts?status=OPEN',
      desc: 'Fetch active unverified differential loss and baseline alerts',
      response: {
        open_alerts: [
          { alert_code: "AQ-ALERT-0926", category: "Possible Water Loss", pipeline: "Production Line A", diff: 1.13, threshold: 0.50 }
        ]
      }
    },
    {
      id: 'GET_BILLS',
      method: 'GET',
      path: '/api/v1/bills/household/H102',
      desc: 'Retrieve municipal water bill and progressive slab calculations',
      response: {
        bill_id: "MUNI-BILL-2026-092",
        household_id: "H102",
        consumption_litre: 5420,
        total_amount_inr: 398.50,
        due_date: "2026-09-20"
      }
    }
  ];

  const currentEndpoint = endpoints.find(e => e.id === selectedEndpoint) || endpoints[0];

  const handleExecuteApi = () => {
    setLoadingApi(true);
    setTimeout(() => {
      setApiResponse(currentEndpoint.response);
      setLoadingApi(false);
      toast.success(`Executed ${currentEndpoint.method} ${currentEndpoint.path}`);
    }, 400);
  };

  const esp32ArduinoCode = `/*
 * AquaSense ESP32 Flow Telemetry Firmware
 * Hardware: ESP32 + YF-S201 / Industrial Turbine Flow Sensor
 * Platform: AquaSense SCADA REST Ingestion Engine
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "AquaSense_Industrial_IoT";
const char* password = "SCADA_Secure_Passkey_2026";
const char* serverUrl = "https://aquasense.viraj.demo/api/v1/readings";
const char* deviceToken = "tok_esp32_h002_sec";

#define FLOW_SENSOR_PIN 18
#define CALIBRATION_FACTOR 4.5 // Pulses per second per L/min

volatile uint32_t pulseCount = 0;
float flowRateLpm = 0.0;
float totalLitres = 128450.0;
unsigned long oldTime = 0;

void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected. AquaSense Node Ready.");
}

void loop() {
  if ((millis() - oldTime) > 1000) { // 1 Hz Telemetry Sampling
    detachInterrupt(FLOW_SENSOR_PIN);
    
    flowRateLpm = ((1000.0 / (millis() - oldTime)) * pulseCount) / CALIBRATION_FACTOR;
    oldTime = millis();
    totalLitres += (flowRateLpm / 60.0);
    uint32_t currentPulses = pulseCount;
    pulseCount = 0;
    
    attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), pulseCounter, FALLING);

    // Transmit JSON Payload
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      http.addHeader("X-Device-Token", deviceToken);

      StaticJsonDocument<256> doc;
      doc["device_token"] = deviceToken;
      doc["device_id"] = "ESP32-H002";
      doc["flow_rate_lpm"] = flowRateLpm;
      doc["total_volume_litre"] = totalLitres;
      doc["pulse_count"] = currentPulses;
      doc["signal_rssi_dbm"] = WiFi.RSSI();
      doc["battery_voltage_v"] = 24.0; // Mains industrial feed

      String requestBody;
      serializeJson(doc, requestBody);
      int httpResponseCode = http.POST(requestBody);
      http.end();
    }
  }
}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
              System Architecture
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Production Stack
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            API, Database &amp; Hardware Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore the relational data schema, interactive REST endpoints, and plug-and-play ESP32 firmware source
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('API')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'API' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            REST API Explorer
          </button>
          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'DATABASE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Database Schema (ERD)
          </button>
          <button
            onClick={() => setActiveTab('ESP32_CODE')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'ESP32_CODE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ESP32 Firmware Code
          </button>
        </div>
      </div>

      {activeTab === 'API' && (
        /* ========================================================================= */
        /* TAB 1: REST API EXPLORER                                                  */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Endpoints List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">SCADA API Endpoints</h3>
            
            <div className="space-y-2">
              {endpoints.map((ep) => {
                const isSelected = selectedEndpoint === ep.id;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEndpoint(ep.id);
                      setApiResponse(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'POST' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="truncate text-slate-800 font-semibold">{ep.path}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 leading-tight">{ep.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Test Bench */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 font-mono">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    currentEndpoint.method === 'POST' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-sky-50 text-sky-700 border border-sky-200'
                  }`}>
                    {currentEndpoint.method}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{currentEndpoint.path}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{currentEndpoint.desc}</p>
              </div>

              <button
                onClick={handleExecuteApi}
                disabled={loadingApi}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Execute Test
              </button>
            </div>

            {/* Request Body (if POST) */}
            {currentEndpoint.sampleBody && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Request Payload (JSON)</span>
                <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                  {JSON.stringify(currentEndpoint.sampleBody, null, 2)}
                </pre>
              </div>
            )}

            {/* Response Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Live API Response</span>
                {apiResponse && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    200 OK • 24ms
                  </span>
                )}
              </div>

              <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto min-h-[140px]">
                {loadingApi ? (
                  <span className="text-slate-400 animate-pulse">Executing HTTP request to AquaSense backend...</span>
                ) : apiResponse ? (
                  JSON.stringify(apiResponse, null, 2)
                ) : (
                  <span className="text-slate-500">// Click "Execute Test" above to execute mock REST call</span>
                )}
              </pre>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'DATABASE' && (
        /* ========================================================================= */
        /* TAB 2: DATABASE ENTITY RELATIONSHIP ARCHITECTURE                          */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-600" />
              Relational Database Entities &amp; Data Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Backend-ready PostgreSQL data models supporting real-time IoT readings, mass balance calculations, and multi-tenant RBAC
            </p>
          </div>

          {/* Flow Pipeline Graphic */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
            <div className="font-bold text-sky-700 uppercase text-[11px] mb-2">Core Data Flow Hierarchy:</div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
              <span className="bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">User / Role</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">Household / Company</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">Meter / Pipeline</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-white px-2.5 py-1 rounded border border-slate-200 text-slate-800">ESP32 Device</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded border border-sky-200 font-bold">Water Readings</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-200 font-bold">Analytics &amp; Billing</span>
            </div>
          </div>

          {/* Database Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-sky-700 font-mono text-sm">Table: pipelines</div>
              <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
                <li>• id (UUID, PK)</li>
                <li>• company_id (FK)</li>
                <li>• pipeline_code (VARCHAR)</li>
                <li>• area (VARCHAR)</li>
                <li>• inlet_sensor_id (FK)</li>
                <li>• outlet_sensor_id (FK)</li>
                <li>• tolerance_lpm (FLOAT)</li>
                <li>• baseline_kld (FLOAT)</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-sky-700 font-mono text-sm">Table: water_readings</div>
              <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
                <li>• id (BIGINT, PK)</li>
                <li>• device_id (FK)</li>
                <li>• pipeline_id (FK)</li>
                <li>• flow_rate_lpm (FLOAT)</li>
                <li>• total_volume_litre (DOUBLE)</li>
                <li>• reading_ts (TIMESTAMP)</li>
                <li>• is_anomaly (BOOLEAN)</li>
                <li>• difference_lpm (FLOAT)</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-sky-700 font-mono text-sm">Table: water_alerts</div>
              <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
                <li>• id (UUID, PK)</li>
                <li>• alert_code (VARCHAR)</li>
                <li>• category (VARCHAR)</li>
                <li>• pipeline_id (FK)</li>
                <li>• difference_lpm (FLOAT)</li>
                <li>• status (ENUM: OPEN..CLOSED)</li>
                <li>• assigned_team (VARCHAR)</li>
                <li>• created_at (TIMESTAMP)</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'ESP32_CODE' && (
        /* ========================================================================= */
        /* TAB 3: ESP32 ARDUINO C++ FIRMWARE CODE                                   */
        /* ========================================================================= */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-600" />
                ESP32 Flow Meter Arduino C++ Firmware
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Zero-modification hardware code: flash directly to ESP32 microcontrollers with pulse counter flow sensors
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(esp32ArduinoCode);
                toast.success('ESP32 Arduino code copied to clipboard!');
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5 text-sky-600" /> Copy Code
            </button>
          </div>

          <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[480px]">
            {esp32ArduinoCode}
          </pre>
        </div>
      )}

    </div>
  );
};
