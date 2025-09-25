import { SpecialtyStatus } from './enums'

export interface Specialty {
  id: number
  name: string
  code: string
  description: string
  image_url: string
  status: SpecialtyStatus
}

export interface SpecialtyResponse {
  specialties: Specialty[]
}
