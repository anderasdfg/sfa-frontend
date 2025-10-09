import { usePatientStore } from '@/stores/patient/patientStore'

export function usePatients(patientId?: number) {
  const patientStore = usePatientStore()

  if (patientId) {
    patientStore.fetchPatient(patientId)
  }

  return {
    ...patientStore
  }
}
