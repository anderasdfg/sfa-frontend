import apiClient from '@/shared/lib/axios.config'
import type { TestResultResponse, TestResult } from '@/types/testResult.types'

export class TestResultService {
  private static readonly BASE_PATH = '/test-results'

  /**
   * Obtiene los resultados de un test order específico
   * @param testOrderId - ID del test order
   * @returns Resultados del test order (tomamos el primero)
   */
  static async getTestResults(testOrderId: number): Promise<TestResult | null> {
    try {
      const response = await apiClient.get<TestResultResponse>(
        `${this.BASE_PATH}?test_order_id=${testOrderId}`
      )

      if (response.data.success && response.data.data.length > 0) {
        // Tomar el primer resultado (como indicaste)
        return response.data.data[0]
      }

      return null
    } catch (error: any) {
      console.error('Error getting test results:', error)
      throw new Error(error.response?.data?.message || 'No se pudieron obtener los resultados')
    }
  }

  /**
   * Verifica si un test order tiene resultados disponibles
   * @param testOrderId - ID del test order
   * @returns true si tiene resultados, false si no
   */
  static async hasResults(testOrderId: number): Promise<boolean> {
    try {
      const result = await this.getTestResults(testOrderId)
      return result !== null
    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene la URL de descarga directa del archivo
   * @param testResult - Resultado del test
   * @returns URL de descarga del archivo
   */
  static getDownloadUrl(testResult: TestResult): string {
    return testResult.file_url
  }

  /**
   * Formatea la fecha de subida del resultado
   * @param uploadedAt - Fecha ISO de subida
   * @returns Fecha formateada
   */
  static formatUploadDate(uploadedAt: string): string {
    const date = new Date(uploadedAt)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}