// composables/useDiagnosisTests.ts
import { ref, computed } from 'vue'
import { DiagnosisTestService } from '@/services/diagnosisTest.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
import type { DiagnosisTest } from '@/types/diagnosisTest.types'
import { 
  TEST_CATEGORIES,
  searchDiagnosisTests,
  getTestByType,
  type TestTemplate
} from '../data/diagnosisTests.data'

export type { TestTemplate } from '../data/diagnosisTests.data'

export function useDiagnosisTests() {
  const consultationStore = useConsultationStore()

  // Usar el store como fuente única de verdad
  const diagnosisTests = computed(() => consultationStore.currentConsultation?.diagnosis_tests || [])
  
  // Estado
  const loading = ref(false)
  const savingTest = ref(false)
  const deletingTest = ref(false)
  const error = ref<string | null>(null)
  
  // Referencias a las categorías de tests desde el archivo de datos
  const laboratoryTemplates = computed(() => 
    TEST_CATEGORIES.find(category => category.id === 'laboratory')?.tests || []
  )
  
  const imagingTemplates = computed(() => 
    TEST_CATEGORIES.find(category => category.id === 'imaging')?.tests || []
  )
  
  const otherTemplates = computed(() => 
    TEST_CATEGORIES.find(category => category.id === 'other')?.tests || []
  )

  // Estado para búsqueda de tests
  const searchTerm = ref('')
  const testSuggestions = ref<TestTemplate[]>([])

  /**
   * Busca tests diagnósticos según el término de búsqueda
   */
  const searchTests = (query: string) => {
    searchTerm.value = query
    testSuggestions.value = searchDiagnosisTests(query)
    return testSuggestions.value
  }

  /**
   * Busca un test por su tipo
   */
  const findTestByType = (testType: string) => {
    return getTestByType(testType)
  }
  
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
    searchTerm,
    testSuggestions,
    
    // Plantillas
    laboratoryTemplates,
    imagingTemplates,
    otherTemplates,
    
    // Métodos
    searchTests,
    findTestByType,
    fetchDiagnosisTestsByConsultation,
    createDiagnosisTest,
    updateDiagnosisTest,
    deleteDiagnosisTest
  }
}