// composables/useDiagnosisTests.ts
import { ref, computed } from 'vue'
import { DiagnosisTestService } from '@/services/diagnosisTest.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
import type { DiagnosisTest } from '@/types/diagnosisTest.types'

export interface TestTemplate {
  id: number
  test_type: string
  description: string
  category: 'laboratory' | 'imaging' | 'other'
}

export function useDiagnosisTests() {
  const consultationStore = useConsultationStore()

  // Usar el store como fuente única de verdad
  const diagnosisTests = computed(() => consultationStore.currentConsultation?.diagnosis_tests || [])
  
  // Estado
  const loading = ref(false)
  const savingTest = ref(false)
  const deletingTest = ref(false)
  const error = ref<string | null>(null)

  // Plantillas de exámenes comunes
  const laboratoryTemplates = ref<TestTemplate[]>([
    {
      id: 1,
      test_type: 'Hemograma completo',
      description: 'Análisis completo de sangre para evaluar células sanguíneas y otros componentes.',
      category: 'laboratory'
    },
    {
      id: 2,
      test_type: 'Perfil lipídico',
      description: 'Medición de colesterol total, HDL, LDL y triglicéridos en sangre.',
      category: 'laboratory'
    },
    {
      id: 3,
      test_type: 'Glucosa en ayunas',
      description: 'Medición de niveles de glucosa en sangre después de ayuno nocturno.',
      category: 'laboratory'
    }
  ])

  const imagingTemplates = ref<TestTemplate[]>([
    {
      id: 4,
      test_type: 'Radiografía de tórax',
      description: 'Imagen de los pulmones, corazón y estructuras torácicas.',
      category: 'imaging'
    },
    {
      id: 5,
      test_type: 'Ecografía abdominal',
      description: 'Evaluación por ultrasonido de órganos abdominales.',
      category: 'imaging'
    },
    {
      id: 6,
      test_type: 'Tomografía computarizada',
      description: 'Imágenes detalladas en cortes transversales del área solicitada.',
      category: 'imaging'
    }
  ])

  const otherTemplates = ref<TestTemplate[]>([
    {
      id: 7,
      test_type: 'Electrocardiograma',
      description: 'Registro de la actividad eléctrica del corazón.',
      category: 'other'
    },
    {
      id: 8,
      test_type: 'Espirometría',
      description: 'Medición de la función pulmonar y capacidad respiratoria.',
      category: 'other'
    }
  ])

  /**
   * Carga los exámenes diagnósticos para una consulta específica
   * @param consultationId - ID de la consulta
   * @param force - Forzar recarga aunque ya existan datos en el store
   */
  const fetchDiagnosisTestsByConsultation = async (consultationId: number, force = false) => {
    // Si ya hay exámenes diagnósticos en el store y no se fuerza la recarga, no hacer fetch
    if (!force && consultationStore.currentConsultation?.diagnosis_tests?.length) {
      return
    }

    try {
      loading.value = true
      error.value = null
      const data = await DiagnosisTestService.getDiagnosisTestsByConsultation(consultationId)
      consultationStore.setCurrentConsultationDiagnosisTests(data)
    } catch (err: any) {
      error.value = err.message || 'Error cargando exámenes diagnósticos'
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un nuevo examen diagnóstico
   * @param payload - Datos del examen a crear
   */
  const createDiagnosisTest = async (payload: {
    consultation_id: number
    test_type: string
    description: string
    result?: string
    test_date?: string
  }) => {
    try {
      savingTest.value = true
      const created = await DiagnosisTestService.createDiagnosisTest(payload)
      consultationStore.addDiagnosisTestToCurrentConsultation(created)
      return created
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo crear el examen diagnóstico')
    } finally {
      savingTest.value = false
    }
  }

  /**
   * Actualiza un examen diagnóstico existente
   * @param id - ID del examen diagnóstico
   * @param payload - Datos a actualizar
   */
  const updateDiagnosisTest = async (id: number, payload: Partial<DiagnosisTest>) => {
    try {
      savingTest.value = true
      const updated = await DiagnosisTestService.updateDiagnosisTest(id, payload)
      consultationStore.updateDiagnosisTestInCurrentConsultation(updated)
      return updated
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo actualizar el examen diagnóstico')
    } finally {
      savingTest.value = false
    }
  }

  /**
   * Elimina un examen diagnóstico
   * @param id - ID del examen diagnóstico a eliminar
   */
  const deleteDiagnosisTest = async (id: number) => {
    try {
      deletingTest.value = true
      await DiagnosisTestService.deleteDiagnosisTest(id)
      consultationStore.removeDiagnosisTestFromCurrentConsultation(id)
      return true
    } catch (err: any) {
      console.error(err)
      return false
    } finally {
      deletingTest.value = false
    }
  }

  return {
    // Estado
    diagnosisTests,
    loading,
    error,
    savingTest,
    deletingTest,
    
    // Plantillas
    laboratoryTemplates,
    imagingTemplates,
    otherTemplates,
    
    // Métodos
    fetchDiagnosisTestsByConsultation,
    createDiagnosisTest,
    updateDiagnosisTest,
    deleteDiagnosisTest
  }
}