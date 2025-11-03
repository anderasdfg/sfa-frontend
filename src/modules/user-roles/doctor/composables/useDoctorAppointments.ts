import { ref } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { TestOrderService } from '@/services/testOrder.service'
import type { Appointment, AppointmentQueryParams } from '@/types/appointments.types'
import type { TestOrder } from '@/types/testOrder.types'
import { useAuthStore } from '@/stores/auth/authStore'

// Tipo unificado para appointments y test orders
export interface DoctorActivityItem {
  id: number
  type: 'appointment' | 'test_order'
  patient_name: string
  patient_id?: number
  scheduled_at: string
  status: string
  modality?: string // Solo para appointments
  diagnostic_test_name?: string // Solo para test orders
  slot_price?: number
  slot_duration_minutes?: number
  specialty_name?: string
  original_data: Appointment | TestOrder
}

export function useDoctorAppointments() {
  const authStore = useAuthStore()
  const appointments = ref<Appointment[]>([])
  const testOrders = ref<TestOrder[]>([])
  const todayAppointments = ref<Appointment[]>([])
  const todayActivities = ref<DoctorActivityItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchDoctorAppointments = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const params: AppointmentQueryParams = {
        doctor_id: authStore.user.doctor_id
      }

      const response = await AppointmentService.getAppointments(params)

      if (response && response.data && Array.isArray(response.data)) {
        appointments.value = response.data.map(appointment => ({
          ...appointment,
          patient_name: appointment.patient_data
            ? `${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`
            : 'Paciente',
          appointment_date: appointment.appointment_date || new Date().toISOString()
        }))
      } else {
        console.error('Unexpected API response format:', response)
        throw new Error('Formato de respuesta del servidor inesperado')
      }
    } catch (err) {
      console.error('Error fetching doctor appointments:', err)
      error.value = 'No se pudieron cargar las citas. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  const fetchDoctorTestOrders = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const params = {
        doctor_id: authStore.user.doctor_id
      }

      testOrders.value = await TestOrderService.getTestOrders(params)
    } catch (err) {
      console.error('Error fetching doctor test orders:', err)
      error.value = 'No se pudieron cargar las órdenes de examen. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  // Función auxiliar para obtener la fecha de hoy
  const getTodayDateString = (): string => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Función auxiliar para obtener appointments de hoy
  const fetchTodayAppointmentsData = async (dateString: string) => {
    const params: AppointmentQueryParams = {
      doctor_id: authStore.user!.doctor_id,
      date_from: dateString,
      date_to: dateString
    }

    const response = await AppointmentService.getAppointments(params)

    if (response?.data && Array.isArray(response.data)) {
      return response.data.map(appointment => ({
        ...appointment,
        patient_name: appointment.patient_data
          ? `${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`
          : 'Paciente',
        appointment_date: appointment.appointment_date || new Date().toISOString()
      }))
    }
    
    throw new Error('Formato de respuesta del servidor inesperado')
  }

  const fetchTodayAppointments = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const dateString = getTodayDateString()
      todayAppointments.value = await fetchTodayAppointmentsData(dateString)
    } catch (err) {
      console.error('Error fetching today appointments:', err)
      error.value = 'No se pudieron cargar las citas de hoy. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
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

  const formatFullName = (firstName?: string, lastName?: string): string => {
    if (firstName && lastName) return `${firstName} ${lastName}`
    return 'Paciente'
  }

  const createDefaultActivity = (id: number, type: 'appointment' | 'test_order', originalData: any): DoctorActivityItem => ({
    id: id || 0,
    type,
    patient_name: 'Paciente',
    patient_id: undefined,
    scheduled_at: new Date().toISOString(),
    status: 'pagado',
    modality: type === 'appointment' ? 'presencial' : undefined,
    diagnostic_test_name: type === 'test_order' ? 'Examen de laboratorio' : undefined,
    slot_price: undefined,
    slot_duration_minutes: undefined,
    specialty_name: undefined,
    original_data: originalData
  })

  // Función auxiliar para convertir appointments a activities
  const appointmentsToActivities = (appointments: Appointment[]): DoctorActivityItem[] => {
    return appointments.map((appointment): DoctorActivityItem => {
      try {
        return {
          id: appointment.id,
          type: 'appointment',
          patient_name: formatFullName(appointment.patient_data?.first_name, appointment.patient_data?.last_name),
          patient_id: appointment.patient_data?.id,
          scheduled_at: safeParseDate(appointment.slot?.scheduled_at),
          status: appointment.status,
          modality: appointment.modality,
          slot_price: safeParsePrice(appointment.slot?.price),
          slot_duration_minutes: appointment.slot?.duration_minutes,
          specialty_name: appointment.specialty,
          original_data: appointment
        }
      } catch (error) {
        console.error('Error processing appointment:', error)
        return createDefaultActivity(appointment.id, 'appointment', appointment)
      }
    })
  }

  // Función auxiliar para convertir test orders a activities
  const testOrdersToActivities = (testOrders: TestOrder[]): DoctorActivityItem[] => {
    return testOrders.map((testOrder): DoctorActivityItem => {
      try {
        return {
          id: testOrder.id,
          type: 'test_order',
          patient_name: formatFullName(testOrder.patient_first_name, testOrder.patient_last_name),
          patient_id: testOrder.patient_id,
          scheduled_at: safeParseDate(testOrder.slot_scheduled_at),
          status: testOrder.status,
          diagnostic_test_name: testOrder.diagnostic_test_name,
          slot_price: safeParsePrice(testOrder.slot_price),
          slot_duration_minutes: testOrder.slot_duration_minutes,
          specialty_name: testOrder.specialty_name,
          original_data: testOrder
        }
      } catch (error) {
        console.error('Error processing test order:', error)
        return createDefaultActivity(testOrder.id, 'test_order', testOrder)
      }
    })
  }

  const fetchTodayActivities = async (): Promise<void> => {
    if (!authStore.user?.doctor_id) {
      error.value = 'ID de doctor no encontrado'
      return
    }

    loading.value = true
    error.value = null

    try {
      const dateString = getTodayDateString()

      // Traer test orders del doctor
      const testOrderParams = {
        doctor_id: authStore.user.doctor_id
      }

      const [todayAppointmentsData, testOrdersResponse] = await Promise.all([
        fetchTodayAppointmentsData(dateString),
        TestOrderService.getTestOrders(testOrderParams)
      ])

      // Actualizar también todayAppointments ya que tenemos los datos
      todayAppointments.value = todayAppointmentsData

      const activities: DoctorActivityItem[] = []

      // Convertir appointments a activities
      const appointmentActivities = appointmentsToActivities(todayAppointmentsData)
      activities.push(...appointmentActivities)

      // Filtrar y convertir test orders del día
      if (testOrdersResponse && Array.isArray(testOrdersResponse)) {
        const todayTestOrders = testOrdersResponse.filter(testOrder => {
          if (!testOrder.slot_scheduled_at) return false
          const orderDate = new Date(testOrder.slot_scheduled_at).toISOString().split('T')[0]
          return orderDate === dateString
        })

        const testOrderActivities = testOrdersToActivities(todayTestOrders)
        activities.push(...testOrderActivities)
      }

      // Ordenar por hora programada
      todayActivities.value = activities.sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )

    } catch (err) {
      console.error('Error fetching today activities:', err)
      error.value = 'No se pudieron cargar las actividades de hoy. Por favor, intente de nuevo.'
    } finally {
      loading.value = false
    }
  }

  return {
    appointments,
    testOrders,
    todayAppointments,
    todayActivities,
    loading,
    error,
    fetchDoctorAppointments,
    fetchDoctorTestOrders,
    fetchTodayAppointments,
    fetchTodayActivities
  }
}
