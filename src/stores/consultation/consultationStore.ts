import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConsultationService } from '@/services/consultations.service'
import type { Consultation, ConsultationCreateRequest } from '@/types/medical.types'

export const useConsultationStore = defineStore('consultation', () => {
  // State
  const currentConsultation = ref<Consultation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasActiveConsultation = computed(() => currentConsultation.value !== null)
  const consultationId = computed(() => currentConsultation.value?.id ?? null)

  // Actions
  const createConsultation = async (appointmentId: number): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null

      const consultationData: ConsultationCreateRequest = {
        appointment_id: appointmentId
      }

      const consultation = await ConsultationService.createConsultation(consultationData)
      currentConsultation.value = consultation

      return consultation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la consulta'
      console.error('Error creating consultation:', err)

      const isExistingConsultationError = errorMessage.includes('Ya existe una consulta asociada')

      if (isExistingConsultationError) {
        const existingConsultation = await fetchConsultationByAppointment(appointmentId)

        if (existingConsultation) {
          error.value = null
          return existingConsultation
        }
      }

      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateConsultation = async (
    consultationId: number,
    updates: Partial<ConsultationCreateRequest>
  ): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null

      // Combinar datos actuales con las actualizaciones
      const updateData: ConsultationCreateRequest = {
        appointment_id: currentConsultation.value?.appointment_id!,
        ...updates
      }

      const consultation = await ConsultationService.updateConsultation(consultationId, updateData)
      currentConsultation.value = consultation

      return consultation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar la consulta'
      console.error('Error updating consultation:', err)
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

  const fetchConsultationByAppointment = async (
    appointmentId: number
  ): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null

      const consultations = await ConsultationService.getConsultations({
        appointment_id: appointmentId
      })

      const consultation = consultations[0] ?? null
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

  const updateChiefComplaint = async (chiefComplaint: string): Promise<boolean> => {
    if (!currentConsultation.value) {
      error.value = 'No hay consulta activa'
      return false
    }

    const result = await updateConsultation(currentConsultation.value.id, {
      chief_complaint: chiefComplaint
    })

    return result !== null
  }

  const updateCurrentIllnessHistory = async (history: string): Promise<boolean> => {
    if (!currentConsultation.value) {
      error.value = 'No hay consulta activa'
      return false
    }

    const result = await updateConsultation(currentConsultation.value.id, {
      current_illnes_history: history
    })

    return result !== null
  }

  const updateTreatmentPlan = async (plan: string): Promise<boolean> => {
    if (!currentConsultation.value) {
      error.value = 'No hay consulta activa'
      return false
    }

    const result = await updateConsultation(currentConsultation.value.id, {
      treatment_plan: plan
    })

    return result !== null
  }

  const clearConsultation = (): void => {
    currentConsultation.value = null
    error.value = null
  }

  const resetError = (): void => {
    error.value = null
  }

  return {
    // State
    currentConsultation,
    isLoading,
    error,

    // Getters
    hasActiveConsultation,
    consultationId,

    // Actions
    createConsultation,
    updateConsultation,
    fetchConsultation,
    fetchConsultationByAppointment,
    updateChiefComplaint,
    updateCurrentIllnessHistory,
    updateTreatmentPlan,
    clearConsultation,
    resetError
  }
})
