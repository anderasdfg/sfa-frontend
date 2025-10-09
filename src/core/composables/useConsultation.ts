import { storeToRefs } from 'pinia'
import { useConsultationStore } from '@/stores/consultation/consultationStore'

export function useConsultation() {
  const consultationStore = useConsultationStore()
  const { currentConsultation, isLoading, error, hasActiveConsultation, consultationId } =
    storeToRefs(consultationStore)

  const {
    startConsultationFlow,
    /*   updateChiefComplaint,
    updateCurrentIllnessHistory,
    updateTreatmentPlan, */
    fetchConsultation,
    clearConsultation,
    resetError
  } = consultationStore

  /**
   * Inicia una nueva consulta (o carga una existente)
   */
  const startConsultation = async (appointmentId: number) => {
    console.log('(useConsultation.ts) Iniciando flujo de consulta...', appointmentId)
    return await startConsultationFlow(appointmentId)
  }

  return {
    // State
    currentConsultation,
    isLoading,
    error,
    hasActiveConsultation,
    consultationId,

    // Actions
    startConsultation,
    /*    updateChiefComplaint,
    updateCurrentIllnessHistory,
    updateTreatmentPlan, */
    fetchConsultation,
    clearConsultation,
    resetError
  }
}
