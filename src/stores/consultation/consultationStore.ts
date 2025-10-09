import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConsultationService } from '@/services/consultations.service'
import { DiagnosisService } from '@/services/diagnosis.service'
import type { Consultation, ConsultationCreateRequest } from '@/types/medical.types'
import type { Diagnosis } from '@/types/diagnosis.types'

export const useConsultationStore = defineStore('consultation', () => {
  // 🔹 State
  const currentConsultation = ref<Consultation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Diagnósticos asociados a la consulta actual
  const diagnosis = ref<Diagnosis[]>([])
  const loadingDiagnosis = ref(false)

  // 🔹 Getters
  const hasActiveConsultation = computed(() => currentConsultation.value !== null)
  const consultationId = computed(() => currentConsultation.value?.id ?? null)

  // 🔹 Actions principales de consulta
  const fetchConsultationByAppointment = async (
    appointmentId: number
  ): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null
      console.log('🔍 Buscando consulta por appointment_id', appointmentId)

      const consultations = await ConsultationService.getConsultations({
        appointment_id: appointmentId
      })

      const consultation = consultations?.[0] ?? null
      currentConsultation.value = consultation
      return consultation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la consulta'
      console.error('Error fetching consultation by appointment:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchConsultation = async (id: number): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      const consultation = await ConsultationService.getConsultationById(id)
      currentConsultation.value = consultation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la consulta'
      console.error('Error fetching consultation:', err)
    } finally {
      isLoading.value = false
    }
  }

  const createConsultation = async (appointmentId: number): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null

      const consultationData: ConsultationCreateRequest = { appointment_id: appointmentId }
      const consultation = await ConsultationService.createConsultation(consultationData)
      currentConsultation.value = consultation
      return consultation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la consulta'
      console.error('Error creating consultation:', err)

      if (errorMessage.includes('Ya existe una consulta asociada')) {
        const existing = await fetchConsultationByAppointment(appointmentId)
        if (existing) {
          error.value = null
          return existing
        }
      }

      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  const startConsultationFlow = async (appointmentId: number): Promise<Consultation | null> => {
    console.log('🚀 Iniciando flujo de consulta...')
    const consultation = await fetchConsultationByAppointment(appointmentId)

    if (!consultation) {
      console.log('🆕 No existe consulta previa, creando nueva...')
      return await createConsultation(appointmentId)
    }

    return consultation
  }

  // 🔹 Diagnósticos (Diagnosis)
  const fetchDiagnosisByConsultation = async (consultationId: number) => {
    try {
      loadingDiagnosis.value = true
      const result = await DiagnosisService.getDiagnosisByConsultation(consultationId)
      diagnosis.value = result

      // 🔁 Mantiene la consulta actual sincronizada
      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = result
      }
    } catch (err) {
      console.error('Error fetching diagnosis:', err)
    } finally {
      loadingDiagnosis.value = false
    }
  }

  const createDiagnosis = async (data: {
    consultation_id: number
    cie10_code: string
    description: string
    diagnosis_type: 'presuntivo' | 'definitivo'
  }) => {
    try {
      const newDiagnosis = await DiagnosisService.createDiagnosis(data)
      diagnosis.value.push(newDiagnosis)

      // Actualizar también en la consulta actual
      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = [...diagnosis.value]
      }

      return newDiagnosis
    } catch (err) {
      console.error('Error creating diagnosis:', err)
      throw err
    }
  }

  const updateDiagnosis = async (id: number, data: Partial<Diagnosis>) => {
    try {
      const updated = await DiagnosisService.updateDiagnosis(id, data)
      const index = diagnosis.value.findIndex(d => d.id === id)
      if (index !== -1) diagnosis.value[index] = updated

      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = [...diagnosis.value]
      }

      return updated
    } catch (err) {
      console.error('Error updating diagnosis:', err)
      throw err
    }
  }

  const deleteDiagnosis = async (id: number) => {
    try {
      await DiagnosisService.deleteDiagnosis(id)
      diagnosis.value = diagnosis.value.filter(d => d.id !== id)

      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = [...diagnosis.value]
      }

      return true
    } catch (err) {
      console.error('Error deleting diagnosis:', err)
      return false
    }
  }

  // 🔹 Completar anamnesis
  const completeAnamnesis = async (chief_complaint: string) => {
    if (!currentConsultation.value?.id) return null

    try {
      isLoading.value = true
      const updated = await ConsultationService.updateConsultation(currentConsultation.value.id, {
        chief_complaint
      } as ConsultationCreateRequest)
      currentConsultation.value = { ...currentConsultation.value, ...updated }
      return updated
    } catch (err) {
      console.error('Error updating consultation step:', err)
      error.value = 'No se pudo actualizar la consulta'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const clearConsultation = () => {
    currentConsultation.value = null
    diagnosis.value = []
    error.value = null
  }

  const resetError = () => (error.value = null)

  // 🔹 Métodos para manejar diagnósticos dentro de la consulta actual
  const setCurrentConsultationDiagnosis = (diagnosisList: any[]) => {
    if (!currentConsultation.value) return
    currentConsultation.value = {
      ...currentConsultation.value,
      diagnosis: diagnosisList
    }
  }

  const addDiagnosisToCurrentConsultation = (newDiagnosis: any) => {
    if (!currentConsultation.value) return
    currentConsultation.value = {
      ...currentConsultation.value,
      diagnosis: [...(currentConsultation.value.diagnosis || []), newDiagnosis]
    }
  }

  const updateDiagnosisInCurrentConsultation = (updatedDiagnosis: any) => {
    if (!currentConsultation.value?.diagnosis) return
    const updatedList = currentConsultation.value.diagnosis.map((d: any) =>
      d.id === updatedDiagnosis.id ? updatedDiagnosis : d
    )
    currentConsultation.value = {
      ...currentConsultation.value,
      diagnosis: updatedList
    }
  }

  const removeDiagnosisFromCurrentConsultation = (diagnosisId: number) => {
    if (!currentConsultation.value?.diagnosis) return
    const filteredList = currentConsultation.value.diagnosis.filter(
      (d: any) => d.id !== diagnosisId
    )
    currentConsultation.value = {
      ...currentConsultation.value,
      diagnosis: filteredList
    }
  }

  return {
    // State
    currentConsultation,
    diagnosis,
    isLoading,
    loadingDiagnosis,
    error,

    // Getters
    hasActiveConsultation,
    consultationId,

    // Actions
    createConsultation,
    fetchConsultation,
    fetchConsultationByAppointment,
    startConsultationFlow,
    completeAnamnesis,
    fetchDiagnosisByConsultation,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    clearConsultation,
    resetError,
    setCurrentConsultationDiagnosis,
    addDiagnosisToCurrentConsultation,
    updateDiagnosisInCurrentConsultation,
    removeDiagnosisFromCurrentConsultation
  }
})
