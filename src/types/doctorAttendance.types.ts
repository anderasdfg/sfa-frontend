import type { Doctor } from './doctor.types'
import { DoctorAttendanceStatus } from './enums'

export interface DoctorAttendance {
  id: number
  doctor_id: number
  date: string
  check_in_time: string
  check_out_time?: string
  status: DoctorAttendanceStatus
  notes?: string
  created_at: string
  updated_at: string
  doctor?: Doctor
}

export interface DoctorAttendanceCheckInRequest {
  doctor_id: number
  date: string
  check_in_time: string
  notes?: string
}

export interface DoctorAttendanceCheckOutRequest {
  attendance_id: number
  check_out_time: string
  notes?: string
}

export interface DoctorAttendanceQueryParams {
  doctor_id?: number
  date_from?: string
  date_to?: string
  status?: DoctorAttendanceStatus
}

export interface DoctorAttendanceStatistics {
  presente: number
  ausente: number
  tardanza: number
  permiso: number
  vacaciones: number
  total: number
  attendance_rate: number
}

export interface DoctorAttendanceResponse {
  success: boolean
  data: DoctorAttendance | DoctorAttendance[] | DoctorAttendanceStatistics
  message?: string
}
