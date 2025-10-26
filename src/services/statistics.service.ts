import apiClient from '@/shared/lib/axios.config'
import type { DashboardStatistics } from '@/types/statistics.types'

export class StatisticsService {
  private static readonly BASE_PATH = '/statistics'

  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      const response = await apiClient.get<DashboardStatistics>(`${this.BASE_PATH}/dashboard`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error)
      throw new Error('No se pudieron cargar las estadísticas del dashboard')
    }
  }
}
