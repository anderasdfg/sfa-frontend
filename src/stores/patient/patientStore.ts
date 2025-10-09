import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { PatientService } from '@/services/patient.service'
import type { Patient } from '@/types/medical.types'
import {
  getPatientFullName,
  calculateAge,
  getFormattedAge,
  formatGender
} from '@/utils/patient.utils'

export const usePatientStore = defineStore('patient', () => {
  // 🔹 State
  const patient = ref<Patient | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 🔹 Computed
  const patientFullName = computed(() => getPatientFullName(patient.value))
  const patientAge = computed(() => {
    if (!patient.value) return null
    return calculateAge(patient.value.date_of_birth ?? '2001-10-08')
  })
  const patientFormattedAge = computed(() => {
    if (!patient.value) return ''
    return getFormattedAge(patient.value.date_of_birth ?? '2001-10-08')
  })
  const patientGender = computed(() => {
    if (!patient.value) return ''
    return formatGender(patient.value.gender)
  })
  const patientDocument = computed(() => patient.value?.document_number ?? '')
  const patientInitials = computed(() => {
    if (!patient.value) return ''
    const firstName = patient.value.first_name?.[0] || ''
    const lastName = patient.value.last_name?.[0] || ''
    return `${firstName}${lastName}`.toUpperCase()
  })
  const hasPatient = computed(() => patient.value !== null)

  // 🔹 Actions
  const fetchPatient = async (id: number): Promise<void> => {
    loading.value = true
    error.value = null
    try {
      patient.value = await PatientService.getPatientById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar el paciente'
      patient.value = null
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearPatient = (): void => {
    patient.value = null
    error.value = null
  }

  return {
    // State
    patient,
    loading,
    error,

    // Computed
    patientFullName,
    patientAge,
    patientFormattedAge,
    patientGender,
    patientDocument,
    patientInitials,
    hasPatient,

    // Actions
    fetchPatient,
    clearPatient
  }
})
