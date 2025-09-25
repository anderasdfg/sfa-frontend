import type { SlotStatus, AppointmentModality } from './enums'
import type { Doctor } from './doctor.types'
import type { Patient } from './medical.types'

export interface AppointmentSlot {
  id: number
  scheduled_at: Date
  duration_minutes: number
  price: number
  status: SlotStatus
  doctor_data: Doctor
  patient_data: Patient
  specialty_id: number
  specialty: string
  schedule_modality: AppointmentModality
}

export interface AppointmentSlotResponse {
  success: boolean
  data: AppointmentSlot[]
}
export interface AppointmentSlotQueryParams {
  date: string
  specialtyId: number
  modality?: AppointmentModality
  doctorId?: number | null
}
