export interface Doctor {
  id: number
  user_id: number
  specialty_id: number
  license_number: string
  specialty_name: string
  first_name: string
  last_name: string
  gender: string
  photo: string
}

export interface DoctorResponse {
  success: boolean
  data: Doctor[]
}
