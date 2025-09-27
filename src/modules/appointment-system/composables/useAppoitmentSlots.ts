import { ref, computed } from 'vue'
import { SlotService } from '@/services/slots.service'
import type { AppointmentSlot, AppointmentSlotQueryParams } from '@/types/slots.types'
import { AppointmentModality } from '@/types/enums'
import type { Doctor } from '../types'
import { adaptSlotsToDoctor } from '../adapters/slots.adapter'

const slots = ref<AppointmentSlot[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number | null>(null)
const lastQueryParams = ref<string | null>(null)

const CACHE_DURATION = 5 * 60 * 1000

export function useAppoitmentSlots() {
  const isCacheValid = (queryParams: AppointmentSlotQueryParams) => {
    if (!lastFetch.value || !lastQueryParams.value) return false

    const currentParamsKey = JSON.stringify(queryParams)
    const isSameParams = lastQueryParams.value === currentParamsKey
    const isTimeValid = Date.now() - lastFetch.value < CACHE_DURATION

    return isSameParams && isTimeValid && slots.value.length > 0
  }

  const loadSlots = async (queryParams: AppointmentSlotQueryParams, forceRefresh = false) => {
    if (!forceRefresh && isCacheValid(queryParams)) {
      return slots.value
    }

    loading.value = true
    error.value = null

    try {
      const data = await SlotService.getSlots(queryParams)
      console.log('Slots loaded successfully:', data.length)
      slots.value = data
      lastFetch.value = Date.now()
      lastQueryParams.value = JSON.stringify(queryParams)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar slots'
      error.value = errorMessage
      console.error('Error loading slots:', err)

      if (slots.value.length === 0) {
        throw err
      }

      return slots.value
    } finally {
      loading.value = false
    }
  }

  const refreshSlots = async () => {
    return loadSlots(
      {
        date: new Date().toISOString(),
        specialty_id: 1,
        modality: AppointmentModality.PRESENCIAL,
        doctor_id: null
      },
      true
    )
  }

  const clearCache = () => {
    slots.value = []
    loading.value = false
    error.value = null
    lastFetch.value = null
    lastQueryParams.value = null
  }

  /**
   * Obtiene los slots adaptados al formato del frontend
   */
  const getAdaptedDoctors = (): Doctor[] => {
    return adaptSlotsToDoctor(slots.value)
  }

  return {
    // Estado reactivo
    slots: computed(() => slots.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Métodos
    loadSlots,
    refreshSlots,
    clearCache,
    getAdaptedDoctors
  }
}
