/**
 * Adapter para transformar query parameters de MercadoPago
 */

import type { PaymentCallbackParams, PaymentSummary, PaymentStatus } from '@/types/payment-callback.types'

/**
 * Extrae y valida los query parameters de MercadoPago
 */
export const extractPaymentParams = (queryParams: Record<string, string>): PaymentCallbackParams | null => {
  try {
    // Validar que existan los parámetros mínimos requeridos
    const requiredParams = ['appointment_id', 'payment_id', 'status']
    const missingParams = requiredParams.filter(param => !queryParams[param])
    
    if (missingParams.length > 0) {
      console.error('Missing required payment parameters:', missingParams)
      return null
    }

    return {
      appointment_id: queryParams.appointment_id,
      collection_id: queryParams.collection_id || '',
      collection_status: queryParams.collection_status as PaymentCallbackParams['collection_status'] || 'pending',
      payment_id: queryParams.payment_id,
      status: queryParams.status as PaymentCallbackParams['status'],
      external_reference: queryParams.external_reference || '',
      payment_type: queryParams.payment_type || '',
      merchant_order_id: queryParams.merchant_order_id || '',
      preference_id: queryParams.preference_id || '',
      site_id: queryParams.site_id || '',
      processing_mode: queryParams.processing_mode || '',
      merchant_account_id: queryParams.merchant_account_id || null
    }
  } catch (error) {
    console.error('Error extracting payment parameters:', error)
    return null
  }
}

/**
 * Convierte PaymentCallbackParams a PaymentSummary para la UI
 */
export const adaptToPaymentSummary = (params: PaymentCallbackParams): PaymentSummary => {
  return {
    appointmentId: parseInt(params.appointment_id, 10),
    paymentId: params.payment_id,
    collectionId: params.collection_id,
    status: params.status,
    paymentType: params.payment_type,
    merchantOrderId: params.merchant_order_id,
    externalReference: params.external_reference
  }
}

/**
 * Determina el estado del pago basado en los parámetros
 */
export const getPaymentStatus = (params: PaymentCallbackParams): PaymentStatus => {
  switch (params.status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'pending'
    case 'rejected':
    case 'cancelled':
      return 'failure'
    default:
      return 'failure'
  }
}

/**
 * Genera mensaje descriptivo basado en el estado del pago
 */
export const getPaymentStatusMessage = (status: PaymentStatus): { title: string; message: string } => {
  switch (status) {
    case 'success':
      return {
        title: '¡Pago Exitoso!',
        message: 'Tu pago ha sido procesado correctamente. Tu cita médica está confirmada.'
      }
    case 'pending':
      return {
        title: 'Pago Pendiente',
        message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'
      }
    case 'failure':
      return {
        title: 'Pago Rechazado',
        message: 'No se pudo procesar tu pago. Por favor, intenta nuevamente.'
      }
  }
}

/**
 * Valida que el appointment_id sea un número válido
 */
export const validateAppointmentId = (appointmentId: string): number | null => {
  const id = parseInt(appointmentId, 10)
  return isNaN(id) || id <= 0 ? null : id
}
