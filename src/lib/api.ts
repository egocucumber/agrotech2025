// AgroVzor API Client with Fallback Support

import type {
  Company,
  Employee,
  FieldWork,
  WorkShift,
  RegularPacket,
  VibrationData,
  GrainLossEstimate,
  FuelData,
  OperatorEfficiencyIndex,
  TeamCompositionResult,
  VehicleUnit,
  CropVariety,
  CropSpecies,
  VehicleType,
  VehicleModel,
  Incident,
} from './types';

import { IncidentType } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
  isOffline?: boolean;
}

// ===== MOCK DATA FOR OFFLINE MODE =====

const MOCK_COMPANIES: Company[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'Общество с ограниченной ответственностью "Агропромышленный комплекс Золотое Зерно"',
    shortName: 'ООО "АПК Золотое Зерно"',
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001',
    fullName: 'Закрытое акционерное общество "Урожай"',
    shortName: 'ЗАО "Урожай"',
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002',
    fullName: 'Фермерское хозяйство "Солнечное поле"',
    shortName: 'ФХ "Солнечное поле"',
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003',
    fullName: 'Акционерное общество "Нива"',
    shortName: 'АО "Нива"',
  },
  {
    id: '523e4567-e89b-12d3-a456-426614174004',
    fullName: 'Общество с ограниченной ответственностью "Хлебный край"',
    shortName: 'ООО "Хлебный край"',
  },
  {
    id: '623e4567-e89b-12d3-a456-426614174005',
    fullName: 'Сельскохозяйственный производственный кооператив "Родник"',
    shortName: 'СПК "Родник"',
  },
];

const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    company: MOCK_COMPANIES[0],
    username: 'ivanov',
    firstName: 'Иван',
    lastName: 'Иванов',
    middleName: 'Иванович',
  },
  {
    id: 'emp-002',
    company: MOCK_COMPANIES[0],
    username: 'petrov',
    firstName: 'Петр',
    lastName: 'Петров',
    middleName: 'Петрович',
  },
  {
    id: 'emp-003',
    company: MOCK_COMPANIES[1],
    username: 'sidorov',
    firstName: 'Сидор',
    lastName: 'Сидоров',
    middleName: 'Сидорович',
  },
  {
    id: 'emp-004',
    company: MOCK_COMPANIES[2],
    username: 'kuznetsov',
    firstName: 'Алексей',
    lastName: 'Кузнецов',
    middleName: 'Владимирович',
  },
  {
    id: 'emp-005',
    company: MOCK_COMPANIES[0],
    username: 'smirnov',
    firstName: 'Дмитрий',
    lastName: 'Смирнов',
    middleName: 'Александрович',
  },
  {
    id: 'emp-006',
    company: MOCK_COMPANIES[1],
    username: 'popov',
    firstName: 'Михаил',
    lastName: 'Попов',
    middleName: 'Викторович',
  },
  {
    id: 'emp-007',
    company: MOCK_COMPANIES[3],
    username: 'sokolov',
    firstName: 'Андрей',
    lastName: 'Соколов',
    middleName: 'Петрович',
  },
  {
    id: 'emp-008',
    company: MOCK_COMPANIES[3],
    username: 'lebedev',
    firstName: 'Сергей',
    lastName: 'Лебедев',
    middleName: 'Николаевич',
  },
  {
    id: 'emp-009',
    company: MOCK_COMPANIES[4],
    username: 'kozlov',
    firstName: 'Николай',
    lastName: 'Козлов',
    middleName: 'Иванович',
  },
  {
    id: 'emp-010',
    company: MOCK_COMPANIES[4],
    username: 'novikov',
    firstName: 'Владимир',
    lastName: 'Новиков',
    middleName: 'Дмитриевич',
  },
  {
    id: 'emp-011',
    company: MOCK_COMPANIES[5],
    username: 'morozov',
    firstName: 'Евгений',
    lastName: 'Морозов',
    middleName: 'Сергеевич',
  },
  {
    id: 'emp-012',
    company: MOCK_COMPANIES[5],
    username: 'volkov',
    firstName: 'Артем',
    lastName: 'Волков',
    middleName: 'Алексеевич',
  },
];

const MOCK_CROP_SPECIES: CropSpecies[] = [
  { id: 1, name: 'Пшеница' },
  { id: 2, name: 'Кукуруза' },
  { id: 3, name: 'Соя' },
  { id: 4, name: 'Подсолнечник' },
];

const MOCK_CROP_VARIETIES: CropVariety[] = [
  { id: 1, name: 'Безостая 1', species: MOCK_CROP_SPECIES[0] },
  { id: 2, name: 'Саратовская 38', species: MOCK_CROP_SPECIES[0] },
  { id: 3, name: 'Самоделка', species: MOCK_CROP_SPECIES[1] },
  { id: 4, name: 'Краснодарский 291', species: MOCK_CROP_SPECIES[1] },
  { id: 5, name: 'Элита', species: MOCK_CROP_SPECIES[2] },
  { id: 6, name: 'Мастер', species: MOCK_CROP_SPECIES[3] },
];

const MOCK_VEHICLE_TYPES: VehicleType[] = [
  { id: 1, name: 'Комбайн' },
  { id: 2, name: 'Грузовик' },
  { id: 3, name: 'Транспортная машина' },
];

const MOCK_VEHICLE_MODELS: VehicleModel[] = [
  { id: 1, name: 'John Deere S790', vehicleType: MOCK_VEHICLE_TYPES[0] },
  { id: 2, name: 'Claas Lexion 8900', vehicleType: MOCK_VEHICLE_TYPES[0] },
  { id: 3, name: 'MAN TGX 26.440', vehicleType: MOCK_VEHICLE_TYPES[1] },
  { id: 4, name: 'Scania R500', vehicleType: MOCK_VEHICLE_TYPES[1] },
  { id: 5, name: 'John Deere T560', vehicleType: MOCK_VEHICLE_TYPES[2] },
];

const MOCK_VEHICLE_UNITS: VehicleUnit[] = [
  {
    id: 'veh-001',
    company: MOCK_COMPANIES[0],
    model: MOCK_VEHICLE_MODELS[0],
    inventoryNumber: 'КМБ-001',
  },
  {
    id: 'veh-002',
    company: MOCK_COMPANIES[0],
    model: MOCK_VEHICLE_MODELS[1],
    inventoryNumber: 'КМБ-002',
  },
  {
    id: 'veh-003',
    company: MOCK_COMPANIES[1],
    model: MOCK_VEHICLE_MODELS[2],
    inventoryNumber: 'ГРЗ-001',
  },
  {
    id: 'veh-004',
    company: MOCK_COMPANIES[2],
    model: MOCK_VEHICLE_MODELS[3],
    inventoryNumber: 'ГРЗ-002',
  },
  {
    id: 'veh-005',
    company: MOCK_COMPANIES[0],
    model: MOCK_VEHICLE_MODELS[4],
    inventoryNumber: 'ТРН-001',
  },
  {
    id: 'veh-006',
    company: MOCK_COMPANIES[1],
    model: MOCK_VEHICLE_MODELS[0],
    inventoryNumber: 'КМБ-003',
  },
  {
    id: 'veh-007',
    company: MOCK_COMPANIES[3],
    model: MOCK_VEHICLE_MODELS[1],
    inventoryNumber: 'КМБ-004',
  },
  {
    id: 'veh-008',
    company: MOCK_COMPANIES[3],
    model: MOCK_VEHICLE_MODELS[2],
    inventoryNumber: 'ГРЗ-003',
  },
  {
    id: 'veh-009',
    company: MOCK_COMPANIES[4],
    model: MOCK_VEHICLE_MODELS[0],
    inventoryNumber: 'КМБ-005',
  },
  {
    id: 'veh-010',
    company: MOCK_COMPANIES[4],
    model: MOCK_VEHICLE_MODELS[3],
    inventoryNumber: 'ГРЗ-004',
  },
  {
    id: 'veh-011',
    company: MOCK_COMPANIES[5],
    model: MOCK_VEHICLE_MODELS[1],
    inventoryNumber: 'КМБ-006',
  },
  {
    id: 'veh-012',
    company: MOCK_COMPANIES[5],
    model: MOCK_VEHICLE_MODELS[4],
    inventoryNumber: 'ТРН-002',
  },
];

const MOCK_FIELD_WORKS: FieldWork[] = [
  {
    id: 'fw-001',
    company: MOCK_COMPANIES[0],
    variety: MOCK_CROP_VARIETIES[0],
    startDate: '2024-07-15',
    endDate: '2024-08-20',
  },
  {
    id: 'fw-002',
    company: MOCK_COMPANIES[0],
    variety: MOCK_CROP_VARIETIES[2],
    startDate: '2024-08-01',
    endDate: '2024-09-10',
  },
  {
    id: 'fw-003',
    company: MOCK_COMPANIES[1],
    variety: MOCK_CROP_VARIETIES[1],
    startDate: '2024-07-20',
    endDate: '2024-08-25',
  },
  {
    id: 'fw-004',
    company: MOCK_COMPANIES[2],
    variety: MOCK_CROP_VARIETIES[5],
    startDate: '2024-08-10',
    endDate: undefined,
  },
  {
    id: 'fw-005',
    company: MOCK_COMPANIES[3],
    variety: MOCK_CROP_VARIETIES[0],
    startDate: '2024-07-18',
    endDate: '2024-08-22',
  },
  {
    id: 'fw-006',
    company: MOCK_COMPANIES[3],
    variety: MOCK_CROP_VARIETIES[3],
    startDate: '2024-08-05',
    endDate: '2024-09-15',
  },
  {
    id: 'fw-007',
    company: MOCK_COMPANIES[4],
    variety: MOCK_CROP_VARIETIES[4],
    startDate: '2024-08-12',
    endDate: undefined,
  },
  {
    id: 'fw-008',
    company: MOCK_COMPANIES[5],
    variety: MOCK_CROP_VARIETIES[0],
    startDate: '2024-07-25',
    endDate: '2024-08-28',
  },
];

const MOCK_WORK_SHIFTS: WorkShift[] = [
  {
    id: 'shift-001',
    fieldWork: MOCK_FIELD_WORKS[0],
    employee: MOCK_EMPLOYEES[0],
    vehicleUnit: MOCK_VEHICLE_UNITS[0],
    startDate: '2024-07-16T08:00:00',
    endDate: '2024-07-16T18:00:00',
  },
  {
    id: 'shift-002',
    fieldWork: MOCK_FIELD_WORKS[0],
    employee: MOCK_EMPLOYEES[1],
    vehicleUnit: MOCK_VEHICLE_UNITS[1],
    startDate: '2024-07-17T08:00:00',
    endDate: '2024-07-17T19:00:00',
  },
  {
    id: 'shift-003',
    fieldWork: MOCK_FIELD_WORKS[1],
    employee: MOCK_EMPLOYEES[0],
    vehicleUnit: MOCK_VEHICLE_UNITS[0],
    startDate: '2024-08-02T08:00:00',
    endDate: '2024-08-02T18:30:00',
  },
  {
    id: 'shift-004',
    fieldWork: MOCK_FIELD_WORKS[2],
    employee: MOCK_EMPLOYEES[2],
    vehicleUnit: MOCK_VEHICLE_UNITS[2],
    startDate: '2024-07-21T07:00:00',
    endDate: '2024-07-21T17:00:00',
  },
  {
    id: 'shift-005',
    fieldWork: MOCK_FIELD_WORKS[3],
    employee: MOCK_EMPLOYEES[3],
    vehicleUnit: MOCK_VEHICLE_UNITS[3],
    startDate: '2024-08-11T08:00:00',
    endDate: undefined,
  },
  {
    id: 'shift-006',
    fieldWork: MOCK_FIELD_WORKS[0],
    employee: MOCK_EMPLOYEES[4],
    vehicleUnit: MOCK_VEHICLE_UNITS[4],
    startDate: '2024-07-18T08:00:00',
    endDate: '2024-07-18T19:00:00',
  },
  {
    id: 'shift-007',
    fieldWork: MOCK_FIELD_WORKS[2],
    employee: MOCK_EMPLOYEES[5],
    vehicleUnit: MOCK_VEHICLE_UNITS[5],
    startDate: '2024-07-22T08:00:00',
    endDate: '2024-07-22T18:00:00',
  },
  {
    id: 'shift-008',
    fieldWork: MOCK_FIELD_WORKS[4],
    employee: MOCK_EMPLOYEES[6],
    vehicleUnit: MOCK_VEHICLE_UNITS[6],
    startDate: '2024-07-19T07:30:00',
    endDate: '2024-07-19T17:30:00',
  },
  {
    id: 'shift-009',
    fieldWork: MOCK_FIELD_WORKS[4],
    employee: MOCK_EMPLOYEES[7],
    vehicleUnit: MOCK_VEHICLE_UNITS[7],
    startDate: '2024-07-20T08:00:00',
    endDate: '2024-07-20T18:00:00',
  },
  {
    id: 'shift-010',
    fieldWork: MOCK_FIELD_WORKS[5],
    employee: MOCK_EMPLOYEES[6],
    vehicleUnit: MOCK_VEHICLE_UNITS[6],
    startDate: '2024-08-06T08:00:00',
    endDate: '2024-08-06T19:00:00',
  },
  {
    id: 'shift-011',
    fieldWork: MOCK_FIELD_WORKS[6],
    employee: MOCK_EMPLOYEES[8],
    vehicleUnit: MOCK_VEHICLE_UNITS[8],
    startDate: '2024-08-13T08:00:00',
    endDate: undefined,
  },
  {
    id: 'shift-012',
    fieldWork: MOCK_FIELD_WORKS[7],
    employee: MOCK_EMPLOYEES[10],
    vehicleUnit: MOCK_VEHICLE_UNITS[10],
    startDate: '2024-07-26T08:00:00',
    endDate: '2024-07-26T18:30:00',
  },
];

const MOCK_GRAIN_LOSS: GrainLossEstimate[] = [
  {
    id: 1,
    workShift: MOCK_WORK_SHIFTS[0],
    lossWeight: 145.5,
    lossPercentage: 2.1,
    calculatedAt: '2024-07-16T18:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 2,
    workShift: MOCK_WORK_SHIFTS[1],
    lossWeight: 89.2,
    lossPercentage: 1.3,
    calculatedAt: '2024-07-17T19:15:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 3,
    workShift: MOCK_WORK_SHIFTS[2],
    lossWeight: 215.8,
    lossPercentage: 3.2,
    calculatedAt: '2024-08-02T19:00:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 4,
    workShift: MOCK_WORK_SHIFTS[3],
    lossWeight: 98.4,
    lossPercentage: 1.5,
    calculatedAt: '2024-07-21T17:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 5,
    workShift: MOCK_WORK_SHIFTS[5],
    lossWeight: 132.7,
    lossPercentage: 1.9,
    calculatedAt: '2024-07-18T19:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 6,
    workShift: MOCK_WORK_SHIFTS[6],
    lossWeight: 175.3,
    lossPercentage: 2.5,
    calculatedAt: '2024-07-22T18:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 7,
    workShift: MOCK_WORK_SHIFTS[7],
    lossWeight: 95.1,
    lossPercentage: 1.4,
    calculatedAt: '2024-07-19T17:45:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 8,
    workShift: MOCK_WORK_SHIFTS[8],
    lossWeight: 188.9,
    lossPercentage: 2.8,
    calculatedAt: '2024-07-20T18:15:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 9,
    workShift: MOCK_WORK_SHIFTS[9],
    lossWeight: 156.4,
    lossPercentage: 2.3,
    calculatedAt: '2024-08-06T19:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 10,
    workShift: MOCK_WORK_SHIFTS[11],
    lossWeight: 112.8,
    lossPercentage: 1.7,
    calculatedAt: '2024-07-26T19:00:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 11,
    workShift: MOCK_WORK_SHIFTS[0],
    lossWeight: 203.5,
    lossPercentage: 3.0,
    calculatedAt: '2024-07-16T16:00:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
  {
    id: 12,
    workShift: MOCK_WORK_SHIFTS[1],
    lossWeight: 76.3,
    lossPercentage: 1.1,
    calculatedAt: '2024-07-17T15:30:00',
    calculationMethod: 'Анализ уровня заполненности',
  },
];

const MOCK_VIBRATION_DATA: VibrationData[] = [
  {
    id: 1,
    workShift: MOCK_WORK_SHIFTS[0],
    sensorLocation: 'Выгрузной шнек',
    vibrationValues: '{"x": 2.5, "y": 3.1, "z": 1.8}',
    timestamp: '2024-07-16T14:30:00',
    anomalyDetected: true,
    anomalyDescription: 'Повышенная амплитуда вибрации по оси Y',
  },
  {
    id: 2,
    workShift: MOCK_WORK_SHIFTS[2],
    sensorLocation: 'Молотильный аппарат',
    vibrationValues: '{"x": 4.2, "y": 4.8, "z": 3.5}',
    timestamp: '2024-08-02T12:45:00',
    anomalyDetected: true,
    anomalyDescription: 'Нерегулярный вибрационный паттерн',
  },
  {
    id: 3,
    workShift: MOCK_WORK_SHIFTS[1],
    sensorLocation: 'Двигатель',
    vibrationValues: '{"x": 1.8, "y": 2.1, "z": 1.5}',
    timestamp: '2024-07-17T10:15:00',
    anomalyDetected: false,
  },
  {
    id: 4,
    workShift: MOCK_WORK_SHIFTS[5],
    sensorLocation: 'Режущий аппарат',
    vibrationValues: '{"x": 3.8, "y": 4.2, "z": 2.9}',
    timestamp: '2024-07-18T13:20:00',
    anomalyDetected: true,
    anomalyDescription: 'Резкое увеличение вибрации',
  },
  {
    id: 5,
    workShift: MOCK_WORK_SHIFTS[7],
    sensorLocation: 'Выгрузной шнек',
    vibrationValues: '{"x": 2.9, "y": 3.5, "z": 2.1}',
    timestamp: '2024-07-19T11:45:00',
    anomalyDetected: true,
    anomalyDescription: 'Повышенный уровень вибрации',
  },
  {
    id: 6,
    workShift: MOCK_WORK_SHIFTS[9],
    sensorLocation: 'Барабан',
    vibrationValues: '{"x": 5.1, "y": 5.8, "z": 4.2}',
    timestamp: '2024-08-06T15:10:00',
    anomalyDetected: true,
    anomalyDescription: 'Критическая вибрация, требуется обслуживание',
  },
  {
    id: 7,
    workShift: MOCK_WORK_SHIFTS[3],
    sensorLocation: 'Двигатель',
    vibrationValues: '{"x": 1.9, "y": 2.3, "z": 1.7}',
    timestamp: '2024-07-21T09:30:00',
    anomalyDetected: false,
  },
  {
    id: 8,
    workShift: MOCK_WORK_SHIFTS[11],
    sensorLocation: 'Молотильный аппарат',
    vibrationValues: '{"x": 3.3, "y": 3.9, "z": 2.8}',
    timestamp: '2024-07-26T14:00:00',
    anomalyDetected: true,
    anomalyDescription: 'Нестабильная работа',
  },
];

const MOCK_FUEL_DATA: FuelData[] = [
  {
    id: 1,
    workShift: MOCK_WORK_SHIFTS[0],
    fuelLevel: 45.5,
    timestamp: '2024-07-16T10:30:00',
    theftDetected: true,
    suspiciousDrop: 25.5,
  },
  {
    id: 2,
    workShift: MOCK_WORK_SHIFTS[1],
    fuelLevel: 78.2,
    timestamp: '2024-07-17T09:00:00',
    theftDetected: false,
  },
  {
    id: 3,
    workShift: MOCK_WORK_SHIFTS[2],
    fuelLevel: 35.8,
    timestamp: '2024-08-02T14:20:00',
    theftDetected: false,
  },
  {
    id: 4,
    workShift: MOCK_WORK_SHIFTS[5],
    fuelLevel: 32.3,
    timestamp: '2024-07-18T11:15:00',
    theftDetected: true,
    suspiciousDrop: 28.7,
  },
  {
    id: 5,
    workShift: MOCK_WORK_SHIFTS[7],
    fuelLevel: 65.4,
    timestamp: '2024-07-19T08:30:00',
    theftDetected: false,
  },
  {
    id: 6,
    workShift: MOCK_WORK_SHIFTS[9],
    fuelLevel: 52.1,
    timestamp: '2024-08-06T10:00:00',
    theftDetected: false,
  },
  {
    id: 7,
    workShift: MOCK_WORK_SHIFTS[3],
    fuelLevel: 38.9,
    timestamp: '2024-07-21T08:15:00',
    theftDetected: true,
    suspiciousDrop: 22.3,
  },
  {
    id: 8,
    workShift: MOCK_WORK_SHIFTS[11],
    fuelLevel: 71.5,
    timestamp: '2024-07-26T09:00:00',
    theftDetected: false,
  },
  {
    id: 9,
    workShift: MOCK_WORK_SHIFTS[6],
    fuelLevel: 28.7,
    timestamp: '2024-07-22T10:30:00',
    theftDetected: true,
    suspiciousDrop: 31.4,
  },
  {
    id: 10,
    workShift: MOCK_WORK_SHIFTS[8],
    fuelLevel: 59.2,
    timestamp: '2024-07-20T09:15:00',
    theftDetected: false,
  },
];

const MOCK_EFFICIENCY_DATA: OperatorEfficiencyIndex[] = [
  {
    id: 1,
    workShift: MOCK_WORK_SHIFTS[0],
    movementScore: 85.5,
    responseTimeScore: 80.0,
    unloadEfficiencyScore: 90.2,
    overallIndex: 85.23,
    calculatedAt: '2024-07-16T18:30:00',
  },
  {
    id: 2,
    workShift: MOCK_WORK_SHIFTS[1],
    movementScore: 92.0,
    responseTimeScore: 88.5,
    unloadEfficiencyScore: 85.0,
    overallIndex: 88.5,
    calculatedAt: '2024-07-17T19:15:00',
  },
  {
    id: 3,
    workShift: MOCK_WORK_SHIFTS[2],
    movementScore: 78.5,
    responseTimeScore: 75.0,
    unloadEfficiencyScore: 82.5,
    overallIndex: 78.67,
    calculatedAt: '2024-08-02T19:00:00',
  },
  {
    id: 4,
    workShift: MOCK_WORK_SHIFTS[3],
    movementScore: 88.0,
    responseTimeScore: 85.5,
    unloadEfficiencyScore: 87.0,
    overallIndex: 86.83,
    calculatedAt: '2024-07-21T17:30:00',
  },
  {
    id: 5,
    workShift: MOCK_WORK_SHIFTS[5],
    movementScore: 81.3,
    responseTimeScore: 79.8,
    unloadEfficiencyScore: 84.7,
    overallIndex: 81.93,
    calculatedAt: '2024-07-18T19:30:00',
  },
  {
    id: 6,
    workShift: MOCK_WORK_SHIFTS[6],
    movementScore: 89.7,
    responseTimeScore: 86.2,
    unloadEfficiencyScore: 91.5,
    overallIndex: 89.13,
    calculatedAt: '2024-07-22T18:30:00',
  },
  {
    id: 7,
    workShift: MOCK_WORK_SHIFTS[7],
    movementScore: 76.8,
    responseTimeScore: 72.5,
    unloadEfficiencyScore: 79.3,
    overallIndex: 76.2,
    calculatedAt: '2024-07-19T17:45:00',
  },
  {
    id: 8,
    workShift: MOCK_WORK_SHIFTS[8],
    movementScore: 83.4,
    responseTimeScore: 81.7,
    unloadEfficiencyScore: 86.9,
    overallIndex: 84.0,
    calculatedAt: '2024-07-20T18:15:00',
  },
  {
    id: 9,
    workShift: MOCK_WORK_SHIFTS[9],
    movementScore: 90.5,
    responseTimeScore: 87.3,
    unloadEfficiencyScore: 89.8,
    overallIndex: 89.2,
    calculatedAt: '2024-08-06T19:30:00',
  },
  {
    id: 10,
    workShift: MOCK_WORK_SHIFTS[11],
    movementScore: 79.2,
    responseTimeScore: 77.8,
    unloadEfficiencyScore: 81.5,
    overallIndex: 79.5,
    calculatedAt: '2024-07-26T19:00:00',
  },
  {
    id: 11,
    workShift: MOCK_WORK_SHIFTS[5],
    movementScore: 94.1,
    responseTimeScore: 91.3,
    unloadEfficiencyScore: 93.7,
    overallIndex: 93.03,
    calculatedAt: '2024-07-18T17:00:00',
  },
  {
    id: 12,
    workShift: MOCK_WORK_SHIFTS[6],
    movementScore: 73.5,
    responseTimeScore: 70.2,
    unloadEfficiencyScore: 76.8,
    overallIndex: 73.5,
    calculatedAt: '2024-07-22T16:30:00',
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    type: IncidentType.GRAIN_THEFT,
    workShift: MOCK_WORK_SHIFTS[0],
    coordinate: { latitude: 47.2357, longitude: 39.7015 },
    timestamp: '2024-07-16T10:30:00',
    description: 'Обнаружена кража зерна: резкое уменьшение загруженности комбайна',
    severity: 'high',
    relatedData: MOCK_GRAIN_LOSS[0],
  },
  {
    id: 'inc-002',
    type: IncidentType.FUEL_THEFT,
    workShift: MOCK_WORK_SHIFTS[0],
    coordinate: { latitude: 47.2521, longitude: 39.6872 },
    timestamp: '2024-07-16T10:30:00',
    description: 'Слив топлива: падение уровня на 25.5 литров',
    severity: 'high',
    relatedData: MOCK_FUEL_DATA[0],
  },
  {
    id: 'inc-003',
    type: IncidentType.FUEL_THEFT,
    workShift: MOCK_WORK_SHIFTS[5],
    coordinate: { latitude: 47.2188, longitude: 39.7203 },
    timestamp: '2024-07-18T11:15:00',
    description: 'Слив топлива: падение уровня на 28.7 литров',
    severity: 'high',
    relatedData: MOCK_FUEL_DATA[3],
  },
  {
    id: 'inc-004',
    type: IncidentType.EQUIPMENT_BREAKDOWN,
    workShift: MOCK_WORK_SHIFTS[2],
    coordinate: { latitude: 47.2445, longitude: 39.7345 },
    timestamp: '2024-08-02T12:45:00',
    description: 'Неисправность молотильного аппарата: нерегулярный вибрационный паттерн',
    severity: 'medium',
    relatedData: MOCK_VIBRATION_DATA[1],
  },
  {
    id: 'inc-005',
    type: IncidentType.EQUIPMENT_BREAKDOWN,
    workShift: MOCK_WORK_SHIFTS[0],
    coordinate: { latitude: 47.2612, longitude: 39.6725 },
    timestamp: '2024-07-16T14:30:00',
    description: 'Повышенная амплитуда вибрации выгрузного шнека',
    severity: 'medium',
    relatedData: MOCK_VIBRATION_DATA[0],
  },
  {
    id: 'inc-006',
    type: IncidentType.FUEL_THEFT,
    workShift: MOCK_WORK_SHIFTS[3],
    coordinate: { latitude: 47.2098, longitude: 39.7512 },
    timestamp: '2024-07-21T08:15:00',
    description: 'Слив топлива: падение уровня на 22.3 литров',
    severity: 'high',
    relatedData: MOCK_FUEL_DATA[6],
  },
  {
    id: 'inc-007',
    type: IncidentType.EQUIPMENT_BREAKDOWN,
    workShift: MOCK_WORK_SHIFTS[5],
    coordinate: { latitude: 47.2734, longitude: 39.6998 },
    timestamp: '2024-07-18T13:20:00',
    description: 'Резкое увеличение вибрации режущего аппарата',
    severity: 'high',
    relatedData: MOCK_VIBRATION_DATA[3],
  },
  {
    id: 'inc-008',
    type: IncidentType.FUEL_THEFT,
    workShift: MOCK_WORK_SHIFTS[6],
    coordinate: { latitude: 47.2289, longitude: 39.6634 },
    timestamp: '2024-07-22T10:30:00',
    description: 'Слив топлива: падение уровня на 31.4 литров',
    severity: 'high',
    relatedData: MOCK_FUEL_DATA[8],
  },
  {
    id: 'inc-009',
    type: IncidentType.GRAIN_THEFT,
    workShift: MOCK_WORK_SHIFTS[2],
    coordinate: { latitude: 47.1987, longitude: 39.7156 },
    timestamp: '2024-08-02T19:00:00',
    description: 'Повышенные потери зерна: 3.2%',
    severity: 'medium',
    relatedData: MOCK_GRAIN_LOSS[2],
  },
  {
    id: 'inc-010',
    type: IncidentType.EQUIPMENT_BREAKDOWN,
    workShift: MOCK_WORK_SHIFTS[9],
    coordinate: { latitude: 47.2456, longitude: 39.7789 },
    timestamp: '2024-08-06T15:10:00',
    description: 'Критическая вибрация барабана, требуется обслуживание',
    severity: 'high',
    relatedData: MOCK_VIBRATION_DATA[5],
  },
  {
    id: 'inc-011',
    type: IncidentType.UNAUTHORIZED_STOP,
    workShift: MOCK_WORK_SHIFTS[7],
    coordinate: { latitude: 47.2156, longitude: 39.6891 },
    timestamp: '2024-07-19T14:00:00',
    description: 'Несанкционированная остановка техники на 45 минут',
    severity: 'low',
  },
  {
    id: 'inc-012',
    type: IncidentType.UNAUTHORIZED_STOP,
    workShift: MOCK_WORK_SHIFTS[1],
    coordinate: { latitude: 47.2823, longitude: 39.7423 },
    timestamp: '2024-07-17T13:30:00',
    description: 'Несанкционированная остановка техники на 30 минут',
    severity: 'low',
  },
];

const MOCK_TEAM_COMPOSITION: TeamCompositionResult = {
  team: [
    {
      employee: MOCK_EMPLOYEES[0],
      vehicle: MOCK_VEHICLE_UNITS[0],
      role: 'Оператор комбайна',
    },
    {
      employee: MOCK_EMPLOYEES[1],
      vehicle: MOCK_VEHICLE_UNITS[1],
      role: 'Оператор комбайна',
    },
    {
      employee: MOCK_EMPLOYEES[2],
      vehicle: MOCK_VEHICLE_UNITS[2],
      role: 'Водитель грузовика',
    },
  ],
  expectedYield: 8500.5,
  expectedLoss: 180.2,
  recommendation: 'Рекомендуется добавить еще один грузовик для оптимизации транспортировки',
};

// Helper function to check backend availability
let backendAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

async function checkBackendAvailability(): Promise<boolean> {
  const now = Date.now();

  // Return cached result if check was recent
  if (backendAvailable !== null && now - lastCheckTime < CHECK_INTERVAL) {
    return backendAvailable;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    backendAvailable = response.ok;
    lastCheckTime = now;
    return backendAvailable;
  } catch (error) {
    backendAvailable = false;
    lastCheckTime = now;
    return false;
  }
}

// Generic API call with fallback
async function apiCall<T>(
  url: string,
  options: RequestInit = {},
  fallbackData: T,
): Promise<ApiResponse<T>> {
  const isAvailable = await checkBackendAvailability();

  if (!isAvailable) {
    return {
      data: fallbackData,
      error: 'Backend недоступен. Показаны демонстрационные данные.',
      isOffline: true,
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, isOffline: false };
  } catch (error) {
    return {
      data: fallbackData,
      error: (error as Error).message,
      isOffline: true,
    };
  }
}

// Companies API
export const companiesApi = {
  getAll: async (): Promise<ApiResponse<Company[]>> => {
    return apiCall('/companies', {}, MOCK_COMPANIES);
  },

  getById: async (id: string): Promise<ApiResponse<Company>> => {
    const company = MOCK_COMPANIES.find(c => c.id === id) || MOCK_COMPANIES[0];
    return apiCall(`/companies/${id}`, {}, company);
  },

  create: async (company: Omit<Company, 'id'>): Promise<ApiResponse<Company>> => {
    return apiCall(
      '/companies',
      {
        method: 'POST',
        body: JSON.stringify(company),
      },
      { ...company, id: `mock-${Date.now()}` } as Company,
    );
  },

  update: async (id: string, company: Omit<Company, 'id'>): Promise<ApiResponse<Company>> => {
    return apiCall(
      `/companies/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(company),
      },
      { ...company, id } as Company,
    );
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`/companies/${id}`, { method: 'DELETE' }, undefined);
  },
};

// Employees API
export const employeesApi = {
  getAll: async (): Promise<ApiResponse<Employee[]>> => {
    return apiCall('/employees', {}, MOCK_EMPLOYEES);
  },

  getById: async (id: string): Promise<ApiResponse<Employee>> => {
    const employee = MOCK_EMPLOYEES.find(e => e.id === id) || MOCK_EMPLOYEES[0];
    return apiCall(`/employees/${id}`, {}, employee);
  },

  getByUsername: async (username: string): Promise<ApiResponse<Employee>> => {
    const employee = MOCK_EMPLOYEES.find(e => e.username === username) || MOCK_EMPLOYEES[0];
    return apiCall(`/employees/username/${username}`, {}, employee);
  },

  getByCompanyId: async (companyId: string): Promise<ApiResponse<Employee[]>> => {
    const employees = MOCK_EMPLOYEES.filter(e => e.company.id === companyId);
    return apiCall(`/employees/company/${companyId}`, {}, employees);
  },

  create: async (employee: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return apiCall(
      '/employees',
      {
        method: 'POST',
        body: JSON.stringify(employee),
      },
      { ...employee, id: `mock-${Date.now()}` } as Employee,
    );
  },

  update: async (id: string, employee: Partial<Employee>): Promise<ApiResponse<Employee>> => {
    return apiCall(
      `/employees/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(employee),
      },
      { ...employee, id } as Employee,
    );
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`/employees/${id}`, { method: 'DELETE' }, undefined);
  },
};

// Field Works API
export const fieldWorksApi = {
  getAll: async (): Promise<ApiResponse<FieldWork[]>> => {
    return apiCall('/field-works', {}, MOCK_FIELD_WORKS);
  },

  getById: async (id: string): Promise<ApiResponse<FieldWork>> => {
    const fieldWork = MOCK_FIELD_WORKS.find(fw => fw.id === id) || MOCK_FIELD_WORKS[0];
    return apiCall(`/field-works/${id}`, {}, fieldWork);
  },

  getByCompanyId: async (companyId: string): Promise<ApiResponse<FieldWork[]>> => {
    const fieldWorks = MOCK_FIELD_WORKS.filter(fw => fw.company.id === companyId);
    return apiCall(`/field-works/company/${companyId}`, {}, fieldWorks);
  },

  create: async (fieldWork: Partial<FieldWork>): Promise<ApiResponse<FieldWork>> => {
    return apiCall(
      '/field-works',
      {
        method: 'POST',
        body: JSON.stringify(fieldWork),
      },
      { ...fieldWork, id: `mock-${Date.now()}` } as FieldWork,
    );
  },
};

// Work Shifts API
export const workShiftsApi = {
  getAll: async (): Promise<ApiResponse<WorkShift[]>> => {
    return apiCall('/work-shifts', {}, MOCK_WORK_SHIFTS);
  },

  getById: async (id: string): Promise<ApiResponse<WorkShift>> => {
    const workShift = MOCK_WORK_SHIFTS.find(ws => ws.id === id) || MOCK_WORK_SHIFTS[0];
    return apiCall(`/work-shifts/${id}`, {}, workShift);
  },

  getByFieldWorkId: async (fieldWorkId: string): Promise<ApiResponse<WorkShift[]>> => {
    const workShifts = MOCK_WORK_SHIFTS.filter(ws => ws.fieldWork.id === fieldWorkId);
    return apiCall(`/work-shifts/field-work/${fieldWorkId}`, {}, workShifts);
  },

  getByEmployeeId: async (employeeId: string): Promise<ApiResponse<WorkShift[]>> => {
    const workShifts = MOCK_WORK_SHIFTS.filter(ws => ws.employee.id === employeeId);
    return apiCall(`/work-shifts/employee/${employeeId}`, {}, workShifts);
  },

  create: async (workShift: Partial<WorkShift>): Promise<ApiResponse<WorkShift>> => {
    return apiCall(
      '/work-shifts',
      {
        method: 'POST',
        body: JSON.stringify(workShift),
      },
      { ...workShift, id: `mock-${Date.now()}` } as WorkShift,
    );
  },
};

// Regular Packets (Telemetry) API
export const regularPacketsApi = {
  getAll: async (): Promise<ApiResponse<RegularPacket[]>> => {
    return apiCall('/regular-packets', {}, []);
  },

  getByWorkShiftId: async (workShiftId: string): Promise<ApiResponse<RegularPacket[]>> => {
    return apiCall(`/regular-packets/work-shift/${workShiftId}`, {}, []);
  },

  create: async (packet: Partial<RegularPacket>): Promise<ApiResponse<RegularPacket>> => {
    return apiCall(
      '/regular-packets',
      {
        method: 'POST',
        body: JSON.stringify(packet),
      },
      { ...packet, id: Date.now() } as RegularPacket,
    );
  },
};

// Analytics API
export const analyticsApi = {
  // Grain Loss
  calculateGrainLoss: async (workShiftId: string): Promise<ApiResponse<GrainLossEstimate>> => {
    const estimate = MOCK_GRAIN_LOSS.find(gl => gl.workShift.id === workShiftId) || MOCK_GRAIN_LOSS[0];
    return apiCall(
      `/analytics/grain-loss/calculate/${workShiftId}`,
      { method: 'POST' },
      estimate,
    );
  },

  getAllGrainLoss: async (): Promise<ApiResponse<GrainLossEstimate[]>> => {
    return apiCall('/analytics/grain-loss', {}, MOCK_GRAIN_LOSS);
  },

  getGrainLossByWorkShift: async (workShiftId: string): Promise<ApiResponse<GrainLossEstimate[]>> => {
    const losses = MOCK_GRAIN_LOSS.filter(gl => gl.workShift.id === workShiftId);
    return apiCall(`/analytics/grain-loss/work-shift/${workShiftId}`, {}, losses);
  },

  // Vibration
  saveVibrationData: async (data: Partial<VibrationData>): Promise<ApiResponse<VibrationData>> => {
    return apiCall(
      '/analytics/vibration',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { ...data, id: Date.now() } as VibrationData,
    );
  },

  getVibrationByWorkShift: async (workShiftId: string): Promise<ApiResponse<VibrationData[]>> => {
    const vibrations = MOCK_VIBRATION_DATA.filter(v => v.workShift.id === workShiftId);
    return apiCall(`/analytics/vibration/work-shift/${workShiftId}`, {}, vibrations);
  },

  getVibrationAnomalies: async (): Promise<ApiResponse<VibrationData[]>> => {
    const anomalies = MOCK_VIBRATION_DATA.filter(v => v.anomalyDetected);
    return apiCall('/analytics/vibration/anomalies', {}, anomalies);
  },

  // Fuel
  saveFuelData: async (data: Partial<FuelData>): Promise<ApiResponse<FuelData>> => {
    return apiCall(
      '/analytics/fuel',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { ...data, id: Date.now() } as FuelData,
    );
  },

  getFuelByWorkShift: async (workShiftId: string): Promise<ApiResponse<FuelData[]>> => {
    const fuelData = MOCK_FUEL_DATA.filter(f => f.workShift.id === workShiftId);
    return apiCall(`/analytics/fuel/work-shift/${workShiftId}`, {}, fuelData);
  },

  getFuelTheftAlerts: async (): Promise<ApiResponse<FuelData[]>> => {
    const alerts = MOCK_FUEL_DATA.filter(f => f.theftDetected);
    return apiCall('/analytics/fuel/theft-alerts', {}, alerts);
  },

  // Efficiency
  calculateEfficiency: async (workShiftId: string): Promise<ApiResponse<OperatorEfficiencyIndex>> => {
    const efficiency = MOCK_EFFICIENCY_DATA.find(e => e.workShift.id === workShiftId) || MOCK_EFFICIENCY_DATA[0];
    return apiCall(
      `/analytics/efficiency/calculate/${workShiftId}`,
      { method: 'POST' },
      efficiency,
    );
  },

  getAllEfficiency: async (): Promise<ApiResponse<OperatorEfficiencyIndex[]>> => {
    return apiCall('/analytics/efficiency', {}, MOCK_EFFICIENCY_DATA);
  },

  getEfficiencyByWorkShift: async (workShiftId: string): Promise<ApiResponse<OperatorEfficiencyIndex[]>> => {
    const efficiencies = MOCK_EFFICIENCY_DATA.filter(e => e.workShift.id === workShiftId);
    return apiCall(`/analytics/efficiency/work-shift/${workShiftId}`, {}, efficiencies);
  },

  // Team Composition
  composeTeam: async (params: {
    companyId: string;
    fieldWorkId: string;
    harvesters?: number;
    transloaders?: number;
    grainTrucks?: number;
  }): Promise<ApiResponse<TeamCompositionResult>> => {
    const queryParams = new URLSearchParams({
      companyId: params.companyId,
      fieldWorkId: params.fieldWorkId,
      ...(params.harvesters && { harvesters: params.harvesters.toString() }),
      ...(params.transloaders && { transloaders: params.transloaders.toString() }),
      ...(params.grainTrucks && { grainTrucks: params.grainTrucks.toString() }),
    });

    return apiCall(
      `/analytics/team-composition?${queryParams.toString()}`,
      {},
      MOCK_TEAM_COMPOSITION,
    );
  },
};

// Crops API
export const cropsApi = {
  // Crop Species
  getAllSpecies: async (): Promise<ApiResponse<CropSpecies[]>> => {
    return apiCall('/crops/species', {}, MOCK_CROP_SPECIES);
  },

  getSpeciesById: async (id: number): Promise<ApiResponse<CropSpecies>> => {
    const species = MOCK_CROP_SPECIES.find(s => s.id === id) || MOCK_CROP_SPECIES[0];
    return apiCall(`/crops/species/${id}`, {}, species);
  },

  createSpecies: async (species: Omit<CropSpecies, 'id'>): Promise<ApiResponse<CropSpecies>> => {
    return apiCall(
      '/crops/species',
      {
        method: 'POST',
        body: JSON.stringify(species),
      },
      { ...species, id: Date.now() } as CropSpecies,
    );
  },

  updateSpecies: async (id: number, species: Omit<CropSpecies, 'id'>): Promise<ApiResponse<CropSpecies>> => {
    return apiCall(
      `/crops/species/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(species),
      },
      { ...species, id } as CropSpecies,
    );
  },

  deleteSpecies: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(`/crops/species/${id}`, { method: 'DELETE' }, undefined);
  },

  // Crop Varieties
  getAllVarieties: async (): Promise<ApiResponse<CropVariety[]>> => {
    return apiCall('/crops/varieties', {}, MOCK_CROP_VARIETIES);
  },

  getVarietyById: async (id: number): Promise<ApiResponse<CropVariety>> => {
    const variety = MOCK_CROP_VARIETIES.find(v => v.id === id) || MOCK_CROP_VARIETIES[0];
    return apiCall(`/crops/varieties/${id}`, {}, variety);
  },

  getVarietiesBySpeciesId: async (speciesId: number): Promise<ApiResponse<CropVariety[]>> => {
    const varieties = MOCK_CROP_VARIETIES.filter(v => v.species.id === speciesId);
    return apiCall(`/crops/species/${speciesId}/varieties`, {}, varieties);
  },

  createVariety: async (variety: Partial<CropVariety>): Promise<ApiResponse<CropVariety>> => {
    return apiCall(
      '/crops/varieties',
      {
        method: 'POST',
        body: JSON.stringify(variety),
      },
      { ...variety, id: Date.now() } as CropVariety,
    );
  },

  updateVariety: async (id: number, variety: Partial<CropVariety>): Promise<ApiResponse<CropVariety>> => {
    return apiCall(
      `/crops/varieties/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(variety),
      },
      { ...variety, id } as CropVariety,
    );
  },

  deleteVariety: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(`/crops/varieties/${id}`, { method: 'DELETE' }, undefined);
  },
};

// Vehicles API
export const vehiclesApi = {
  // Vehicle Types
  getAllTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    return apiCall('/vehicles/types', {}, MOCK_VEHICLE_TYPES);
  },

  getTypeById: async (id: number): Promise<ApiResponse<VehicleType>> => {
    const type = MOCK_VEHICLE_TYPES.find(t => t.id === id) || MOCK_VEHICLE_TYPES[0];
    return apiCall(`/vehicles/types/${id}`, {}, type);
  },

  createType: async (type: Omit<VehicleType, 'id'>): Promise<ApiResponse<VehicleType>> => {
    return apiCall(
      '/vehicles/types',
      {
        method: 'POST',
        body: JSON.stringify(type),
      },
      { ...type, id: Date.now() } as VehicleType,
    );
  },

  updateType: async (id: number, type: Omit<VehicleType, 'id'>): Promise<ApiResponse<VehicleType>> => {
    return apiCall(
      `/vehicles/types/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(type),
      },
      { ...type, id } as VehicleType,
    );
  },

  deleteType: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(`/vehicles/types/${id}`, { method: 'DELETE' }, undefined);
  },

  // Vehicle Models
  getAllModels: async (): Promise<ApiResponse<VehicleModel[]>> => {
    return apiCall('/vehicles/models', {}, MOCK_VEHICLE_MODELS);
  },

  getModelById: async (id: number): Promise<ApiResponse<VehicleModel>> => {
    const model = MOCK_VEHICLE_MODELS.find(m => m.id === id) || MOCK_VEHICLE_MODELS[0];
    return apiCall(`/vehicles/models/${id}`, {}, model);
  },

  getModelsByTypeId: async (typeId: number): Promise<ApiResponse<VehicleModel[]>> => {
    const models = MOCK_VEHICLE_MODELS.filter(m => m.vehicleType.id === typeId);
    return apiCall(`/vehicles/types/${typeId}/models`, {}, models);
  },

  createModel: async (model: Partial<VehicleModel>): Promise<ApiResponse<VehicleModel>> => {
    return apiCall(
      '/vehicles/models',
      {
        method: 'POST',
        body: JSON.stringify(model),
      },
      { ...model, id: Date.now() } as VehicleModel,
    );
  },

  updateModel: async (id: number, model: Partial<VehicleModel>): Promise<ApiResponse<VehicleModel>> => {
    return apiCall(
      `/vehicles/models/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(model),
      },
      { ...model, id } as VehicleModel,
    );
  },

  deleteModel: async (id: number): Promise<ApiResponse<void>> => {
    return apiCall(`/vehicles/models/${id}`, { method: 'DELETE' }, undefined);
  },

  // Vehicle Units
  getAllUnits: async (): Promise<ApiResponse<VehicleUnit[]>> => {
    return apiCall('/vehicles/units', {}, MOCK_VEHICLE_UNITS);
  },

  getUnitById: async (id: string): Promise<ApiResponse<VehicleUnit>> => {
    const unit = MOCK_VEHICLE_UNITS.find(u => u.id === id) || MOCK_VEHICLE_UNITS[0];
    return apiCall(`/vehicles/units/${id}`, {}, unit);
  },

  getUnitsByCompanyId: async (companyId: string): Promise<ApiResponse<VehicleUnit[]>> => {
    const units = MOCK_VEHICLE_UNITS.filter(u => u.company.id === companyId);
    return apiCall(`/vehicles/units/company/${companyId}`, {}, units);
  },

  createUnit: async (unit: Partial<VehicleUnit>): Promise<ApiResponse<VehicleUnit>> => {
    return apiCall(
      '/vehicles/units',
      {
        method: 'POST',
        body: JSON.stringify(unit),
      },
      { ...unit, id: `mock-${Date.now()}` } as VehicleUnit,
    );
  },

  updateUnit: async (id: string, unit: Partial<VehicleUnit>): Promise<ApiResponse<VehicleUnit>> => {
    return apiCall(
      `/vehicles/units/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(unit),
      },
      { ...unit, id } as VehicleUnit,
    );
  },

  deleteUnit: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`/vehicles/units/${id}`, { method: 'DELETE' }, undefined);
  },
};

// Incidents API
export const incidentsApi = {
  getAll: async (): Promise<ApiResponse<Incident[]>> => {
    return apiCall('/incidents', {}, MOCK_INCIDENTS);
  },

  getById: async (id: string): Promise<ApiResponse<Incident>> => {
    const incident = MOCK_INCIDENTS.find(i => i.id === id) || MOCK_INCIDENTS[0];
    return apiCall(`/incidents/${id}`, {}, incident);
  },

  getByType: async (type: IncidentType): Promise<ApiResponse<Incident[]>> => {
    const incidents = MOCK_INCIDENTS.filter(i => i.type === type);
    return apiCall(`/incidents/type/${type}`, {}, incidents);
  },

  getBySeverity: async (severity: 'low' | 'medium' | 'high'): Promise<ApiResponse<Incident[]>> => {
    const incidents = MOCK_INCIDENTS.filter(i => i.severity === severity);
    return apiCall(`/incidents/severity/${severity}`, {}, incidents);
  },

  getByWorkShiftId: async (workShiftId: string): Promise<ApiResponse<Incident[]>> => {
    const incidents = MOCK_INCIDENTS.filter(i => i.workShift?.id === workShiftId);
    return apiCall(`/incidents/work-shift/${workShiftId}`, {}, incidents);
  },
};

// Export helper to check backend status
export { checkBackendAvailability };
