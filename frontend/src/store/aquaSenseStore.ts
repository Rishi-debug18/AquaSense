import { create } from 'zustand';
import { 
  UserRole, PipelineBranch, WaterAlert, HouseholdData, MunicipalArea, 
  IoTDevice, NotificationMessage, SupportTicket, WaterUsageCostRecord,
  DigitalTwinValve, DigitalTwinTank, DigitalTwinDepartment, ActionItem, WaterBalanceData 
} from '../types/aquasense';

interface AquaSenseState {
  // Active Persona / RBAC
  currentRole: UserRole;
  setRole: (role: UserRole) => void;

  // Real-time Simulation Engine
  simulationActive: boolean;
  simulationSpeed: number; // 1, 2, 5
  lastHeartbeatTime: Date;
  secondsSinceLastUpdate: number;
  toggleSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  tickTelemetry: () => void;
  toggleDemoLeakAnomaly: () => void;
  leakAnomalyActive: boolean;

  // Digital Twin Elements
  valves: DigitalTwinValve[];
  tanks: DigitalTwinTank[];
  departments: DigitalTwinDepartment[];
  selectedDigitalTwinNode: { type: 'PIPELINE' | 'SENSOR' | 'VALVE' | 'TANK' | 'DEPARTMENT'; id: string; data?: any } | null;
  selectDigitalTwinNode: (node: { type: 'PIPELINE' | 'SENSOR' | 'VALVE' | 'TANK' | 'DEPARTMENT'; id: string; data?: any } | null) => void;
  updateValveState: (valveId: string, state: 'OPEN' | 'THROTTLED' | 'CLOSED', positionPercent?: number) => void;

  // Action Center
  actionItems: ActionItem[];
  acknowledgeActionItem: (id: string) => void;
  assignActionItem: (id: string, team: string, person: string) => void;
  resolveActionItem: (id: string) => void;

  // Water Balance
  waterBalance: WaterBalanceData;


  // Industrial Pipeline Network
  pipelines: PipelineBranch[];
  selectedPipelineId: string | null;
  selectPipeline: (id: string | null) => void;
  updatePipelineTolerance: (id: string, newToleranceLpm: number) => void;

  // Alerts Management
  alerts: WaterAlert[];
  activeAlertModalId: string | null;
  openAlertModal: (alertId: string | null) => void;
  acknowledgeAlert: (id: string) => void;
  assignAlertInspection: (id: string, team: string, engineer: string) => void;
  resolveAlert: (id: string, notes: string) => void;

  // Industrial KPIs
  industrialKpis: {
    totalConsumptionLitre: number;
    todayConsumptionLitre: number;
    waterSupplyLitre: number;
    possibleWaterLossLitre: number;
    activeDevicesCount: number;
    totalDevicesCount: number;
    activeAlertsCount: number;
  };

  // Municipal Data & KPIs
  municipalAreas: MunicipalArea[];
  selectedAreaId: string | null;
  selectArea: (areaId: string | null) => void;
  municipalKpis: {
    totalWaterSuppliedMlDay: number;
    totalConsumptionMlDay: number;
    estimatedSystemLossMlDay: number;
    householdsConnected: number;
    activeMeters: number;
    leakageAlertsCount: number;
    highUsageAlertsCount: number;
  };

  // Household / Resident Data
  currentHousehold: HouseholdData;
  updateHouseholdReading: (newFlow: number) => void;

  // IoT Devices
  devices: IoTDevice[];
  updateDeviceStatus: (deviceId: string, status: 'ONLINE' | 'OFFLINE' | 'WARNING') => void;

  // Notifications
  notifications: NotificationMessage[];
  createNotification: (notif: Omit<NotificationMessage, 'id' | 'sentAt' | 'readCount'>) => void;

  // Support Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketCode' | 'createdAt' | 'updatedAt' | 'responses'>) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  addTicketResponse: (ticketId: string, author: string, role: string, message: string) => void;

  // Water Accounting Records
  industrialAccounting: WaterUsageCostRecord;
  householdBill: {
    billId: string;
    householdId: string;
    residentName: string;
    period: string;
    openingReading: number;
    closingReading: number;
    consumptionLitre: number;
    tariffSlabs: {
      slab: string;
      litres: number;
      rate: number;
      amount: number;
    }[];
    waterCharges: number;
    meterRent: number;
    sewerageCharge: number;
    totalAmount: number;
    status: 'PAID' | 'DUE' | 'PENDING';
    dueDate: string;
  };

  // 1-Minute Judge Demo Tour
  tourActive: boolean;
  tourStep: number; // 1 to 14
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  exitTour: () => void;
  setTourStep: (step: number) => void;
}

const INITIAL_PIPELINES: PipelineBranch[] = [
  {
    id: 'pipe-prd-001',
    code: 'PRD-001',
    name: 'Production Line A',
    area: 'Production',
    description: 'Main continuous steel hot-rolling feed line supplying cooling sprays and scale wash in Bay 3.',
    inletFlowLpm: 15.23,
    outletFlowLpm: 14.10,
    differenceLpm: 1.13,
    configuredToleranceLpm: 0.50,
    status: 'possible_loss',
    todayLitre: 8642,
    monthlyLitre: 53950,
    estimatedLossLitre: 1250,
    inletSensorId: 'SEN-PRD-01-IN',
    outletSensorId: 'SEN-PRD-02-OUT',
    exactLocation: 'Bay 3 Pipe Rack — Section PRD-001B (Elevation +4.2m)',
    lastUpdated: '10 sec ago',
    hasActiveLoss: true,
    baselineLitrePerDay: 7500,
  },
  {
    id: 'pipe-col-001',
    code: 'COL-001',
    name: 'Cooling System Tower B',
    area: 'Cooling',
    description: 'Closed-loop secondary heat exchanger and evaporative cooling tower loop.',
    inletFlowLpm: 12.40,
    outletFlowLpm: 12.38,
    differenceLpm: 0.02,
    configuredToleranceLpm: 0.40,
    status: 'normal',
    todayLitre: 7120,
    monthlyLitre: 34680,
    estimatedLossLitre: 18,
    inletSensorId: 'SEN-COL-04-IN',
    outletSensorId: 'SEN-COL-05-OUT',
    exactLocation: 'Cooling Tower Yard — Header Loop 2',
    lastUpdated: '12 sec ago',
    hasActiveLoss: false,
    baselineLitrePerDay: 7200,
  },
  {
    id: 'pipe-prc-001',
    code: 'PRC-001',
    name: 'Chemical Processing Unit',
    area: 'Processing',
    description: 'Pickling bath rinse and neutralizer dilution water feed line.',
    inletFlowLpm: 9.15,
    outletFlowLpm: 9.12,
    differenceLpm: 0.03,
    configuredToleranceLpm: 0.35,
    status: 'normal',
    todayLitre: 5410,
    monthlyLitre: 23120,
    estimatedLossLitre: 25,
    inletSensorId: 'SEN-PRC-06-IN',
    outletSensorId: 'SEN-PRC-07-OUT',
    exactLocation: 'Processing Building 2 — Pickling Manifold',
    lastUpdated: '8 sec ago',
    hasActiveLoss: false,
    baselineLitrePerDay: 5500,
  },
  {
    id: 'pipe-utl-001',
    code: 'UTL-001',
    name: 'Utilities & Steam Boiler',
    area: 'Utilities',
    description: 'High pressure steam boiler feed water & general utility makeup line.',
    inletFlowLpm: 8.20,
    outletFlowLpm: 8.18,
    differenceLpm: 0.02,
    configuredToleranceLpm: 0.30,
    status: 'normal',
    todayLitre: 4890,
    monthlyLitre: 11560,
    estimatedLossLitre: 12,
    inletSensorId: 'SEN-UTL-08-IN',
    outletSensorId: 'SEN-UTL-09-OUT',
    exactLocation: 'Boiler House — Deaerator Feed Line',
    lastUpdated: '15 sec ago',
    hasActiveLoss: false,
    baselineLitrePerDay: 5000,
  },
  {
    id: 'pipe-wtr-001',
    code: 'WTR-001',
    name: 'Water Treatment & RO Recycle',
    area: 'Water Treatment',
    description: 'Treated effluent recycling and Reverse Osmosis permeate feed line.',
    inletFlowLpm: 4.50,
    outletFlowLpm: 4.48,
    differenceLpm: 0.02,
    configuredToleranceLpm: 0.25,
    status: 'normal',
    todayLitre: 2388,
    monthlyLitre: 5140,
    estimatedLossLitre: 9,
    inletSensorId: 'SEN-WTR-10-IN',
    outletSensorId: 'SEN-WTR-11-OUT',
    exactLocation: 'ETP/STP Plant — RO Permeate Skid',
    lastUpdated: '14 sec ago',
    hasActiveLoss: false,
    baselineLitrePerDay: 2400,
  },
];

const INITIAL_ALERTS: WaterAlert[] = [
  {
    id: 'alert-0926',
    alertCode: 'AQ-ALERT-0926',
    category: 'Possible Water Loss',
    title: 'Possible Water Loss Detected',
    description: 'Flow difference across Production Line A exceeds configured tolerance threshold (1.13 L/min > 0.50 L/min). Flow discrepancy has persisted for 18 minutes.',
    pipelineId: 'pipe-prd-001',
    pipelineName: 'Production Line A',
    exactLocation: 'Bay 3 Pipe Rack — Section PRD-001B (Elevation +4.2m)',
    inletFlowLpm: 15.23,
    outletFlowLpm: 14.10,
    differenceLpm: 1.13,
    thresholdLpm: 0.50,
    severity: 'warning',
    status: 'OPEN',
    createdAt: '2026-09-09',
    time: '18:32',
    assignedTeam: 'Mechanical Maintenance Team Alpha',
    assignedEngineer: 'Vikas Patil (Senior Inspection Tech)',
    requiresVerification: true,
  },
  {
    id: 'alert-0925',
    alertCode: 'AQ-ALERT-0925',
    category: 'High Usage',
    title: 'Baseline Usage Exceeded (+31.3%)',
    description: 'Production Line A daily consumption reached 9,850 L/day vs configured baseline of 7,500 L/day.',
    pipelineId: 'pipe-prd-001',
    pipelineName: 'Production Line A',
    exactLocation: 'Bay 3 Production Header',
    severity: 'warning',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-09-09',
    time: '17:15',
    assignedTeam: 'Operations Control',
    requiresVerification: false,
  },
  {
    id: 'alert-0924',
    alertCode: 'AQ-ALERT-0924',
    category: 'Device Offline',
    title: 'ESP32 Telemetry Heartbeat Missing',
    description: 'Sensor Node ESP32-H003 (Cooling System Auxiliary) failed to send heartbeat packets for > 8 minutes.',
    exactLocation: 'Cooling Tower Yard — Auxiliary Manifold',
    severity: 'critical',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-09',
    time: '16:40',
    assignedTeam: 'IoT Instrumentation Team',
    assignedEngineer: 'Rahul Deshmukh',
    requiresVerification: true,
  },
  {
    id: 'alert-0923',
    alertCode: 'AQ-ALERT-0923',
    category: 'Water Supply Interruption',
    title: 'Scheduled MIDC Supply Maintenance Notice',
    description: 'Main feeder pressure reduction expected tomorrow between 10:00 AM and 02:00 PM.',
    exactLocation: 'MIDC Main Water Intake Header',
    severity: 'info',
    status: 'OPEN',
    createdAt: '2026-09-09',
    time: '14:00',
    assignedTeam: 'Municipal Liaison',
    requiresVerification: false,
  }
];

const INITIAL_AREAS: MunicipalArea[] = [
  {
    id: 'area-a',
    name: 'Area A — North Vangaon',
    code: 'VAN-AREA-A',
    householdsCount: 184,
    waterSuppliedKld: 920,
    waterConsumedKld: 828,
    estimatedLossKld: 92,
    lossPercent: 10.0,
    activeMeters: 181,
    activeAlerts: 3,
    highUsageCount: 5,
    households: [
      {
        id: 'hh-001',
        householdCode: 'H001',
        residentName: 'Suresh Patil',
        address: 'Plot 12, Shivaji Nagar, Area A, Vangaon',
        areaId: 'area-a',
        areaName: 'Area A — North Vangaon',
        meterId: 'MTR-VAN-1001',
        deviceId: 'ESP32-H001',
        currentFlowLpm: 3.80,
        todayLitre: 310.5,
        thisMonthLitre: 5120,
        prevMonthLitre: 5300,
        meterReadingLitre: 14890,
        currentBillAmount: 375.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 4,
        dailyBaselineLitre: 350,
        lastUpdated: '8 sec ago',
      },
      {
        id: 'hh-002',
        householdCode: 'H002',
        residentName: 'Anil Jadhav',
        address: 'Plot 14, Shivaji Nagar, Area A, Vangaon',
        areaId: 'area-a',
        areaName: 'Area A — North Vangaon',
        meterId: 'MTR-VAN-1002',
        deviceId: 'ESP32-H002',
        currentFlowLpm: 4.10,
        todayLitre: 345.0,
        thisMonthLitre: 5680,
        prevMonthLitre: 5800,
        meterReadingLitre: 16120,
        currentBillAmount: 418.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 5,
        dailyBaselineLitre: 380,
        lastUpdated: '12 sec ago',
      },
      {
        id: 'hh-102',
        householdCode: 'H102',
        residentName: 'Rajesh Sharma',
        address: 'Flat 302, Sai Residency, Area A, Vangaon',
        areaId: 'area-a',
        areaName: 'Area A — North Vangaon',
        meterId: 'MTR-VAN-1102',
        deviceId: 'ESP32-H102',
        currentFlowLpm: 4.20,
        todayLitre: 338.7,
        thisMonthLitre: 5420,
        prevMonthLitre: 5870,
        meterReadingLitre: 15240,
        currentBillAmount: 398.50,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 4,
        dailyBaselineLitre: 360,
        lastUpdated: '10 sec ago',
      },
    ]
  },
  {
    id: 'area-b',
    name: 'Area B — Central Vangaon',
    code: 'VAN-AREA-B',
    householdsCount: 215,
    waterSuppliedKld: 1080,
    waterConsumedKld: 972,
    estimatedLossKld: 108,
    lossPercent: 10.0,
    activeMeters: 212,
    activeAlerts: 3,
    highUsageCount: 6,
    households: [
      {
        id: 'hh-004',
        householdCode: 'H004',
        residentName: 'Meena Kulkarni',
        address: 'House 45, Station Road, Area B, Vangaon',
        areaId: 'area-b',
        areaName: 'Area B — Central Vangaon',
        meterId: 'MTR-VAN-1004',
        deviceId: 'ESP32-H004',
        currentFlowLpm: 3.20,
        todayLitre: 290.0,
        thisMonthLitre: 4890,
        prevMonthLitre: 5100,
        meterReadingLitre: 13450,
        currentBillAmount: 355.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 3,
        dailyBaselineLitre: 300,
        lastUpdated: '15 sec ago',
      },
      {
        id: 'hh-005',
        householdCode: 'H005',
        residentName: 'Ganesh Shinde',
        address: 'House 52, Station Road, Area B, Vangaon',
        areaId: 'area-b',
        areaName: 'Area B — Central Vangaon',
        meterId: 'MTR-VAN-1005',
        deviceId: 'ESP32-H005',
        currentFlowLpm: 6.80,
        todayLitre: 580.0,
        thisMonthLitre: 9450,
        prevMonthLitre: 6200,
        meterReadingLitre: 24100,
        currentBillAmount: 820.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'ABNORMAL_FLOW',
        residentCount: 6,
        dailyBaselineLitre: 420,
        lastUpdated: '5 sec ago',
      },
    ]
  },
  {
    id: 'area-c',
    name: 'Area C — South Vangaon & MIDC Belt',
    code: 'VAN-AREA-C',
    householdsCount: 183,
    waterSuppliedKld: 850,
    waterConsumedKld: 740,
    estimatedLossKld: 110,
    lossPercent: 12.9,
    activeMeters: 178,
    activeAlerts: 2,
    highUsageCount: 3,
    households: [
      {
        id: 'hh-006',
        householdCode: 'H006',
        residentName: 'Pooja Deshmukh',
        address: 'Bunglow 8, MIDC Green View, Area C',
        areaId: 'area-c',
        areaName: 'Area C — South Vangaon',
        meterId: 'MTR-VAN-1006',
        deviceId: 'ESP32-H006',
        currentFlowLpm: 3.50,
        todayLitre: 315.0,
        thisMonthLitre: 5200,
        prevMonthLitre: 5400,
        meterReadingLitre: 14200,
        currentBillAmount: 382.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 4,
        dailyBaselineLitre: 340,
        lastUpdated: '14 sec ago',
      },
      {
        id: 'hh-007',
        householdCode: 'H007',
        residentName: 'Vijay Varma',
        address: 'Bunglow 14, MIDC Green View, Area C',
        areaId: 'area-c',
        areaName: 'Area C — South Vangaon',
        meterId: 'MTR-VAN-1007',
        deviceId: 'ESP32-H007',
        currentFlowLpm: 4.00,
        todayLitre: 330.0,
        thisMonthLitre: 5350,
        prevMonthLitre: 5500,
        meterReadingLitre: 15100,
        currentBillAmount: 392.00,
        meterStatus: 'ONLINE',
        leakageStatus: 'NORMAL',
        residentCount: 4,
        dailyBaselineLitre: 350,
        lastUpdated: '9 sec ago',
      },
    ]
  }
];

const INITIAL_DEVICES: IoTDevice[] = [
  {
    id: 'dev-001',
    deviceCode: 'ESP32-H001',
    assignedTo: 'Household H001 (Suresh Patil)',
    assignedType: 'HOUSEHOLD',
    sensorModel: 'YF-S201 Hall Effect Sensor',
    status: 'ONLINE',
    signalRssi: -58,
    batteryVoltage: 4.12,
    firmwareVersion: 'v2.4.1-agy',
    ipAddress: '192.168.1.101',
    lastHeartbeat: '10 sec ago',
    totalPacketsSent: 43280,
    currentFlowLpm: 3.80,
    cumulativeLitre: 14890,
  },
  {
    id: 'dev-002',
    deviceCode: 'ESP32-H002',
    assignedTo: 'Production Line A — Inlet Sensor',
    assignedType: 'PIPELINE',
    sensorModel: 'Turbine Flow Sensor DN50',
    status: 'ONLINE',
    signalRssi: -62,
    batteryVoltage: 24.0, // Mains industrial 24V supply
    firmwareVersion: 'v3.1.0-ind',
    ipAddress: '10.20.4.12',
    lastHeartbeat: '5 sec ago',
    totalPacketsSent: 128450,
    currentFlowLpm: 15.23,
    cumulativeLitre: 128450,
  },
  {
    id: 'dev-003',
    deviceCode: 'ESP32-H003',
    assignedTo: 'Cooling System — Secondary Sensor',
    assignedType: 'PIPELINE',
    sensorModel: 'Ultrasonic Flow Meter DN40',
    status: 'OFFLINE',
    signalRssi: -89,
    batteryVoltage: 3.25,
    firmwareVersion: 'v3.0.8-ind',
    ipAddress: '10.20.4.18',
    lastHeartbeat: '8 min ago',
    totalPacketsSent: 94210,
    currentFlowLpm: 0.00,
    cumulativeLitre: 89400,
  },
  {
    id: 'dev-102',
    deviceCode: 'ESP32-H102',
    assignedTo: 'Household H102 (Rajesh Sharma)',
    assignedType: 'HOUSEHOLD',
    sensorModel: 'YF-S201 Hall Effect Sensor',
    status: 'ONLINE',
    signalRssi: -64,
    batteryVoltage: 3.98,
    firmwareVersion: 'v2.4.1-agy',
    ipAddress: '192.168.1.142',
    lastHeartbeat: '8 sec ago',
    totalPacketsSent: 45190,
    currentFlowLpm: 4.20,
    cumulativeLitre: 15240,
  },
  {
    id: 'dev-hdr-01',
    deviceCode: 'ESP32-HDR-01',
    assignedTo: 'Main Facility Water Header Meter',
    assignedType: 'HEADER',
    sensorModel: 'Electromagnetic Flow Meter DN100',
    status: 'ONLINE',
    signalRssi: -52,
    batteryVoltage: 24.0,
    firmwareVersion: 'v3.2.0-ind',
    ipAddress: '10.20.1.5',
    lastHeartbeat: '4 sec ago',
    totalPacketsSent: 215000,
    currentFlowLpm: 98.8,
    cumulativeLitre: 142300,
  },
];

const INITIAL_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: 'notif-01',
    title: 'Water Supply Maintenance Notice',
    message: 'Water supply will be unavailable tomorrow from 10:00 AM to 2:00 PM due to scheduled municipal pipeline maintenance in Area A & B.',
    targetAudience: 'ALL_HOUSEHOLDS',
    targetDetail: 'Vangaon Municipal Region',
    priority: 'HIGH',
    scheduledAt: '2026-09-10 10:00',
    sentAt: '2026-09-09 16:30',
    status: 'SENT',
    createdBy: 'Municipal Water Board',
    readCount: 489,
  },
  {
    id: 'notif-02',
    title: 'High Usage Baseline Advisory',
    message: 'Your water consumption has exceeded the configured usage baseline for this week. Please check for unintentional fixture leaks.',
    targetAudience: 'SPECIFIC_AREA',
    targetDetail: 'Area B — Central Vangaon',
    priority: 'MEDIUM',
    scheduledAt: '2026-09-09 11:00',
    sentAt: '2026-09-09 11:05',
    status: 'SENT',
    createdBy: 'AquaSense Automated Policy',
    readCount: 172,
  },
  {
    id: 'notif-03',
    title: 'Possible Water Loss Verification Required',
    message: 'Possible water loss detected in Production Line A (Bay 3). Mechanical inspection team has been notified.',
    targetAudience: 'PIPELINE_TEAM',
    targetDetail: 'Viraj Profiles — Mechanical Maintenance Alpha',
    priority: 'URGENT',
    scheduledAt: '2026-09-09 18:35',
    sentAt: '2026-09-09 18:35',
    status: 'SENT',
    createdBy: 'Industrial SCADA Telemetry Engine',
    readCount: 6,
  },
];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    ticketCode: 'TKT-2026-089',
    category: 'Billing Issue',
    subject: 'Discrepancy in previous month tariff slab calculation',
    description: 'The slab 2 rate was applied to 250 L extra despite meter reading showing only 1,150 L.',
    userName: 'Rajesh Sharma (H-102)',
    location: 'Flat 302, Sai Residency, Area A',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-08 14:20',
    updatedAt: '2026-09-09 10:15',
    responses: [
      {
        author: 'Municipal Billing Desk',
        role: 'Billing Officer',
        message: 'We have received your ticket. Meter calibration log is being reviewed by the accounts team.',
        timestamp: '2026-09-08 16:00',
      },
    ]
  },
  {
    id: 'tkt-102',
    ticketCode: 'TKT-2026-090',
    category: 'Leakage',
    subject: 'Suspected underground pipe seepage near Bay 3 building corner',
    description: 'Moisture observed near the foundation close to pipe rack elevation +4.2m.',
    userName: 'Vikas Patil (Production Tech)',
    location: 'Viraj Profiles — Bay 3 Hot Rolling Mill',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-09-09 18:45',
    updatedAt: '2026-09-09 18:45',
    responses: []
  },
];

const INITIAL_VALVES: DigitalTwinValve[] = [
  {
    id: 'vlv-hdr-01',
    valveCode: 'VLV-HDR-01',
    name: 'Main Intake Emergency Gate Valve',
    pipelineId: 'pipe-hdr-01',
    state: 'OPEN',
    actuatorType: 'MOTORIZED',
    positionPercent: 100,
    lastActuated: 'Yesterday 09:00',
  },
  {
    id: 'vlv-prd-01',
    valveCode: 'VLV-PRD-01',
    name: 'Bay 3 Rolling Mill Line A Isolation Valve',
    pipelineId: 'pipe-prd-001',
    state: 'OPEN',
    actuatorType: 'SOLENOID',
    positionPercent: 100,
    lastActuated: '3 days ago',
  },
  {
    id: 'vlv-col-01',
    valveCode: 'VLV-COL-01',
    name: 'Cooling Tower B Make-Up Modulating Valve',
    pipelineId: 'pipe-col-001',
    state: 'THROTTLED',
    actuatorType: 'MOTORIZED',
    positionPercent: 78,
    lastActuated: '14 min ago',
  },
  {
    id: 'vlv-prc-01',
    valveCode: 'VLV-PRC-01',
    name: 'Pickling Bath Neutralizer Solenoid',
    pipelineId: 'pipe-prc-001',
    state: 'OPEN',
    actuatorType: 'SOLENOID',
    positionPercent: 100,
    lastActuated: '1 hour ago',
  },
  {
    id: 'vlv-utl-01',
    valveCode: 'VLV-UTL-01',
    name: 'Steam Boiler Feed Line Valve',
    pipelineId: 'pipe-utl-001',
    state: 'OPEN',
    actuatorType: 'MANUAL',
    positionPercent: 100,
    lastActuated: '2 days ago',
  },
  {
    id: 'vlv-wtr-01',
    valveCode: 'VLV-WTR-01',
    name: 'RO Permeate Recycling Return Valve',
    pipelineId: 'pipe-wtr-001',
    state: 'OPEN',
    actuatorType: 'SOLENOID',
    positionPercent: 100,
    lastActuated: '4 hours ago',
  },
];

const INITIAL_TANKS: DigitalTwinTank[] = [
  {
    id: 'tnk-raw-01',
    tankCode: 'TNK-RAW-250',
    name: 'Raw Water Buffer Reservoir',
    capacityKiloLitres: 250,
    currentLevelPercent: 82,
    currentVolumeKiloLitres: 205,
    temperatureCelsius: 28.4,
    status: 'OPTIMAL',
    waterType: 'Raw Water Buffer',
  },
  {
    id: 'tnk-sft-01',
    tankCode: 'TNK-SFT-100',
    name: 'Cooling Tower Soft Water Reservoir',
    capacityKiloLitres: 100,
    currentLevelPercent: 74,
    currentVolumeKiloLitres: 74,
    temperatureCelsius: 31.2,
    status: 'OPTIMAL',
    waterType: 'Soft Water',
  },
  {
    id: 'tnk-ro-01',
    tankCode: 'TNK-RO-080',
    name: 'RO Permeate Recycled Storage',
    capacityKiloLitres: 80,
    currentLevelPercent: 89,
    currentVolumeKiloLitres: 71.2,
    temperatureCelsius: 26.8,
    status: 'OPTIMAL',
    waterType: 'RO Permeate',
  },
];

const INITIAL_DEPARTMENTS: DigitalTwinDepartment[] = [
  {
    id: 'dept-prd',
    code: 'PRD-01',
    name: 'Production & Rolling Mill',
    leadManager: 'Sanjay Deshmukh (VP Operations)',
    currentFlowLpm: 15.23,
    todayLitre: 53950,
    monthlyLitre: 1618500,
    waterCostInr: 111223,
    monthlyBudgetIntLitre: 1950000,
    budgetUtilizationPercent: 83.0,
    trendMoM: 4.2,
    activeAlertsCount: 1,
    specificConsumption: '0.82 m³/tonne steel',
  },
  {
    id: 'dept-col',
    code: 'COL-02',
    name: 'Cooling & Secondary Loops',
    leadManager: 'Dr. Anita Joshi (Thermal Lead)',
    currentFlowLpm: 12.40,
    todayLitre: 34680,
    monthlyLitre: 1040400,
    waterCostInr: 71500,
    monthlyBudgetIntLitre: 1300000,
    budgetUtilizationPercent: 80.0,
    trendMoM: -2.1,
    activeAlertsCount: 0,
    specificConsumption: '0.53 m³/tonne steel',
  },
  {
    id: 'dept-prc',
    code: 'PRC-03',
    name: 'Chemical Pickling & Surface Treatment',
    leadManager: 'Ramesh Kadam (Chemical Plant Supt)',
    currentFlowLpm: 9.15,
    todayLitre: 23120,
    monthlyLitre: 693600,
    waterCostInr: 47660,
    monthlyBudgetIntLitre: 850000,
    budgetUtilizationPercent: 81.6,
    trendMoM: 1.5,
    activeAlertsCount: 0,
    specificConsumption: '0.35 m³/tonne steel',
  },
  {
    id: 'dept-utl',
    code: 'UTL-04',
    name: 'Utilities & Steam Generation',
    leadManager: 'Mahesh Sharma (Chief Utility Eng)',
    currentFlowLpm: 8.20,
    todayLitre: 11560,
    monthlyLitre: 346800,
    waterCostInr: 23832,
    monthlyBudgetIntLitre: 450000,
    budgetUtilizationPercent: 77.1,
    trendMoM: -5.4,
    activeAlertsCount: 0,
    specificConsumption: '0.18 m³/tonne steel',
  },
  {
    id: 'dept-wtr',
    code: 'WTR-05',
    name: 'ETP, STP & Zero Liquid Discharge (ZLD)',
    leadManager: 'Pooja Nair (Environmental Head)',
    currentFlowLpm: 4.50,
    todayLitre: 5140,
    monthlyLitre: 154200,
    waterCostInr: 10597,
    monthlyBudgetIntLitre: 200000,
    budgetUtilizationPercent: 77.1,
    trendMoM: -8.2,
    activeAlertsCount: 0,
    specificConsumption: '92% Recovery Index',
  },
];

const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'act-001',
    taskCode: 'ACT-2026-001',
    title: 'Possible Water Loss — Pipeline PRD-001',
    source: 'SCADA Telemetry Engine',
    category: 'Possible Water Loss',
    priority: 'CRITICAL',
    status: 'OPEN',
    description: 'Continuous differential loss of 1.13 L/min detected between inlet ESP32-H002 and outlet ESP32-H002B in Bay 3 (configured tolerance: 0.50 L/min).',
    recommendedAction: 'Verify flange joints, spray nozzles, and junction welds at Bay 3 pipe rack (+4.2m elevation).',
    assignedTeam: 'Mechanical Maintenance Team Alpha',
    assignedPerson: 'Vikas Patil',
    timestamp: 'Today, 18:32',
    targetId: 'pipe-prd-001',
    targetRoute: '/pipelines',
  },
  {
    id: 'act-002',
    taskCode: 'ACT-2026-002',
    title: 'High Usage Advisory — Cooling Area Loop',
    source: 'Diurnal Baseline Monitor',
    category: 'High Consumption',
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
    description: 'Cooling Tower B makeup intake exceeded expected seasonal baseline by +14.2% during shift handover.',
    recommendedAction: 'Inspect drift eliminators and blowdown valve timer settings on Cooling Tower B.',
    assignedTeam: 'Thermal Utility Ops',
    assignedPerson: 'Dr. Anita Joshi',
    timestamp: 'Today, 17:15',
    targetId: 'pipe-col-001',
    targetRoute: '/departments',
  },
  {
    id: 'act-003',
    taskCode: 'ACT-2026-003',
    title: 'IoT Node Offline — Sensor ESP32-H003',
    source: 'IoT Fleet Heartbeat',
    category: 'Device Offline',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    description: 'Auxiliary flow sensor ESP32-H003 failed to transmit heartbeat packet for >42 minutes.',
    recommendedAction: 'Check 24V DC auxiliary power supply and WiFi access point AP-YARD-02 signal link.',
    assignedTeam: 'IoT Instrumentation Team',
    assignedPerson: 'Rahul Deshmukh',
    timestamp: 'Today, 16:40',
    targetId: 'dev-003',
    targetRoute: '/devices',
  },
  {
    id: 'act-004',
    taskCode: 'ACT-2026-004',
    title: 'Water Budget Advisory — Production Dept',
    source: 'Budget Tracking Engine',
    category: 'Budget Alert',
    priority: 'MEDIUM',
    status: 'OPEN',
    description: 'Production department has consumed 83.0% of its monthly water quota with 7 days remaining in billing cycle.',
    recommendedAction: 'Review mill scale wash cycle frequency and schedule high-volume wash during off-peak hours.',
    assignedTeam: 'Production Management',
    assignedPerson: 'Sanjay Deshmukh',
    timestamp: 'Today, 14:00',
    targetId: 'dept-prd',
    targetRoute: '/departments',
  },
];

const INITIAL_WATER_BALANCE: WaterBalanceData = {
  period: 'September 2026 (Month-to-Date)',
  waterSuppliedLitres: 142300,
  accountedConsumptionLitres: 128450,
  identifiedLossLitres: 1250,
  unaccountedDifferenceLitres: 12600,
  evaporativeLossLitres: 9400,
  storageVariationLitres: 3200,
  status: 'NEEDS_INVESTIGATION',
  departmentBreakdown: [
    { department: 'Production & Rolling Mill', volumeLitres: 53950, sharePercent: 42.0, flowRateLpm: 15.23 },
    { department: 'Cooling Tower Secondary Loop', volumeLitres: 34680, sharePercent: 27.0, flowRateLpm: 12.40 },
    { department: 'Chemical Pickling & Processing', volumeLitres: 23120, sharePercent: 18.0, flowRateLpm: 9.15 },
    { department: 'Utilities & Steam Boiler', volumeLitres: 11560, sharePercent: 9.0, flowRateLpm: 8.20 },
    { department: 'RO Recycle & Water Treatment', volumeLitres: 5140, sharePercent: 4.0, flowRateLpm: 4.50 },
  ],
};

export const useAquaSenseStore = create<AquaSenseState>((set, get) => ({
  currentRole: 'COMPANY_ADMIN',
  setRole: (role) => set({ currentRole: role }),

  valves: INITIAL_VALVES,
  tanks: INITIAL_TANKS,
  departments: INITIAL_DEPARTMENTS,
  selectedDigitalTwinNode: { type: 'PIPELINE', id: 'pipe-prd-001', data: INITIAL_PIPELINES[0] },
  selectDigitalTwinNode: (node) => set({ selectedDigitalTwinNode: node }),
  
  updateValveState: (valveId, state, positionPercent) => set((prev) => ({
    valves: prev.valves.map((v) => 
      v.id === valveId 
        ? { 
            ...v, 
            state, 
            positionPercent: positionPercent !== undefined ? positionPercent : state === 'OPEN' ? 100 : state === 'CLOSED' ? 0 : 50,
            lastActuated: 'Just now'
          } 
        : v
    )
  })),

  actionItems: INITIAL_ACTION_ITEMS,
  acknowledgeActionItem: (id) => set((prev) => ({
    actionItems: prev.actionItems.map((item) => 
      item.id === id ? { ...item, status: 'ACKNOWLEDGED' as const } : item
    )
  })),
  assignActionItem: (id, team, person) => set((prev) => ({
    actionItems: prev.actionItems.map((item) => 
      item.id === id ? { ...item, status: 'IN_PROGRESS' as const, assignedTeam: team, assignedPerson: person } : item
    )
  })),
  resolveActionItem: (id) => set((prev) => ({
    actionItems: prev.actionItems.map((item) => 
      item.id === id ? { ...item, status: 'RESOLVED' as const } : item
    )
  })),

  waterBalance: INITIAL_WATER_BALANCE,


  simulationActive: true,
  simulationSpeed: 1,
  lastHeartbeatTime: new Date(),
  secondsSinceLastUpdate: 8,
  leakAnomalyActive: true,

  toggleSimulation: () => set((state) => ({ simulationActive: !state.simulationActive })),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  toggleDemoLeakAnomaly: () => set((state) => {
    const nextState = !state.leakAnomalyActive;
    const updatedPipelines = state.pipelines.map((pipe) => {
      if (pipe.id === 'pipe-prd-001') {
        if (nextState) {
          // Anomaly active
          return {
            ...pipe,
            inletFlowLpm: 15.23,
            outletFlowLpm: 14.10,
            differenceLpm: 1.13,
            status: 'possible_loss' as const,
            hasActiveLoss: true,
          };
        } else {
          // Normal balanced flow
          return {
            ...pipe,
            inletFlowLpm: 15.23,
            outletFlowLpm: 15.19,
            differenceLpm: 0.04,
            status: 'normal' as const,
            hasActiveLoss: false,
          };
        }
      }
      return pipe;
    });

    const updatedAlerts = state.alerts.map((a) => {
      if (a.id === 'alert-0926') {
        return {
          ...a,
          status: nextState ? ('OPEN' as const) : ('RESOLVED' as const),
          resolutionNotes: nextState ? undefined : 'Pipe joint packing tightened. Difference returned to 0.04 L/min.',
        };
      }
      return a;
    });

    return {
      leakAnomalyActive: nextState,
      pipelines: updatedPipelines,
      alerts: updatedAlerts,
    };
  }),

  tickTelemetry: () => set((state) => {
    if (!state.simulationActive) return state;

    // Realistic microscopic jitter (e.g. 15.23 -> 15.31 -> 15.18)
    const jitter = (base: number, range: number) => {
      const delta = (Math.random() - 0.5) * range;
      return Number(Math.max(0.1, base + delta).toFixed(2));
    };

    const updatedPipelines = state.pipelines.map((pipe) => {
      if (pipe.id === 'pipe-prd-001') {
        const newInlet = jitter(15.23, 0.16);
        const newOutlet = state.leakAnomalyActive ? jitter(14.10, 0.14) : jitter(newInlet - 0.04, 0.06);
        const diff = Number(Math.max(0, newInlet - newOutlet).toFixed(2));
        const status = diff > pipe.configuredToleranceLpm ? ('possible_loss' as const) : ('normal' as const);
        return {
          ...pipe,
          inletFlowLpm: newInlet,
          outletFlowLpm: newOutlet,
          differenceLpm: diff,
          status,
          todayLitre: pipe.todayLitre + Math.round(newInlet * 0.1),
          lastUpdated: 'Just now',
        };
      } else {
        const newInlet = jitter(pipe.inletFlowLpm, 0.12);
        const newOutlet = jitter(newInlet - 0.03, 0.05);
        const diff = Number(Math.max(0, newInlet - newOutlet).toFixed(2));
        return {
          ...pipe,
          inletFlowLpm: newInlet,
          outletFlowLpm: newOutlet,
          differenceLpm: diff,
          lastUpdated: 'Just now',
        };
      }
    });

    // Update household reading
    const curHh = state.currentHousehold;
    const newHhFlow = jitter(4.20, 0.20);

    return {
      lastHeartbeatTime: new Date(),
      secondsSinceLastUpdate: 0,
      pipelines: updatedPipelines,
      currentHousehold: {
        ...curHh,
        currentFlowLpm: newHhFlow,
        todayLitre: Number((curHh.todayLitre + 0.07).toFixed(1)),
        lastUpdated: 'Just now',
      }
    };
  }),

  pipelines: INITIAL_PIPELINES,
  selectedPipelineId: 'pipe-prd-001',
  selectPipeline: (id) => set({ selectedPipelineId: id }),

  updatePipelineTolerance: (id, newTolerance) => set((state) => {
    const updated = state.pipelines.map((p) => {
      if (p.id === id) {
        const status = p.differenceLpm > newTolerance ? ('possible_loss' as const) : ('normal' as const);
        return { ...p, configuredToleranceLpm: newTolerance, status };
      }
      return p;
    });
    return { pipelines: updated };
  }),

  alerts: INITIAL_ALERTS,
  activeAlertModalId: null,
  openAlertModal: (alertId) => set({ activeAlertModalId: alertId }),

  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { ...a, status: 'ACKNOWLEDGED' as const } : a)
  })),

  assignAlertInspection: (id, team, engineer) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { 
      ...a, 
      status: 'IN_PROGRESS' as const, 
      assignedTeam: team, 
      assignedEngineer: engineer 
    } : a)
  })),

  resolveAlert: (id, notes) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { 
      ...a, 
      status: 'RESOLVED' as const, 
      resolutionNotes: notes 
    } : a)
  })),

  industrialKpis: {
    totalConsumptionLitre: 128450,
    todayConsumptionLitre: 8642,
    waterSupplyLitre: 142300,
    possibleWaterLossLitre: 1250,
    activeDevicesCount: 12,
    totalDevicesCount: 12,
    activeAlertsCount: 3,
  },

  municipalAreas: INITIAL_AREAS,
  selectedAreaId: 'area-a',
  selectArea: (areaId) => set({ selectedAreaId: areaId }),

  municipalKpis: {
    totalWaterSuppliedMlDay: 2.85,
    totalConsumptionMlDay: 2.54,
    estimatedSystemLossMlDay: 0.31,
    householdsConnected: 582,
    activeMeters: 571,
    leakageAlertsCount: 8,
    highUsageAlertsCount: 14,
  },

  currentHousehold: INITIAL_AREAS[0].households[2], // H-102 Rajesh Sharma
  updateHouseholdReading: (newFlow) => set((state) => ({
    currentHousehold: {
      ...state.currentHousehold,
      currentFlowLpm: newFlow,
    }
  })),

  devices: INITIAL_DEVICES,
  updateDeviceStatus: (deviceId, status) => set((state) => ({
    devices: state.devices.map((d) => d.id === deviceId ? { ...d, status } : d)
  })),

  notifications: INITIAL_NOTIFICATIONS,
  createNotification: (notif) => set((state) => {
    const newItem: NotificationMessage = {
      ...notif,
      id: `notif-${Date.now()}`,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      readCount: 0,
    };
    return { notifications: [newItem, ...state.notifications] };
  }),

  supportTickets: INITIAL_TICKETS,
  createSupportTicket: (ticket) => set((state) => {
    const code = `TKT-${new Date().getFullYear()}-${String(state.supportTickets.length + 91).padStart(3, '0')}`;
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketCode: code,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responses: [],
    };
    return { supportTickets: [newTicket, ...state.supportTickets] };
  }),

  updateTicketStatus: (ticketId, status) => set((state) => ({
    supportTickets: state.supportTickets.map((t) => t.id === ticketId ? { 
      ...t, 
      status, 
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) 
    } : t)
  })),

  addTicketResponse: (ticketId, author, role, message) => set((state) => ({
    supportTickets: state.supportTickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          responses: [
            ...t.responses,
            {
              author,
              role,
              message,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          ]
        };
      }
      return t;
    })
  })),

  industrialAccounting: {
    periodStart: '01 Sep 2026',
    periodEnd: '30 Sep 2026',
    openingReadingLitre: 8450,
    closingReadingLitre: 9684,
    totalConsumptionLitre: 1234,
    slabsBreakdown: [
      {
        slabName: 'Tier 1 Baseline (0 – 1,000 L)',
        volumeLitre: 1000,
        ratePerLitre: 0.05,
        amount: 50.00,
      },
      {
        slabName: 'Tier 2 Industrial High (1,001 – 2,000 L)',
        volumeLitre: 234,
        ratePerLitre: 0.08,
        amount: 18.72,
      }
    ],
    subtotalAmount: 68.72,
    serviceCharge: 0.00,
    totalAmount: 68.72,
    currency: 'INR (₹)',
    isDemoCalculation: true,
  },

  householdBill: {
    billId: 'MUNI-BILL-2026-092',
    householdId: 'H102',
    residentName: 'Rajesh Sharma',
    period: '01 Aug 2026 – 31 Aug 2026',
    openingReading: 9820,
    closingReading: 15240,
    consumptionLitre: 5420,
    tariffSlabs: [
      { slab: '0 – 2,000 L (Lifeline)', litres: 2000, rate: 0.04, amount: 80.00 },
      { slab: '2,001 – 5,000 L (Standard Domestic)', litres: 3000, rate: 0.08, amount: 240.00 },
      { slab: '5,001 – 10,000 L (Higher Usage)', litres: 420, rate: 0.12, amount: 50.40 },
    ],
    waterCharges: 370.40,
    meterRent: 15.00,
    sewerageCharge: 13.10,
    totalAmount: 398.50,
    status: 'DUE',
    dueDate: '20 Sep 2026',
  },

  tourActive: false,
  tourStep: 1,
  startTour: () => set({ tourActive: true, tourStep: 1 }),
  nextTourStep: () => set((state) => ({ tourStep: Math.min(14, state.tourStep + 1) })),
  prevTourStep: () => set((state) => ({ tourStep: Math.max(1, state.tourStep - 1) })),
  exitTour: () => set({ tourActive: false, tourStep: 1 }),
  setTourStep: (step) => set({ tourStep: step }),
}));
