import { ref, computed } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { DoctorService } from '@/services/doctors.service'
import { SpecialtyService } from '@/services/specialty.service'
import type { Appointment, AppointmentQueryParams } from '@/types/appointments.types'
import type { Doctor } from '@/types/doctor.types'
import type { Specialty } from '@/types/specialty.types'
import { AppointmentStatus, AppointmentModality } from '@/types/enums'

// Interfaz para eventos del calendario
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    appointmentId: number
    patientId: number
    doctorId: number
    status: AppointmentStatus
    modality: AppointmentModality
    patientName: string
    doctorName: string
    specialty: string
    phone?: string
  }
}

// Interfaz para filtros
interface AppointmentFilters {
  statusFilter: AppointmentStatus | 'all'
  modalityFilter: AppointmentModality | 'all'
  specialtyFilter: number | 'all'
  doctorFilter: number | 'all'
  dateFrom: string
  dateTo: string
}

// Colores por estado de cita
const STATUS_COLORS = {
  [AppointmentStatus.RESERVADA]: '#f59e0b', // Amarillo
  [AppointmentStatus.PAGADA]: '#10b981', // Verde
  [AppointmentStatus.REALIZADA]: '#6366f1', // Índigo
  [AppointmentStatus.CANCELADA]: '#ef4444' // Rojo
} as const

// Colores por modalidad
const MODALITY_COLORS = {
  [AppointmentModality.PRESENCIAL]: '#3b82f6', // Azul
  [AppointmentModality.TELECONSULTA]: '#8b5cf6' // Púrpura
} as const

export function useAppointmentsCalendar() {
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appointments = ref<Appointment[]>([])
  const doctors = ref<Doctor[]>([])
  const specialties = ref<Specialty[]>([])

  // Filtros
  const filters = ref<AppointmentFilters>({
    statusFilter: 'all',
    modalityFilter: 'all',
    specialtyFilter: 'all',
    doctorFilter: 'all',
    dateFrom: '',
    dateTo: ''
  })

  // Rango de fechas actual (por defecto: mes actual)
  const currentMonth = ref(new Date())

  // Computed para eventos del calendario
  const calendarEvents = computed(() => {
    return filteredAppointments.value.map(appointment => transformAppointmentToEvent(appointment))
  })

  // Computed para citas filtradas
  const filteredAppointments = computed(() => {
    if (!Array.isArray(appointments.value)) {
      return []
    }
    return appointments.value.filter(appointment => {
      // Filtro por estado
      if (
        filters.value.statusFilter !== 'all' &&
        appointment.status !== filters.value.statusFilter
      ) {
        return false
      }

      // Filtro por modalidad
      if (
        filters.value.modalityFilter !== 'all' &&
        appointment.modality !== filters.value.modalityFilter
      ) {
        return false
      }

      // Filtro por especialidad
      if (filters.value.specialtyFilter !== 'all') {
        const doctor = doctors.value.find(d => d.id === appointment.doctor_id)
        if (!doctor || doctor.specialty_id !== filters.value.specialtyFilter) {
          return false
        }
      }

      // Filtro por médico
      if (
        filters.value.doctorFilter !== 'all' &&
        appointment.doctor_id !== filters.value.doctorFilter
      ) {
        return false
      }

      // Filtro por rango de fechas
      if (filters.value.dateFrom || filters.value.dateTo) {
        const appointmentDate = new Date(appointment.appointment_date)

        if (filters.value.dateFrom) {
          const fromDate = new Date(filters.value.dateFrom)
          if (appointmentDate < fromDate) return false
        }

        if (filters.value.dateTo) {
          const toDate = new Date(filters.value.dateTo)
          if (appointmentDate > toDate) return false
        }
      }

      return true
    })
  })

  // Computed para opciones de filtros
  const statusOptions = computed(() => [
    { label: 'Todos los estados', value: 'all' },
    { label: 'Reservada', value: AppointmentStatus.RESERVADA },
    { label: 'Pagada', value: AppointmentStatus.PAGADA },
    { label: 'Realizada', value: AppointmentStatus.REALIZADA },
    { label: 'Cancelada', value: AppointmentStatus.CANCELADA }
  ])

  const modalityOptions = computed(() => [
    { label: 'Todas las modalidades', value: 'all' },
    { label: 'Presencial', value: AppointmentModality.PRESENCIAL },
    { label: 'Teleconsulta', value: AppointmentModality.TELECONSULTA }
  ])

  const specialtyOptions = computed(() => [
    { label: 'Todas las especialidades', value: 'all' },
    ...specialties.value.map(specialty => ({
      label: specialty.name,
      value: specialty.id
    }))
  ])

  const doctorOptions = computed(() => {
    let availableDoctors = doctors.value

    // Filtrar médicos por especialidad si hay filtro activo
    if (filters.value.specialtyFilter !== 'all') {
      availableDoctors = doctors.value.filter(
        doctor => doctor.specialty_id === filters.value.specialtyFilter
      )
    }

    return [
      { label: 'Todos los médicos', value: 'all' },
      ...availableDoctors.map(doctor => ({
        label: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        value: doctor.id
      }))
    ]
  })

  // Funciones auxiliares
  function transformAppointmentToEvent(appointment: Appointment): CalendarEvent {
    const doctor = doctors.value.find(d => d.id === appointment.doctor_id)
    const specialty = specialties.value.find(s => s.id === doctor?.specialty_id)

    // Determinar color basado en estado y modalidad
    const statusColor = STATUS_COLORS[appointment.status]
    const modalityColor = MODALITY_COLORS[appointment.modality]

    const backgroundColor = statusColor
    const borderColor = modalityColor

    const appointmentDate = new Date(appointment.appointment_date)

    const slotScheduledAtString =
      typeof appointment.slot.scheduled_at === 'string'
        ? appointment.slot.scheduled_at
        : appointment.slot.scheduled_at.toISOString()

    let slotTime: Date
    if (slotScheduledAtString.endsWith('Z')) {
      const localDateString = slotScheduledAtString.replace('Z', '')
      slotTime = new Date(localDateString)
    } else {
      slotTime = new Date(slotScheduledAtString)
    }

    // Combinar fecha de la cita con la hora del slot
    const startDate = new Date(appointmentDate)
    startDate.setHours(slotTime.getHours(), slotTime.getMinutes(), 0, 0)

    // Calcular fecha de fin usando la duración del slot
    const durationMinutes = appointment.slot.duration_minutes || 30
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

    // Título del evento
    const patientName = `${appointment.patient_data.first_name} ${appointment.patient_data.last_name}`
    const doctorName = `Dr. ${appointment.doctor_data.first_name} ${appointment.doctor_data.last_name}`
    const title = `${patientName} - ${doctorName}`

    return {
      id: `appointment-${appointment.id}`,
      title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      backgroundColor,
      borderColor,
      textColor: '#ffffff',
      extendedProps: {
        appointmentId: appointment.id,
        patientId: appointment.patient_id,
        doctorId: appointment.doctor_id,
        status: appointment.status,
        modality: appointment.modality,
        patientName,
        doctorName,
        specialty: specialty?.name || 'Sin especialidad',
        phone: appointment.patient_data.phone || undefined
      }
    }
  }

  function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  function getMonthRange(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end }
  }

  // Funciones principales
  async function loadAppointments(dateFrom?: string, dateTo?: string) {
    try {
      loading.value = true
      error.value = null

      // Si no se proporcionan fechas, usar el mes actual
      if (!dateFrom || !dateTo) {
        const monthRange = getMonthRange(currentMonth.value)
        dateFrom = formatDateForAPI(monthRange.start)
        dateTo = formatDateForAPI(monthRange.end)
      }

      const queryParams: Partial<AppointmentQueryParams> = {
        date_from: dateFrom,
        date_to: dateTo
      }

      const data = await AppointmentService.getAppointments(queryParams as AppointmentQueryParams)
      console.log('API Response:', data) // Debug log

      // Manejar diferentes estructuras de respuesta del API
      let appointmentsArray: Appointment[] = []

      if (Array.isArray(data)) {
        appointmentsArray = data
      } else if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
        appointmentsArray = (data as any).data
      } else if (data && typeof data === 'object' && Array.isArray((data as any).appointments)) {
        appointmentsArray = (data as any).appointments
      } else {
        console.warn('Unexpected API response structure:', data)
        appointmentsArray = []
      }

      appointments.value = appointmentsArray
    } catch (err) {
      console.error('Error loading appointments:', err)
      error.value = 'No se pudieron cargar las citas'
    } finally {
      loading.value = false
    }
  }

  async function loadDoctors() {
    try {
      const data = await DoctorService.getDoctors()
      doctors.value = data
    } catch (err) {
      console.error('Error loading doctors:', err)
    }
  }

  async function loadSpecialties() {
    try {
      const data = await SpecialtyService.getActiveSpecialties()
      specialties.value = data
    } catch (err) {
      console.error('Error loading specialties:', err)
    }
  }

  async function initializeData() {
    await Promise.all([loadDoctors(), loadSpecialties(), loadAppointments()])
  }

  // Funciones de navegación
  function goToPreviousMonth() {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentMonth.value = newDate
    loadAppointments()
  }

  function goToNextMonth() {
    const newDate = new Date(currentMonth.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentMonth.value = newDate
    loadAppointments()
  }

  function goToToday() {
    currentMonth.value = new Date()
    loadAppointments()
  }

  // Funciones de filtros
  function updateFilters(newFilters: Partial<AppointmentFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      statusFilter: 'all',
      modalityFilter: 'all',
      specialtyFilter: 'all',
      doctorFilter: 'all',
      dateFrom: '',
      dateTo: ''
    }
  }

  function applyDateRangeFilter(dateFrom: string, dateTo: string) {
    updateFilters({ dateFrom, dateTo })
    loadAppointments(dateFrom, dateTo)
  }

  // Función para refrescar datos
  function refreshData() {
    loadAppointments()
  }

  return {
    // Estado
    loading,
    error,
    appointments,
    doctors,
    specialties,
    filters,
    currentMonth,

    // Computed
    calendarEvents,
    filteredAppointments,
    statusOptions,
    modalityOptions,
    specialtyOptions,
    doctorOptions,

    // Métodos
    initializeData,
    loadAppointments,
    refreshData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    updateFilters,
    clearFilters,
    applyDateRangeFilter
  }
}
