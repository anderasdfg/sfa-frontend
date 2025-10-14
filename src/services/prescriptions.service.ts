import apiClient from '@/shared/lib/axios.config'
import type { Prescription } from '@/types/prescriptions.types'

interface PrescriptionResponse {
  success: boolean
  data: Prescription | Prescription[]
  message?: string
}

interface PrescriptionQueryParams {
  consultation_id?: number
}

interface CreatePrescriptionRequest {
  consultation_id: number
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface UpdatePrescriptionRequest {
  medication?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
}

export class PrescriptionService {
  private static readonly BASE_PATH = '/prescriptions'

  /**
   * Obtiene todas las prescripciones con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de prescripciones
   */
  static async getPrescriptions(params?: PrescriptionQueryParams): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<PrescriptionResponse>(this.BASE_PATH, { params })

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      throw new Error('No se pudieron cargar las prescripciones')
    }
  }

  /**
   * Obtiene las prescripciones de una consulta específica
   * @param consultationId - ID de la consulta
   * @returns Lista de prescripciones de la consulta
   */
  static async getPrescriptionsByConsultation(consultationId: number): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<PrescriptionResponse>(
        `${this.BASE_PATH}?consultation_id=${consultationId}`
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching prescriptions by consultation:', error)
      throw new Error('No se pudieron cargar las prescripciones de la consulta')
    }
  }

  /**
   * Obtiene una prescripción por su ID
   * @param id - ID de la prescripción
   * @returns Prescripción encontrada
   */
  static async getPrescriptionById(id: number): Promise<Prescription> {
    try {
      const response = await apiClient.get<PrescriptionResponse>(`${this.BASE_PATH}/${id}`)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching prescription:', error)
      throw new Error('No se pudo cargar la prescripción')
    }
  }

  /**
   * Crea una nueva prescripción
   * @param prescription - Datos de la prescripción a crear
   * @returns Prescripción creada
   */
  static async createPrescription(prescription: CreatePrescriptionRequest): Promise<Prescription> {
    try {
      const response = await apiClient.post<PrescriptionResponse>(this.BASE_PATH, prescription)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error creating prescription:', error)
      throw new Error('No se pudo crear la prescripción')
    }
  }

  /**
   * Actualiza una prescripción existente
   * @param id - ID de la prescripción
   * @param prescription - Datos a actualizar
   * @returns Prescripción actualizada
   */
  static async updatePrescription(id: number, prescription: UpdatePrescriptionRequest): Promise<Prescription> {
    try {
      const response = await apiClient.put<PrescriptionResponse>(`${this.BASE_PATH}/${id}`, prescription)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error updating prescription:', error)
      throw new Error('No se pudo actualizar la prescripción')
    }
  }

  /**
   * Elimina una prescripción
   * @param id - ID de la prescripción a eliminar
   */
  static async deletePrescription(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<PrescriptionResponse>(`${this.BASE_PATH}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error deleting prescription:', error)
      throw new Error('No se pudo eliminar la prescripción')
    }
  }
}

export type {
  PrescriptionQueryParams,
  CreatePrescriptionRequest,
  UpdatePrescriptionRequest,
  PrescriptionResponse
}