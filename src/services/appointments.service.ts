import apiClient from '@/shared/lib/axios.config'
import type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentCreateResponse,
  AppointmentQueryParams
} from '@/types/appointments.types'

interface UpdateAppointmentStatusRequest {
  status: string
}

export class AppointmentService {
  private static readonly BASE_PATH = '/appointments'

  /** Obtiene las citas médicas */
  static async getAppointments(
    appointmentQueryParams: AppointmentQueryParams
  ): Promise<{ success: boolean; data: Appointment[]; message?: string }> {
    try {
      const response = await apiClient.get(this.BASE_PATH, { params: appointmentQueryParams })
      return response.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw new Error('No se pudieron cargar las citas')
    }
  }

  /** Crea una cita médica */
  static async createAppointment(appointment: AppointmentCreateRequest): Promise<Appointment> {
    try {
      console.log('🚀 Sending appointment to API:', appointment)
      const response = await apiClient.post<AppointmentCreateResponse>(this.BASE_PATH, appointment)
      console.log('📥 API Response:', response.data)

      // El API devuelve { success, data, message }, necesitamos solo data
      if (response.data.success && response.data.data) {
        console.log('✅ Extracted appointment data:', response.data.data)
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw new Error('No se pudo crear la cita')
    }
  }

  /** Obtiene una cita por id */
  static async getAppointmentById(id: number): Promise<Appointment> {
    try {
      const response = await apiClient.get<AppointmentCreateResponse>(`${this.BASE_PATH}/${id}`)

      // El API devuelve { success, data, message }, necesitamos solo data
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
      throw new Error('No se pudo cargar la cita')
    }
  }

  /** Actualiza el estado de una cita */
  static async updateAppointmentStatus(
    id: number, 
    statusData: UpdateAppointmentStatusRequest
  ): Promise<Appointment> {
    try {
      const response = await apiClient.patch<AppointmentCreateResponse>(
        `${this.BASE_PATH}/${id}/status`, 
        statusData
      )

      // El API devuelve { success, data, message }, necesitamos solo data
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error updating appointment status:', error)
      throw new Error('No se pudo actualizar el estado de la cita')
    }
  }

  /** Confirmar llegada del paciente */
  static async confirmArrival(id: number, arrivalTime?: string): Promise<Appointment> {
    try {
      const body = arrivalTime ? { arrival_time: arrivalTime } : {}
      const response = await apiClient.patch<AppointmentCreateResponse>(
        `${this.BASE_PATH}/${id}/arrival`,
        body
      )

      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Error en la respuesta del API')
      }
    } catch (error) {
      console.error('Error confirming arrival:', error)
      throw new Error('No se pudo confirmar la llegada del paciente')
    }
  }

}

export type { UpdateAppointmentStatusRequest }
