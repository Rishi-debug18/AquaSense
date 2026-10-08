import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { 
  ZoomIn, ZoomOut, Maximize2, Layers, AlertTriangle, 
  Droplets, Activity, Sliders, RotateCcw, CheckCircle2, 
  MapPin, Eye, Compass, Info, ShieldAlert, ArrowRight, Gauge,
  Network, Map
} from 'lucide-react';

interface LeafletPipelineMapProps {
  onOpenAlertModal?: (alertId: string) => void;
  height?: string;
  onSelectPipeline?: (pipelineId: string) => void;
  mode?: 'INDUSTRIAL' | 'MUNICIPAL';
}

// Fictional realistic GPS coordinates around Boisar Industrial Plant (Viraj Profiles context)
const BOISAR_CENTER: [number, number] = [19.7983, 72.7483];

// Pipeline GPS Waypoints
const PIPELINE_ROUTES: Record<string, { name: string; code: string; color: string; coords: [number, number][]; area: string; pressure: string; length: string }> = {
  'main-header': {
    name: 'MIDC Intake Feeder Line',
    code: 'HDR-001',
    color: '#0284c7', // Primary Sky Blue
    coords: [
      [19.8020, 72.7440], // MIDC Intake Station
      [19.8005, 72.7460],
      [19.7985, 72.7480], // Main Distribution Header
    ],
    area: 'Intake',
    pressure: '4.8 bar',
    length: '1.2 km'
  },
  'pipe-prd-001': {
    name: 'Production Line A',
    code: 'PRD-001',
    color: '#f59e0b', // Amber / Warning Loss
    coords: [
      [19.7985, 72.7480], // Header
      [19.7970, 72.7495],
      [19.7955, 72.7510], // Bay 3 Pipe Rack (Leak Pin)
      [19.7942, 72.7525], // Hot Rolling Unit
    ],
    area: 'Production',
    pressure: '4.4 bar',
    length: '850 m'
  },
  'pipe-col-001': {
    name: 'Cooling Tower Loop',
    code: 'COL-001',
    color: '#0284c7', // Blue
    coords: [
      [19.7985, 72.7480], // Header
      [19.7995, 72.7500],
      [19.8008, 72.7520], // Cooling Tower Skid
    ],
    area: 'Cooling',
    pressure: '4.6 bar',
    length: '620 m'
  },
  'pipe-prc-001': {
    name: 'Chemical Processing Unit',
    code: 'PRC-001',
    color: '#0284c7',
    coords: [
      [19.7985, 72.7480], // Header
      [19.7972, 72.7465],
      [19.7960, 72.7450], // Pickling & Neutralization
    ],
    area: 'Processing',
    pressure: '4.5 bar',
    length: '710 m'
  },
  'pipe-utl-001': {
    name: 'Boiler & Utilities Line',
    code: 'UTL-001',
    color: '#0284c7',
    coords: [
      [19.7985, 72.7480], // Header
      [19.8000, 72.7470],
      [19.8015, 72.7460], // High Pressure Boiler
    ],
    area: 'Utilities',
    pressure: '5.1 bar',
    length: '540 m'
  },
  'pipe-wtr-001': {
    name: 'RO Recycle & Treatment',
    code: 'WTR-001',
    color: '#0284c7',
    coords: [
      [19.7985, 72.7480], // Header
      [19.7968, 72.7485],
      [19.7950, 72.7488], // RO Permeate Skid
    ],
    area: 'Water Treatment',
    pressure: '4.7 bar',
    length: '480 m'
  }
};

export const LeafletPipelineMap: React.FC<LeafletPipelineMapProps> = ({
  onOpenAlertModal,
  height = '480px',
  onSelectPipeline,
  mode = 'INDUSTRIAL'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesRef = useRef<{ [key: string]: L.Polyline }>({});
  const flowPolylinesRef = useRef<{ [key: string]: L.Polyline }>({});

  const { 
    pipelines, 
    selectedPipelineId, 
    selectPipeline, 
    openAlertModal,
    simulationActive,
    leakAnomalyActive
  } = useAquaSenseStore();

  const [legendOpen, setLegendOpen] = useState(true);
  const [showFlowAnimation, setShowFlowAnimation] = useState(true);
  const [tileLayerType, setTileLayerType] = useState<'streets' | 'satellite'>('streets');

  const prdPipe = pipelines.find(p => p.id === 'pipe-prd-001') || pipelines[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: BOISAR_CENTER,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Light OpenStreetMap / Carto Positron Tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous vector layers
    Object.values(polylinesRef.current).forEach(p => map.removeLayer(p));
    Object.values(flowPolylinesRef.current).forEach(p => map.removeLayer(p));
    polylinesRef.current = {};
    flowPolylinesRef.current = {};

    // Draw Pipeline Polylines
    Object.entries(PIPELINE_ROUTES).forEach(([pipeId, route]) => {
      const isSelected = selectedPipelineId === pipeId;
      const isPrd = pipeId === 'pipe-prd-001';
      const hasLoss = isPrd && prdPipe.hasActiveLoss;

      const baseColor = hasLoss ? '#ef4444' : isSelected ? '#0284c7' : '#0369a1';
      const weight = isSelected ? 6 : 4;

      // Base solid polyline
      const polyline = L.polyline(route.coords, {
        color: baseColor,
        weight: weight,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Tooltip on Hover
      polyline.bindTooltip(`
        <div class="px-2 py-1 text-xs font-sans">
          <div class="font-bold text-slate-900">${route.name} (${route.code})</div>
          <div class="text-slate-500 font-mono text-[11px]">Area: ${route.area} • Pressure: ${route.pressure}</div>
          <div class="${hasLoss ? 'text-red-600 font-bold' : 'text-emerald-600'} text-[11px] mt-0.5">
            ${hasLoss ? '⚠️ POSSIBLE WATER LOSS DETECTED' : '● BALANCED FLOW (Normal)'}
          </div>
        </div>
      `, { sticky: true, className: 'leaflet-custom-tooltip' });

      // Click to select
      polyline.on('click', () => {
        if (pipeId !== 'main-header') {
          selectPipeline(pipeId);
          if (onSelectPipeline) onSelectPipeline(pipeId);
        }
      });

      polylinesRef.current[pipeId] = polyline;

      // Animated Flow Overlay Line
      if (showFlowAnimation) {
        const flowPolyline = L.polyline(route.coords, {
          color: hasLoss ? '#f59e0b' : '#38bdf8',
          weight: weight - 1,
          opacity: 0.9,
          className: hasLoss ? 'leaflet-flow-path-warning' : 'leaflet-flow-path',
        }).addTo(map);

        flowPolyline.on('click', () => {
          if (pipeId !== 'main-header') {
            selectPipeline(pipeId);
            if (onSelectPipeline) onSelectPipeline(pipeId);
          }
        });

        flowPolylinesRef.current[pipeId] = flowPolyline;
      }
    });

    // Custom Icon Creators
    const createSourceIcon = () => L.divIcon({
      className: 'custom-source-marker',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-sky-600 text-white shadow-lg border-2 border-white ring-2 ring-sky-300">
          <svg class="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const createMeterIcon = (code: string) => L.divIcon({
      className: 'custom-meter-marker',
      html: `
        <div class="flex items-center justify-center w-6 h-6 rotate-45 rounded-sm bg-blue-600 text-white shadow-md border-2 border-white">
          <div class="-rotate-45 text-[8px] font-mono font-bold">M</div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const createSensorIcon = (status: 'normal' | 'loss') => L.divIcon({
      className: 'custom-sensor-marker',
      html: `
        <div class="w-4 h-4 rounded-full ${status === 'loss' ? 'bg-amber-500 ring-4 ring-amber-300' : 'bg-emerald-500 ring-2 ring-white'} shadow-md"></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const createValveIcon = () => L.divIcon({
      className: 'custom-valve-marker',
      html: `
        <div class="w-5 h-5 rounded bg-slate-800 text-white border-2 border-white flex items-center justify-center shadow-md">
          <div class="w-2 h-2 bg-sky-400 rounded-full"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const createAlertPinIcon = () => L.divIcon({
      className: 'custom-alert-pin-marker',
      html: `
        <div class="relative cursor-pointer group">
          <div class="w-10 h-10 rounded-full bg-red-500/20 pulse-marker absolute -top-1 -left-1"></div>
          <div class="flex items-center gap-1 bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xl border-2 border-white animate-bounce">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>LEAK DETECTED: Bay 3</span>
          </div>
        </div>
      `,
      iconSize: [130, 36],
      iconAnchor: [65, 18],
    });

    // Add Source Marker
    L.marker([19.8020, 72.7440], { icon: createSourceIcon() })
      .bindPopup(`
        <div class="p-3">
          <div class="text-[10px] uppercase font-bold text-sky-600">Water Supply Source</div>
          <div class="font-bold text-sm text-slate-900 mt-0.5">MIDC Boisar Intake Station</div>
          <div class="text-xs text-slate-500 mt-1">Pressure: 4.8 Bar • Flow: 142,300 L/day</div>
        </div>
      `)
      .addTo(map);

    // Add Header Meter
    L.marker([19.7985, 72.7480], { icon: createMeterIcon('ESP32-HDR-01') })
      .bindPopup(`
        <div class="p-3">
          <div class="text-[10px] uppercase font-bold text-blue-600">Main Flow Meter</div>
          <div class="font-bold text-sm text-slate-900 mt-0.5">ESP32-HDR-01 Header</div>
          <div class="text-xs text-slate-500 mt-1">Instant: 98.8 L/min • Status: Online</div>
        </div>
      `)
      .addTo(map);

    // Add Dual Sensors along Production Line A
    L.marker([19.7970, 72.7495], { icon: createSensorIcon('normal') })
      .bindTooltip('Sensor 1 (INLET): 15.23 L/min', { sticky: true })
      .addTo(map);

    L.marker([19.7942, 72.7525], { icon: createSensorIcon(prdPipe.hasActiveLoss ? 'loss' : 'normal') })
      .bindTooltip('Sensor 2 (OUTLET): 14.10 L/min', { sticky: true })
      .addTo(map);

    // Add Gate Valves
    L.marker([19.8005, 72.7460], { icon: createValveIcon() }).bindTooltip('Intake Gate Valve #1', { sticky: true }).addTo(map);
    L.marker([19.7995, 72.7500], { icon: createValveIcon() }).bindTooltip('Cooling Isolation Valve', { sticky: true }).addTo(map);

    // Add Pulsating Alert Pin on Bay 3 if Loss Active
    if (prdPipe.hasActiveLoss) {
      const alertMarker = L.marker([19.7955, 72.7510], { icon: createAlertPinIcon() }).addTo(map);
      alertMarker.on('click', () => {
        if (onOpenAlertModal) {
          onOpenAlertModal('alert-0926');
        } else {
          openAlertModal('alert-0926');
        }
      });
    }

  }, [selectedPipelineId, prdPipe.hasActiveLoss, showFlowAnimation, selectPipeline, openAlertModal, onOpenAlertModal, onSelectPipeline]);

  // Map Controls
  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleFitNetwork = () => mapInstanceRef.current?.setView(BOISAR_CENTER, 15);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex flex-col">
      
      {/* Map Header Toolbar (AquaMonitor Style) */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Pipeline Network GIS Map
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Live 1 Hz Stream
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive geographic pipeline topology • Viraj Profiles — Boisar Facility
            </p>
          </div>
        </div>

        {/* Map Actions */}
        <div className="flex items-center gap-2">
          {/* Flow Vector Animation Toggle */}
          <button
            onClick={() => setShowFlowAnimation(!showFlowAnimation)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
              showFlowAnimation 
                ? 'bg-sky-50 border-sky-200 text-sky-700 font-semibold' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Flow Direction Pulses"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            Flow Pulses
          </button>

          {/* Fit Network Button */}
          <button
            onClick={handleFitNetwork}
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-sm transition"
            title="Fit Entire Network"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-r border-slate-200"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Collapsible Map Legend (AquaMonitor Style) */}
        <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg max-w-[210px] text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
            <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Map Legend</span>
            <button 
              onClick={() => setLegendOpen(!legendOpen)}
              className="text-slate-400 hover:text-slate-600 text-[10px]"
            >
              {legendOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          {legendOpen && (
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-sky-600 rounded"></span>
                <span>Normal Pipeline</span>
              </div>
              <div className="flex items-center gap-2 text-amber-700 font-medium">
                <span className="w-4 h-1 bg-amber-500 rounded"></span>
                <span>Warning / Delta Drift</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 font-bold">
                <span className="w-4 h-1 bg-red-600 rounded"></span>
                <span>Critical / Water Loss</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <div className="w-3 h-3 rounded-full bg-sky-600"></div>
                <span>Water Source (MIDC)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rotate-45 bg-blue-600"></div>
                <span>Flow Meter (ESP32)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span>Dual Sensors (In/Out)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded bg-slate-800"></div>
                <span>Gate Valve Station</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Callout for Active Loss Pin (Bottom Left of Map) */}
        {prdPipe.hasActiveLoss && (
          <div 
            onClick={() => onOpenAlertModal ? onOpenAlertModal('alert-0926') : openAlertModal('alert-0926')}
            className="absolute bottom-3 left-3 z-[400] bg-white border-2 border-red-500 rounded-xl p-3 shadow-xl max-w-xs cursor-pointer hover:bg-red-50/50 transition group"
          >
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
              <span>POSSIBLE WATER LOSS: Zone C | P-001</span>
            </div>
            <div className="text-[11px] text-slate-600 mt-1">
              Production Line A (Bay 3 Rack) • Δ <strong className="text-red-600 font-mono">1.13 L/min</strong> &gt; 0.50 L/min
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-sky-600 group-hover:text-sky-700">
              <span>Inspect Incident AQ-0926</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>

      {/* Map Bottom Information Strip */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4">
        <div className="flex items-center gap-4">
          <span>Active Lines: <strong className="text-slate-900">5 / 5 Monitored</strong></span>
          <span>Flow Meters: <strong className="text-slate-900">12 ESP32s Online (100%)</strong></span>
          <span>Supply Pressure: <strong className="text-sky-600 font-mono">4.8 Bar</strong></span>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-sky-500" />
          Click any pipeline or sensor node on the map to inspect live telemetry
        </div>
      </div>

    </div>
  );
};
