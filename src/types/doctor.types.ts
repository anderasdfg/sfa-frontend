export interface Doctor {
  id: number
  user_id?: number
  specialty_id?: number
  license_number?: string
  specialty_name: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  gender?: 'masculino' | 'femenino'
  photo?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
  services?: readonly Service[]
}

export interface Service {
  id: number
  name: string
}

export interface DoctorResponse {
  success: boolean
  data: Doctor[]
}
