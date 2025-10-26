import type { AppointmentModality, AppointmentStatus } from '@/types/enums'

export interface Doctor {
  id: number
  name: string
  specialtyName: string
  cmp: string
  consultationType: AppointmentModality
  location: string
  avatar: string
  availableSlots: TimeSlot[]
}

export interface TimeSlot {
  id: number
  time: string
  price: number
  available: boolean
  date: string,
  schedule_modality: AppointmentModality
}

export interface AppointmentBooking {
  patientId: number
  doctorId: number
  slotId: number
  appointmentDate: string
  status: AppointmentStatus
  modality: AppointmentModality
  scheduledAt: Date
}

export interface AppointmentSelection {
  doctorId: number
  patientId: number
  slotId: number
  appointmentDate: string
  modality: AppointmentModality
  // Información adicional para mostrar en UI
  time: string
  price: number
  doctorName: string
  doctorSpecialty: string
  doctorAvatar: string
  doctorLocation: string
}
