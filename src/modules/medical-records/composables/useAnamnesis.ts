import { ref, computed, watchEffect } from 'vue'
import {
  complaintsToString,
  stringToComplaints,
  searchComplaints as searchComplaintsData
} from '../data/complaints.data'
import { useConsultationStore } from '@/stores/consultation/consultationStore'

export function useAnamnesis() {
  // State
  const selectedComplaints = ref<string[]>([])
  const customComplaint = ref('')
  const searchQuery = ref('')
  const suggestions = ref<string[]>([])

  const { completeAnamnesis, currentConsultation } = useConsultationStore()

  // Computed
  const hasComplaints = computed(() => selectedComplaints.value.length > 0)

  const complaintsAsString = computed(() => complaintsToString(selectedComplaints.value))

  /**
   * Agrega una queja a la lista de seleccionadas
   */
  const addComplaint = (complaint: string): void => {
    const trimmedComplaint = complaint.trim()

    if (!trimmedComplaint) return

    // Evitar duplicados (case-insensitive)
    const exists = selectedComplaints.value.some(
      c => c.toLowerCase() === trimmedComplaint.toLowerCase()
    )

    if (!exists) {
      selectedComplaints.value.push(trimmedComplaint)
    }

    // Limpiar inputs
    customComplaint.value = ''
    searchQuery.value = ''
    suggestions.value = []
  }

  /**
   * Elimina una queja de la lista
   */
  const removeComplaint = (complaint: string): void => {
    selectedComplaints.value = selectedComplaints.value.filter(c => c !== complaint)
  }

  /**
   * Limpia todas las quejas seleccionadas
   */
  const clearComplaints = (): void => {
    selectedComplaints.value = []
  }

  /**
   * Busca sugerencias de quejas
   */
  const searchComplaints = (query: string): void => {
    searchQuery.value = query

    if (query.trim().length < 2) {
      suggestions.value = []
      return
    }

    suggestions.value = searchComplaintsData(query)
  }

  /**
   * Carga quejas desde un string (para inicializar desde BD)
   */
  const loadComplaintsFromString = (complaintsString: string): void => {
    selectedComplaints.value = stringToComplaints(complaintsString)
  }

  /**
   * Guarda las quejas (retorna el string para enviar al backend)
   */
  const saveComplaints = (): string => {
    completeAnamnesis(complaintsAsString.value)
    return complaintsAsString.value
  }

  /**
   * Toggle de una queja (agregar si no existe, quitar si existe)
   */
  const toggleComplaint = (complaint: string): void => {
    const exists = selectedComplaints.value.includes(complaint)

    if (exists) {
      removeComplaint(complaint)
    } else {
      addComplaint(complaint)
    }
  }

  /**
   * Verifica si una queja está seleccionada
   */
  const isComplaintSelected = (complaint: string): boolean => {
    return selectedComplaints.value.includes(complaint)
  }

  watchEffect(() => {
    if (currentConsultation?.chief_complaint) {
      loadComplaintsFromString(currentConsultation.chief_complaint)
    }
  })

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
