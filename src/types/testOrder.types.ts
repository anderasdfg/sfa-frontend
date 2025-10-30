export interface TestOrder {
  id: number
  consultation_id: number
  diagnostic_test_id: number
  diagnostic_test_name: string
  diagnostic_test_cpt_code: string
  diagnostic_test_description: string
  diagnostic_test_patient_instructions: string
  status: string
  payment_id: number
  created_at: string
  updated_at: string
  doctor_first_name?: string
  doctor_last_name?: string
  specialty_name?: string
  service_id?: number
}
