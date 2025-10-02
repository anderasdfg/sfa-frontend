import { ref } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import type { Appointment, AppointmentQueryParams } from '@/types/appointments.types'
import { useAuthStore } from '@/stores/auth/authStore'

export function usePatientAppointments() {
  const authStore = useAuthStore()
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPatientAppointments = async (): Promise<void> => {
    if (!authStore.user?.patient_id) {
      error.value = 'ID de paciente no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const params: AppointmentQueryParams = {
        patient_id: authStore.user.patient_id
        // Opcional: agregar paginación o filtros adicionales si es necesario
        // limit: 10,
        // status: 'scheduled,confirmed',
      }

      const response = await AppointmentService.getAppointments(params)

      // Verificar si la respuesta tiene la estructura esperada
      if (response && response.data && Array.isArray(response.data)) {
        // Mapear los datos para asegurar que tengan el formato esperado por el componente
        appointments.value = response.data.map(appointment => {
          // Asegurarse de que la fecha de la cita esté en el formato correcto
          let appointmentDate = appointment.appointment_date
          if (!appointmentDate && appointment.scheduled_at) {
            // Si no hay appointment_date pero hay scheduled_at, usamos ese
            appointmentDate = new Date(appointment.scheduled_at).toISOString()
          } else if (!appointmentDate) {
            // Si no hay ninguna fecha, usamos la hora actual como último recurso
            console.warn('No appointment date found for appointment:', appointment.id)
            appointmentDate = new Date().toISOString()
          }
          
          return {
            ...appointment,
            // Asegurarse de que los campos requeridos estén presentes
            doctor_name: appointment.doctor_name || 'Doctor',
            specialty: appointment.specialty || 'General',
            status: appointment.status || 'scheduled',
            appointment_date: appointmentDate
          }
        })
      } else {
        console.error('Unexpected API response format:', response)
        throw new Error('Formato de respuesta del servidor inesperado')
      }
    } catch (err) {
      console.error('Error fetching patient appointments:', err)
      error.value = 'No se pudieron cargar las citas. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return {
    appointments,
    loading,
    error,
    fetchPatientAppointments
  }
}
