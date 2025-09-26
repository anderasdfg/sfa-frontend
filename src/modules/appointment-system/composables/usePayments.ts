import { ref, readonly } from 'vue'
import { PaymentService } from '@/services/payments.service'
import { 
  adaptPaymentToCreateRequest, 
  validatePaymentRequest,
  createPaymentRequestFromAppointment
} from '../adapters/payment.adapter'
import type { PaymentResponse } from '@/types/payments.types'
import type { Appointment } from '@/types/appointments.types'

export const usePayments = () => {
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const paymentResponse = ref<PaymentResponse | null>(null)

  const createPayment = async (appointment: Appointment): Promise<{ success: boolean; initPoint?: string }> => {
    loading.value = true
    error.value = null

    try {
      console.log('💳 Creating payment for appointment:', appointment)
      
      // 1. Crear PaymentRequest desde el appointment
      const paymentRequest = createPaymentRequestFromAppointment(appointment)
      console.log('📝 Payment request created:', paymentRequest)

      // 2. Validar datos del payment request con Zod
      const validation = validatePaymentRequest(paymentRequest)
      if (!validation.isValid) {
        error.value = `Datos de pago inválidos:\n${validation.errors.map(err => `- ${err}`).join('\n')}`
        return { success: false }
      }

      // 3. Convertir a formato del API
      const createRequest = adaptPaymentToCreateRequest(paymentRequest)

      // 4. Llamar al servicio
      const response = await PaymentService.createPayment(createRequest)

      // 5. Guardar resultado
      paymentResponse.value = response

      if (response.success && response.data?.init_point) {
        return { 
          success: true, 
          initPoint: response.data.init_point 
        }
      } else {
        error.value = response.message || 'Error al crear el pago'
        return { success: false }
      }

    } catch (err: any) {
      // Manejo de errores específicos
      if (err.response?.status === 400) {
        error.value = 'Datos de pago inválidos'
      } else if (err.response?.status === 404) {
        error.value = 'Cita no encontrada'
      } else if (err.response?.status === 409) {
        error.value = 'La cita ya tiene un pago asociado'
      } else {
        error.value = err.message || 'Error al procesar el pago'
      }
      
      console.error('Error creating payment:', err)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  /**
   * Redirige al usuario a MercadoPago para completar el pago
   */
  const redirectToPayment = (initPoint: string) => {
    // Redirigir en la misma pestaña
    window.location.href = initPoint
  }

  /**
   * Crea el pago y redirige automáticamente
   */
  const createAndRedirectToPayment = async (appointment: Appointment): Promise<boolean> => {
    const result = await createPayment(appointment)
    
    if (result.success && result.initPoint) {
      redirectToPayment(result.initPoint)
      return true
    }
    
    return false
  }

  /**
   * Limpia el estado del composable
   */
  const clearState = () => {
    error.value = null
    paymentResponse.value = null
  }

  /**
   * Resetea solo el error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado (readonly para evitar mutaciones directas)
    loading: readonly(loading),
    error: readonly(error),
    paymentResponse: readonly(paymentResponse),

    // Métodos
    createPayment,
    redirectToPayment,
    createAndRedirectToPayment,
    clearState,
    clearError
  }
}
