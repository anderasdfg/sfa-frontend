import apiClient from '@/shared/lib/axios.config'
import type { TestOrder } from '@/types/testOrder.types'

interface TestOrderResponse {
  success: boolean
  data: TestOrder | TestOrder[]
  message?: string
}

interface TestOrderQueryParams {
  consultation_id?: number
  patient_id?: number
}

interface CreateTestOrderRequest {
  consultation_id: number
  diagnostic_test_id?: number
  diagnostic_test_name: string
  diagnostic_test_cpt_code?: string
  diagnostic_test_description?: string
  diagnostic_test_patient_instructions?: string
  status: string
  payment_id?: number
  created_at?: string
  updated_at?: string
}

interface UpdateTestOrderRequest {
  diagnostic_test_id?: number
  diagnostic_test_name: string
  diagnostic_test_cpt_code?: string
  diagnostic_test_description?: string
  diagnostic_test_patient_instructions?: string
  status: string
  payment_id?: number
  updated_at?: string
}

export class TestOrderService {
  private static readonly BASE_PATH = '/test-orders'

  /**
   * Obtiene todas las órdenes de exámenes con filtros opcionales
   * @param params - Parámetros de filtrado
   * @returns Lista de órdenes de exámenes
   */
  static async getTestOrders(params?: TestOrderQueryParams): Promise<TestOrder[]> {
    try {
      const response = await apiClient.get<TestOrderResponse>(this.BASE_PATH, { params })

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching test orders:', error)
      throw new Error('No se pudieron cargar las órdenes de exámenes')
    }
  }

  /**
   * Obtiene las órdenes de exámenes de una consulta específica
   * @param consultationId - ID de la consulta
   * @returns Lista de órdenes de exámenes de la consulta
   */
  static async getTestOrdersByConsultation(consultationId: number): Promise<TestOrder[]> {
    try {
      const response = await apiClient.get<TestOrderResponse>(
        `${this.BASE_PATH}?consultation_id=${consultationId}`
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching test orders by consultation:', error)
      throw new Error('No se pudieron cargar las órdenes de exámenes de la consulta')
    }
  }

  /**
   * Obtiene una orden de examen por su ID
   * @param id - ID de la orden de examen
   * @returns Orden de examen encontrada
   */
  static async getTestOrderById(id: number): Promise<TestOrder> {
    try {
      const response = await apiClient.get<TestOrderResponse>(`${this.BASE_PATH}/${id}`)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error fetching test order:', error)
      throw new Error('No se pudo cargar la orden de examen')
    }
  }

  /**
   * Obtiene la fecha y hora actual en zona horaria de Lima (UTC-5)
   * @returns String en formato ISO compatible con el backend
   */
  private static getCurrentLimaTime(): string {
    const now = new Date()
    // Convertir a hora de Lima (UTC-5)
    const limaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }))
    
    // Formatear como YYYY-MM-DD HH:mm:ss
    const year = limaTime.getFullYear()
    const month = String(limaTime.getMonth() + 1).padStart(2, '0')
    const day = String(limaTime.getDate()).padStart(2, '0')
    const hours = String(limaTime.getHours()).padStart(2, '0')
    const minutes = String(limaTime.getMinutes()).padStart(2, '0')
    const seconds = String(limaTime.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  /**
   * Crea una nueva orden de examen
   * @param testOrder - Datos de la orden de examen a crear
   * @returns Orden de examen creada
   */
  static async createTestOrder(testOrder: CreateTestOrderRequest): Promise<TestOrder> {
    try {
      // Agregar timestamps automáticamente con hora de Lima
      const now = this.getCurrentLimaTime()
      const testOrderWithTimestamps = {
        ...testOrder,
        created_at: now,
        updated_at: now
      }

      const response = await apiClient.post<TestOrderResponse>(this.BASE_PATH, testOrderWithTimestamps)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error creating test order:', error)
      throw new Error('No se pudo crear la orden de examen')
    }
  }

  /**
   * Actualiza una orden de examen existente
   * @param id - ID de la orden de examen
   * @param testOrder - Datos a actualizar
   * @returns Orden de examen actualizada
   */
  static async updateTestOrder(id: number, testOrder: UpdateTestOrderRequest): Promise<TestOrder> {
    try {
      // Agregar updated_at automáticamente con hora de Lima
      const testOrderWithTimestamp = {
        ...testOrder,
        updated_at: this.getCurrentLimaTime()
      }

      const response = await apiClient.put<TestOrderResponse>(`${this.BASE_PATH}/${id}`, testOrderWithTimestamp)

      if (response.data.success && !Array.isArray(response.data.data)) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Error en la respuesta del API')
    } catch (error) {
      console.error('Error updating test order:', error)
      throw new Error('No se pudo actualizar la orden de examen')
    }
  }

  /**
   * Elimina una orden de examen
   * @param id - ID de la orden de examen a eliminar
   */
  static async deleteTestOrder(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<TestOrderResponse>(`${this.BASE_PATH}/${id}`)

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error deleting test order:', error)
      throw new Error('No se pudo eliminar la orden de examen')
    }
  }
}

export type {
  TestOrderQueryParams,
  CreateTestOrderRequest,
  UpdateTestOrderRequest,
  TestOrderResponse
}
