export interface ScheduledAppointment {
  id: number
  patient_name: string
  doctor_name: string
  specialty: string
  appointment_time: string
  appointment_type: string
  has_arrived: boolean
  payment_status: string
}

export interface WaitingPatient {
  id: number
  queue_id: number
  patient_name: string
  doctor_name: string
  specialty: string
  appointment_time: string
  arrived_at: string
  waiting_minutes: number
  queue_position: number
  is_urgent: boolean
  payment_pending: boolean
  being_called: boolean
  consultation_room: string
}

export interface InConsultationPatient {
  id: number
  queue_id: number
  patient_name: string
  doctor_name: string
  specialty: string
  consultation_room: string
  started_at: string
  consultation_minutes: number
}

export interface CompletedPatient {
  id: number
  queue_id: number
  turn_number: string
  patient_name: string
  doctor_name: string
  specialty: string
  appointment_time: string
  completed_at: string
  total_time_minutes: number
  consultation_room: string
}

export interface QueueMetrics {
  scheduled_count: number
  waiting_count: number
  in_consultation_count: number
  completed_today_count: number
}

export interface QueueOverview {
  scheduled_appointments: ScheduledAppointment[]
  waiting_patients: WaitingPatient[]
  in_consultation: InConsultationPatient[]
  completed_patients: CompletedPatient[]
  metrics: QueueMetrics
}

export interface QueueFilters {
  date?: string
  doctor_id?: number
  specialty_id?: number
}

export interface DoctorQueueData {
  doctor_name: string
  specialty: string
  scheduled_appointments: ScheduledAppointment[]
  waiting_patients: WaitingPatient[]
  in_consultation: InConsultationPatient[]
  completed_patients: CompletedPatient[]
}
