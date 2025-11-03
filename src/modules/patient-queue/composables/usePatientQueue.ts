import { ref } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { TestOrderService } from '@/services/testOrder.service'
import type { Appointment } from '@/types/appointments.types'
import type { TestOrder } from '@/types/testOrder.types'
import { AppointmentStatus } from '@/types/enums'

// Tipo unificado para la cola de pacientes (activities pagadas)
export interface PatientQueueActivity {
  id: number
  type: 'appointment' | 'test_order'
  patient_name: string
  patient_id?: number
  doctor_name: string
  doctor_id: number
  scheduled_at: string
  status: string
  service_name: string // Specialty name o diagnostic test name
  duration_minutes?: number
  price?: number
  original_data: Appointment | TestOrder
}

export function usePatientQueue() {
  const activities = ref<PatientQueueActivity[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Función auxiliar para obtener la fecha de hoy
  const getTodayDateString = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Utility functions
  const safeParseDate = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString()
    
    if (dateValue instanceof Date) return dateValue.toISOString()
    if (typeof dateValue === 'string') return dateValue
    
    try {
      return new Date(dateValue).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  const safeParsePrice = (priceValue: any): number | undefined => {
    if (!priceValue) return undefined
    if (typeof priceValue === 'number') return priceValue
    if (typeof priceValue === 'string') {
      const parsed = parseFloat(priceValue)
      return isNaN(parsed) ? undefined : parsed
    }
    return undefined
  }

  const formatFullName = (firstName?: string, lastName?: string, prefix = ''): string => {
    if (firstName && lastName) return `${prefix}${firstName} ${lastName}`
    return prefix ? `${prefix.trim()}` : 'N/A'
  }

  const createDefaultActivity = (id: number, type: 'appointment' | 'test_order', originalData: any): PatientQueueActivity => ({
    id: id || 0,
    type,
    patient_name: 'Paciente',
    patient_id: undefined,
    doctor_name: 'Doctor', 
    doctor_id: 0,
    scheduled_at: new Date().toISOString(),
    status: 'pagado',
    service_name: type === 'appointment' ? 'Consulta médica' : 'Examen de laboratorio',
    duration_minutes: undefined,
    price: undefined,
    original_data: originalData
  })

  // Convertir appointments a activities
  const appointmentsToActivities = (appointments: Appointment[]): PatientQueueActivity[] => {
    return appointments.map((appointment): PatientQueueActivity => {
      try {
        return {
          id: appointment.id,
          type: 'appointment',
          patient_name: formatFullName(appointment.patient_data?.first_name, appointment.patient_data?.last_name) || 'Paciente',
          patient_id: appointment.patient_data?.id,
          doctor_name: formatFullName(appointment.doctor_data?.first_name, appointment.doctor_data?.last_name, 'Dr. ') || 'Doctor',
          doctor_id: appointment.doctor_data?.id || 0,
          scheduled_at: safeParseDate(appointment.slot?.scheduled_at),
          status: appointment.status,
          service_name: appointment.specialty || 'Consulta médica',
          duration_minutes: appointment.slot?.duration_minutes,
          price: safeParsePrice(appointment.slot?.price),
          original_data: appointment
        }
      } catch (error) {
        console.error('Error processing appointment:', error)
        return createDefaultActivity(appointment.id, 'appointment', appointment)
      }
    })
  }

  // Convertir test orders a activities  
  const testOrdersToActivities = (testOrders: TestOrder[]): PatientQueueActivity[] => {
    return testOrders.map((testOrder): PatientQueueActivity => {
      try {
        return {
          id: testOrder.id,
          type: 'test_order',
          patient_name: formatFullName(testOrder.patient_first_name, testOrder.patient_last_name) || 'Paciente',
          patient_id: testOrder.patient_id,
          doctor_name: formatFullName(testOrder.doctor_first_name, testOrder.doctor_last_name, 'Dr. ') || 'Doctor',
          doctor_id: testOrder.doctor_id || 0,
          scheduled_at: safeParseDate(testOrder.slot_scheduled_at),
          status: testOrder.status,
          service_name: testOrder.diagnostic_test_name || 'Examen de laboratorio',
          duration_minutes: testOrder.slot_duration_minutes,
          price: safeParsePrice(testOrder.slot_price),
          original_data: testOrder
        }
      } catch (error) {
        console.error('Error processing test order:', error)
        return createDefaultActivity(testOrder.id, 'test_order', testOrder)
      }
    })
  }

  /**
   * Obtiene todas las actividades del día (excluyendo pendientes y reservadas)
   */
  const fetchTodayPaidActivities = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const dateString = getTodayDateString()

      // Obtener todas las appointments del día
      const appointmentsPromise = AppointmentService.getAppointments({
        date_from: dateString,
        date_to: dateString
        // Sin filtrar por status - traemos todos
      })

      // Obtener todas las test orders del día
      const testOrdersPromise = TestOrderService.getTestOrders({
        date_from: dateString,
        date_to: dateString
        // Sin filtrar por status - traemos todos
      })

      const [appointmentsResponse, testOrdersResponse] = await Promise.all([
        appointmentsPromise,
        testOrdersPromise
      ])

      const allActivities: PatientQueueActivity[] = []

      // Procesar appointments (excluir reservadas)
      if (appointmentsResponse?.data && Array.isArray(appointmentsResponse.data)) {
        const filteredAppointments = appointmentsResponse.data.filter(appointment => 
          appointment.status !== AppointmentStatus.RESERVADA
        )
        const appointmentActivities = appointmentsToActivities(filteredAppointments)
        allActivities.push(...appointmentActivities)
      }

      // Procesar test orders (excluir pendientes)
      if (testOrdersResponse && Array.isArray(testOrdersResponse)) {
        const filteredTestOrders = testOrdersResponse.filter(testOrder => 
          testOrder.status !== 'pendiente'
        )
        const testOrderActivities = testOrdersToActivities(filteredTestOrders)
        allActivities.push(...testOrderActivities)
      }

      // Ordenar por hora programada
      activities.value = allActivities.sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )

    } catch (err) {
      console.error('Error fetching today activities:', err)
      error.value = 'No se pudieron cargar las actividades de hoy. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  /**
   * Marca que el paciente ha llegado (cambia estado a 'en_espera')
   */
  const markPatientArrived = async (activity: PatientQueueActivity): Promise<boolean> => {
    try {
      if (activity.type === 'appointment') {
        await AppointmentService.updateAppointmentStatus(activity.id, { status: 'en_espera' })
      } else if (activity.type === 'test_order') {
        await TestOrderService.updateTestOrder(activity.id, { status: 'en_espera' })
      }

      // Actualizar el estado localmente
      const activityIndex = activities.value.findIndex(a => 
        a.type === activity.type && a.id === activity.id
      )
      if (activityIndex !== -1) {
        activities.value[activityIndex].status = 'en_espera'
      }

      return true
    } catch (error) {
      console.error('Error marking patient as arrived:', error)
      throw new Error('No se pudo marcar la llegada del paciente')
    }
  }

  /**
   * Obtiene estadísticas de la cola del día
   */
  const getQueueStats = () => {
    const total = activities.value.length
    const appointments = activities.value.filter(a => a.type === 'appointment').length
    const testOrders = activities.value.filter(a => a.type === 'test_order').length
    const waiting = activities.value.filter(a => a.status === 'en_espera').length
    const paid = activities.value.filter(a => a.status === 'pagada' || a.status === 'pagado').length
    const inProcess = activities.value.filter(a => a.status === 'en_proceso').length
    const completed = activities.value.filter(a => ['completado', 'completada', 'realizada'].includes(a.status)).length
    const cancelled = activities.value.filter(a => ['cancelado', 'cancelada'].includes(a.status)).length

    return {
      total,
      appointments,
      testOrders,
      waiting,
      paid,
      inProcess,
      completed,
      cancelled
    }
  }

  return {
    activities,
    loading,
    error,
    fetchTodayPaidActivities,
    markPatientArrived,
    getQueueStats
  }
}