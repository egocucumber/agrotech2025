// AgroVzor API Types

export interface Company {
  id: string;
  fullName: string;
  shortName: string;
}

export interface Employee {
  id: string;
  company: Company;
  username: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

export interface CropSpecies {
  id: number;
  name: string;
}

export interface CropVariety {
  id: number;
  name: string;
  species: CropSpecies;
}

export interface VehicleType {
  id: number;
  name: string;
  parentType?: VehicleType;
}

export interface VehicleModel {
  id: number;
  name: string;
  vehicleType: VehicleType;
}

export interface VehicleUnit {
  id: string;
  company: Company;
  model: VehicleModel;
  inventoryNumber: string;
}

export interface FieldWork {
  id: string;
  company: Company;
  variety: CropVariety;
  startDate: string;
  endDate?: string;
}

export interface WorkShift {
  id: string;
  fieldWork: FieldWork;
  employee: Employee;
  vehicleUnit: VehicleUnit;
  startDate: string;
  endDate?: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RegularPacket {
  id: number;
  workShift: WorkShift;
  weight?: number;
  fillLevel?: number;
  coordinate: Coordinate;
  direction?: number;
  timestamp: string;
  rawData?: string;
}

export interface VibrationData {
  id: number;
  workShift: WorkShift;
  sensorLocation: string;
  vibrationValues: string;
  timestamp: string;
  anomalyDetected: boolean;
  anomalyDescription?: string;
}

export interface GrainLossEstimate {
  id: number;
  workShift: WorkShift;
  lossWeight: number;
  lossPercentage: number;
  calculatedAt: string;
  calculationMethod: string;
}

export interface FuelData {
  id: number;
  workShift: WorkShift;
  fuelLevel: number;
  timestamp: string;
  theftDetected: boolean;
  suspiciousDrop?: number;
}

export interface OperatorEfficiencyIndex {
  id: number;
  workShift: WorkShift;
  movementScore: number;
  responseTimeScore: number;
  unloadEfficiencyScore: number;
  overallIndex: number;
  calculatedAt: string;
}

export interface TeamMember {
  employee: Employee;
  vehicle: VehicleUnit;
  role: string;
}

export interface TeamCompositionResult {
  team: TeamMember[];
  expectedYield: number;
  expectedLoss: number;
  recommendation: string;
}

export enum IncidentType {
  GRAIN_THEFT = 'GRAIN_THEFT',
  FUEL_THEFT = 'FUEL_THEFT',
  EQUIPMENT_BREAKDOWN = 'EQUIPMENT_BREAKDOWN',
  UNAUTHORIZED_STOP = 'UNAUTHORIZED_STOP',
}

export interface Incident {
  id: string;
  type: IncidentType;
  workShift?: WorkShift;
  coordinate: Coordinate;
  timestamp: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  relatedData?: FuelData | GrainLossEstimate | VibrationData;
}
