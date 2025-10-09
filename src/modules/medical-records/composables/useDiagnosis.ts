import { ref, computed } from 'vue'
import { DiagnosisService } from '@/services/diagnosis.service'
import type { Diagnosis } from '@/types/diagnosis.types'
import type {
  CreateDiagnosisRequest,
  UpdateDiagnosisRequest,
  DiagnosisQueryParams
} from '@/services/diagnosis.service'

export function useDiagnosis(consultationId?: number) {
  // State
  const diagnoses = ref<Diagnosis[]>([])
  const currentDiagnosis = ref<Diagnosis | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const savingDiagnosis = ref(false)
  const deletingDiagnosis = ref(false)

  // Computed
  const hasDiagnoses = computed(() => diagnoses.value.length > 0)

  const presumptiveDiagnoses = computed(() =>
    diagnoses.value.filter(d => d.diagnosis_type === 'presuntivo')
  )

  const definitiveDiagnoses = computed(() =>
    diagnoses.value.filter(d => d.diagnosis_type === 'definitivo')
  )

  /**
   * Obtiene todos los diagnósticos con filtros opcionales
   */
  const fetchDiagnoses = async (params?: DiagnosisQueryParams): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      diagnoses.value = await DiagnosisService.getDiagnoses(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar diagnósticos'
      console.error('Error fetching diagnoses:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene los diagnósticos de una consulta específica
   */
  const fetchDiagnosesByConsultation = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      diagnoses.value = await DiagnosisService.getDiagnosesByConsultation(id)
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Error al cargar diagnósticos de la consulta'
      console.error('Error fetching diagnoses by consultation:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un diagnóstico por su ID
   */
  const fetchDiagnosisById = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      currentDiagnosis.value = await DiagnosisService.getDiagnosisById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar diagnóstico'
      console.error('Error fetching diagnosis:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo diagnóstico
   */
  const createDiagnosis = async (diagnosis: CreateDiagnosisRequest): Promise<Diagnosis | null> => {
    savingDiagnosis.value = true
    error.value = null

    try {
      const newDiagnosis = await DiagnosisService.createDiagnosis(diagnosis)

      // Agregar el nuevo diagnóstico a la lista
      diagnoses.value.push(newDiagnosis)

      return newDiagnosis
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear diagnóstico'
      console.error('Error creating diagnosis:', err)
      return null
    } finally {
      savingDiagnosis.value = false
    }
  }

  /**
   * Actualiza un diagnóstico existente
   */
  const updateDiagnosis = async (
    id: number,
    diagnosis: UpdateDiagnosisRequest
  ): Promise<Diagnosis | null> => {
    savingDiagnosis.value = true
    error.value = null

    try {
      const updatedDiagnosis = await DiagnosisService.updateDiagnosis(id, diagnosis)

      // Actualizar el diagnóstico en la lista
      const index = diagnoses.value.findIndex(d => d.id === id)
      if (index !== -1) {
        diagnoses.value[index] = updatedDiagnosis
      }

      // Actualizar el diagnóstico actual si es el mismo
      if (currentDiagnosis.value?.id === id) {
        currentDiagnosis.value = updatedDiagnosis
      }

      return updatedDiagnosis
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar diagnóstico'
      console.error('Error updating diagnosis:', err)
      return null
    } finally {
      savingDiagnosis.value = false
    }
  }

  /**
   * Elimina un diagnóstico
   */
  const deleteDiagnosis = async (id: number): Promise<boolean> => {
    deletingDiagnosis.value = true
    error.value = null

    try {
      await DiagnosisService.deleteDiagnosis(id)

      // Remover el diagnóstico de la lista
      diagnoses.value = diagnoses.value.filter(d => d.id !== id)

      // Limpiar el diagnóstico actual si es el mismo
      if (currentDiagnosis.value?.id === id) {
        currentDiagnosis.value = null
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar diagnóstico'
      console.error('Error deleting diagnosis:', err)
      return false
    } finally {
      deletingDiagnosis.value = false
    }
  }

  /**
   * Limpia el estado de errores
   */
  const clearError = (): void => {
    error.value = null
  }

  /**
   * Limpia todos los diagnósticos
   */
  const clearDiagnoses = (): void => {
    diagnoses.value = []
    currentDiagnosis.value = null
  }

  /**
   * Reinicia el estado del composable
   */
  const reset = (): void => {
    diagnoses.value = []
    currentDiagnosis.value = null
    loading.value = false
    error.value = null
    savingDiagnosis.value = false
    deletingDiagnosis.value = false
  }

  // Auto-fetch si se proporciona consultationId
  if (consultationId) {
    fetchDiagnosesByConsultation(consultationId)
  }

  return {
    // State
    diagnoses,
    currentDiagnosis,
    loading,
    error,
    savingDiagnosis,
    deletingDiagnosis,

    // Computed
    hasDiagnoses,
    presumptiveDiagnoses,
    definitiveDiagnoses,

    // Methods
    fetchDiagnoses,
    fetchDiagnosesByConsultation,
    fetchDiagnosisById,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    clearError,
    clearDiagnoses,
    reset
  }
}
