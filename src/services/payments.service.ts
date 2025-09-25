import axios from 'axios'
import type { PaymentCreateRequest, PaymentResponse } from '@/types/payments.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class PaymentService {
  private static readonly BASE_PATH = '/payments'

  /** Crea un pago */
  static async createPayment(payment: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/preference`
      const response = await axios.post(url, payment)
      return response.data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw new Error('No se pudo crear el pago')
    }
  }
}
