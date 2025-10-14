// composables/usePrescription.ts
import { ref, computed } from 'vue'
import { PrescriptionService } from '@/services/prescriptions.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
import type { Prescription } from '@/types/prescriptions.types'

export interface PrescriptionTemplate {
  id: number
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  category: 'common' | 'antibiotics' | 'analgesics' | 'respiratory' | 'cardiovascular' | 'other'
}

export function usePrescription() {
  const consultationStore = useConsultationStore()

  // Usar el store como fuente única de verdad
  const prescriptions = computed(() => consultationStore.currentConsultation?.prescriptions || [])
  
  // Estado
  const loading = ref(false)
  const error = ref<string | null>(null)
  const savingPrescription = ref(false)
  const deletingPrescription = ref(false)

  // Plantillas de prescripciones comunes
  const commonTemplates = ref<PrescriptionTemplate[]>([
    {
      id: 1,
      medication: 'Omnicortil (10mg)',
      dosage: '1 tableta',
      frequency: '2 veces al día',
      duration: '5 días',
      instructions: 'Tomar después de las comidas',
      category: 'common'
    },
    {
      id: 2,
      medication: 'Evapara (650)',
      dosage: '1 tableta',
      frequency: '2 veces al día',
      duration: '5 días',
      instructions: 'Tomar si hay dolor o fiebre',
      category: 'common'
    },
    {
      id: 3,
      medication: 'Flunivib 10',
      dosage: '1 tableta',
      frequency: '1 vez al día',
      duration: '7 días',
      instructions: 'Tomar por la mañana con alimentos',
      category: 'common'
    }
  ])

  const respiratoryTemplates = ref<PrescriptionTemplate[]>([
    {
      id: 4,
      medication: 'Calfix k2',
      dosage: '1 tableta',
      frequency: '2 veces al día',
      duration: '7 días',
      instructions: 'Tomar antes de las comidas',
      category: 'respiratory'
    },
    {
      id: 5,
      medication: 'Altidol plus',
      dosage: '1 tableta',
      frequency: '3 veces al día',
      duration: '5 días',
      instructions: 'Tomar cada 8 horas',
      category: 'respiratory'
    }
  ])

  const cardiovascularTemplates = ref<PrescriptionTemplate[]>([
    {
      id: 6,
      medication: 'Amlodipina 5mg',
      dosage: '1 tableta',
      frequency: '1 vez al día',
      duration: '30 días',
      instructions: 'Tomar por la mañana con alimentos',
      category: 'cardiovascular'
    },
    {
      id: 7,
      medication: 'Losartan 50mg',
      dosage: '1 tableta',
      frequency: '2 veces al día',
      duration: '30 días',
      instructions: 'Tomar con un vaso de agua',
      category: 'cardiovascular'
    }
  ])

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

    // Plantillas
    commonTemplates,
    respiratoryTemplates,
    cardiovascularTemplates,

    // Métodos
    fetchPrescriptionsByConsultation,
    createPrescription,
    updatePrescription,
    deletePrescription
  }
}