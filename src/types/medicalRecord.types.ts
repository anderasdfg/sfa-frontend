export interface MedicalRecordPatient {
  id: number
  full_name: string
  document_number: string
  document_type: string
  gender: string
  birth_date: string
  phone: string
  email: string
}

export interface MedicalRecordDoctor {
  id: number
  full_name: string
  specialty: string
  license_number: string
}

export interface MedicalRecordDiagnosis {
  id: number
  cie10_code: string
  description: string
  diagnosis_type: 'presuntivo' | 'definitivo'
}

export interface MedicalRecordPrescription {
  id: number
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface MedicalRecordDiagnosticTest {
  id: number
  test_type: string
  description: string
  result: string | null
  test_date: string | null
}

export interface MedicalRecordConsultation {
  id: number
  consultation_date: string
  chief_complaint: string
  current_illness_history: string | null
  treatment_plan: string
  doctor: MedicalRecordDoctor
  diagnoses: MedicalRecordDiagnosis[]
  prescriptions: MedicalRecordPrescription[]
  diagnostic_tests: MedicalRecordDiagnosticTest[]
}

export interface MedicalRecord {
  id: number
  record_number: string
  created_at: string
  general_notes: string
  patient: MedicalRecordPatient
  consultations: MedicalRecordConsultation[]
}

export interface MedicalRecordResponse {
  success: boolean
  data: MedicalRecord
  message: string
}
