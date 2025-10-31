import apiClient from '@/shared/lib/axios.config'
import type {
  PatientQueue,
  PatientQueueCreateRequest,
  PatientQueueQueryParams,
  PatientQueueStatistics,
  PatientQueueResponse
} from '@/types/patientQueue.types'

export class PatientQueueService {
  private static readonly BASE_PATH = '/patient-queue'

  /** Agregar paciente a la cola */
  static async addToQueue(data: PatientQueueCreateRequest): Promise<PatientQueue> {
    try {
      const response = await apiClient.post<PatientQueueResponse>(this.BASE_PATH, data)
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueue
      }
      throw new Error(response.data.message || 'Error al agregar paciente a la cola')
    } catch (error) {
      console.error('Error adding patient to queue:', error)
      throw new Error('No se pudo agregar el paciente a la cola')
    }
  }

  /** Listar cola con filtros */
  static async getQueue(params?: PatientQueueQueryParams): Promise<PatientQueue[]> {
    try {
      const response = await apiClient.get<PatientQueueResponse>(this.BASE_PATH, { params })
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueue[]
      }
      return []
    } catch (error) {
      console.error('Error fetching queue:', error)
      throw new Error('No se pudo cargar la cola de pacientes')
    }
  }

  /** Obtener siguiente paciente en espera para un doctor */
  static async getNextPatient(doctorId: number): Promise<PatientQueue | null> {
    try {
      const response = await apiClient.get<PatientQueueResponse>(
        `${this.BASE_PATH}/next/${doctorId}`
      )
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueue
      }
      return null
    } catch (error) {
      console.error('Error fetching next patient:', error)
      throw new Error('No se pudo obtener el siguiente paciente')
    }
  }

  /** Llamar a paciente (cambiar a in_consultation) */
  static async callPatient(id: number): Promise<PatientQueue> {
    try {
      const response = await apiClient.patch<PatientQueueResponse>(
        `${this.BASE_PATH}/${id}/call`
      )
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueue
      }
      throw new Error(response.data.message || 'Error al llamar al paciente')
    } catch (error) {
      console.error('Error calling patient:', error)
      throw new Error('No se pudo llamar al paciente')
    }
  }

  /** Completar atención del paciente */
  static async completePatient(id: number): Promise<PatientQueue> {
    try {
      const response = await apiClient.patch<PatientQueueResponse>(
        `${this.BASE_PATH}/${id}/complete`
      )
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueue
      }
      throw new Error(response.data.message || 'Error al completar atención')
    } catch (error) {
      console.error('Error completing patient:', error)
      throw new Error('No se pudo completar la atención del paciente')
    }
  }

  /** Remover paciente de la cola */
  static async removeFromQueue(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      console.error('Error removing patient from queue:', error)
      throw new Error('No se pudo remover al paciente de la cola')
    }
  }

  /** Obtener estadísticas de la cola */
  static async getStatistics(doctorId?: number): Promise<PatientQueueStatistics> {
    try {
      const params = doctorId ? { doctor_id: doctorId } : undefined
      const response = await apiClient.get<PatientQueueResponse>(
        `${this.BASE_PATH}/statistics`,
        { params }
      )
      if (response.data.success && response.data.data) {
        return response.data.data as PatientQueueStatistics
      }
      throw new Error(response.data.message || 'Error al obtener estadísticas')
    } catch (error) {
      console.error('Error fetching queue statistics:', error)
      throw new Error('No se pudieron cargar las estadísticas de la cola')
    }
  }
}
