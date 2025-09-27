/**
 * Adapter para transformar datos de slots del API al formato del frontend
 */

import type { AppointmentSlot } from '@/types/slots.types'
import type { Doctor, TimeSlot } from '../types'
import { SlotStatus, AppointmentModality } from '@/types/enums'

/**
 * Convierte un slot del API a formato de frontend
 */
export const adaptSlotToTimeSlot = (slot: AppointmentSlot): TimeSlot => {
  // Manejar zona horaria correctamente - igual que en useScheduleCalendar
  const scheduledAtString = typeof slot.scheduled_at === 'string' 
    ? slot.scheduled_at 
    : slot.scheduled_at.toISOString()
  
  // Si viene con Z (UTC), convertir a fecha local manteniendo la hora
  let scheduledDate: Date
  if (scheduledAtString.endsWith('Z')) {
    // Remover Z y tratar como hora local
    const localDateString = scheduledAtString.replace('Z', '')
    scheduledDate = new Date(localDateString)
  } else {
    scheduledDate = new Date(scheduledAtString)
  }
  
  const timeString = scheduledDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return {
    id: slot.id,
    time: timeString,
    price: slot.price,
    available: slot.status === SlotStatus.DISPONIBLE,
    date: scheduledDate.toISOString().split('T')[0]
  }
}

/**
 * Convierte datos del doctor del API a formato de frontend
 */
export const adaptSlotToDoctor = (slot: AppointmentSlot): Omit<Doctor, 'availableSlots'> => {
  const doctorData = slot.doctor_data

  return {
    id: doctorData.id,
    name: `${doctorData.first_name} ${doctorData.last_name}`,
    specialtyName: slot.specialty,
    cmp: `${doctorData.license_number}`,
    consultationType: slot.schedule_modality === 'teleconsulta' ? AppointmentModality.TELECONSULTA : AppointmentModality.PRESENCIAL,
    location: slot.schedule_modality === 'teleconsulta' ? 'Virtual' : 'Los Olivos',
    avatar:
      'https://www.shutterstock.com/image-vector/default-placeholder-doctor-halflength-portrait-600nw-1058724875.jpg'
  }
}

/**
 * Agrupa slots por doctor y los convierte al formato del frontend
 */
export const adaptSlotsToDoctor = (slots: AppointmentSlot[]): Doctor[] => {
  const doctorsMap = new Map<number, Doctor>()

  slots.forEach(slot => {
    const doctorId = slot.doctor_data.id

    if (!doctorsMap.has(doctorId)) {
      const doctorData = adaptSlotToDoctor(slot)
      doctorsMap.set(doctorId, {
        ...doctorData,
        availableSlots: []
      })
    }

    const doctor = doctorsMap.get(doctorId)!
    const timeSlot = adaptSlotToTimeSlot(slot)
    doctor.availableSlots.push(timeSlot)
  })

  return Array.from(doctorsMap.values())
}
