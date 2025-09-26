import { ref, readonly } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { adaptBookingToCreateRequest, validateBookingData } from '../adapters/appointment.adapter'
import type { AppointmentBooking } from '../types'
import type { Appointment } from '@/types/appointments.types'

export const useAppointments = () => {
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const createdAppointment = ref<Appointment | null>(null)

  const createAppointment = async (booking: AppointmentBooking): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      // 1. Validar datos del booking con Zod
      const validation = validateBookingData(booking)
      if (!validation.isValid) {
        error.value = `Datos inválidos:\n${validation.errors.map(err => `- ${err}`).join('\n')}`
        return false
      }

      // 2. Convertir a formato del API
      const createRequest = adaptBookingToCreateRequest(booking)
      // 3. Llamar al servicio
      const appointment = await AppointmentService.createAppointment(createRequest)
      console.log('🎯 Appointment created from API:', appointment)

      // 4. Guardar resultado
      createdAppointment.value = appointment
      console.log('💾 Appointment saved to store:', createdAppointment.value)

      return true
    } catch (err: any) {
      // Manejo de errores específicos
      if (err.response?.status === 400) {
        error.value = 'Datos de la cita son inválidos'
      } else if (err.response?.status === 409) {
        error.value = 'El horario seleccionado ya no está disponible'
      } else if (err.response?.status === 404) {
        error.value = 'Doctor o horario no encontrado'
      } else {
        error.value = err.message || 'Error al crear la cita médica'
      }

      console.error('Error creating appointment:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpia el estado del composable
   */
  const clearState = () => {
    error.value = null
    createdAppointment.value = null
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
    createdAppointment: readonly(createdAppointment),

    // Métodos
    createAppointment,
    clearState,
    clearError
  }
}
