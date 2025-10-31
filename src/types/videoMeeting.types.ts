import type { Appointment } from './appointments.types'
import { VideoMeetingStatus } from './enums'

export interface VideoMeeting {
  id: number
  appointment_id: number
  room_id: string
  meeting_url: string
  doctor_url: string
  patient_url: string
  status: VideoMeetingStatus
  started_at?: string
  ended_at?: string
  duration_minutes?: number
  created_at: string
  updated_at: string
  appointment?: Appointment
}

export interface VideoMeetingCreateRequest {
  appointment_id: number
}

export interface VideoMeetingJoinResponse {
  url: string
}

export interface VideoMeetingResponse {
  success: boolean
  data: VideoMeeting | VideoMeetingJoinResponse
  message?: string
}
