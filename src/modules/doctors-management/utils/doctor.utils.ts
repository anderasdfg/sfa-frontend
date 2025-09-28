import type { Doctor } from '@/types/doctor.types'

/**
 * Obtiene las iniciales de un médico
 */
export const getDoctorInitials = (doctor: Doctor): string => {
  const firstName = doctor.first_name || ''
  const lastName = doctor.last_name || ''
  const firstInitial = firstName.charAt(0) || 'D'
  const lastInitial = lastName.charAt(0) || 'R'
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * Obtiene un color de avatar basado en el ID del médico
 */
export const getAvatarColor = (id: string | number): string => {
  const colors = ['#059669', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
  const idStr = String(id || '0')
  const index = parseInt(idStr.slice(-1)) % colors.length
  return colors[index]
}

/**
 * Formatea una fecha para mostrar en la interfaz
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'No disponible'
  
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

/**
 * Obtiene el nombre completo de un médico
 */
export const getDoctorFullName = (doctor: Doctor): string => {
  const firstName = doctor.first_name || 'Sin nombre'
  const lastName = doctor.last_name || ''
  return `${firstName} ${lastName}`.trim()
}

/**
 * Obtiene el estado del médico como texto
 */
export const getDoctorStatus = (doctor: Doctor): { text: string; severity: 'success' | 'danger' | 'warning' } => {
  if (doctor.is_active === undefined) {
    return { text: 'Sin estado', severity: 'warning' }
  }
  
  return {
    text: doctor.is_active ? 'Activo' : 'Inactivo',
    severity: doctor.is_active ? 'success' : 'danger'
  }
}

/**
 * Filtra médicos por texto de búsqueda
 */
export const filterDoctorsBySearch = (doctors: Doctor[], searchQuery: string): Doctor[] => {
  if (!searchQuery) return doctors
  
  const query = searchQuery.toLowerCase()
  
  return doctors.filter(doctor => {
    const fullName = getDoctorFullName(doctor).toLowerCase()
    const email = (doctor.email || '').toLowerCase()
    const specialty = (doctor.specialty_name || '').toLowerCase()
    
    return fullName.includes(query) || email.includes(query) || specialty.includes(query)
  })
}

/**
 * Filtra médicos por especialidad
 */
export const filterDoctorsBySpecialty = (doctors: Doctor[], specialty: string): Doctor[] => {
  if (!specialty) return doctors
  
  return doctors.filter(doctor => (doctor.specialty_name || '') === specialty)
}

/**
 * Obtiene las especialidades únicas de una lista de médicos
 */
export const getUniqueSpecialties = (doctors: Doctor[]): Array<{ name: string; value: string }> => {
  const uniqueSpecialties = [...new Set(
    doctors.map(d => d.specialty_name || 'Sin especialidad').filter(Boolean)
  )]
  
  return [
    { name: 'Todas las especialidades', value: '' },
    ...uniqueSpecialties.map(specialty => ({ name: specialty, value: specialty }))
  ]
}
