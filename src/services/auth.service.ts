import axios from 'axios'
import type { LoginCredentials, AuthResponse, UserProfileResponse } from '@/types/auth.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE}/auth/login`, credentials)
    return response.data
  }

  async getUserProfile(token: string): Promise<UserProfileResponse> {
    const response = await axios.get(`${API_BASE}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  }

  /*   async logout(): Promise<void> {
    await axios.post(`${API_BASE}/auth/logout`)
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await axios.post(`${API_BASE}/auth/refresh`, {
      refreshToken,
    })
    return response.data
  }

  async forgotPassword(email: string): Promise<void> {
    await axios.post(`${API_BASE}/auth/forgot-password`, { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await axios.post(`${API_BASE}/auth/reset-password`, {
      token,
      password: newPassword,
    })
  } */
}

export const authService = new AuthService()
