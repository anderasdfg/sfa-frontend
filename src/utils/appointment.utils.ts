import type { Appointment } from '@/types/appointments.types'
import type { Doctor } from '@/types/doctor.types'

/**
 * Formatea una fecha en formato legible (DD/MM/YYYY)
 */
export const formatDate = (dateInput: string | Date | undefined): string => {
  if (!dateInput) return ''

  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (e) {
    console.error('Error formatting date:', dateInput, e)
    return ''
  }
}

export const getDoctorName = (appointment: any): string => {
  console.log('Appointment data:', JSON.parse(JSON.stringify(appointment)))
  
  // Check for direct doctor_name first
  if (appointment.doctor_name) {
    console.log('Using doctor_name:', appointment.doctor_name)
    return appointment.doctor_name
  }
  
  // Check for doctor_data with first_name and last_name
  if (appointment.doctor_data) {
    console.log('Doctor data found:', appointment.doctor_data)
    const doctor = appointment.doctor_data
    
    // Try different variations of the doctor data structure
    if (doctor.first_name && doctor.last_name) {
      const fullName = `${doctor.first_name} ${doctor.last_name}`.trim()
      console.log('Using first_name + last_name:', fullName)
      return fullName
    }
    
    // Check for nested user object
    if (doctor.user?.first_name && doctor.user?.last_name) {
      const fullName = `${doctor.user.first_name} ${doctor.user.last_name}`.trim()
      console.log('Using user.first_name + user.last_name:', fullName)
      return fullName
    }
    
    // Check for direct name property
    if (doctor.name) {
      console.log('Using doctor.name:', doctor.name)
      return doctor.name
    }
  }
  
  // Fallback to specialty if available
  if (appointment.specialty) {
    console.log('Using specialty:', appointment.specialty)
    return `Médico ${appointment.specialty}`
  }
  
  console.log('No doctor name found, using default')
  return 'Médico'
}

export const getSpecialty = (appointment: Appointment): string => {
  if (appointment.specialty) return appointment.specialty
  if ((appointment.doctor_data as Doctor)?.specialty_name) {
    return (appointment.doctor_data as Doctor).specialty_name || 'General'
  }
  return 'General'
}
