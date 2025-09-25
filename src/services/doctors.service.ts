import axios from 'axios'
import type { Doctor, DoctorResponse } from '@/types/doctor.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class DoctorService {
  private static readonly BASE_PATH = '/doctors'

  /**
   * Obtiene todos los médicos
   */
  static async getDoctors(): Promise<Doctor[]> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.get<DoctorResponse>(url)

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      } else if (Array.isArray(response.data)) {
        return response.data as Doctor[]
      } else {
        console.warn('Unexpected API response structure:', response.data)
        return []
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      throw new Error('No se pudieron cargar los médicos')
    }
  }
}
