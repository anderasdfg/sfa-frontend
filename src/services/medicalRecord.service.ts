import apiClient from '@/shared/lib/axios.config'
import type { MedicalRecordResponse } from '@/types/medicalRecord.types'

export class MedicalRecordService {
  private static readonly BASE_PATH = '/medical-record'

  /**
   * Obtiene la historia clínica de un paciente por su número de documento
   * @param documentNumber - Número de documento del paciente
   * @returns Historia clínica completa del paciente
   */
  static async getMedicalRecordByDocument(
    documentNumber: string
  ): Promise<MedicalRecordResponse> {
    try {
      const response = await apiClient.get<MedicalRecordResponse>(this.BASE_PATH, {
        params: { document_number: documentNumber }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching medical record:', error)
      throw new Error('No se pudo cargar la historia clínica')
    }
  }
}
