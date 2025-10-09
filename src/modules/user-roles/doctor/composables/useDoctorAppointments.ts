import { ref } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import type { Appointment, AppointmentQueryParams } from '@/types/appointments.types'
import { useAuthStore } from '@/stores/auth/authStore'

export function useDoctorAppointments() {
  const authStore = useAuthStore()
  const appointments = ref<Appointment[]>([])
  const todayAppointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDoctorAppointments = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const params: AppointmentQueryParams = {
        doctor_id: authStore.user.doctor_id
      }

      const response = await AppointmentService.getAppointments(params)

      if (response && response.data && Array.isArray(response.data)) {
        appointments.value = response.data.map(appointment => ({
          ...appointment,
          patient_name: appointment.patient_data
            ? `${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`
            : 'Paciente',
          appointment_date: appointment.appointment_date || new Date().toISOString()
        }))
      } else {
        console.error('Unexpected API response format:', response)
        throw new Error('Formato de respuesta del servidor inesperado')
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err)
      error.value = 'No se pudieron cargar las citas. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  const fetchTodayAppointments = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`

      const params: AppointmentQueryParams = {
        doctor_id: authStore.user.doctor_id,
        date_from: dateString,
        date_to: dateString
      }

      const response = await AppointmentService.getAppointments(params)

      if (response && response.data && Array.isArray(response.data)) {
        todayAppointments.value = response.data.map(appointment => ({
          ...appointment,
          patient_name: appointment.patient_data
            ? `${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`
            : 'Paciente',
          appointment_date: appointment.appointment_date || new Date().toISOString()
        }))
      } else {
        console.error('Unexpected API response format:', response)
        throw new Error('Formato de respuesta del servidor inesperado')
      }
    } catch (err) {
      console.error('Error fetching today appointments:', err)
      error.value = 'No se pudieron cargar las citas de hoy. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return {
    appointments,
    todayAppointments,
    loading,
    error,
    fetchDoctorAppointments,
    fetchTodayAppointments
  }
}
