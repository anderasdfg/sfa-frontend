import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConsultationService } from '@/services/consultations.service'
import { DiagnosisService } from '@/services/diagnosis.service'
import { TestOrderService } from '@/services/testOrder.service'
import { PrescriptionService } from '@/services/prescriptions.service'
import type { Consultation, ConsultationCreateRequest } from '@/types/medical.types'
import type { Diagnosis } from '@/types/diagnosis.types'
import type { TestOrder } from '@/types/testOrder.types'
import type { Prescription } from '@/types/prescriptions.types'

export const useConsultationStore = defineStore('consultation', () => {
  // 🔹 State
  const currentConsultation = ref<Consultation | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const diagnosis = ref<Diagnosis[]>([])
  const loadingDiagnosis = ref(false)
  
  const testOrders = ref<TestOrder[]>([])
  const loadingTestOrders = ref(false)
  
  const prescriptions = ref<Prescription[]>([])
  const loadingPrescriptions = ref(false)

  // 🔹 Getters
  const hasActiveConsultation = computed(() => currentConsultation.value !== null)
  const consultationId = computed(() => currentConsultation.value?.id ?? null)

  // === Consultas ===
  const fetchConsultationByAppointment = async (
    appointmentId: number
  ): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null
      const consultations = await ConsultationService.getConsultations({
        appointment_id: appointmentId
      })
      const consultation = consultations?.[0] ?? null
      currentConsultation.value = consultation

      // Cargar diagnósticos, exámenes diagnósticos y prescripciones si la consulta existe
      if (consultation?.id) {
        await fetchDiagnosisByConsultation(consultation.id)
        await fetchTestOrdersByConsultation(consultation.id)
        await fetchPrescriptionsByConsultation(consultation.id)
      }

      return consultation
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la consulta'
      console.error(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchConsultation = async (id: number): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null
      const consultation = await ConsultationService.getConsultationById(id)
      currentConsultation.value = consultation

      // Cargar diagnósticos, exámenes diagnósticos y prescripciones
      if (consultation?.id) {
        await fetchDiagnosisByConsultation(consultation.id)
        await fetchTestOrdersByConsultation(consultation.id)
        await fetchPrescriptionsByConsultation(consultation.id)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar la consulta'
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }

  const createConsultation = async (appointmentId: number): Promise<Consultation | null> => {
    try {
      isLoading.value = true
      error.value = null
      const consultationData: ConsultationCreateRequest = { appointment_id: appointmentId }
      const consultation = await ConsultationService.createConsultation(consultationData)
      currentConsultation.value = consultation

      // Nueva consulta = no hay diagnósticos previos
      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = []
      }

      return consultation
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la consulta'
      console.error(err)

      if (errorMessage.includes('Ya existe una consulta asociada')) {
        const existing = await fetchConsultationByAppointment(appointmentId)
        if (existing) {
          error.value = null
          return existing
        }
      }

      error.value = errorMessage
      return null
    } finally {
      isLoading.value = false
    }
  }

  const startConsultationFlow = async (appointmentId: number): Promise<Consultation | null> => {
    const consultation = await fetchConsultationByAppointment(appointmentId)
    if (!consultation) return await createConsultation(appointmentId)
    return consultation
  }

  // === Anamnesis ===
  /*   const completeAnamnesis = async (chief_complaint: string) => {
    if (!currentConsultation.value?.id) return null

    try {
      isLoading.value = true
      const updated = await ConsultationService.updateConsultation(currentConsultation.value.id, {
        chief_complaint
      } as ConsultationCreateRequest)

      // ✅ Solo se actualiza el campo, no se reemplaza el objeto completo
      if (currentConsultation.value) {
        currentConsultation.value.chief_complaint = updated.chief_complaint
      }

      return updated
    } catch (err) {
      console.error('Error updating consultation step:', err)
      error.value = 'No se pudo actualizar la consulta'
      return null
    } finally {
      isLoading.value = false
    }
  } */

  // === Diagnósticos ===
  const fetchDiagnosisByConsultation = async (consultationId: number) => {
    try {
      loadingDiagnosis.value = true
      const result = await DiagnosisService.getDiagnosisByConsultation(consultationId)
      diagnosis.value = result
      if (currentConsultation.value) {
        currentConsultation.value.diagnosis = result
      }
    } catch (err) {
      console.error('Error fetching diagnosis:', err)
    } finally {
      loadingDiagnosis.value = false
    }
  }

  const createDiagnosis = async (data: {
    consultation_id: number
    cie10_code: string
    description: string
    diagnosis_type: 'presuntivo' | 'definitivo'
  }) => {
    const newDiagnosis = await DiagnosisService.createDiagnosis(data)
    diagnosis.value.push(newDiagnosis)
    if (currentConsultation.value) {
      currentConsultation.value.diagnosis = [...diagnosis.value]
    }
    return newDiagnosis
  }

  const updateDiagnosis = async (id: number, data: Partial<Diagnosis>) => {
    const updated = await DiagnosisService.updateDiagnosis(id, data)
    const index = diagnosis.value.findIndex(d => d.id === id)
    if (index !== -1) diagnosis.value[index] = updated
    if (currentConsultation.value) {
      currentConsultation.value.diagnosis = [...diagnosis.value]
    }
    return updated
  }

  const deleteDiagnosis = async (id: number) => {
    await DiagnosisService.deleteDiagnosis(id)
    diagnosis.value = diagnosis.value.filter(d => d.id !== id)
    if (currentConsultation.value) {
      currentConsultation.value.diagnosis = [...diagnosis.value]
    }
    return true
  }

  // 🔹 Métodos para manejar diagnósticos dentro de la consulta actual
  const setCurrentConsultationDiagnosis = (diagnosisList: any[]) => {
    if (!currentConsultation.value) return
    currentConsultation.value.diagnosis = diagnosisList
  }
  const addDiagnosisToCurrentConsultation = (newDiagnosis: any) => {
    if (!currentConsultation.value) return
    if (!currentConsultation.value.diagnosis) {
      currentConsultation.value.diagnosis = []
    }
    currentConsultation.value.diagnosis.push(newDiagnosis)
  }

  const updateDiagnosisInCurrentConsultation = (updatedDiagnosis: any) => {
    if (!currentConsultation.value?.diagnosis) return

    const index = currentConsultation.value.diagnosis.findIndex((d: any) => d.id === updatedDiagnosis.id)
    if (index !== -1) {
      currentConsultation.value.diagnosis[index] = updatedDiagnosis
    }
  }

  const removeDiagnosisFromCurrentConsultation = (diagnosisId: number) => {
    if (!currentConsultation.value?.diagnosis) return
    const index = currentConsultation.value.diagnosis.findIndex((d: any) => d.id === diagnosisId)
    if (index !== -1) {
      currentConsultation.value.diagnosis.splice(index, 1)
    }
  }

  // 🔹 Métodos para manejar órdenes de exámenes dentro de la consulta actual
  const fetchTestOrdersByConsultation = async (consultationId: number) => {
    try {
      loadingTestOrders.value = true
      const result = await TestOrderService.getTestOrdersByConsultation(consultationId)
      testOrders.value = result
      if (currentConsultation.value) {
        currentConsultation.value.diagnosis_tests = result
      }
    } catch (err) {
      console.error('Error fetching test orders:', err)
    } finally {
      loadingTestOrders.value = false
    }
  }

  const setCurrentConsultationTestOrders = (testOrdersList: TestOrder[]) => {
    if (!currentConsultation.value) return
    currentConsultation.value.diagnosis_tests = testOrdersList
  }
  
  const addTestOrderToCurrentConsultation = (newTestOrder: TestOrder) => {
    if (!currentConsultation.value) return
    if (!currentConsultation.value.diagnosis_tests) {
      currentConsultation.value.diagnosis_tests = []
    }
    currentConsultation.value.diagnosis_tests.push(newTestOrder)
  }

  const updateTestOrderInCurrentConsultation = (updatedTestOrder: TestOrder) => {
    if (!currentConsultation.value?.diagnosis_tests) return

    const index = currentConsultation.value.diagnosis_tests.findIndex(dt => dt.id === updatedTestOrder.id)
    if (index !== -1) {
      currentConsultation.value.diagnosis_tests[index] = updatedTestOrder
    }
  }

  const removeTestOrderFromCurrentConsultation = (testOrderId: number) => {
    if (!currentConsultation.value?.diagnosis_tests) return
    const index = currentConsultation.value.diagnosis_tests.findIndex(dt => dt.id === testOrderId)
    if (index !== -1) {
      currentConsultation.value.diagnosis_tests.splice(index, 1)
    }
  }
  
  // 🔹 Métodos para manejar prescripciones dentro de la consulta actual
  const fetchPrescriptionsByConsultation = async (consultationId: number) => {
    try {
      loadingPrescriptions.value = true
      const result = await PrescriptionService.getPrescriptionsByConsultation(consultationId)
      prescriptions.value = result
      if (currentConsultation.value) {
        currentConsultation.value.prescriptions = result
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
    } finally {
      loadingPrescriptions.value = false
    }
  }

  const setCurrentConsultationPrescriptions = (prescriptionsList: Prescription[]) => {
    if (!currentConsultation.value) return
    currentConsultation.value.prescriptions = prescriptionsList
  }
  
  const addPrescriptionToCurrentConsultation = (newPrescription: Prescription) => {
    if (!currentConsultation.value) return
    if (!currentConsultation.value.prescriptions) {
      currentConsultation.value.prescriptions = []
    }
    currentConsultation.value.prescriptions.push(newPrescription)
  }

  const updatePrescriptionInCurrentConsultation = (updatedPrescription: Prescription) => {
    if (!currentConsultation.value?.prescriptions) return

    const index = currentConsultation.value.prescriptions.findIndex(p => p.id === updatedPrescription.id)
    if (index !== -1) {
      currentConsultation.value.prescriptions[index] = updatedPrescription
    }
  }

  const removePrescriptionFromCurrentConsultation = (prescriptionId: number) => {
    if (!currentConsultation.value?.prescriptions) return
    const index = currentConsultation.value.prescriptions.findIndex(p => p.id === prescriptionId)
    if (index !== -1) {
      currentConsultation.value.prescriptions.splice(index, 1)
    }
  }

  async function updateConsultationField(field: string, value: any) {
    if (!currentConsultation.value?.id) {
      console.error('No se puede actualizar: consulta sin ID')
      return
    }

    try {
      const updated = await ConsultationService.updateConsultation(currentConsultation.value.id, {
        [field]: value
      } as ConsultationCreateRequest)

      // Actualizar el campo específico sin romper la reactividad
      Object.assign(currentConsultation.value, updated)
    } catch (err) {
      console.error('Error actualizando campo de consulta:', err)
    }
  }

  // === Otros helpers ===
  const clearConsultation = () => {
    currentConsultation.value = null
    diagnosis.value = []
    testOrders.value = []
    prescriptions.value = []
    error.value = null
  }

  const resetError = () => (error.value = null)

  return {
    currentConsultation,
    diagnosis,
    testOrders,
    prescriptions,
    isLoading,
    loadingDiagnosis,
    loadingTestOrders,
    loadingPrescriptions,
    error,
    hasActiveConsultation,
    consultationId,
    // Consultas
    createConsultation,
    fetchConsultation,
    fetchConsultationByAppointment,
    startConsultationFlow,
    //completeAnamnesis,
    // Diagnósticos
    fetchDiagnosisByConsultation,
    createDiagnosis,
    updateDiagnosis,
    deleteDiagnosis,
    setCurrentConsultationDiagnosis,
    addDiagnosisToCurrentConsultation,
    updateDiagnosisInCurrentConsultation,
    removeDiagnosisFromCurrentConsultation,
    // Órdenes de exámenes
    fetchTestOrdersByConsultation,
    setCurrentConsultationTestOrders,
    addTestOrderToCurrentConsultation,
    updateTestOrderInCurrentConsultation,
    removeTestOrderFromCurrentConsultation,
    // Prescripciones
    fetchPrescriptionsByConsultation,
    setCurrentConsultationPrescriptions,
    addPrescriptionToCurrentConsultation,
    updatePrescriptionInCurrentConsultation,
    removePrescriptionFromCurrentConsultation,
    // Utilidades
    updateConsultationField,
    clearConsultation,
    resetError
  }
})
