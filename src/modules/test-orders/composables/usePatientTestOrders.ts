import { ref } from 'vue'
import { TestOrderService } from '@/services/testOrder.service'
import type { TestOrder } from '@/types/testOrder.types'
import { useAuthStore } from '@/stores/auth/authStore'

export function usePatientTestOrders() {
  const authStore = useAuthStore()
  const testOrders = ref<TestOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPatientTestOrders = async (): Promise<void> => {
    if (!authStore.user?.patient_id) {
      error.value = 'ID de paciente no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await TestOrderService.getTestOrders({
        patient_id: authStore.user.patient_id
      })

      // Verificar si la respuesta es un array
      if (response && Array.isArray(response)) {
        testOrders.value = response
      } else {
        console.error('Unexpected API response format:', response)
        throw new Error('Formato de respuesta del servidor inesperado')
      }
    } catch (err) {
      console.error('Error fetching patient test orders:', err)
      error.value = 'No se pudieron cargar las órdenes de exámenes. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return {
    testOrders,
    loading,
    error,
    fetchPatientTestOrders
  }
}
