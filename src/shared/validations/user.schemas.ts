import { z } from 'zod'

/**
 * Expresiones regulares para validaciones
 */
const REGEX_PATTERNS = {
  // Solo letras, espacios y tildes (caracteres latinos)
  LETTERS_ONLY: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  
  // Solo números
  NUMBERS_ONLY: /^\d+$/,
  
  // Números y letras sin símbolos extraños (para licencias médicas)
  ALPHANUMERIC_CLEAN: /^[a-zA-Z0-9\-]+$/,
  
  // Teléfono peruano (9 dígitos)
  PHONE_PE: /^9\d{8}$/
} as const

/**
 * Mensajes de error personalizados
 */
const ERROR_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'El formato del email no es válido',
  INVALID_NAME: 'Solo se permiten letras, espacios y tildes',
  INVALID_PHONE: 'El teléfono debe tener 9 dígitos y comenzar con 9',
  INVALID_DOCUMENT: 'El número de documento solo debe contener números',
  INVALID_LICENSE: 'El número de licencia solo puede contener letras, números y guiones',
  FUTURE_DATE: 'La fecha de nacimiento no puede ser futura',
  MIN_AGE: 'Debe ser mayor de 18 años',
  PASSWORD_MIN: 'La contraseña debe tener al menos 6 caracteres'
} as const

/**
 * Esquema base para nombres (nombre y apellido)
 */
const nameSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED)
  .min(2, 'Debe tener al menos 2 caracteres')
  .max(50, 'No puede exceder 50 caracteres')
  .regex(REGEX_PATTERNS.LETTERS_ONLY, ERROR_MESSAGES.INVALID_NAME)
  .transform(val => val.trim())

/**
 * Esquema para email
 */
const emailSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED)
  .email(ERROR_MESSAGES.INVALID_EMAIL)
  .max(100, 'El email no puede exceder 100 caracteres')
  .transform(val => val.toLowerCase().trim())

/**
 * Esquema para teléfono (opcional)
 */
const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || REGEX_PATTERNS.PHONE_PE.test(val),
    ERROR_MESSAGES.INVALID_PHONE
  )

/**
 * Esquema para fecha de nacimiento
 */
const birthDateSchema = z
  .date()
  .optional()
  .refine(
    (date) => !date || date <= new Date(),
    ERROR_MESSAGES.FUTURE_DATE
  )
  .refine(
    (date) => {
      if (!date) return true
      const today = new Date()
      const age = today.getFullYear() - date.getFullYear()
      const monthDiff = today.getMonth() - date.getMonth()
      const dayDiff = today.getDate() - date.getDate()
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) 
        ? age - 1 
        : age
      
      return actualAge >= 18
    },
    ERROR_MESSAGES.MIN_AGE
  )

/**
 * Esquema para número de documento
 */
const documentNumberSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED)
  .min(8, 'Debe tener al menos 8 dígitos')
  .max(12, 'No puede exceder 12 dígitos')
  .regex(REGEX_PATTERNS.NUMBERS_ONLY, ERROR_MESSAGES.INVALID_DOCUMENT)

/**
 * Esquema para número de licencia médica (opcional)
 */
const licenseNumberSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || REGEX_PATTERNS.ALPHANUMERIC_CLEAN.test(val),
    ERROR_MESSAGES.INVALID_LICENSE
  )

/**
 * Esquema para contraseña
 */
const passwordSchema = z
  .string()
  .min(1, ERROR_MESSAGES.REQUIRED)
  .min(6, ERROR_MESSAGES.PASSWORD_MIN)
  .max(100, 'La contraseña no puede exceder 100 caracteres')

/**
 * Esquema completo para creación de doctor
 */
export const createDoctorSchema = z.object({
  // Información personal
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  gender: z.enum(['masculino', 'femenino']).optional(),
  birth_date: birthDateSchema,
  
  // Información de documento
  document_type: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED),
  document_number: documentNumberSchema,
  
  // Información profesional
  specialty_id: z
    .number()
    .positive('Debe seleccionar una especialidad')
    .optional(),
  license_number: licenseNumberSchema,
  
  // Credenciales
  password: passwordSchema
})

/**
 * Tipo inferido del esquema
 */
export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>

/**
 * Esquema para validación parcial (útil para validación en tiempo real)
 */
export const createDoctorPartialSchema = createDoctorSchema.partial()

/**
 * Función helper para validar un campo específico
 */
export const validateField = <K extends keyof CreateDoctorFormData>(
  fieldName: K,
  value: CreateDoctorFormData[K]
): { success: boolean; error?: string } => {
  try {
    const fieldSchema = createDoctorSchema.shape[fieldName]
    fieldSchema.parse(value)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues[0]?.message || 'Error de validación' 
      }
    }
    return { success: false, error: 'Error desconocido' }
  }
}

/**
 * Función helper para validar todo el formulario
 */
export const validateCreateDoctorForm = (
  data: Partial<CreateDoctorFormData>
): { success: boolean; errors: Record<string, string> } => {
  try {
    createDoctorSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Error de validación' } }
  }
}
