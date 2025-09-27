/**
 * Adapter para transformar datos de payments entre formatos frontend y API
 */

import { z } from 'zod'
import type { PaymentCreateRequest } from '@/types/payments.types'
import type { Appointment } from '@/types/appointments.types'

/**
 * Schema de validación para PaymentRequest usando Zod
 */
export const PaymentRequestSchema = z.object({
  appointmentId: z.number().positive('ID de la cita debe ser mayor a 0'),
  successUrl: z.string().url('URL de éxito debe ser válida'),
  failureUrl: z.string().url('URL de fallo debe ser válida'),
  pendingUrl: z.string().url('URL de pendiente debe ser válida')
})

/**
 * Tipo inferido para PaymentRequest del frontend
 */
export type PaymentRequest = z.infer<typeof PaymentRequestSchema>

/**
 * Convierte PaymentRequest (frontend) a PaymentCreateRequest (API)
 */
export const adaptPaymentToCreateRequest = (payment: PaymentRequest): PaymentCreateRequest => {
  return {
    appointment_id: payment.appointmentId,
    success_url: payment.successUrl,
    failure_url: payment.failureUrl,
    pending_url: payment.pendingUrl
  }
}

/**
 * Genera URLs de callback para el pago
 */
export const generatePaymentUrls = (appointmentId: number, baseUrl: string) => {
  return {
    successUrl: `${baseUrl}/payment/success?appointment_id=${appointmentId}`,
    failureUrl: `${baseUrl}/payment/failure?appointment_id=${appointmentId}`,
    pendingUrl: `${baseUrl}/payment/pending?appointment_id=${appointmentId}`
  }
}

/**
 * Crea PaymentRequest desde un appointment creado
 */
export const createPaymentRequestFromAppointment = (
  appointment: Appointment,
  baseUrl: string = window.location.origin
): PaymentRequest => {
  baseUrl = 'https://www.google.com'
  const urls = generatePaymentUrls(appointment.id, baseUrl)

  return {
    appointmentId: appointment.id,
    successUrl: urls.successUrl,
    failureUrl: urls.failureUrl,
    pendingUrl: urls.pendingUrl
  }
}

/**
 * Valida que los datos del payment request sean correctos usando Zod
 */
export const validatePaymentRequest = (
  payment: PaymentRequest
): {
  isValid: boolean
  errors: string[]
  data?: PaymentRequest
} => {
  const result = PaymentRequestSchema.safeParse(payment)

  if (result.success) {
    return {
      isValid: true,
      errors: [],
      data: result.data
    }
  }

  const errors = result.error.issues.map(issue => {
    const field = issue.path.join('.')
    return `${field}: ${issue.message}`
  })

  return {
    isValid: false,
    errors,
    data: undefined
  }
}
