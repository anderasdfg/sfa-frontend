/**
 * Composable para manejar callbacks de pago de MercadoPago
 */

import { ref, readonly, computed } from 'vue'
import { useRoute } from 'vue-router'
import { AppointmentService } from '@/services/appointments.service'
import { TestOrderService } from '@/services/testOrder.service'
import { 
  extractPaymentParams, 
  adaptToPaymentSummary, 
  getPaymentStatus,
  getPaymentStatusMessage,
  validateAppointmentId,
  isTestOrderPayment,
  extractTestOrderId
} from '../adapters/payment-callback.adapter'
import type { Appointment } from '@/types/appointments.types'
import type { TestOrder } from '@/types/testOrder.types'
import type { PaymentSummary, PaymentStatus } from '@/types/payment-callback.types'

export const usePaymentCallback = () => {
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appointment = ref<Appointment | null>(null)
  const testOrder = ref<TestOrder | null>(null)
  const paymentSummary = ref<PaymentSummary | null>(null)
  const paymentStatus = ref<PaymentStatus>('pending')
  const isTestOrder = ref(false)

  // Computed properties
  const statusMessage = computed(() => getPaymentStatusMessage(paymentStatus.value))
  
  const isSuccess = computed(() => paymentStatus.value === 'success')
  const isPending = computed(() => paymentStatus.value === 'pending')
  const isFailure = computed(() => paymentStatus.value === 'failure')

  /**
   * Procesa los query parameters de la URL y carga los datos
   */
  const processPaymentCallback = async (queryParams: Record<string, string>) => {
    loading.value = true
    error.value = null

    try {
      // 1. Detectar si es una orden de examen
      isTestOrder.value = isTestOrderPayment(queryParams)

      // 2. Extraer y validar parámetros
      const params = extractPaymentParams(queryParams)
      if (!params) {
        throw new Error('Parámetros de pago inválidos')
      }

      // 3. Validar appointment_id
      const appointmentId = validateAppointmentId(params.appointment_id)
      if (!appointmentId) {
        throw new Error('ID de cita inválido')
      }

      // 4. Determinar estado del pago
      paymentStatus.value = getPaymentStatus(params)

      // 5. Crear resumen de pago
      paymentSummary.value = adaptToPaymentSummary(params)

      // 6. Cargar datos según el tipo
      if (isTestOrder.value) {
        const testOrderId = extractTestOrderId(queryParams)
        if (testOrderId) {
          await loadTestOrderData(testOrderId)
        }
      }
      
      // Siempre cargar datos de la cita
      await loadAppointmentData(appointmentId)

      return true
    } catch (err: any) {
      console.error('Error processing payment callback:', err)
      error.value = err.message || 'Error al procesar el resultado del pago'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Carga los datos de la cita desde el API
   */
  const loadAppointmentData = async (appointmentId: number) => {
    try {
      const appointmentData = await AppointmentService.getAppointmentById(appointmentId)
      appointment.value = appointmentData
    } catch (err: any) {
      console.error('Error loading appointment data:', err)
      // No lanzamos error aquí para no interrumpir el flujo
      // El usuario puede ver el resumen de pago aunque no se cargue la cita
    }
  }

  /**
   * Carga los datos de la orden de examen desde el API
   */
  const loadTestOrderData = async (testOrderId: number) => {
    try {
      const testOrderData = await TestOrderService.getTestOrderById(testOrderId)
      testOrder.value = testOrderData
    } catch (err: any) {
      console.error('Error loading test order data:', err)
      // No lanzamos error aquí para no interrumpir el flujo
    }
  }

  /**
   * Procesa automáticamente los query parameters de la ruta actual
   */
  const processCurrentRoute = async () => {
    const route = useRoute()
    const queryParams = route.query as Record<string, string>
    return await processPaymentCallback(queryParams)
  }

  /**
   * Limpia el estado del composable
   */
  const clearState = () => {
    error.value = null
    appointment.value = null
    testOrder.value = null
    paymentSummary.value = null
    paymentStatus.value = 'pending'
    isTestOrder.value = false
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
    appointment: readonly(appointment),
    testOrder: readonly(testOrder),
    paymentSummary: readonly(paymentSummary),
    paymentStatus: readonly(paymentStatus),
    isTestOrder: readonly(isTestOrder),

    // Computed properties
    statusMessage,
    isSuccess,
    isPending,
    isFailure,

    // Métodos
    processPaymentCallback,
    processCurrentRoute,
    clearState,
    clearError
  }
}
