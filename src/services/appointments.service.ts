import axios from 'axios'
import type {
  Appointment,
  AppointmentCreateRequest,
  AppointmentQueryParams
} from '@/types/appointments.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class AppointmentService {
  private static readonly BASE_PATH = '/appointments'

  /** Obtiene las citas médicas */
  static async getAppointments(
    appointmentQueryParams: AppointmentQueryParams
  ): Promise<Appointment[]> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.get(url, { params: appointmentQueryParams })
      return response.data
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw new Error('No se pudieron cargar las citas')
    }
  }

  /** Crea una cita médica */
  static async createAppointment(appointment: AppointmentCreateRequest): Promise<Appointment> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.post(url, appointment)
      return response.data
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw new Error('No se pudo crear la cita')
    }
  }

  /** Obtiene una cita por id */
  static async getAppointmentById(id: number): Promise<Appointment> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${id}`
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching appointment by id:', error)
      throw new Error('No se pudo cargar la cita')
    }
  }
}
