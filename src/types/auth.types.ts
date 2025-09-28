import type { User } from './user.types'

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
