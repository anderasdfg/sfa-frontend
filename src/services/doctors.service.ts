import type { Doctor, DoctorResponse } from '@/types/doctor.types'
import apiClient from '@/shared/lib/axios.config'
const API_BASE = import.meta.env.VITE_API_BASE_URL

export class DoctorService {
  private static readonly BASE_PATH = '/doctors'

  /**
   * Obtiene todos los médicos
   */
  static async getDoctors(): Promise<Doctor[]> {
    try {
      const response = await apiClient.get<DoctorResponse>(`${this.BASE_PATH}`)

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

  static async getDoctorById(id: string): Promise<Doctor> {
    try {
      const response = await apiClient.get<{success: boolean, data: Doctor}>(`${this.BASE_PATH}/${id}`)
      
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.warn('Unexpected API response structure for doctor detail:', response.data)
        throw new Error('Estructura de respuesta inesperada')
      }
    } catch (error) {
      console.error('Error fetching doctor by ID:', error)
      throw new Error('No se pudo cargar el médico')
    }
  }

  static async updateDoctor(id: string, doctor: Doctor): Promise<Doctor> {
    try {
      const response = await apiClient.put<{success: boolean, data: Doctor}>(`${this.BASE_PATH}/${id}`, doctor)
      
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.warn('Unexpected API response structure for doctor update:', response.data)
        throw new Error('Estructura de respuesta inesperada')
      }
    } catch (error) {
      console.error('Error updating doctor:', error)
      throw new Error('No se pudo actualizar el médico')
    }
  }
}
