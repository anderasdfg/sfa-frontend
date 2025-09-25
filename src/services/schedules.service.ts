import axios from 'axios'
import type {
  Schedule,
  ScheduleCreateRequest,
  ScheduleRequestQueryParams,
  ScheduleResponse
} from '@/types/schedules.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class ScheduleService {
  private static readonly BASE_PATH = '/schedules'

  /**
   * Obtiene todos los horarios
   */
  static async getSchedules(queryParams: ScheduleRequestQueryParams): Promise<ScheduleResponse> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.get(url, { params: queryParams })
      return response.data
    } catch (error) {
      console.error('Error fetching schedules:', error)
      throw new Error('No se pudieron cargar los horarios')
    }
  }

  /**
   * Crea un nuevo horario
   */
  static async createSchedule(schedule: ScheduleCreateRequest): Promise<ScheduleResponse> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.post(url, schedule)
      return response.data
    } catch (error) {
      console.error('Error creating schedule:', error)
      throw new Error('No se pudo crear el horario')
    }
  }

  /**
   * Actualiza un horario existente
   */
  static async updateSchedule(schedule: Schedule): Promise<ScheduleResponse> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${schedule.id}`
      const response = await axios.put(url, schedule)
      return response.data
    } catch (error) {
      console.error('Error updating schedule:', error)
      throw new Error('No se pudo actualizar el horario')
    }
  }

  /**
   * Elimina un horario existente
   */
  static async deleteSchedule(id: number): Promise<void> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${id}`
      await axios.delete(url)
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw new Error('No se pudo eliminar el horario')
    }
  }
}
