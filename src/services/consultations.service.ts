import apiClient from '@/shared/lib/axios.config'
import { isAxiosError } from 'axios'
import type { Consultation, ConsultationCreateRequest } from '@/types/medical.types'

export class ConsultationService {
  private static readonly BASE_PATH = '/consultations'

  /** Obtiene las consultas */
  static async getConsultations(params?: { appointment_id?: number }): Promise<Consultation[]> {
    try {
      const response = await apiClient.get(this.BASE_PATH, { params })
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching consultations:', error)
      throw new Error('No se pudieron cargar las consultas')
    }
  }

  /** Obtiene una consulta por id */
  static async getConsultationById(id: number): Promise<Consultation> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching consultation:', error)
      throw new Error('No se pudo cargar la consulta')
    }
  }

  /** Crea una consulta */
  static async createConsultation(consultation: ConsultationCreateRequest): Promise<Consultation> {
    try {
      const response = await apiClient.post(this.BASE_PATH, consultation)
      return response.data
    } catch (error) {
      console.error('Error creating consultation:', error)

      if (isAxiosError(error)) {
        const errorData = (error.response?.data ?? {}) as { message?: string; error?: string }
        const apiMessage = errorData.error || errorData.message
        if (apiMessage) {
          throw new Error(apiMessage)
        }
      }

      throw new Error('No se pudo crear la consulta')
    }
  }

  /** Actualiza una consulta */
  static async updateConsultation(
    id: number,
    consultation: ConsultationCreateRequest
  ): Promise<Consultation> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/${id}`, consultation)
      return response.data
    } catch (error) {
      console.error('Error updating consultation:', error)
      throw new Error('No se pudo actualizar la consulta')
    }
  }
}
