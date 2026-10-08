import React, { useState, useEffect, useRef } from 'react';
import { useAquaSenseStore } from '../../store/aquaSenseStore';
import { DemoVideo } from './DemoVideo';
import { 
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft, X, Maximize2, Minimize2,
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Cpu, Droplets,
  Layers, MapPin, ArrowRight, Gauge, Radio, Server, Wrench, Building2, Landmark,
  Home, ExternalLink, HelpCircle, Check, Eye, Clock, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const JudgeDemoTour: React.FC = () => {
  const { 
    tourActive, 
    tourStep, 
    nextTourStep, 
    prevTourStep, 
    exitTour, 
    setTourStep,
    setRole,
    selectPipeline,
    openAlertModal,
    acknowledgeAlert,
    assignAlertInspection,
    resolveAlert,
    alerts
  } = useAquaSenseStore();

  const navigate = useNavigate();

  // Navigation & Timeline state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCallout, setActiveCallout] = useState<number | null>(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const totalTourSeconds = 75;

  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step definition array
  const STEPS = [
    { id: 0, title: 'Overview', shortLabel: 'Overview' },
    { id: 1, title: 'The Problem', shortLabel: '01 Problem' },
    { id: 2, title: 'What is AquaSense', shortLabel: '02 Solution' },
    { id: 3, title: 'Physical Prototype', shortLabel: '03 Prototype' },
    { id: 4, title: 'How It Works', shortLabel: '04 Tech Flow' },
    { id: 5, title: 'Industrial Scale', shortLabel: '05 Industrial' },
    { id: 6, title: 'Live SCADA Monitoring', shortLabel: '06 Live SCADA' },
    { id: 7, title: 'Loss Detection', shortLabel: '07 Loss Detect' },
    { id: 8, title: 'Action & Impact', shortLabel: '08 Action' },
    { id: 9, title: 'Final Impact', shortLabel: 'Impact' },
  ];

  // Auto-play timer logic
  useEffect(() => {
    if (!tourActive || !isPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        const next = prev + 1;
        // Step progression timings based on timeline
        if (next === 8 && tourStep === 0) handleStepChange(1);
        else if (next === 16 && tourStep === 1) handleStepChange(2);
        else if (next === 26 && tourStep === 2) handleStepChange(3);
        else if (next === 38 && tourStep === 3) handleStepChange(4);
        else if (next === 48 && tourStep === 4) handleStepChange(5);
        else if (next === 58 && tourStep === 5) handleStepChange(6);
        else if (next === 66 && tourStep === 6) handleStepChange(7);
        else if (next === 73 && tourStep === 7) handleStepChange(8);
        else if (next >= totalTourSeconds) {
          handleStepChange(9);
          setIsPlaying(false);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [tourActive, isPlaying, tourStep]);

  // Reset timer on step change
  const handleStepChange = (stepNum: number) => {
    setTourStep(stepNum);
    if (stepNum === 0) setTimerSeconds(0);
    else if (stepNum === 1) setTimerSeconds(8);
    else if (stepNum === 2) setTimerSeconds(16);
    else if (stepNum === 3) setTimerSeconds(26);
    else if (stepNum === 4) setTimerSeconds(38);
    else if (stepNum === 5) setTimerSeconds(48);
    else if (stepNum === 6) setTimerSeconds(58);
    else if (stepNum === 7) setTimerSeconds(66);
    else if (stepNum === 8) setTimerSeconds(73);
    else if (stepNum === 9) setTimerSeconds(75);
  };

  const handleStartAutoTour = () => {
    setTourStep(1);
    setTimerSeconds(8);
    setIsPlaying(true);
    toast.success('Starting 1-Minute Guided Demonstration...');
  };

  const handleRestartTour = () => {
    setTourStep(0);
    setTimerSeconds(0);
    setIsPlaying(false);
  };

  const handleFinishAndExplore = (route: string = '/industrial', role: any = 'COMPANY_ADMIN') => {
    exitTour();
    setRole(role);
    navigate(route);
  };

  if (!tourActive) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 ${
      isFullscreen ? '!p-0' : ''
    }`}>
      
      {/* Main Large Presentation Container */}
      <div className={`bg-white border border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 text-slate-900 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-full max-w-7xl max-h-[94vh] min-h-[640px] md:min-h-[720px] rounded-3xl'
      }`}>
        
        {/* ========================================================================= */}
        {/* 1. TOP CONTROL BAR & STEP NAVIGATION SCRUBBER                             */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
          
          {/* Branding & Tour Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-sky-500/30">
              <Droplets className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-sky-400 uppercase">
                  AquaSense
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  JUDGE 1-MINUTE TOUR
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {STEPS.find(s => s.id === tourStep)?.title}
              </h2>
            </div>
          </div>

          {/* Center: Step Navigation Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
            {STEPS.map((s) => {
              const isActive = tourStep === s.id;
              const isPast = tourStep > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStepChange(s.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    isActive 
                      ? 'bg-sky-500 text-slate-950 shadow-sm font-black' 
                      : isPast
                      ? 'text-sky-300 hover:text-white hover:bg-slate-900'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {s.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Right: Actions, Fullscreen, Play/Pause & Close */}
          <div className="flex items-center gap-2 text-xs">
            
            {/* Step Counter */}
            <div className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {tourStep.toString().padStart(2, '0')} / 09
            </div>

            {/* Play/Pause Toggle */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
              title={isPlaying ? 'Pause Auto-Play' : 'Play 1-Minute Auto-Tour'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto-Tour'}</span>
            </button>

            {/* Restart Button */}
            <button
              onClick={handleRestartTour}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Close / Exit Tour */}
            <button
              onClick={exitTour}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Close Tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Timeline Progress Bar */}
        <div className="w-full bg-slate-900 h-1 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${(Math.max(1, timerSeconds) / totalTourSeconds) * 100}%` }}
          />
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC STEP CONTENT PRESENTATION CANVAS                                */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50">
          
          {/* --------------------------------------------------------------------- */}
          {/* STEP 0: HERO OPENING SCREEN                                           */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 0 && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold tracking-wide">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  Smart Water Management Platform
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  AquaSense
                </h1>
                
                <p className="text-lg sm:text-xl font-bold text-sky-600">
                  Measure Every Drop. Understand Every Flow. Detect Every Loss.
                </p>

                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  An end-to-end IoT and SCADA monitoring solution that transforms physical pipeline hydraulics into continuous, actionable, and accountable digital data.
                </p>

                <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
                  <button
                    onClick={handleStartAutoTour}
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black rounded-2xl text-sm shadow-lg shadow-sky-600/30 flex items-center gap-2 transition transform hover:scale-105"
                  >
                    <Play className="w-4 h-4 fill-white" /> START 1-MINUTE TOUR
                  </button>

                  <button
                    onClick={() => handleStepChange(3)}
                    className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition"
                  >
                    Watch Prototype Demo <ChevronRight className="w-4 h-4 text-sky-600" />
                  </button>
                </div>
              </div>

              {/* INDUSTRIAL ENTERPRISE ARCHITECTURE CARD GRID */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">
                    Enterprise Industrial Architecture
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    END-TO-END INDUSTRIAL WATER INTELLIGENCE • VIRAJ PROFILES DEMO
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* INDUSTRIAL PILLAR 1 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-sky-700">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                        <Gauge className="w-4 h-4 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">1. Bulk Intake &amp; Mass-Balance SCADA</h4>
                        <span className="text-[10px] text-slate-500">MIDC Boisar Supply &amp; Dual-Sensor Networks</span>
                      </div>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-2">✓ Continuous bulk meter reading (142,300 L/d intake @ 4.8 Bar)</li>
                      <li className="flex items-center gap-2">✓ Dual-sensor flow discrepancy checking (Q_in − Q_out = Δ)</li>
                      <li className="flex items-center gap-2">✓ Real-time pipeline pressure and 1 Hz telemetry waveforms</li>
                      <li className="flex items-center gap-2">✓ High-resolution automated work order dispatch</li>
                    </ul>
                  </div>

                  {/* INDUSTRIAL PILLAR 2 */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-700">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">2. Departmental Accounting &amp; Billing</h4>
                        <span className="text-[10px] text-slate-500">Production, Cooling, Processing &amp; Utilities</span>
                      </div>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-2">✓ Sub-metered accounting across 5 major plant divisions</li>
                      <li className="flex items-center gap-2">✓ Transparent utility reconciliation and ₹/L tariff audit</li>
                      <li className="flex items-center gap-2">✓ Specific Water Consumption (WCI m³/tonne) tracking</li>
                      <li className="flex items-center gap-2">✓ Zero Liquid Discharge (ZLD) RO recovery monitoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 1: THE PROBLEM                                                   */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left Visual: Industrial Water Pipeline & The 3 Core Questions */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-mono uppercase text-sky-400 font-bold">
                    Industry Reality • Distributed Hydraulics
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                    UNMONITORED LOSS
                  </span>
                </div>

                {/* Conceptual Pipeline Graphic */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Main Feeder Pipe</span>
                    <span className="text-amber-400">? Unknown Drain Points</span>
                  </div>

                  {/* SVG Multi-Branch Loss Representation */}
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 80">
                    <path d="M 10 40 L 150 40" fill="none" stroke="#0ea5e9" strokeWidth="6" />
                    <path d="M 150 40 L 250 15" fill="none" stroke="#0ea5e9" strokeWidth="4" />
                    <path d="M 150 40 L 250 40" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="4 4" />
                    <path d="M 150 40 L 250 65" fill="none" stroke="#0ea5e9" strokeWidth="4" />
                    <circle cx="150" cy="40" r="6" fill="#38bdf8" />
                    <circle cx="200" cy="40" r="8" fill="#ef4444" className="animate-ping" />
                    <circle cx="200" cy="40" r="5" fill="#ef4444" />
                  </svg>
                  
                  <div className="text-[11px] text-slate-400 text-center italic">
                    Unaccounted leakage, unmetered branch lines, and valve seepage go completely unnoticed for months.
                  </div>
                </div>

                {/* 3 Core Questions Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-black text-sky-400">1</span>
                    <h5 className="font-bold text-xs text-white mt-1">HOW MUCH?</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Total volume consumed daily</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-black text-cyan-400">2</span>
                    <h5 className="font-bold text-xs text-white mt-1">WHERE?</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Specific pipeline &amp; process unit</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-lg font-black text-amber-400">3</span>
                    <h5 className="font-bold text-xs text-white mt-1">IS THERE LOSS?</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Hidden leaks or fixture failures</p>
                  </div>
                </div>
              </div>

              {/* Right Technical Explanation & Key Takeaway */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 01 • The Problem
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Where Is The Water Going?
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Large manufacturing facilities and distributed municipal networks involve multiple pipelines, consumption points, and remote monitoring locations. 
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Without continuous measurement, water remains an invisible cost center. Traditional manual monthly meter reading cannot detect sudden pipeline discrepancies, valve failures, or nocturnal seepage.
                  </p>
                </div>

                {/* Judge Key Takeaway Callout Box */}
                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "You cannot manage what you do not measure. AquaSense replaces monthly guesswork with continuous second-by-second visibility."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 2: WHAT IS AQUASENSE                                             */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left Visual: Technical Flow Architecture */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wide">
                    End-to-End System Pipeline
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Continuous Closed Loop
                  </span>
                </div>

                {/* Visual Architecture Chain */}
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { title: '1. PHYSICAL WATER PIPELINE', desc: 'Fluid dynamics under pressure', icon: Droplets, color: 'text-sky-600 bg-sky-50' },
                    { title: '2. INLET & OUTLET SENSORS', desc: 'Hall-effect pulse generators', icon: Gauge, color: 'text-blue-600 bg-blue-50' },
                    { title: '3. ESP32 MICROCONTROLLER', desc: 'Interrupt counting & calibration math', icon: Cpu, color: 'text-purple-600 bg-purple-50' },
                    { title: '4. CLOUD / BACKEND SERVER', desc: 'FastAPI telemetry ingestion & DB ledger', icon: Server, color: 'text-emerald-600 bg-emerald-50' },
                    { title: '5. REAL-TIME SCADA DASHBOARD', desc: 'Mass balance & volumetric billing', icon: Activity, color: 'text-cyan-600 bg-cyan-50' },
                    { title: '6. TARGETED FIELD ACTION', desc: 'Work order dispatch & leak repair', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
                  ].map((node, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                      <div className={`w-8 h-8 rounded-lg ${node.color} flex items-center justify-center flex-shrink-0`}>
                        <node.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-xs">{node.title}</div>
                        <div className="text-[10px] text-slate-500">{node.desc}</div>
                      </div>
                      <span className="text-slate-400 font-bold">→</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Description */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 02 • Core Concept
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Meet AquaSense
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    AquaSense is a full-stack smart water management and monitoring platform. It connects physical water-flow hardware with a centralized digital operational engine.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The platform computes mass-balance differentials in real time, automates progressive tariff calculations, generates instant SCADA alerts, and provides verifiable financial accountability.
                  </p>
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "AquaSense bridges physical hardware measurements with actionable digital intelligence in a transparent closed loop."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 3: PHYSICAL PROTOTYPE DEMO VIDEO                                 */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Real Prototype Hardware Card */}
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-xl group">
                  {/* Top Header Badge Overlay */}
                  <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent p-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-sm">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        PHYSICAL WORKING RIG
                      </span>
                      <span className="text-xs font-bold text-white drop-shadow truncate hidden sm:inline">
                        AquaSense Edge Flow Sensor Prototype
                      </span>
                    </div>

                    <a
                      href="/aquasense_prototype.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-[11px] font-medium flex items-center gap-1 backdrop-blur-md transition"
                      title="View Full High-Res Image"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Full Size</span>
                    </a>
                  </div>

                  {/* Prototype Image */}
                  <div className="relative w-full aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img 
                      src="/aquasense_prototype.jpg" 
                      alt="AquaSense Physical Prototype Hardware Rig" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Bottom Technical Caption */}
                  <div className="p-3 bg-slate-900/90 border-t border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Bench-Tested Dual Turbine Sensing (Inlet: 15.23 L/m vs Outlet: 14.10 L/m • Δ 1.13 L/m)</span>
                    </div>
                    <p className="text-[10px] text-sky-300/90 font-mono leading-tight">
                      HARDWARE INTEGRATED • ESP32 Wi-Fi Node, 16×2 LCD Display, Relay Actuation & Dual Flow Sensors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Hardware Structure & Explanation */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 03 • Working Hardware
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Real Physical Prototype
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    This is not just software mockups. We built and tested a physical working flow rig featuring dual inline turbine sensors, ESP32 microcontroller, display module, and relay switching.
                  </p>
                </div>

                {/* Hardware Flow Diagram */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Prototype Fluid Topology</span>
                  
                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px] items-center">
                    <div className="bg-sky-50 p-2 rounded-lg border border-sky-200 text-sky-800 font-bold">Water In</div>
                    <div className="text-slate-400">→</div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 text-blue-900 font-bold">Sensor 1 (Inlet)</div>
                    <div className="text-slate-400">→</div>
                    <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-800 font-bold">Pipeline</div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px] items-center pt-2">
                    <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-slate-800 font-bold">Pipeline</div>
                    <div className="text-slate-400">→</div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 text-blue-900 font-bold">Sensor 2 (Outlet)</div>
                    <div className="text-slate-400">→</div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-800 font-bold">Water Out</div>
                  </div>
                </div>

                {/* Key Takeaway */}
                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Hardware verified: Dual sensors measure entry and exit flows simultaneously, capturing fluid differentials as low as 0.1 L/min."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 4: HOW THE PROTOTYPE WORKS (PULSE TO DATA FLOWCHART)             */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Flowchart / Technical Engine Diagram */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono text-sky-400 font-bold">PULSE CONVERSION ARCHITECTURE</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">1000 Hz Sampling</span>
                </div>

                {/* Detailed Technical Step Cards */}
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-sky-300 font-bold">1. Mechanical Fluid Velocity</span>
                    <span className="text-slate-400 text-[11px]">Water spins internal turbine</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-sky-300 font-bold">2. Hall-Effect Pulse Generation</span>
                    <span className="text-amber-400 text-[11px]">Square wave frequency (Hz)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sky-950/70 border border-sky-500/80 flex items-center justify-between">
                    <span className="text-white font-bold">3. ESP32 Hardware Interrupt</span>
                    <span className="text-sky-300 text-[11px]">IRAM_ATTR pulseCounter()</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-sky-300 font-bold">4. Calibration Formula</span>
                    <span className="text-emerald-400 text-[11px]">Flow = (Hz × 60) / 4.5 L/m</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-sky-300 font-bold">5. Wi-Fi JSON Telemetry</span>
                    <span className="text-slate-300 text-[11px]">POST /api/v1/readings</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-sky-300">Technical Rigor:</strong> Sensors do not send arbitrary litres. The ESP32 microcontrollers convert raw physical pulses into calibrated flow rates using deterministic physics.
                </div>
              </div>

              {/* Right: Technical Explanation */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 04 • Signal Processing
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    From Water Flow to Digital Data
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Flow sensors generate electrical pulses as water spins their internal magnetic rotor. The ESP32 microcontroller counts pulses via non-blocking hardware interrupts.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Using precise calibration curves (e.g. 4.5 pulses/second per L/min), the firmware calculates instantaneous flow rates and integrates total volumetric litres before transmitting encrypted JSON payloads to the AquaSense backend.
                  </p>
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Accurate telemetry: Pulse frequency is converted to volumetric litres at the edge, ensuring resilient local data logging and cloud synchronization."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 5: VIRAJ PROFILES INDUSTRIAL APPLICATION VIDEO                   */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Viraj Demo Video (YouTube) */}
              <div className="space-y-3">
                <DemoVideo 
                  title="Viraj Profiles Industrial Application Demo"
                  badgeLabel="INDUSTRIAL APPLICATION DEMO"
                  youtubeUrl="https://youtu.be/MJRF5jnYAeM?si=2pJypLg2vZ6FjcBg"
                  caption="Simulated deployment scenario at Viraj Profiles stainless steel manufacturing plant, Boisar"
                  disclaimer="DEMO ENVIRONMENT • Illustrative demonstration — not actual company measurements."
                  autoPlay={isPlaying}
                />
              </div>

              {/* Right: Facility Context */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      Step 05 • Industrial Scale
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Boisar Facility
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    AquaSense at Industrial Scale
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Industrial steel manufacturing and rolling mills require massive volumes of continuous cooling and processing water.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    At Viraj Profiles, Boisar, AquaSense monitors the main 4.8 Bar MIDC supply header (142,300 L/day) and breaks it down across 5 critical facility pipelines: Hot Rolling Line A, Cooling Tower B, Chemical Processing, Utilities, and RO Recycling.
                  </p>
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Enterprise ready: Built to handle complex industrial plant topologies with high-resolution telemetry and zonal mass-balance accounting."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 6: LIVE SCADA MONITORING (WITH 5 INTERACTIVE CALLOUT MARKERS)     */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 6 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Interactive SCADA Dashboard Mock with 5 Markers */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4 relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-slate-100">Live Dashboard Preview</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Click numbers ① to ⑤ to inspect</span>
                </div>

                {/* Dashboard Grid Simulation with Overlaid Number Badges */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 relative">
                  
                  {/* Top KPIs Row */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div 
                      onClick={() => setActiveCallout(1)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition ${
                        activeCallout === 1 ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">Total Supply</span>
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">1</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono mt-1">142,300 L</div>
                    </div>

                    <div 
                      onClick={() => setActiveCallout(2)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition ${
                        activeCallout === 2 ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">Today Used</span>
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">2</span>
                      </div>
                      <div className="text-sm font-bold text-white font-mono mt-1">8,642 L</div>
                    </div>

                    <div 
                      onClick={() => setActiveCallout(3)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition ${
                        activeCallout === 3 ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold">Pipelines</span>
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">3</span>
                      </div>
                      <div className="text-sm font-bold text-amber-400 font-mono mt-1">4 Ok / 1 Loss</div>
                    </div>
                  </div>

                  {/* Middle: Map & Devices */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div 
                      onClick={() => setActiveCallout(4)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        activeCallout === 4 ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold">Device Fleet</span>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">12 / 12 Nodes Online</div>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">4</span>
                    </div>

                    <div 
                      onClick={() => setActiveCallout(5)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        activeCallout === 5 ? 'bg-sky-950 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold">Active Alerts</span>
                        <div className="text-xs font-bold text-red-400 mt-0.5">1 Loss Discrepancy</div>
                      </div>
                      <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black flex items-center justify-center">5</span>
                    </div>
                  </div>
                </div>

                {/* Callout Inspector Card */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-sky-500/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-sky-300 font-bold">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    {activeCallout === 1 && '① Bulk Water Supply Header (142,300 L/d • 4.8 Bar)'}
                    {activeCallout === 2 && "② Today's Real-Time Consumption (8,642 L)"}
                    {activeCallout === 3 && '③ Pipeline Balance Status (4 Normal, 1 Possible Loss)'}
                    {activeCallout === 4 && '④ IoT Device Fleet Health (12 ESP32 Nodes Online)'}
                    {activeCallout === 5 && '⑤ Incident Queue (AQ-ALERT-0926 Triggered on PRD-001)'}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    {activeCallout === 1 && 'Monitors bulk facility intake and pressure from the MIDC Boisar reservoir supply line.'}
                    {activeCallout === 2 && 'Aggregates volumetric intake across all 5 facility branches to compare against diurnal baselines.'}
                    {activeCallout === 3 && 'Dual-sensor differential comparison continuously checks flow consistency across every pipeline branch.'}
                    {activeCallout === 4 && 'Tracks ESP32 heartbeat ping, WiFi RSSI signal strength (-58 dBm), and battery voltage.'}
                    {activeCallout === 5 && 'Flags anomalies where inlet flow exceeds outlet flow beyond configured engineering tolerance.'}
                  </p>
                </div>
              </div>

              {/* Right: Technical Explanation */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 06 • Operational Intelligence
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    See Every Flow
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    The AquaSense SCADA interface gives plant managers and municipal engineers complete visibility over the physical water network in real time.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click any marker on the dashboard preview to understand how telemetry from physical flow meters is transformed into instantaneous KPIs and alerts.
                  </p>
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Zero blind spots: Management sees real-time consumption, pipeline health, and device diagnostics on a unified operational screen."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 7: LEAKAGE / WATER LOSS DETECTION                                */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 7 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Dual-Sensor Differential Loss Math Card */}
              <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Differential Mass-Balance Check
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    PRD-001 Section Bay 3
                  </span>
                </div>

                {/* Pipeline Flow Diagram with Dual Sensors */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                  
                  {/* Inlet Sensor */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Sensor 1 — Entry Point (Inlet)</span>
                      <div className="text-xs font-bold text-slate-800">ESP32-H002 • Bay 3 Header</div>
                    </div>
                    <div className="text-base font-mono font-black text-sky-600">
                      15.23 <span className="text-xs font-normal">L/min</span>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
                    <span>▼ Flowing through 45m steel pipe section ▼</span>
                  </div>

                  {/* Outlet Sensor */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Sensor 2 — Exit Point (Outlet)</span>
                      <div className="text-xs font-bold text-slate-800">ESP32-H003 • Rolling Mill Sprays</div>
                    </div>
                    <div className="text-base font-mono font-black text-sky-600">
                      14.10 <span className="text-xs font-normal">L/min</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Evaluation */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600">Discrepancy (15.23 − 14.10):</span>
                    <strong className="text-amber-900 text-sm">Δ = 1.13 L/min</strong>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-600">Configured Tolerance Limit:</span>
                    <strong className="text-slate-800">0.50 L/min</strong>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-amber-900 font-bold">
                    <span>Evaluation: 1.13 &gt; 0.50 L/min</span>
                    <span className="px-2 py-0.5 bg-amber-200 rounded text-[10px] font-black">
                      ⚠ POSSIBLE WATER LOSS
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Technical Explanation */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Step 07 • Anomaly Detection
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Detect Possible Water Loss
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Rather than making unverified assumptions of catastrophic pipe bursts, AquaSense uses mathematically sound <strong>dual-sensor differential mass-balance verification</strong>.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    When flow entering a pipeline section exceeds flow leaving it by more than the configured tolerance for sustained periods, AquaSense flags the branch as <strong>"POSSIBLE WATER LOSS — REQUIRES VERIFICATION"</strong> and highlights the exact physical pipe rack for inspection.
                  </p>
                </div>

                <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Trustworthy detection: Continuous mathematical comparison flags real fluid loss without false alarms."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 8: ALERT -> ACTION -> IMPACT                                     */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 8 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center max-w-6xl mx-auto animate-in fade-in duration-300">
              
              {/* Left: Work Order & Alert Dispatch UI */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      AQ-ALERT-0926
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">Possible Water Loss in Production Line A</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    HIGH PRIORITY
                  </span>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location: <strong>Bay 3 Pipe Rack — Section PRD-001B (Elevation +4.2m)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Discrepancy: <strong className="text-amber-800">1.13 L/min (Tolerance: 0.50 L/min)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Wrench className="w-3.5 h-3.5 text-sky-600" />
                    <span>Assigned To: <strong>Mechanical Maintenance Alpha (Senior Tech Vikas Patil)</strong></span>
                  </div>
                </div>

                {/* Interactive Work Order Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      acknowledgeAlert('alert-0926');
                      toast.success('Alert AQ-ALERT-0926 marked as Acknowledged.');
                    }}
                    className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge Alert
                  </button>

                  <button
                    onClick={() => {
                      assignAlertInspection('alert-0926', 'Mechanical Maintenance Alpha', 'Vikas Patil');
                      toast.success('Work order dispatched to Senior Tech Vikas Patil.');
                    }}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Assign Inspection
                  </button>
                </div>
              </div>

              {/* Right: Technical Explanation */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                    Step 08 • Actionable Workflows
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    From Detection to Action
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Detection is meaningless without prompt execution. AquaSense automatically generates structured work orders with precise physical coordinates.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Maintenance teams are dispatched directly to the affected pipe rack with recommended verification steps (inspecting flange gaskets, spray nozzles, and junction welds), cutting repair latency from weeks to hours.
                  </p>
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                    Key Judge Takeaway
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-normal">
                    "Closed-loop efficiency: Measure → Understand → Detect → Act → Improve."
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STEP 9: FINAL IMPACT & SUMMARY                                        */}
          {/* --------------------------------------------------------------------- */}
          {tourStep === 9 && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 text-center">
              
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-600">
                  Demonstration Complete
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  AquaSense Transforms Water Management
                </h1>
                <p className="text-lg sm:text-xl font-bold text-sky-600 max-w-xl mx-auto">
                  Smart • Transparent • Accountable
                </p>
              </div>

              {/* 3 Industrial Pillars Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Mass-Balance SCADA</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1 Hz continuous inlet and outlet telemetry across all plant sectors, eliminating unmonitored transfer loss.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Departmental Accounting</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Granular sub-metering across Production, Cooling, and Utilities with verified tariff rate cost allocation.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Differential Loss Mitigation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dual-sensor discrepancy flagging with closed-loop maintenance work orders and ISO/ESG compliance records.
                  </p>
                </div>
              </div>

              {/* Final Statement & Action Buttons */}
              <div className="pt-4 space-y-4">
                <p className="text-base font-bold text-slate-800 italic">
                  "Every Drop Counts. Every Litre Accounted For."
                </p>

                <div className="flex flex-wrap justify-center items-center gap-3">
                  <button
                    onClick={() => handleFinishAndExplore('/industrial', 'COMPANY_ADMIN')}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl text-sm shadow-md transition flex items-center gap-2"
                  >
                    EXPLORE INDUSTRIAL DASHBOARD <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleFinishAndExplore('/pipelines', 'COMPANY_ADMIN')}
                    className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition"
                  >
                    View Pipeline Matrix
                  </button>

                  <button
                    onClick={() => handleFinishAndExplore('/departments', 'COMPANY_ADMIN')}
                    className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition"
                  >
                    Department Cost Ledger
                  </button>

                  <button
                    onClick={handleRestartTour}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restart Tour
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM FOOTER NAVIGATION BAR                                           */}
        {/* ========================================================================= */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Previous Button */}
          <button
            onClick={() => handleStepChange(Math.max(0, tourStep - 1))}
            disabled={tourStep === 0}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Center Informational Hint */}
          <div className="text-center hidden sm:block">
            <span className="text-xs text-slate-500 font-medium">
              {tourStep === 0 && 'Click "Start 1-Minute Tour" or browse steps manually'}
              {tourStep === 1 && 'Problem: Undetected fluid loss & lack of continuous telemetry'}
              {tourStep === 2 && 'Solution: End-to-end IoT hardware to digital SCADA architecture'}
              {tourStep === 3 && 'Prototype: Real physical hardware with dual inline turbine sensors'}
              {tourStep === 4 && 'How It Works: Interrupt pulse frequency calibrated into flow rate'}
              {tourStep === 5 && 'Industrial: Scaled facility monitoring at Viraj Profiles Boisar'}
              {tourStep === 6 && 'Live Monitoring: Real-time telemetry, pressure, and device health'}
              {tourStep === 7 && 'Loss Detection: Mathematical dual-sensor mass balance comparison'}
              {tourStep === 8 && 'Action: Immediate work order generation with physical coordinates'}
              {tourStep === 9 && 'Impact: Measure → Understand → Detect → Act → Improve'}
            </span>
          </div>

          {/* Next / Finish Button */}
          {tourStep < 9 ? (
            <button
              onClick={() => handleStepChange(tourStep + 1)}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFinishAndExplore('/industrial', 'COMPANY_ADMIN')}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" /> Explore Dashboard
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
