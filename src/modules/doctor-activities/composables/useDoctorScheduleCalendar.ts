import { ref, computed } from 'vue'
import { SlotService } from '@/services/slots.service'
import { useAuthStore } from '@/stores/auth/authStore'
import type { AppointmentSlot } from '@/types/slots.types'
import { AppointmentModality } from '@/types/enums'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    slotId: number
    status: 'available' | 'occupied'
    patientName?: string
    appointmentId?: number
    price: number
    modality: AppointmentModality
  }
}

// Interfaz para la semana actual
interface WeekRange {
  start: Date
  end: Date
}

export function useDoctorScheduleCalendar() {
  const authStore = useAuthStore()
  
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const appointmentSlots = ref<AppointmentSlot[]>([])

  // Semana actual
  const currentWeek = ref<WeekRange>({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date())
  })

  // Computed
  const calendarEvents = computed(() => {
    return appointmentSlots.value.map(slot => transformSlotToEvent(slot))
  })

  // Obtener el color del médico actual
  const doctorColor = '#059669' // Color verde principal del tema

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lunes como primer día
    return new Date(d.setDate(diff))
  }

  function getEndOfWeek(date: Date): Date {
    const start = getStartOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  }

  function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  // Transformar slot a evento del calendario
  function transformSlotToEvent(slot: AppointmentSlot): CalendarEvent {
    // Crear fecha y hora de inicio - manejar zona horaria correctamente
    const scheduledAtString =
      typeof slot.scheduled_at === 'string' ? slot.scheduled_at : slot.scheduled_at.toISOString()

    // Si viene con Z (UTC), convertir a fecha local manteniendo la hora
    let slotDate: Date
    if (scheduledAtString.endsWith('Z')) {
      // Remover Z y tratar como hora local
      const localDateString = scheduledAtString.replace('Z', '')
      slotDate = new Date(localDateString)
    } else {
      slotDate = new Date(scheduledAtString)
    }

    const startTime = slotDate.toISOString()
    const endTime = new Date(slotDate.getTime() + slot.duration_minutes * 60000).toISOString()

    // Determinar estado
    const backendStatus = slot.status?.toLowerCase()
    let status: 'available' | 'occupied'

    if (backendStatus === 'disponible') {
      status = 'available'
    } else if (backendStatus === 'ocupado') {
      status = 'occupied'
    } else {
      const isOccupied = slot.patient_data !== null
      status = isOccupied ? 'occupied' : 'available'
    }

    // Verificar si es un evento pasado
    const now = new Date()
    const isPast = slotDate < now

    // Título del evento
    const title = status === 'occupied' && slot.patient_data
      ? `${slot.patient_data.first_name} ${slot.patient_data.last_name}`
      : 'Disponible'

    // Ajustar color para eventos disponibles vs ocupados
    let backgroundColor = status === 'available' ? doctorColor : '#3b82f6'
    let textColor = '#ffffff'

    if (isPast) {
      backgroundColor = backgroundColor + '60' // Agregar transparencia
      textColor = 'rgba(255, 255, 255, 0.7)'
    }

    return {
      id: `slot-${slot.id}`,
      title,
      start: startTime,
      end: endTime,
      backgroundColor,
      borderColor: backgroundColor,
      textColor,
      extendedProps: {
        slotId: slot.id,
        status,
        patientName: slot.patient_data
          ? `${slot.patient_data.first_name} ${slot.patient_data.last_name}`
          : undefined,
        appointmentId: undefined,
        price: slot.price,
        modality: slot.schedule_modality
      }
    }
  }

  // Cargar slots de una semana específica para el médico actual
  async function loadWeekSlots(weekStart: Date, weekEnd: Date) {
    try {
      loading.value = true
      
      if (!authStore.user?.doctor_id) {
        throw new Error('No se encontró el ID del médico')
      }

      const slots: AppointmentSlot[] = []

      // Cargar slots para cada día de la semana
      const currentDate = new Date(weekStart)
      while (currentDate <= weekEnd) {
        try {
          const queryParams = {
            date: formatDateForAPI(currentDate),
            doctor_id: authStore.user.doctor_id // Solo los slots del médico actual
          }

          const daySlots = await SlotService.getSlots(queryParams)
          slots.push(...daySlots)
        } catch (dayError) {
          console.warn(`Error loading slots for ${formatDateForAPI(currentDate)}:`, dayError)
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      appointmentSlots.value = slots
    } catch (err) {
      console.error('Error loading week slots:', err)
      error.value = 'No se pudieron cargar los horarios de la semana'
    } finally {
      loading.value = false
    }
  }

  // Cargar datos de la semana actual
  async function loadWeekData() {
    await loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  // Navegación de semanas
  function previousWeek() {
    const newStart = new Date(currentWeek.value.start)
    newStart.setDate(newStart.getDate() - 7)

    currentWeek.value = {
      start: newStart,
      end: getEndOfWeek(newStart)
    }

    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  function nextWeek() {
    const newStart = new Date(currentWeek.value.start)
    newStart.setDate(newStart.getDate() + 7)

    currentWeek.value = {
      start: newStart,
      end: getEndOfWeek(newStart)
    }

    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  function goToToday() {
    const today = new Date()
    currentWeek.value = {
      start: getStartOfWeek(today),
      end: getEndOfWeek(today)
    }

    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  return {
    // Estado
    loading,
    error,
    appointmentSlots,
    currentWeek,

    // Computed
    calendarEvents,

    // Métodos
    loadWeekData,
    loadWeekSlots,
    previousWeek,
    nextWeek,
    goToToday
  }
}