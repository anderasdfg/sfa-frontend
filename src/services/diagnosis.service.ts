import apiClient from '@/shared/lib/axios.config'
import type { Diagnosis } from '@/types/diagnosis.types'

interface DiagnosisResponse {
  success: boolean
  data: Diagnosis | Diagnosis[]
  message?: string
}

interface DiagnosisQueryParams {
  consultation_id?: number
  diagnosis_type?: 'presuntivo' | 'definitivo'
}

interface CreateDiagnosisRequest {
  consultation_id: number
  cie10_code: string
  description: string
  diagnosis_type: 'presuntivo' | 'definitivo'
}

interface UpdateDiagnosisRequest {
  cie10_code?: string
  description?: string
  diagnosis_type?: 'presuntivo' | 'definitivo'
}

export class DiagnosisService {
  private static readonly BASE_PATH = '/diagnosis'

  /**
   * Obtiene todos los diagnósticos con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de diagnósticos
   */
  static async getDiagnoses(params?: DiagnosisQueryParams): Promise<Diagnosis[]> {
    try {
      const response = await apiClient.get<DiagnosisResponse>(this.BASE_PATH, { params })

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnoses:', error)
      throw new Error('No se pudieron cargar los diagnósticos')
    }
  }

  /**
   * Obtiene los diagnósticos de una consulta específica
   * @param consultationId - ID de la consulta
   * @returns Lista de diagnósticos de la consulta
   */
  static async getDiagnosesByConsultation(consultationId: number): Promise<Diagnosis[]> {
    try {
      const response = await apiClient.get<DiagnosisResponse>(
        `${this.BASE_PATH}/consultation/${consultationId}`
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnoses by consultation:', error)
      throw new Error('No se pudieron cargar los diagnósticos de la consulta')
    }
  }

  /**
   * Obtiene un diagnóstico por su ID
   * @param id - ID del diagnóstico
   * @returns Diagnóstico encontrado
   */
  static async getDiagnosisById(id: number): Promise<Diagnosis> {
    try {
      const response = await apiClient.get<DiagnosisResponse>(`${this.BASE_PATH}/${id}`)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnosis:', error)
      throw new Error('No se pudo cargar el diagnóstico')
    }
  }

  /**
   * Crea un nuevo diagnóstico
   * @param diagnosis - Datos del diagnóstico a crear
   * @returns Diagnóstico creado
   */
  static async createDiagnosis(diagnosis: CreateDiagnosisRequest): Promise<Diagnosis> {
    try {
      const response = await apiClient.post<DiagnosisResponse>(this.BASE_PATH, diagnosis)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error creating diagnosis:', error)
      throw new Error('No se pudo crear el diagnóstico')
    }
  }

  /**
   * Actualiza un diagnóstico existente
   * @param id - ID del diagnóstico
   * @param diagnosis - Datos a actualizar
   * @returns Diagnóstico actualizado
   */
  static async updateDiagnosis(
    id: number,
    diagnosis: UpdateDiagnosisRequest
  ): Promise<Diagnosis> {
    try {
      const response = await apiClient.put<DiagnosisResponse>(`${this.BASE_PATH}/${id}`, diagnosis)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error updating diagnosis:', error)
      throw new Error('No se pudo actualizar el diagnóstico')
    }
  }

  /**
   * Elimina un diagnóstico
   * @param id - ID del diagnóstico a eliminar
   */
  static async deleteDiagnosis(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<DiagnosisResponse>(`${this.BASE_PATH}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error deleting diagnosis:', error)
      throw new Error('No se pudo eliminar el diagnóstico')
    }
  }
}

export type {
  DiagnosisQueryParams,
  CreateDiagnosisRequest,
  UpdateDiagnosisRequest,
  DiagnosisResponse
}
