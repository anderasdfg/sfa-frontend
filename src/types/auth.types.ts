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

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  expires_in: number
  expires_at: Date
  token_type: string
}

export interface UserProfileResponse {
  success: boolean
  data: User
}
