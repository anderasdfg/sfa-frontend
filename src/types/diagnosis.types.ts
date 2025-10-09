export interface Diagnosis {
  id: number
  consultation_id: number
  cie10_code: string
  description: string
  diagnosis_type: 'presuntivo' | 'definitivo'
}
