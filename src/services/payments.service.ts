import apiClient from '@/shared/lib/axios.config'
import type { PaymentCreateRequest, PaymentResponse } from '@/types/payments.types'

export class PaymentService {
  private static readonly BASE_PATH = '/payments'

  /** Crea un pago */
  static async createPayment(payment: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/preference`, payment)
      return response.data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new Error('No se pudo crear el pago')
    }
  }
}
