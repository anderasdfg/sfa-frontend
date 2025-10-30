import { ref, computed } from 'vue'
import { SlotService } from '@/services/slots.service'
import type { AppointmentSlot, AppointmentSlotQueryParams } from '@/types/slots.types'
import { SlotStatus } from '@/types/enums'

interface ProcessedSlot {
  id: number
  date: string
  time: string
  price: number
  available: boolean
  schedule_modality: string
  duration_minutes: number
  scheduled_at: Date
  doctor_id: number
  specialty_id: number
}

export function useTestOrderSlots() {
  const slots = ref<AppointmentSlot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Carga los slots disponibles para un servicio específico
   * @param serviceId - ID del servicio (ej: Laboratorio)
   * @param date - Fecha inicial para buscar slots
   */
  const loadSlotsForService = async (
    serviceId: number,
    date: string
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const params: AppointmentSlotQueryParams = {
        service_id: serviceId,
        date
      }

      const response = await SlotService.getSlots(params)
      slots.value = response
    } catch (err) {
      console.error('Error loading slots for service:', err)
      error.value = 'No se pudieron cargar los horarios disponibles'
    } finally {
      loading.value = false
    }
  }

  /**
   * Procesa los slots para mostrar en UI agrupados por fecha
   */
  const getProcessedSlots = computed((): ProcessedSlot[] => {
    return slots.value.map(slot => {
      // Convertir la fecha a zona horaria de Lima
      const scheduledDate = new Date(slot.scheduled_at)
      const limaDateStr = scheduledDate.toLocaleString('en-US', { 
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      
      // Parsear el formato MM/DD/YYYY, HH:mm
      const [datePart, timePart] = limaDateStr.split(', ')
      const [month, day, year] = datePart.split('/')
      const dateStr = `${year}-${month}-${day}`
      const timeStr = timePart

      return {
        id: slot.id,
        date: dateStr,
        time: timeStr,
        price: slot.price,
        available: slot.status === SlotStatus.DISPONIBLE,
        schedule_modality: slot.schedule_modality,
        duration_minutes: slot.duration_minutes,
        scheduled_at: scheduledDate,
        doctor_id: slot.doctor_data.id,
        specialty_id: slot.specialty_id
      }
    })
  })

  /**
   * Obtiene las fechas únicas disponibles
   */
  const getAvailableDates = computed((): string[] => {
    const dates = new Set<string>()
    getProcessedSlots.value.forEach(slot => {
      dates.add(slot.date)
    })
    return Array.from(dates).sort()
  })

  /**
   * Filtra slots por fecha específica
   */
  const getSlotsByDate = (date: string): ProcessedSlot[] => {
    return getProcessedSlots.value.filter(slot => slot.date === date)
  }

  /**
   * Verifica si hay slots disponibles para una fecha
   */
  const hasAvailableSlotsForDate = (date: string): boolean => {
    return getSlotsByDate(date).some(slot => slot.available)
  }

  /**
   * Limpia los slots cargados
   */
  const clearSlots = (): void => {
    slots.value = []
    error.value = null
  }

  return {
    // Estado
    slots,
    loading,
    error,

    // Computed
    processedSlots: getProcessedSlots,
    availableDates: getAvailableDates,

    // Métodos
    loadSlotsForService,
    getSlotsByDate,
    hasAvailableSlotsForDate,
    clearSlots
  }
}
