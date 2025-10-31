import apiClient from '@/shared/lib/axios.config'
import type {
  DoctorAttendance,
  DoctorAttendanceCheckInRequest,
  DoctorAttendanceCheckOutRequest,
  DoctorAttendanceQueryParams,
  DoctorAttendanceStatistics,
  DoctorAttendanceResponse
} from '@/types/doctorAttendance.types'

export class DoctorAttendanceService {
  private static readonly BASE_PATH = '/doctor-attendance'

  /** Registrar entrada del doctor */
  static async checkIn(data: DoctorAttendanceCheckInRequest): Promise<DoctorAttendance> {
    try {
      const response = await apiClient.post<DoctorAttendanceResponse>(
        `${this.BASE_PATH}/check-in`,
        data
      )
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendance
      }
      throw new Error(response.data.message || 'Error al registrar entrada')
    } catch (error) {
      console.error('Error checking in:', error)
      throw new Error('No se pudo registrar la entrada del doctor')
    }
  }

  /** Registrar salida del doctor */
  static async checkOut(data: DoctorAttendanceCheckOutRequest): Promise<DoctorAttendance> {
    try {
      const response = await apiClient.post<DoctorAttendanceResponse>(
        `${this.BASE_PATH}/check-out`,
        data
      )
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendance
      }
      throw new Error(response.data.message || 'Error al registrar salida')
    } catch (error) {
      console.error('Error checking out:', error)
      throw new Error('No se pudo registrar la salida del doctor')
    }
  }

  /** Listar asistencias con filtros */
  static async getAttendances(params?: DoctorAttendanceQueryParams): Promise<DoctorAttendance[]> {
    try {
      const response = await apiClient.get<DoctorAttendanceResponse>(this.BASE_PATH, { params })
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendance[]
      }
      return []
    } catch (error) {
      console.error('Error fetching attendances:', error)
      throw new Error('No se pudieron cargar las asistencias')
    }
  }

  /** Asistencias del día actual */
  static async getTodayAttendances(): Promise<DoctorAttendance[]> {
    try {
      const response = await apiClient.get<DoctorAttendanceResponse>(`${this.BASE_PATH}/today`)
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendance[]
      }
      return []
    } catch (error) {
      console.error('Error fetching today attendances:', error)
      throw new Error('No se pudieron cargar las asistencias del día')
    }
  }

  /** Historial de asistencia de un doctor específico */
  static async getDoctorAttendances(doctorId: number): Promise<DoctorAttendance[]> {
    try {
      const response = await apiClient.get<DoctorAttendanceResponse>(
        `${this.BASE_PATH}/doctor/${doctorId}`
      )
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendance[]
      }
      return []
    } catch (error) {
      console.error('Error fetching doctor attendances:', error)
      throw new Error('No se pudo cargar el historial de asistencia del doctor')
    }
  }

  /** Estadísticas de asistencia */
  static async getStatistics(
    doctorId?: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<DoctorAttendanceStatistics> {
    try {
      const params: Record<string, string | number> = {}
      if (doctorId) params.doctor_id = doctorId
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const response = await apiClient.get<DoctorAttendanceResponse>(
        `${this.BASE_PATH}/statistics`,
        { params }
      )
      if (response.data.success && response.data.data) {
        return response.data.data as DoctorAttendanceStatistics
      }
      throw new Error(response.data.message || 'Error al obtener estadísticas')
    } catch (error) {
      console.error('Error fetching attendance statistics:', error)
      throw new Error('No se pudieron cargar las estadísticas de asistencia')
    }
  }
}
