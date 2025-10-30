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

export const formatTime = (date: Date | string): string => {
  // Si es string y tiene formato de hora (HH:MM:SS o HH:MM), extraerla directamente
  if (typeof date === 'string') {
    // Buscar patrón de hora en el string (ej: "2025-10-08T08:00:00" o "08:00:00")
    const timeMatch = date.match(/T?(\d{2}):(\d{2})(?::\d{2})?/)
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`
    }
  }

  // Fallback: convertir a Date y formatear
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }).format(dateObj)
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

/**
 * Crea una fecha segura en el timezone especificado para evitar desfases
 * @param dateString - String de fecha en formato ISO (YYYY-MM-DD)
 * @param timeZone - Timezone IANA (ej: 'America/Lima')
 * @returns Date object en el timezone especificado
 */
export const createSafeDateInTimezone = (dateString?: string, timeZone = 'America/Lima'): Date => {
  if (dateString) {
    // Crear fecha en timezone específico para evitar desfases
    const offset = timeZone === 'America/Lima' ? '-05:00' : '+00:00'
    return new Date(dateString + `T12:00:00${offset}`)
  }
  return new Date()
}

/**
 * Genera información de fecha para mostrar en UI (día de semana y número)
 * @param baseDate - Fecha base
 * @param daysOffset - Días a sumar a la fecha base
 * @param timeZone - Timezone IANA (ej: 'America/Lima')
 * @returns Objeto con value (ISO), day (nombre corto) y number (día del mes)
 */
export const generateDateInfo = (baseDate: Date, daysOffset: number, timeZone = 'America/Lima') => {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  
  const targetDate = new Date(baseDate)
  targetDate.setDate(baseDate.getDate() + daysOffset)
  
  const isoDate = formatDateToISO(targetDate, timeZone)
  const offset = timeZone === 'America/Lima' ? '-05:00' : '+00:00'
  const displayDate = new Date(isoDate + `T12:00:00${offset}`)
  
  return {
    value: isoDate,
    day: dayNames[displayDate.getDay()],
    number: displayDate.getDate().toString()
  }
}

/**
 * Genera un array de fechas disponibles para mostrar en calendarios/selectors
 * @param selectedDate - Fecha seleccionada como base (opcional)
 * @param daysCount - Número de días a generar (default: 7)
 * @param timeZone - Timezone IANA (ej: 'America/Lima')
 * @returns Array de objetos con información de fecha
 */
export const generateAvailableDates = (
  selectedDate?: string, 
  daysCount = 7, 
  timeZone = 'America/Lima'
) => {
  const baseDate = createSafeDateInTimezone(selectedDate, timeZone)
  
  return Array.from({ length: daysCount }, (_, i) => 
    generateDateInfo(baseDate, i, timeZone)
  )
}
