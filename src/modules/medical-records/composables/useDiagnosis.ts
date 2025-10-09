// composables/useDiagnosis.ts
import { ref, computed } from 'vue'
import { DiagnosisService } from '@/services/diagnosis.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
import type { Diagnosis } from '@/types/diagnosis.types'

export function useDiagnosis() {
  const consultationStore = useConsultationStore()

  // Usar el store como fuente única de verdad
  const diagnosis = computed(() => consultationStore.currentConsultation?.diagnosis || [])

  const loading = ref(false)
  const savingDiagnosis = ref(false)
  const deletingDiagnosis = ref(false)
  const error = ref<string | null>(null)

  const fetchDiagnosisByConsultation = async (consultationId: number, force = false) => {
    // Si ya hay diagnósticos en el store y no se fuerza la recarga, no hacer fetch
    if (!force && consultationStore.currentConsultation?.diagnosis?.length) {
      return
    }

    try {
      loading.value = true
      error.value = null
      const data = await DiagnosisService.getDiagnosisByConsultation(consultationId)
      consultationStore.setCurrentConsultationDiagnosis(data)
    } catch (err: any) {
      error.value = err.message || 'Error cargando diagnósticos'
    } finally {
      loading.value = false
    }
  }

  const createDiagnosis = async (payload: {
    consultation_id: number
    cie10_code: string
    description: string
    diagnosis_type: 'presuntivo' | 'definitivo'
  }) => {
    try {
      savingDiagnosis.value = true
      const created = await DiagnosisService.createDiagnosis(payload)
      consultationStore.addDiagnosisToCurrentConsultation(created)
    } catch (err: any) {
      console.error(err)
    } finally {
      savingDiagnosis.value = false
    }
  }

  const updateDiagnosis = async (id: number, payload: Partial<Diagnosis>) => {
    try {
      savingDiagnosis.value = true
      const updated = await DiagnosisService.updateDiagnosis(id, payload)
      consultationStore.updateDiagnosisInCurrentConsultation(updated)
    } catch (err: any) {
      console.error(err)
    } finally {
      savingDiagnosis.value = false
    }
  }

  const deleteDiagnosis = async (id: number) => {
    try {
      deletingDiagnosis.value = true
      await DiagnosisService.deleteDiagnosis(id)
      consultationStore.removeDiagnosisFromCurrentConsultation(id)
      return true
    } catch (err: any) {
      console.error(err)
      return false
    } finally {
      deletingDiagnosis.value = false
    }
  }

  return {
    diagnosis,
    loading,
    savingDiagnosis,
    deletingDiagnosis,
    error,
    fetchDiagnosisByConsultation,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis
  }
}
