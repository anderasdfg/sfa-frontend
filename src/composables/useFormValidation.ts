import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { z } from 'zod'

type UseFormValidationReturn = {
  errors: Ref<Record<string, string>>
  touched: Ref<Record<string, boolean>>
  isValidating: Ref<boolean>
  validateForm: (data: any, allFieldsTouched?: boolean) => boolean
  validateField: (fieldName: string, value: any) => string | null
  setFieldTouched: (fieldName: string, isTouched?: boolean) => void
  clearErrors: () => void
  getFieldError: (fieldName: string) => string | undefined
  hasFieldError: (fieldName: string) => boolean
  isValid: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>
}

export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>
): UseFormValidationReturn {
  // Errores de validación
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const isValidating = ref(false)

  const validateForm = (data: any, allFieldsTouched = false): boolean => {
    isValidating.value = true

    try {
      schema.parse(data)
      errors.value = {}
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}

        error.issues.forEach((err: any) => {
          if (err.path.length > 0) {
            const fieldName = err.path[0] as string
            if (allFieldsTouched || touched.value[fieldName]) {
              newErrors[fieldName] = err.message
            }
          }
        })

        errors.value = newErrors
      }
      return false
    } finally {
      isValidating.value = false
    }
  }

  const validateField = (fieldName: string, value: any): string | null => {
    try {
      const fieldSchema = (schema as any).shape[fieldName]
      if (fieldSchema) {
        fieldSchema.parse(value)
        return null
      }
      return null
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || 'Error de validación'
      }
      return 'Error de validación'
    }
  }

  const setFieldTouched = (fieldName: string, isTouched = true) => {
    touched.value = {
      ...touched.value,
      [fieldName]: isTouched
    }
  }

  const clearErrors = () => {
    errors.value = {}
    touched.value = {}
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return errors.value[fieldName]
  }

  /**
   * Verifica si un campo tiene error
   */
  const hasFieldError = (fieldName: string): boolean => {
    return !!errors.value[fieldName]
  }

  const result: UseFormValidationReturn = {
    // Estado
    errors,
    touched,
    isValidating,

    // Métodos
    validateForm,
    validateField,
    setFieldTouched,
    clearErrors,
    getFieldError,
    hasFieldError,

    // Computed
    isValid: computed(() => Object.keys(errors.value).length === 0),
    hasErrors: computed(() => Object.keys(errors.value).length > 0)
  }
  return result
}
