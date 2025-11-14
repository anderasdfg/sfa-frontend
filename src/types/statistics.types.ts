export interface DailyInfo {
  daily_revenue: number
  total_appointments_today: number
  completed_appointments: number
  pending_appointments: number
}

export interface Summary {
  total_users: number
  total_doctors: number
  total_patients: number
  future_appointments_scheduled_today: number
}

export interface DashboardStatistics {
  daily_info: DailyInfo
  summary: Summary
}

export interface WaitingPatient {
  id: number
  patient_name: string
  doctor_name: string
  specialty: string
  arrival_time: string
  wait_time_minutes: number
  queue_position: number
}

export interface UpcomingAppointment {
  id: number
  time: string
  patient_name: string
  doctor_name: string
  specialty: string
  status: string
  modality: string
}

export interface AvailableDoctor {
  id: number
  name: string
  specialty: string
  status: string
  patients_in_queue: number
}

export interface DayStatistics {
  patients_attended: number
  absences: number
  occupied_rooms: number
}

export interface HourlyAppointments {
  hour: string
  completed: number
  in_consultation: number
  scheduled: number
}

export interface MedicalAvailability {
  available: number
  in_consultation: number
  busy: number
}

export interface AdminDashboard {
  current_datetime: string
  waiting_patients_count: number
  average_wait_time: number
  available_doctors: string
  daily_revenue: number
  waiting_room: WaitingPatient[]
  upcoming_appointments: UpcomingAppointment[]
  medical_availability: MedicalAvailability
  available_doctors_now: AvailableDoctor[]
  day_statistics: DayStatistics
  hourly_appointments: HourlyAppointments[]
}
