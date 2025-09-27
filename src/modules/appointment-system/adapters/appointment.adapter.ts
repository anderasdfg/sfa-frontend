/**
 * Adapter para transformar datos de appointments entre formatos frontend y API
 */

import { z } from 'zod'
import type { AppointmentCreateRequest } from '@/types/appointments.types'
import type { AppointmentBooking } from '../types'
import { AppointmentStatus, AppointmentModality } from '@/types/enums'

/**
 * Schema de validación para AppointmentBooking usando Zod
 */
export const AppointmentBookingSchema = z.object({
  patientId: z.number().positive('ID del paciente debe ser mayor a 0'),
  doctorId: z.number().positive('ID del doctor debe ser mayor a 0'),
  slotId: z.number().positive('ID del slot debe ser mayor a 0'),
  appointmentDate: z
    .string()
    .min(1, 'Fecha de la cita es requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha debe estar en formato YYYY-MM-DD'),
  status: z.nativeEnum(AppointmentStatus),
  modality: z.nativeEnum(AppointmentModality),
  scheduledAt: z.date()
})

/**
 * Tipo inferido automáticamente desde el schema de Zod
 */
export type ValidatedAppointmentBooking = z.infer<typeof AppointmentBookingSchema>

/**
 * Convierte AppointmentBooking (frontend) a AppointmentCreateRequest (API)
 */
export const adaptBookingToCreateRequest = (
  booking: AppointmentBooking
): AppointmentCreateRequest => {
  return {
    patient_id: booking.patientId,
    doctor_id: booking.doctorId,
    slot_id: booking.slotId,
    appointment_date: booking.appointmentDate,
    status: booking.status,
    modality: booking.modality,
    scheduled_at: booking.scheduledAt
  }
}

/**
 * Valida que los datos del booking sean correctos usando Zod
 * @param booking - Datos del booking a validar
 * @returns Objeto con resultado de validación y errores específicos
 */
export const validateBookingData = (
  booking: AppointmentBooking
): {
  isValid: boolean
  errors: string[]
  data?: ValidatedAppointmentBooking
} => {
  const result = AppointmentBookingSchema.safeParse(booking)

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

/**
 * Función helper para validar y transformar en un solo paso
 * @param booking - Datos del booking
 * @returns Datos validados o lanza error con detalles
 */
export const validateAndTransformBooking = (
  booking: AppointmentBooking
): ValidatedAppointmentBooking => {
  const result = AppointmentBookingSchema.parse(booking) // Lanza error si falla
  return result
}
