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
