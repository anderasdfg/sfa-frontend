import apiClient from '@/shared/lib/axios.config'
import type { DashboardStatistics, AdminDashboard } from '@/types/statistics.types'

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

  static async getAdminDashboard(): Promise<AdminDashboard> {
    try {
      const response = await apiClient.get<AdminDashboard>(`${this.BASE_PATH}/admin-dashboard`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo datos del dashboard de administrador:', error)
      throw new Error('No se pudieron cargar los datos del dashboard')
    }
  }
}
