import { storeToRefs } from 'pinia'
import { usePatientStore } from '@/stores/patient/patientStore'

export function usePatients() {
  const patientStore = usePatientStore()

  // Usar storeToRefs para preservar reactividad
  const {
    patient,
    loading,
    error,
    patientFullName,
    patientAge,
    patientFormattedAge,
    patientGender,
    patientDocument,
    patientInitials,
    hasPatient
  } = storeToRefs(patientStore)

  return {
    // State reactivo
    patient,
    loading,
    error,
    patientFullName,
    patientAge,
    patientFormattedAge,
    patientGender,
    patientDocument,
    patientInitials,
    hasPatient,

    // Actions (no necesitan storeToRefs)
    fetchPatient: patientStore.fetchPatient,
    clearPatient: patientStore.clearPatient
  }
}
