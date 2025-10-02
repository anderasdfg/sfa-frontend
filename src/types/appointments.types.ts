import type { Doctor } from './doctor.types'
import type { Patient } from './medical.types'
import type { Slot } from './schedules.types'
import { AppointmentStatus, AppointmentModality } from './enums'

export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  doctor_name?: string
  slot_id: number
  appointment_date: string
  status: AppointmentStatus
  modality: AppointmentModality
  scheduled_at: Date
  patient_data: Patient
  doctor_data: Doctor
  slot: Slot
  specialty: string
}

export interface AppointmentQueryParams {
  patient_id?: number
  doctor_id?: number
  status?: AppointmentStatus
  modality?: AppointmentModality
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface AppointmentCreateRequest {
  patient_id: number
  doctor_id: number
  slot_id: number
  appointment_date: string
  status: AppointmentStatus
  modality: AppointmentModality
  scheduled_at: Date
}

export interface AppointmentCreateResponse {
  success: boolean
  data: Appointment
  message: string
}
