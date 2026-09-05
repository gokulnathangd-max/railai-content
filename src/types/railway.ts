export type Department = 'CIVIL_PWAY' | 'SNT_SIGNAL' | 'OHE_TRACTION';

export type TrackLineId = 'UP_MAIN' | 'DN_MAIN' | '3RD_LINE' | 'LOOP_LINE_UP' | 'LOOP_LINE_DN';

export type PriorityLevel = 'EMERGENCY' | 'SAFETY_CRITICAL' | 'ROUTINE' | 'PLANNED_RENEWAL';

export type RequestStatus = 'PENDING' | 'CLUSTERED' | 'SCHEDULED' | 'LOCKED_EI' | 'ACTIVE' | 'COMPLETED';

export type TrainClass = 
  | 'VANDE_BHARAT' 
  | 'RAJDHANI_SHATABDI' 
  | 'SUPERFAST_EXPRESS' 
  | 'PASSENGER_MEMU' 
  | 'FREIGHT_CONTAINER';

export interface Station {
  code: string;
  name: string;
  kp: number; // Kilometre post
  hasLoopLines: boolean;
  numLoopLines: number;
  interlockingType: 'ELECTRONIC_INTERLOCKING' | 'ROUTE_RELAY' | 'SOLID_STATE';
  division: string;
}

export interface Corridor {
  id: string;
  name: string;
  code: string;
  zone: string;
  division: string;
  lengthKm: number;
  startKp: number;
  endKp: number;
  tracks: TrackLineId[];
  maxPermissibleSpeedKmph: number;
  stations: Station[];
  description: string;
}

export interface MaintenanceRequest {
  id: string;
  department: Department;
  title: string;
  activityType: string;
  corridorId: string;
  lineId: TrackLineId;
  stationFrom: string;
  stationTo: string;
  kpStart: number;
  kpEnd: number;
  requestedDurationMin: number;
  preferredStartTime: string; // "HH:MM" e.g. "01:30"
  preferredEndTime: string;   // "HH:MM" e.g. "04:30"
  machineryIds: string[];
  crewId: string;
  gangCount: number;
  requiresTractionCut: boolean;
  imposedSpeedRestrictionKmph?: number;
  priority: PriorityLevel;
  status: RequestStatus;
  machineAgeYears?: number;
  trackGradient?: string; // e.g. "1 in 150 falling"
  weatherCondition?: string; // e.g. "Dense Fog, 8°C" or "Clear Night, 18°C"
  clusterId?: string;
  submittedAt: string;
}

export interface MegaShadowBlock {
  id: string;
  name: string;
  corridorId: string;
  lineId: TrackLineId;
  kpStart: number;
  kpEnd: number;
  stationFrom: string;
  stationTo: string;
  assignedRequests: MaintenanceRequest[];
  departmentsInvolved: Department[];
  rawCombinedDurationMin: number;
  optimizedWindow: {
    start: string;
    end: string;
    durationMin: number;
  };
  isolatedTrackLengthKm: number;
  efficiencySavingsMin: number; // hours of separate disruptions saved
  capacitySavedPct: number;
  status: 'PENDING_EVALUATION' | 'RISK_EVALUATED' | 'MILP_OPTIMIZED' | 'LOCKED_EI';
  // Risk outputs
  riskAssessment?: RiskAssessment;
  // Interlocking token
  interlockingToken?: InterlockingToken;
}

export interface RiskFeatureWeight {
  feature: string;
  value: string | number;
  impactScore: number; // -10 to +30 min
  category: 'EQUIPMENT' | 'HUMAN_FACTOR' | 'SPATIAL_GEOMETRY' | 'ENVIRONMENT';
  explanation: string;
}

export interface CompletionCurvePoint {
  timeMin: number;
  probabilityPct: number;
}

export interface RiskAssessment {
  blockId: string;
  baseDurationMin: number;
  calculatedBufferMin: number;
  recommendedTotalTimeMin: number;
  overrunProbabilityPct: number;
  confidenceScorePct: number;
  riskCategory: 'LOW' | 'MODERATE' | 'CRITICAL';
  features: RiskFeatureWeight[];
  completionCurve: CompletionCurvePoint[];
  selfHealingRecommendation: string;
}

export interface TrainPathNode {
  stationCode: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  optimizedArrival: string;
  optimizedDeparture: string;
  assignedTrack: TrackLineId;
  platformOrLoop: string;
  action: 'RUN_THROUGH' | 'SCHEDULED_HALT' | 'REGULATED_OVERTAKE' | 'WAIT_IN_LOOP';
  dwellMin: number;
}

export interface Train {
  trainNo: string;
  trainName: string;
  trainClass: TrainClass;
  priorityWeight: number; // Vande Bharat=10, Rajdhani=8.5, Freight=2.0
  direction: 'UP' | 'DN';
  origin: string;
  destination: string;
  maxSpeedKmph: number;
  pathNodes: TrainPathNode[];
  totalDelayMin: number;
  regulationStatus: 'ON_TIME' | 'LOOP_REGULATED' | 'CROSS_OVER_SINGLE_LINE' | 'DELAYED';
  regulatedAtStation?: string;
  overtakenByTrain?: string;
}

export interface LoopClearingEvent {
  id: string;
  stationCode: string;
  loopLineName: string;
  heldTrainNo: string;
  heldTrainName: string;
  heldTrainClass: TrainClass;
  heldDurationMin: number;
  heldWindow: { start: string; end: string };
  priorityTrainNo: string;
  priorityTrainName: string;
  priorityTrainClass: TrainClass;
  reason: string;
}

export interface MilpOptimizationResult {
  corridorId: string;
  objectiveValueZ: number;
  totalTrainDelayMin: number;
  totalMaintenanceAllocatedMin: number;
  biDirectionalCorridorActive: boolean;
  reroutedLineId: TrackLineId;
  loopClearings: LoopClearingEvent[];
  trainSchedules: Train[];
  solverStatus: 'OPTIMAL' | 'FEASIBLE';
  computationTimeMs: number;
}

export interface LockedSignal {
  signalId: string;
  stationCode: string;
  kpLocation: number;
  lineId: TrackLineId;
  aspect: 'DANGER_RED' | 'CAUTION_YELLOW' | 'PROCEED_GREEN';
  lockedState: 'INTERLOCKED_LOCKED' | 'NORMAL';
  controlPanelAddress: string;
}

export interface ClampedSwitchPoint {
  pointNo: string;
  stationCode: string;
  kpLocation: number;
  normalReversePosition: 'NORMAL' | 'REVERSE';
  padlockClamped: boolean;
  detectionCircuit: 'LOCKED_DISCONNECTED' | 'ACTIVE';
}

export interface InterlockingToken {
  tokenId: string;
  sha256Hash: string;
  blockId: string;
  timestamp: string;
  issuingAuthority: string;
  stationCodes: string[];
  lineLocked: TrackLineId;
  kpBoundaryStart: number;
  kpBoundaryEnd: number;
  validFrom: string;
  validTo: string;
  totalBufferDurationMin: number;
  lockedSignals: LockedSignal[];
  clampedPoints: ClampedSwitchPoint[];
  oheTractionStatus: 'ENERGIZED' | 'ISOLATED_EARTHED';
  formNumber: string; // e.g. "IR Form T/409 - Caution Order & Block Permit"
  digitalSignatureValidation: 'VERIFIED_CRYPTOGRAPHICALLY' | 'PENDING';
  stationMasterAcknowledged: boolean;
}
