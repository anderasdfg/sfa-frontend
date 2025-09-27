import apiClient from '@/shared/lib/axios.config'
import type {
  Schedule,
  ScheduleCreateRequest,
  ScheduleRequestQueryParams,
  ScheduleResponse
} from '@/types/schedules.types'

export class ScheduleService {
  private static readonly BASE_PATH = '/schedules'

  /**
   * Obtiene todos los horarios
   */
  static async getSchedules(queryParams: ScheduleRequestQueryParams): Promise<ScheduleResponse> {
    try {
      const response = await apiClient.get(this.BASE_PATH, { params: queryParams })
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
      const response = await apiClient.post(this.BASE_PATH, schedule)
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
      const response = await apiClient.put(`${this.BASE_PATH}/${schedule.id}`, schedule)
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
      await apiClient.delete(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      console.error('Error deleting schedule:', error)
      throw new Error('No se pudo eliminar el horario')
    }
  }
}
