// composables/useDiagnosisTests.ts
import { ref, computed } from 'vue'
import { TestOrderService } from '@/services/testOrder.service'
import { useConsultationStore } from '@/stores/consultation/consultationStore'
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
  const testOrders = computed(() => consultationStore.currentConsultation?.diagnosis_tests || [])
  
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
   * Carga las órdenes de exámenes para una consulta específica
   * @param consultationId - ID de la consulta
   * @param force - Forzar recarga aunque ya existan datos en el store
   */
  const fetchTestOrdersByConsultation = async (consultationId: number, force = false) => {
    // Si ya hay órdenes de exámenes en el store y no se fuerza la recarga, no hacer fetch
    if (!force && consultationStore.currentConsultation?.diagnosis_tests?.length) {
      return
    }

    try {
      loading.value = true
      error.value = null
      const data = await TestOrderService.getTestOrdersByConsultation(consultationId)
      consultationStore.setCurrentConsultationTestOrders(data)
    } catch (err: any) {
      error.value = err.message || 'Error cargando órdenes de exámenes'
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea una nueva orden de examen
   * @param payload - Datos de la orden a crear
   */
  const createTestOrder = async (payload: {
    consultation_id: number
    diagnostic_test_id?: number
    diagnostic_test_name: string
    diagnostic_test_cpt_code?: string
    diagnostic_test_description?: string
    diagnostic_test_patient_instructions?: string
    status: string
    payment_id?: number
  }) => {
    try {
      savingTest.value = true
      const created = await TestOrderService.createTestOrder(payload)
      consultationStore.addTestOrderToCurrentConsultation(created)
      return created
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo crear la orden de examen')
    } finally {
      savingTest.value = false
    }
  }

  /**
   * Actualiza una orden de examen existente
   * @param id - ID de la orden de examen
   * @param payload - Datos a actualizar
   */
  const updateTestOrder = async (id: number, payload: {
    diagnostic_test_id?: number
    diagnostic_test_name: string
    diagnostic_test_cpt_code?: string
    diagnostic_test_description?: string
    diagnostic_test_patient_instructions?: string
    status: string
    payment_id?: number
  }) => {
    try {
      savingTest.value = true
      const updated = await TestOrderService.updateTestOrder(id, payload)
      consultationStore.updateTestOrderInCurrentConsultation(updated)
      return updated
    } catch (err: any) {
      console.error(err)
      throw new Error(err.message || 'No se pudo actualizar la orden de examen')
    } finally {
      savingTest.value = false
    }
  }

  /**
   * Elimina una orden de examen
   * @param id - ID de la orden de examen a eliminar
   */
  const deleteTestOrder = async (id: number) => {
    try {
      deletingTest.value = true
      await TestOrderService.deleteTestOrder(id)
      consultationStore.removeTestOrderFromCurrentConsultation(id)
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
    testOrders,
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
    fetchTestOrdersByConsultation,
    createTestOrder,
    updateTestOrder,
    deleteTestOrder
  }
}