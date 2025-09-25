export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
} as const

export const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
} as const

export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  EMERGENCY: 'emergency',
  VIRTUAL: 'virtual',
  PROCEDURE: 'procedure',
} as const

export const MEDICAL_SPECIALTIES = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Traumatología',
  'Urología',
] as const

export const INSURANCE_PROVIDERS = [
  'Sanitas',
  'Sura',
  'Nueva EPS',
  'Compensar',
  'Famisanar',
  'Salud Total',
  'Coomeva',
  'Particular',
] as const

export const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Otro', value: 'other' },
] as const

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const MARITAL_STATUSES = [
  'Soltero/a',
  'Casado/a',
  'Divorciado/a',
  'Viudo/a',
  'Unión libre',
] as const

export const CONSULTATION_DURATIONS = [
  { label: '15 minutos', value: 15 },
  { label: '30 minutos', value: 30 },
  { label: '45 minutos', value: 45 },
  { label: '1 hora', value: 60 },
  { label: '1.5 horas', value: 90 },
  { label: '2 horas', value: 120 },
] as const

export const BUSINESS_HOURS = {
  start: 8, // 8:00 AM
  end: 18, // 6:00 PM
  lunchBreak: {
    start: 12, // 12:00 PM
    end: 13, // 1:00 PM
  },
} as const

export const PAGINATION_OPTIONS = [10, 25, 50, 100] as const

export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD [de] MMMM [de] YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
} as const
