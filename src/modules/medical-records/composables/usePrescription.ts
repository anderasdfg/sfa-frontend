// composables/usePrescription.ts
import { ref, computed } from 'vue'
import { PrescriptionService } from '@/services/prescriptions.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
import type { Prescription } from '@/types/prescriptions.types'
import {
  PRESCRIPTION_TEMPLATES,
  searchMedications,
  getAllMedications,
  type Medication,
} from '../data/medications.data'

export type { PrescriptionTemplate, Medication } from '../data/medications.data'

export function usePrescription() {
  const consultationStore = useConsultationStore()

  // Usar el store como fuente única de verdad
  const prescriptions = computed(() => consultationStore.currentConsultation?.prescriptions || [])
  
  // Estado
  const loading = ref(false)
  const error = ref<string | null>(null)
  const savingPrescription = ref(false)
  const deletingPrescription = ref(false)
  
  // Estado para búsqueda de medicamentos
  const searchTerm = ref('')
  const medicationSuggestions = ref<Medication[]>([])
  
  // Referencias a las plantillas de prescripciones desde el archivo de datos
  const commonTemplates = computed(() => PRESCRIPTION_TEMPLATES.common || [])
  const respiratoryTemplates = computed(() => PRESCRIPTION_TEMPLATES.respiratory || [])
  const cardiovascularTemplates = computed(() => PRESCRIPTION_TEMPLATES.cardiovascular || [])

  /**
   * Busca medicamentos según el término de búsqueda
   * @param query - Término de búsqueda
   */
  const searchMedicationsLocal = (query: string) => {
    searchTerm.value = query
    medicationSuggestions.value = searchMedications(query)
    return medicationSuggestions.value
  }
  
  /**
   * Obtiene todos los medicamentos disponibles
   */
  const getAllAvailableMedications = () => {
    return getAllMedications()
  }

  /**
   * Carga las prescripciones para una consulta específica
   * @param consultationId - ID de la consulta
   * @param force - Forzar recarga aunque ya existan datos en el store
   */
  const fetchPrescriptionsByConsultation = async (consultationId: number, force = false) => {
    // Si ya hay prescripciones en el store y no se fuerza la recarga, no hacer fetch
    if (!force && consultationStore.currentConsultation?.prescriptions?.length) {
      return
    }

    try {
      loading.value = true
      error.value = null
      const data = await PrescriptionService.getPrescriptionsByConsultation(consultationId)
      consultationStore.setCurrentConsultationPrescriptions(data)
    } catch (err: any) {
      error.value = err.message || 'Error cargando prescripciones'
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva prescripción
   * @param payload - Datos de la prescripción a crear
   */
  const createPrescription = async (payload: {
    consultation_id: number;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }) => {
    try {
      savingPrescription.value = true
      const created = await PrescriptionService.createPrescription(payload)
      consultationStore.addPrescriptionToCurrentConsultation(created)
      return created
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo crear la prescripción')
    } finally {
      savingPrescription.value = false
    }
  }

  /**
   * Actualiza una prescripción existente
   * @param id - ID de la prescripción
   * @param payload - Datos a actualizar
   */
  const updatePrescription = async (id: number, payload: Partial<Prescription>) => {
    try {
      savingPrescription.value = true
      const updated = await PrescriptionService.updatePrescription(id, payload)
      consultationStore.updatePrescriptionInCurrentConsultation(updated)
      return updated
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo actualizar la prescripción')
    } finally {
      savingPrescription.value = false
    }
  }

  /**
   * Elimina una prescripción
   * @param id - ID de la prescripción a eliminar
   */
  const deletePrescription = async (id: number) => {
    try {
      deletingPrescription.value = true
      await PrescriptionService.deletePrescription(id)
      consultationStore.removePrescriptionFromCurrentConsultation(id)
      return true
    } catch (err: any) {
      console.error(err)
      return false
    } finally {
      deletingPrescription.value = false
    }
  }

  return {
    // Estado
    prescriptions,
    loading,
    error,
    savingPrescription,
    deletingPrescription,
    searchTerm,
    medicationSuggestions,

    // Plantillas
    commonTemplates,
    respiratoryTemplates,
    cardiovascularTemplates,

    // Métodos
    searchMedications: searchMedicationsLocal,
    getAllMedications: getAllAvailableMedications,
    fetchPrescriptionsByConsultation,
    createPrescription,
    updatePrescription,
    deletePrescription
  }
}