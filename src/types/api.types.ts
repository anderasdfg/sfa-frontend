export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}
