import apiClient from '@/shared/lib/axios.config'
import type {
  VideoMeeting,
  VideoMeetingCreateRequest,
  VideoMeetingJoinResponse,
  VideoMeetingResponse
} from '@/types/videoMeeting.types'

export class VideoMeetingService {
  private static readonly BASE_PATH = '/video-meetings'

  /** Crear sala de videollamada para una cita */
  static async createMeeting(data: VideoMeetingCreateRequest): Promise<VideoMeeting> {
    try {
      const response = await apiClient.post<VideoMeetingResponse>(this.BASE_PATH, data)
      if (response.data.success && response.data.data) {
        return response.data.data as VideoMeeting
      }
      throw new Error(response.data.message || 'Error al crear videollamada')
    } catch (error) {
      console.error('Error creating video meeting:', error)
      throw new Error('No se pudo crear la sala de videollamada')
    }
  }

  /** Obtener información de videollamada por ID de cita */
  static async getMeetingByAppointment(appointmentId: number): Promise<VideoMeeting> {
    try {
      const response = await apiClient.get<VideoMeetingResponse>(
        `${this.BASE_PATH}/${appointmentId}`
      )
      if (response.data.success && response.data.data) {
        return response.data.data as VideoMeeting
      }
      throw new Error(response.data.message || 'Error al obtener videollamada')
    } catch (error) {
      console.error('Error fetching video meeting:', error)
      throw new Error('No se pudo cargar la información de la videollamada')
    }
  }

  /** Obtener URL para unirse según rol */
  static async getJoinUrl(appointmentId: number, role: 'doctor' | 'patient'): Promise<string> {
    try {
      const response = await apiClient.get<VideoMeetingResponse>(
        `${this.BASE_PATH}/${appointmentId}/join`,
        { params: { role } }
      )
      if (response.data.success && response.data.data) {
        const joinData = response.data.data as VideoMeetingJoinResponse
        return joinData.url
      }
      throw new Error(response.data.message || 'Error al obtener URL de videollamada')
    } catch (error) {
      console.error('Error getting join URL:', error)
      throw new Error('No se pudo obtener la URL de la videollamada')
    }
  }

  /** Marcar videollamada como iniciada */
  static async startMeeting(id: number): Promise<VideoMeeting> {
    try {
      const response = await apiClient.patch<VideoMeetingResponse>(`${this.BASE_PATH}/${id}/start`)
      if (response.data.success && response.data.data) {
        return response.data.data as VideoMeeting
      }
      throw new Error(response.data.message || 'Error al iniciar videollamada')
    } catch (error) {
      console.error('Error starting video meeting:', error)
      throw new Error('No se pudo iniciar la videollamada')
    }
  }

  /** Finalizar videollamada */
  static async endMeeting(id: number): Promise<VideoMeeting> {
    try {
      const response = await apiClient.patch<VideoMeetingResponse>(`${this.BASE_PATH}/${id}/end`)
      if (response.data.success && response.data.data) {
        return response.data.data as VideoMeeting
      }
      throw new Error(response.data.message || 'Error al finalizar videollamada')
    } catch (error) {
      console.error('Error ending video meeting:', error)
      throw new Error('No se pudo finalizar la videollamada')
    }
  }
}
