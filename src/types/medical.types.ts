import type { Diagnosis } from './diagnosis.types'
import type { DiagnosisTest } from './diagnosisTest.types'
import type { Prescription } from './prescriptions.types'

export interface Patient {
  id: number
  user_id: number
  medical_record_number: string
  insurance_id: number
  first_name: string
  last_name: string
  gender: string
  photo: string
  email: string
  status: string
  phone: string
  document_number: string
  date_of_birth?: string
  created_at: string
  update_at: string
}

export interface ConsultationCreateRequest {
  medical_record_id?: number
  appointment_id: number
  chief_complaint?: string
  current_illnes_history?: string
  treatment_plan?: string
}

export interface Consultation {
  id: number
  medical_record_id: number
  appointment_id: number
  consultation_date: Date
  chief_complaint: string
  current_illnes_history: string
  treatment_plan: string
  diagnosis: Diagnosis[]
  diagnosis_tests: DiagnosisTest[]
  prescriptions: Prescription[]
}
