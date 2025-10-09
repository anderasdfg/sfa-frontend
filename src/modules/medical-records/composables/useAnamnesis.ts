import { ref, computed, watch } from 'vue'
import {
  complaintsToString,
  stringToComplaints,
  searchComplaints as searchComplaintsData
} from '../data/complaints.data'
import { useConsultationStore } from '@/stores/consultation/consultationStore'

export function useAnamnesis() {
  const consultationStore = useConsultationStore()

  // State
  const selectedComplaints = ref<string[]>([])
  const customComplaint = ref('')
  const searchQuery = ref('')
  const suggestions = ref<string[]>([])

  // Computed
  const hasComplaints = computed(() => selectedComplaints.value.length > 0)
  const complaintsAsString = computed(() => complaintsToString(selectedComplaints.value))

  // === Métodos principales ===

  /** Agrega una queja */
  const addComplaint = (complaint: string): void => {
    const trimmedComplaint = complaint.trim()
    if (!trimmedComplaint) return

    const exists = selectedComplaints.value.some(
      c => c.toLowerCase() === trimmedComplaint.toLowerCase()
    )
    if (!exists) {
      selectedComplaints.value.push(trimmedComplaint)
    }

    customComplaint.value = ''
    searchQuery.value = ''
    suggestions.value = []
  }

  /** Elimina una queja */
  const removeComplaint = (complaint: string): void => {
    selectedComplaints.value = selectedComplaints.value.filter(c => c !== complaint)
  }

  /** Limpia todas las quejas */
  const clearComplaints = (): void => {
    selectedComplaints.value = []
  }

  /** Busca sugerencias de quejas */
  const searchComplaints = (query: string): void => {
    searchQuery.value = query
    if (query.trim().length < 2) {
      suggestions.value = []
      return
    }
    suggestions.value = searchComplaintsData(query)
  }

  /** Carga quejas desde un string (por ejemplo, al iniciar el componente) */
  const loadComplaintsFromString = (complaintsString: string): void => {
    selectedComplaints.value = stringToComplaints(complaintsString)
  }

  /** Guarda las quejas en el store (y backend si aplica) */
  const saveComplaints = async (): Promise<string> => {
    const complaintStr = complaintsAsString.value
    await consultationStore.completeAnamnesis(complaintStr)
    return complaintStr
  }

  /** Toggle de queja */
  const toggleComplaint = (complaint: string): void => {
    const exists = selectedComplaints.value.includes(complaint)
    exists ? removeComplaint(complaint) : addComplaint(complaint)
  }

  /** Verifica si una queja está seleccionada */
  const isComplaintSelected = (complaint: string): boolean => {
    return selectedComplaints.value.includes(complaint)
  }

  // === Sincronización reactiva ===

  // Cargar al iniciar
  watch(
    () => consultationStore.currentConsultation?.chief_complaint,
    newValue => {
      if (newValue !== undefined && newValue !== null) {
        loadComplaintsFromString(newValue)
      }
    },
    { immediate: true }
  )

  // Actualizar el store cada vez que cambian las quejas
  watch(
    selectedComplaints,
    newVal => {
      if (consultationStore.currentConsultation) {
        consultationStore.currentConsultation.chief_complaint = complaintsToString(newVal)
      }
    },
    { deep: true }
  )

  return {
    // State
    selectedComplaints,
    customComplaint,
    searchQuery,
    suggestions,

    // Computed
    hasComplaints,
    complaintsAsString,

    // Methods
    addComplaint,
    removeComplaint,
    clearComplaints,
    searchComplaints,
    loadComplaintsFromString,
    saveComplaints,
    toggleComplaint,
    isComplaintSelected
  }
}
