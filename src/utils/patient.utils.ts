/**
 * Interfaz genérica para datos de paciente
 */
interface PatientData {
  first_name?: string
  last_name?: string
  document_type?: string
  document_number?: string
  date_of_birth?: string | Date
  gender?: string
  phone?: string
  email?: string
  [key: string]: any
}

/**
 * Obtiene el nombre completo del paciente
 * @param patient - Datos del paciente
 * @returns Nombre completo
 */
export const getPatientFullName = (patient: PatientData | null | undefined): string => {
  if (!patient) return ''
  console.log(patient)
  const firstName = patient.first_name || ''
  const lastName = patient.last_name || ''

  return `${firstName} ${lastName}`.trim() || 'Paciente'
}

/**
 * Calcula la edad del paciente basado en su fecha de nacimiento
 * @param dateOfBirth - Fecha de nacimiento (string o Date)
 * @returns Edad en años
 */
export const calculateAge = (dateOfBirth: string | Date | null | undefined): number | null => {
  console.log(dateOfBirth)
  if (!dateOfBirth) return null

  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth

  // Validar que la fecha sea válida
  if (isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age >= 0 ? age : null
}

/**
 * Formatea la edad del paciente
 * @param dateOfBirth - Fecha de nacimiento
 * @param fallback - Valor por defecto si no se puede calcular
 * @returns Edad formateada como string
 */
export const getFormattedAge = (
  dateOfBirth: string | Date | null | undefined,
  fallback: string = 'N/A'
): string => {
  const age = calculateAge(dateOfBirth)
  return age !== null ? age.toString() + ' años' : fallback
}

/**
 * Obtiene las iniciales del paciente
 * @param patient - Datos del paciente
 * @returns Iniciales (ej: "JD" para "John Doe")
 */
export const getPatientInitials = (patient: PatientData | null | undefined): string => {
  if (!patient) return '?'

  const firstInitial = patient.first_name?.[0]?.toUpperCase() || ''
  const lastInitial = patient.last_name?.[0]?.toUpperCase() || ''

  return `${firstInitial}${lastInitial}` || '?'
}

/**
 * Formatea el tipo de documento
 * @param documentType - Tipo de documento
 * @returns Tipo de documento formateado
 */
export const formatDocumentType = (documentType: string | null | undefined): string => {
  if (!documentType) return 'N/A'

  const documentTypes: Record<string, string> = {
    DNI: 'DNI',
    CE: 'Carnet de Extranjería',
    PASSPORT: 'Pasaporte',
    RUC: 'RUC'
  }

  return documentTypes[documentType.toUpperCase()] || documentType
}

/**
 * Formatea el género del paciente
 * @param gender - Género (M, F, O)
 * @returns Género formateado
 */
export const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return 'N/A'

  const genderMap: Record<string, string> = {
    masculino: 'Masculino',
    femenino: 'Femenino',
    otro: 'Otro'
  }

  return genderMap[gender.toLowerCase()] || gender
}

/**
 * Valida si un paciente tiene información mínima requerida
 * @param patient - Datos del paciente
 * @returns true si tiene información mínima
 */
export const hasMinimumPatientInfo = (patient: PatientData | null | undefined): boolean => {
  if (!patient) return false

  return !!(patient.first_name && patient.last_name && patient.document_number)
}

/**
 * Obtiene el grupo etario del paciente
 * @param dateOfBirth - Fecha de nacimiento
 * @returns Grupo etario (niño, adolescente, adulto, adulto mayor)
 */
export const getAgeGroup = (dateOfBirth: string | Date | null | undefined): string => {
  const age = calculateAge(dateOfBirth)

  if (age === null) return 'Desconocido'

  if (age < 12) return 'Niño'
  if (age < 18) return 'Adolescente'
  if (age < 60) return 'Adulto'
  return 'Adulto Mayor'
}
