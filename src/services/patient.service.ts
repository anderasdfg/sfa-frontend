import apiClient from '@/shared/lib/axios.config'
import type { Patient } from '@/types/medical.types'

export class PatientService {
  private static readonly BASE_PATH = '/patients'

  /** Obtiene los pacientes */
  static async getPatients(doctor_id?: number): Promise<Patient[]> {
    try {
      const response = await apiClient.get(this.BASE_PATH, { params: { doctor_id } })
      return response.data
    } catch (error) {
      console.error('Error fetching patients:', error)
      throw new Error('No se pudieron cargar los pacientes')
    }
  }

  /** Obtiene un paciente por id */
  static async getPatientById(id: number): Promise<Patient> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}`)
      return response.data.data
    } catch (error) {
      console.error('Error fetching patient:', error)
      throw new Error('No se pudo cargar el paciente')
    }
  }
}
