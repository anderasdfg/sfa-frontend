import type { Appointment } from './appointments.types'
import type { Patient } from './medical.types'
import type { Doctor } from './doctor.types'
import { PatientQueueStatus } from './enums'

export interface PatientQueue {
  id: number
  appointment_id: number
  doctor_id: number
  service_id?: number
  queue_position: number
  status: PatientQueueStatus
  estimated_wait_minutes: number
  called_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  appointment?: Appointment
  patient?: Patient
  doctor?: Doctor
}

export interface PatientQueueCreateRequest {
  appointment_id: number
  doctor_id: number
  service_id?: number
}

export interface PatientQueueQueryParams {
  doctor_id?: number
  service_id?: number
  status?: PatientQueueStatus
  date?: string
}

export interface PatientQueueStatistics {
  waiting: number
  in_consultation: number
  completed: number
  cancelled: number
  average_wait_minutes: number
}

export interface PatientQueueResponse {
  success: boolean
  data: PatientQueue | PatientQueue[] | PatientQueueStatistics
  message?: string
}
