import { ref, computed } from 'vue'
import { DoctorService } from '@/services/doctors.service'
import type { Doctor } from '@/types/doctor.types'

const doctors = ref<Doctor[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number | null>(null)

const CACHE_DURATION = 5 * 60 * 1000

export function useDoctors() {
  const isCacheValid = computed(() => {
    if (!lastFetch.value) return false
    return Date.now() - lastFetch.value < CACHE_DURATION
  })

  const doctorsWithFullNames = computed(() =>
    doctors.value.map(doctor => ({
      ...doctor,
      fullName:
        `Dr${doctor.gender === 'femenino' ? 'a' : ''}. ${doctor.first_name} ${doctor.last_name}`.trim(),
      displayName: `${doctor.first_name} ${doctor.last_name}`.trim()
    }))
  )

  const loadDoctors = async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid.value && doctors.value.length > 0) {
      return doctors.value
    }

    loading.value = true
    error.value = null

    try {
      const data = await DoctorService.getDoctors()
      console.log('Doctors loaded successfully:', data.length)
      doctors.value = data
      lastFetch.value = Date.now()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar médicos'
      error.value = errorMessage
      console.error('Error loading doctors:', err)

      if (doctors.value.length === 0) {
        throw err
      }

      return doctors.value
    } finally {
      loading.value = false
    }
  }

  const getDoctorById = (id: number): Doctor | undefined => {
    return doctors.value.find(doctor => doctor.id === id)
  }

  const getDoctorsBySpecialtyId = (specialtyId: number) => {
    return doctorsWithFullNames.value.filter(doctor => doctor.specialty_id === specialtyId)
  }

  const getDoctorsBySpecialtyName = (specialtyName: string) => {
    return doctorsWithFullNames.value.filter(
      doctor => doctor.specialty_name.toLowerCase() === specialtyName.toLowerCase()
    )
  }

  const refreshDoctors = async () => {
    return loadDoctors(true)
  }

  const clearCache = () => {
    doctors.value = []
    loading.value = false
    error.value = null
    lastFetch.value = null
  }

  return {
    // Estado reactivo
    doctors: computed(() => doctors.value),
    doctorsWithFullNames,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    isCacheValid,

    // Métodos
    loadDoctors,
    refreshDoctors,
    getDoctorById,
    getDoctorsBySpecialtyId,
    getDoctorsBySpecialtyName,
    clearCache
  }
}
