import { ref } from 'vue'
import { ScheduleService } from '@/services/schedules.service'
import type { ScheduleCreateRequest } from '@/types/schedules.types'
import { AppointmentModality } from '@/types/enums'

export interface ScheduleFormData {
  doctorId: number
  date: Date
  modality: 'presencial' | 'virtual'
  startTime: Date
  endTime: Date
  slotDuration: number
  price: number
}

export const useCreateSchedule = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createSchedules = async (formData: ScheduleFormData): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      // Transformar datos del formulario al formato esperado por la API
      const scheduleRequest: ScheduleCreateRequest = {
        doctor_id: formData.doctorId,
        schedule_date: formData.date.toISOString().split('T')[0],
        start_time: formData.startTime.toTimeString().split(' ')[0],
        end_time: formData.endTime.toTimeString().split(' ')[0],
        slot_duration_minutes: formData.slotDuration,
        slot_price: formData.price,
        appointment_modality: formData.modality === 'presencial' 
          ? AppointmentModality.PRESENCIAL 
          : AppointmentModality.TELECONSULTA
      }

      // Usar el service layer para crear el horario
      await ScheduleService.createSchedule(scheduleRequest)
      
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error creating schedules:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createSchedules
  }
}
