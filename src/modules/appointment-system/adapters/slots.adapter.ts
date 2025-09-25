/**
 * Adapter para transformar datos de slots del API al formato del frontend
 */

import type { AppointmentSlot } from '@/types/slots.types'
import { SlotStatus } from '@/types/enums'
import type { Doctor, TimeSlot } from '../types'

/**
 * Convierte un slot del API a formato de frontend
 */
export const adaptSlotToTimeSlot = (slot: AppointmentSlot): TimeSlot => {
  const scheduledDate = new Date(slot.scheduled_at)
  const timeString = scheduledDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return {
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
    consultationType: slot.schedule_modality === 'teleconsulta' ? 'TELECONSULTA' : 'PRESENCIAL',
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
