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

  /** Busca un paciente por DNI */
  static async getPatientByDNI(documentNumber: string): Promise<Patient | null> {
    try {
      const response = await apiClient.get(this.BASE_PATH, {
        params: { document_number: documentNumber }
      })
      const patients = response.data.data || response.data
      return Array.isArray(patients) && patients.length > 0 ? patients[0] : null
    } catch (error) {
      console.error('Error fetching patient by DNI:', error)
      throw new Error('No se pudo buscar el paciente')
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

  /** Obtener resultados de exámenes del paciente */
  static async getPatientTestResults(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/${id}/test-results`)
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching patient test results:', error)
      throw new Error('No se pudieron cargar los resultados de exámenes')
    }
  }

  /** Crea un nuevo paciente */
  static async createPatient(patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiClient.post(this.BASE_PATH, patientData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error creating patient:', error)
      throw new Error('No se pudo crear el paciente')
    }
  }

  /** Actualiza un paciente */
  static async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/${id}`, patientData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error updating patient:', error)
      throw new Error('No se pudo actualizar el paciente')
    }
  }

  /** Elimina un paciente */
  static async deletePatient(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`)
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw new Error('No se pudo eliminar el paciente')
    }
  }
}
