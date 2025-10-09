import { storeToRefs } from 'pinia'
import { useConsultationStore } from '@/stores/consultation/consultationStore'

/**
 * Composable para manejar la lógica de consultas médicas
 * Wrapper del store de consultas para facilitar su uso en componentes
 */
export function useConsultation() {
  const consultationStore = useConsultationStore()

  // State reactivo del store
  const { currentConsultation, isLoading, error, hasActiveConsultation, consultationId } =
    storeToRefs(consultationStore)

  // Actions del store
  const {
    createConsultation,
    updateConsultation,
    fetchConsultation,
    updateChiefComplaint,
    updateCurrentIllnessHistory,
    updateTreatmentPlan,
    clearConsultation,
    resetError
  } = consultationStore

  /**
   * Inicia una nueva consulta a partir de una cita
   * @param appointmentId - ID de la cita
   * @returns La consulta creada o null si hubo error
   */
  const startConsultation = async (appointmentId: number) => {
    return await createConsultation(appointmentId)
  }

  /**
   * Completa la sección de anamnesis (chief complaint)
   * @param chiefComplaint - Motivo de consulta
   * @returns true si se actualizó correctamente
   */
  const completeAnamnesis = async (chiefComplaint: string) => {
    console.log('Completando anamnesis para consulta: ', currentConsultation.value)
    return await updateChiefComplaint(chiefComplaint)
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
    completeAnamnesis,
    updateChiefComplaint,
    updateCurrentIllnessHistory,
    updateTreatmentPlan,
    fetchConsultation,
    clearConsultation,
    resetError
  }
}
