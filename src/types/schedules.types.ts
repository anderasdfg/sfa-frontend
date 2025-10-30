import type { Doctor } from './doctor.types'
import { AppointmentModality, SlotStatus } from './enums'

export interface Schedule {
  doctor_id: number
  schedule_date: string
  appointment_modality: AppointmentModality
  start_time: string
  end_time: string
  id: number
  doctor_data: Doctor
  specialty: string
}

export interface ScheduleRequestQueryParams {
  doctor_id: number
  schedule_date: string
  modality: AppointmentModality
}

export interface ScheduleResponse {
  success: boolean
  data: Schedule[]
}

export interface ScheduleCreateRequest {
  doctor_id: number
  schedule_date: string
  appointment_modality: AppointmentModality
  start_time: string
  end_time: string
  slot_duration_minutes: number
  slot_price: number
  service_id: number
}

export interface Slot {
  id: number
  scheduled_at: Date
  duration_minutes: number
  price: number
  status: SlotStatus
}
