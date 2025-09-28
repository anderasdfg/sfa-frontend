export interface UserCreate {
  username: string
  first_name: string
  last_name: string
  gender?: 'masculino' | 'femenino'
  document_type: string
  document_number: string
  phone?: string
  photo?: string
  birth_date?: string
  password: string
  role: 'admin' | 'doctor' | 'paciente'
  status: 'activo' | 'inactivo'
  specialty_id?: number
  license_number?: string
  medical_record_number?: string
  insurance_id?: number
}

export interface User {
  username: string
  first_name: string
  last_name: string
  gender: string
  document_type: string
  document_number: string
  phone: string
  photo: string
  birth_date: Date
  id: number
  created_at: Date
  status: 'activo' | 'inactivo'
  patient_id?: number
  doctor_id?: number
  admin_id?: number
}
