export interface TestOrder {
  id: number
  consultation_id: number
  diagnostic_test_id: number
  diagnostic_test_name: string
  diagnostic_test_cpt_code: string
  diagnostic_test_description: string
  diagnostic_test_patient_instructions: string
  status: string
  slot_id?: number
  created_at: string
  updated_at: string
  patient_id?: number
  patient_first_name?: string
  patient_last_name?: string
  specialty_name?: string
  service_id?: number
  // Información del doctor
  doctor_id?: number
  doctor_first_name?: string
  doctor_last_name?: string
  // Información del slot asociado
  slot_scheduled_at?: string
  slot_duration_minutes?: number
  slot_price?: string | number
  slot_status?: string
}
