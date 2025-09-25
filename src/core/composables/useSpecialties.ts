import { ref, computed } from 'vue'
import { specialtyService } from '@/services/specialty.service'
import type { Specialty } from '@/types/specialty.types'
import { SpecialtyStatus } from '@/types/enums'

const specialties = ref<Specialty[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number | null>(null)

// Cache duration: 5 minutos
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Composable para manejar especialidades médicas
 * Proporciona cache automático, manejo de errores y estado compartido
 */
export function useSpecialties() {
  const activeSpecialties = computed(() =>
    specialties.value.filter(specialty => specialty.status === SpecialtyStatus.ACTIVO)
  )

  const isCacheValid = computed(() => {
    if (!lastFetch.value) return false
    return Date.now() - lastFetch.value < CACHE_DURATION
  })

  const loadSpecialties = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid.value && specialties.value.length > 0) {
      return specialties.value
    }

    loading.value = true
    error.value = null

    try {
      const data = await specialtyService.getActiveSpecialties()
      specialties.value = data
      lastFetch.value = Date.now()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar especialidades'
      error.value = errorMessage
      console.error('Error loading specialties:', err)

      if (specialties.value.length === 0) {
        throw err
      }

      return specialties.value
    } finally {
      loading.value = false
    }
  }

  const getSpecialtyById = (id: number): Specialty | undefined => {
    return specialties.value.find(specialty => specialty.id === id)
  }

  const getSpecialtyByName = (name: string): Specialty | undefined => {
    return specialties.value.find(specialty => specialty.name.toLowerCase() === name.toLowerCase())
  }

  const searchSpecialties = (searchTerm: string): Specialty[] => {
    if (!searchTerm.trim()) return activeSpecialties.value

    const term = searchTerm.toLowerCase()
    return activeSpecialties.value.filter(
      specialty =>
        specialty.name.toLowerCase().includes(term) ||
        specialty.description.toLowerCase().includes(term)
    )
  }

  const refreshSpecialties = async () => {
    return loadSpecialties(true)
  }

  const clearCache = () => {
    specialties.value = []
    loading.value = false
    error.value = null
    lastFetch.value = null
  }

  return {
    // Estado reactivo
    specialties: computed(() => specialties.value),
    activeSpecialties,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isCacheValid,

    // Métodos
    loadSpecialties,
    refreshSpecialties,
    getSpecialtyById,
    getSpecialtyByName,
    searchSpecialties,
    clearCache
  }
}
