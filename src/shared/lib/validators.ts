// Validación de email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validación de contraseña
export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

// Validación de contraseña fuerte
export const validateStrongPassword = (password: string): boolean => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

// Validación de teléfono
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validación de fecha de nacimiento
export const validateBirthDate = (date: string): boolean => {
  const birthDate = new Date(date)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()

  return birthDate < today && age <= 150 && age >= 0
}

// Validación de documento de identidad (genérico)
export const validateIdentityDocument = (document: string): boolean => {
  return document.length >= 6 && document.length <= 20
}

// Validación de código postal
export const validateZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zipCode)
}

// Validación de campos requeridos
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

// Validación de longitud mínima
export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

// Validación de longitud máxima
export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

// Validación de rango numérico
export const validateNumericRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

// Validaciones específicas para datos médicos

// Validación de altura (en cm)
export const validateHeight = (height: number): boolean => {
  return validateNumericRange(height, 30, 300)
}

// Validación de peso (en kg)
export const validateWeight = (weight: number): boolean => {
  return validateNumericRange(weight, 0.5, 1000)
}

// Validación de presión arterial
export const validateBloodPressure = (systolic: number, diastolic: number): boolean => {
  return (
    validateNumericRange(systolic, 50, 300) &&
    validateNumericRange(diastolic, 30, 200) &&
    systolic > diastolic
  )
}

// Validación de frecuencia cardíaca
export const validateHeartRate = (heartRate: number): boolean => {
  return validateNumericRange(heartRate, 30, 250)
}

// Validación de temperatura corporal (en °C)
export const validateTemperature = (temperature: number): boolean => {
  return validateNumericRange(temperature, 30, 50)
}

// Validación de número de licencia médica
export const validateMedicalLicense = (license: string): boolean => {
  return license.length >= 6 && license.length <= 20 && /^[A-Z0-9\-]+$/.test(license)
}

// Validación de horarios de citas
export const validateAppointmentTime = (
  date: Date,
  businessHours: { start: number; end: number },
): boolean => {
  const hour = date.getHours()
  return hour >= businessHours.start && hour < businessHours.end
}

// Validación de duración de cita (en minutos)
export const validateAppointmentDuration = (duration: number): boolean => {
  return [15, 30, 45, 60, 90, 120].includes(duration)
}

// Composable para validaciones de formularios
export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

export const useFormValidation = () => {
  const validateField = (value: any, rules: ValidationRule[]): string => {
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return rule.message
      }
    }
    return ''
  }

  const validateForm = (
    formData: Record<string, any>,
    validationRules: Record<string, ValidationRule[]>,
  ): Record<string, string> => {
    const errors: Record<string, string> = {}

    for (const [field, rules] of Object.entries(validationRules)) {
      const error = validateField(formData[field], rules)
      if (error) {
        errors[field] = error
      }
    }

    return errors
  }

  return {
    validateField,
    validateForm,
  }
}

// Reglas de validación comunes
export const commonValidationRules = {
  required: {
    validator: validateRequired,
    message: 'Este campo es requerido',
  },
  email: {
    validator: validateEmail,
    message: 'Ingresa un email válido',
  },
  password: {
    validator: validatePassword,
    message: 'La contraseña debe tener al menos 6 caracteres',
  },
  strongPassword: {
    validator: validateStrongPassword,
    message:
      'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos',
  },
  phone: {
    validator: validatePhone,
    message: 'Ingresa un número de teléfono válido',
  },
}
