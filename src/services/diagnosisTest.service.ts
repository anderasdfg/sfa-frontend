import apiClient from '@/shared/lib/axios.config'
import type { DiagnosisTest } from '@/types/diagnosisTest.types'

interface DiagnosisTestResponse {
  success: boolean
  data: DiagnosisTest | DiagnosisTest[]
  message?: string
}

interface DiagnosisTestQueryParams {
  consultation_id?: number
}

interface CreateDiagnosisTestRequest {
  consultation_id: number
  test_type: string
  description: string
  result?: string
  test_date?: string
}

interface UpdateDiagnosisTestRequest {
  test_type?: string
  description?: string
  result?: string
  test_date?: string
}

export class DiagnosisTestService {
  private static readonly BASE_PATH = '/diagnostic-tests'

  /**
   * Obtiene todos los exámenes diagnósticos con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de exámenes diagnósticos
   */
  static async getDiagnosisTests(params?: DiagnosisTestQueryParams): Promise<DiagnosisTest[]> {
    try {
      const response = await apiClient.get<DiagnosisTestResponse>(this.BASE_PATH, { params })

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnosis tests:', error)
      throw new Error('No se pudieron cargar los exámenes diagnósticos')
    }
  }

  /**
   * Obtiene los exámenes diagnósticos de una consulta específica
   * @param consultationId - ID de la consulta
   * @returns Lista de exámenes diagnósticos de la consulta
   */
  static async getDiagnosisTestsByConsultation(consultationId: number): Promise<DiagnosisTest[]> {
    try {
      const response = await apiClient.get<DiagnosisTestResponse>(
        `${this.BASE_PATH}?consultation_id=${consultationId}`
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnosis tests by consultation:', error)
      throw new Error('No se pudieron cargar los exámenes diagnósticos de la consulta')
    }
  }

  /**
   * Obtiene un examen diagnóstico por su ID
   * @param id - ID del examen diagnóstico
   * @returns Examen diagnóstico encontrado
   */
  static async getDiagnosisTestById(id: number): Promise<DiagnosisTest> {
    try {
      const response = await apiClient.get<DiagnosisTestResponse>(`${this.BASE_PATH}/${id}`)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching diagnosis test:', error)
      throw new Error('No se pudo cargar el examen diagnóstico')
    }
  }

  /**
   * Crea un nuevo examen diagnóstico
   * @param diagnosisTest - Datos del examen diagnóstico a crear
   * @returns Examen diagnóstico creado
   */
  static async createDiagnosisTest(diagnosisTest: CreateDiagnosisTestRequest): Promise<DiagnosisTest> {
    try {
      const response = await apiClient.post<DiagnosisTestResponse>(this.BASE_PATH, diagnosisTest)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error creating diagnosis test:', error)
      throw new Error('No se pudo crear el examen diagnóstico')
    }
  }

  /**
   * Actualiza un examen diagnóstico existente
   * @param id - ID del examen diagnóstico
   * @param diagnosisTest - Datos a actualizar
   * @returns Examen diagnóstico actualizado
   */
  static async updateDiagnosisTest(id: number, diagnosisTest: UpdateDiagnosisTestRequest): Promise<DiagnosisTest> {
    try {
      const response = await apiClient.put<DiagnosisTestResponse>(`${this.BASE_PATH}/${id}`, diagnosisTest)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error updating diagnosis test:', error)
      throw new Error('No se pudo actualizar el examen diagnóstico')
    }
  }

  /**
   * Elimina un examen diagnóstico
   * @param id - ID del examen diagnóstico a eliminar
   */
  static async deleteDiagnosisTest(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<DiagnosisTestResponse>(`${this.BASE_PATH}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error deleting diagnosis test:', error)
      throw new Error('No se pudo eliminar el examen diagnóstico')
    }
  }
}

export type {
  DiagnosisTestQueryParams,
  CreateDiagnosisTestRequest,
  UpdateDiagnosisTestRequest,
  DiagnosisTestResponse
}