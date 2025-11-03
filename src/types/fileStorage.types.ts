export interface FileUploadRequest {
  id: number // ID del test order
  file: File // El archivo a subir
  result_summary: string // Resumen del resultado del examen
  uploaded_by_id: string // ID del usuario que sube el archivo
}

export interface FileUploadResponse {
  success: boolean
  path?: string // Ruta del archivo en el storage
  url?: string // URL pública del archivo subido
  size?: number // Tamaño del archivo en bytes
  fileName?: string // Nombre del archivo
  testOrderId?: number // ID del test order
  testResultId?: number // ID del resultado del test
  patientId?: number // ID del paciente
  consultationId?: number // ID de la consulta
  resultSummary?: string // Resumen del resultado
  message?: string // Mensaje de respuesta
  error?: string // Error si algo sale mal
}

export interface FileStorageError {
  code: string
  message: string
  details?: any
}

// Tipos para validación de archivos
export interface FileValidation {
  maxSize: number // Tamaño máximo en bytes (por defecto 10MB)
  allowedTypes: string[] // Tipos MIME permitidos
  allowedExtensions: string[] // Extensiones permitidas
}

// Configuración por defecto para archivos de resultados médicos
export const DEFAULT_FILE_VALIDATION: FileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.doc', '.docx']
}

// Estados del proceso de subida
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadProgress {
  status: UploadStatus
  progress: number // 0-100
  file?: File
  error?: string
  result?: FileUploadResponse
}