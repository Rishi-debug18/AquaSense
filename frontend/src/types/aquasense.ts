// AquaSense TypeScript Type Definitions
// Smart Water Management & Monitoring Platform

export type UserRole = 
  | 'COMPANY_ADMIN'     // Industrial company management (e.g. Viraj Profiles, Boisar)
  | 'GOVERNMENT_ADMIN'  // Municipal / Government Water Authority (e.g. Vangaon)
  | 'HOUSEHOLD_USER'    // Resident consumer (e.g. Household H-102)
  | 'MAINTENANCE_USER'  // Field maintenance & inspection engineer
  | 'SUPER_ADMIN';      // Platform architect & sysadmin

export type PipelineStatus = 'normal' | 'possible_loss' | 'critical' | 'maintenance' | 'offline';

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'maintenance';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type AlertCategory = 
  | 'Possible Water Loss' 
  | 'High Usage' 
  | 'Device Offline' 
  | 'Meter Error' 
  | 'Water Supply Interruption' 
  | 'Maintenance' 
  | 'System Warning';

export interface SensorNode {
  id: string;
  name: string;
  type: 'INLET' | 'OUTLET' | 'HEADER' | 'SINGLE';
  currentFlowLpm: number;
  todayLitre: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  deviceId: string;
  batteryLevel?: number;
  signalRssi?: number;
  lastUpdated: string;
}

export interface PipelineBranch {
  id: string;
  code: string;
  name: string;
  area: 'Production' | 'Cooling' | 'Processing' | 'Utilities' | 'Water Treatment' | 'Residential';
  description: string;
  inletFlowLpm: number;
  outletFlowLpm: number;
  differenceLpm: number;
  configuredToleranceLpm: number;
  status: PipelineStatus;
  todayLitre: number;
  monthlyLitre: number;
  estimatedLossLitre: number;
  inletSensorId: string;
  outletSensorId: string;
  exactLocation: string;
  lastUpdated: string;
  hasActiveLoss: boolean;
  baselineLitrePerDay: number;
}

export interface WaterAlert {
  id: string;
  alertCode: string;
  category: AlertCategory;
  title: string;
  description: string;
  pipelineId?: string;
  pipelineName?: string;
  exactLocation: string;
  inletFlowLpm?: number;
  outletFlowLpm?: number;
  differenceLpm?: number;
  thresholdLpm?: number;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  time: string;
  assignedTeam?: string;
  assignedEngineer?: string;
  resolutionNotes?: string;
  requiresVerification: boolean;
}

export interface HouseholdData {
  id: string;
  householdCode: string;
  residentName: string;
  address: string;
  areaId: string;
  areaName: string;
  meterId: string;
  deviceId: string;
  currentFlowLpm: number;
  todayLitre: number;
  thisMonthLitre: number;
  prevMonthLitre: number;
  meterReadingLitre: number;
  currentBillAmount: number;
  meterStatus: 'ONLINE' | 'OFFLINE' | 'TAMPER';
  leakageStatus: 'NORMAL' | 'POSSIBLE_LEAK' | 'ABNORMAL_FLOW';
  residentCount: number;
  dailyBaselineLitre: number;
  lastUpdated: string;
}

export interface MunicipalArea {
  id: string;
  name: string;
  code: string;
  householdsCount: number;
  waterSuppliedKld: number;
  waterConsumedKld: number;
  estimatedLossKld: number;
  lossPercent: number;
  activeMeters: number;
  activeAlerts: number;
  highUsageCount: number;
  households: HouseholdData[];
}

export interface TariffSlab {
  minLitre: number;
  maxLitre: number | null; // null means and above
  ratePerLitre: number; // in INR
  description: string;
}

export interface WaterUsageCostRecord {
  periodStart: string;
  periodEnd: string;
  openingReadingLitre: number;
  closingReadingLitre: number;
  totalConsumptionLitre: number;
  slabsBreakdown: {
    slabName: string;
    volumeLitre: number;
    ratePerLitre: number;
    amount: number;
  }[];
  subtotalAmount: number;
  serviceCharge: number;
  totalAmount: number;
  currency: string;
  isDemoCalculation: boolean;
}

export interface IoTDevice {
  id: string;
  deviceCode: string; // e.g. ESP32-H001
  assignedTo: string; // Household H-102 or Production Line A
  assignedType: 'HOUSEHOLD' | 'PIPELINE' | 'HEADER';
  sensorModel: string; // YF-S201 Hall Flow Sensor
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  signalRssi: number; // e.g. -62 dBm
  batteryVoltage: number; // e.g. 3.9 V
  firmwareVersion: string;
  ipAddress: string;
  lastHeartbeat: string;
  totalPacketsSent: number;
  currentFlowLpm: number;
  cumulativeLitre: number;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL_HOUSEHOLDS' | 'SPECIFIC_AREA' | 'SELECTED_HOUSEHOLD' | 'COMPANY_DEPT' | 'PIPELINE_TEAM';
  targetDetail?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledAt: string;
  sentAt?: string;
  status: 'SENT' | 'SCHEDULED' | 'DRAFT';
  createdBy: string;
  readCount: number;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  category: 'Billing Issue' | 'Meter Issue' | 'Leakage' | 'Water Supply' | 'High Consumption' | 'Technical Problem' | 'General Complaint';
  subject: string;
  description: string;
  userName: string;
  location: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  responses: {
    author: string;
    role: string;
    message: string;
    timestamp: string;
  }[];
}

export interface DemoTourStep {
  stepNumber: number;
  title: string;
  description: string;
  highlightSelector?: string;
  actionText?: string;
  targetRoute?: string;
}

// ==========================================
// Digital Twin & Industrial Network Elements
// ==========================================
export type DigitalTwinNodeType = 
  | 'SOURCE' 
  | 'METER' 
  | 'HEADER' 
  | 'PIPELINE' 
  | 'VALVE' 
  | 'TANK' 
  | 'DEPARTMENT' 
  | 'DISCHARGE';

export type DigitalTwinValveState = 'OPEN' | 'THROTTLED' | 'CLOSED';

export interface DigitalTwinValve {
  id: string;
  valveCode: string;
  name: string;
  pipelineId: string;
  state: DigitalTwinValveState;
  actuatorType: 'SOLENOID' | 'MOTORIZED' | 'MANUAL';
  positionPercent: number; // 0 to 100
  lastActuated: string;
}

export interface DigitalTwinTank {
  id: string;
  tankCode: string;
  name: string;
  capacityKiloLitres: number;
  currentLevelPercent: number;
  currentVolumeKiloLitres: number;
  temperatureCelsius: number;
  status: 'OPTIMAL' | 'REFILLING' | 'LOW' | 'OVERFLOW_RISK';
  waterType: 'Raw Water Buffer' | 'Soft Water' | 'RO Permeate' | 'Recycled Effluent';
}

export interface DigitalTwinDepartment {
  id: string;
  code: string;
  name: string;
  leadManager: string;
  currentFlowLpm: number;
  todayLitre: number;
  monthlyLitre: number;
  waterCostInr: number;
  monthlyBudgetIntLitre: number;
  budgetUtilizationPercent: number;
  trendMoM: number;
  activeAlertsCount: number;
  specificConsumption: string; // e.g. "0.82 m³/tonne steel"
}

// ==========================================
// Action Center Operational Tasks
// ==========================================
export type ActionItemPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionItemStatus = 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export interface ActionItem {
  id: string;
  taskCode: string;
  title: string;
  source: string;
  category: 'Possible Water Loss' | 'High Consumption' | 'Device Offline' | 'Budget Alert' | 'Maintenance';
  priority: ActionItemPriority;
  status: ActionItemStatus;
  description: string;
  recommendedAction: string;
  assignedTeam?: string;
  assignedPerson?: string;
  timestamp: string;
  targetId?: string; // pipeline ID or device ID
  targetRoute?: string;
}

// ==========================================
// Water Balance / Mass Balance Records
// ==========================================
export interface WaterBalanceData {
  period: string;
  waterSuppliedLitres: number;
  accountedConsumptionLitres: number;
  identifiedLossLitres: number;
  unaccountedDifferenceLitres: number;
  evaporativeLossLitres: number;
  storageVariationLitres: number;
  status: 'BALANCED' | 'NEEDS_INVESTIGATION' | 'SIGNIFICANT_DIFFERENCE';
  departmentBreakdown: {
    department: string;
    volumeLitres: number;
    sharePercent: number;
    flowRateLpm: number;
  }[];
}
