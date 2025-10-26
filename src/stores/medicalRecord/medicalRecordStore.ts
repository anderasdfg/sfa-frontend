import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MedicalRecordService } from '@/services/medicalRecord.service'
import type { MedicalRecord } from '@/types/medicalRecord.types'

export const useMedicalRecordStore = defineStore('medicalRecord', () => {
  // State
  const currentMedicalRecord = ref<MedicalRecord | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasMedicalRecord = computed(() => currentMedicalRecord.value !== null)
  const patientInfo = computed(() => currentMedicalRecord.value?.patient ?? null)
  const consultations = computed(() => currentMedicalRecord.value?.consultations ?? [])
  const consultationsCount = computed(() => consultations.value.length)

  // Actions
  const fetchMedicalRecordByDocument = async (documentNumber: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      const response = await MedicalRecordService.getMedicalRecordByDocument(documentNumber)
      currentMedicalRecord.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la historia clínica'
      console.error(err)
      currentMedicalRecord.value = null
    } finally {
      isLoading.value = false
    }
  }

  const clearMedicalRecord = () => {
    currentMedicalRecord.value = null
    error.value = null
  }

  const resetError = () => {
    error.value = null
  }

  return {
    // State
    currentMedicalRecord,
    isLoading,
    error,
    // Getters
    hasMedicalRecord,
    patientInfo,
    consultations,
    consultationsCount,
    // Actions
    fetchMedicalRecordByDocument,
    clearMedicalRecord,
    resetError
  }
})
