export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Intl.DateTimeFormat('es-ES', { ...defaultOptions, ...options }).format(date)
}

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }

  return phone
}

export const formatMedicalRecordNumber = (number: string): string => {
  return number.toUpperCase().replace(/\s/g, '')
}

export const formatHeight = (heightCm: number): string => {
  const feet = Math.floor(heightCm / 30.48)
  const inches = Math.round((heightCm % 30.48) / 2.54)
  return `${heightCm} cm (${feet}'${inches}")`
}

export const formatWeight = (weightKg: number): string => {
  const pounds = Math.round(weightKg * 2.205)
  return `${weightKg} kg (${pounds} lbs)`
}

export const formatBloodPressure = (systolic: number, diastolic: number): string => {
  return `${systolic}/${diastolic} mmHg`
}

export const formatTemperature = (tempCelsius: number): string => {
  const fahrenheit = Math.round((tempCelsius * 9) / 5 + 32)
  return `${tempCelsius}°C (${fahrenheit}°F)`
}

/**
 * Obtiene la fecha actual en formato ISO (YYYY-MM-DD) para un timezone específico
 * @param timeZone - Timezone IANA (ej: 'America/Lima', 'America/New_York')
 * @returns Fecha en formato ISO string
 */
export const getCurrentDateInTimezone = (timeZone = 'America/Lima'): string => {
  const now = new Date()
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now)
}

/**
 * Convierte una fecha a formato ISO (YYYY-MM-DD) respetando un timezone específico
 * @param date - Fecha a convertir
 * @param timeZone - Timezone IANA (ej: 'America/Lima')
 * @returns Fecha en formato ISO string
 */
export const formatDateToISO = (date: Date | string, timeZone = 'America/Lima'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(dateObj)
}
