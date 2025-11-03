import apiClient from '@/shared/lib/axios.config'
import type { 
  FileUploadRequest,
  FileUploadResponse, 
  FileValidation
} from '@/types/fileStorage.types'
import { DEFAULT_FILE_VALIDATION } from '@/types/fileStorage.types'

export class FileStorageService {
  private static readonly BASE_PATH = '/files/upload/test-result'

  /**
   * Valida un archivo antes de subirlo
   * @param file - Archivo a validar
   * @param validation - Configuración de validación (opcional)
   * @returns true si es válido, throw error si no
   */
  static validateFile(
    file: File, 
    validation: FileValidation = DEFAULT_FILE_VALIDATION
  ): boolean {
    // Validar tamaño
    if (file.size > validation.maxSize) {
      const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024))
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
    }

    // Validar tipo MIME
    if (!validation.allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no permitido. Tipos permitidos: ${validation.allowedTypes.join(', ')}`)
    }

    // Validar extensión
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!validation.allowedExtensions.includes(fileExtension)) {
      throw new Error(`Extensión de archivo no permitida. Extensiones permitidas: ${validation.allowedExtensions.join(', ')}`)
    }

    return true
  }

  /**
   * Sube un archivo de resultado para un test order
   * @param uploadRequest - Datos de la subida
   * @param onProgress - Callback para el progreso de subida (opcional)
   * @returns Respuesta del servidor
   */
  static async uploadTestResult(
    uploadRequest: FileUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    try {
      // Validar el archivo antes de subirlo
      this.validateFile(uploadRequest.file)

      // Crear FormData para multipart/form-data
      const formData = new FormData()
      
      // Usar el File original directamente (el problema estaba en Axios, no en el File)
      formData.append('file', uploadRequest.file)
      formData.append('result_summary', uploadRequest.result_summary)
      
      // Enviar uploaded_by_id como número entero válido
      const uploadedById = parseInt(uploadRequest.uploaded_by_id.toString(), 10)
      formData.append('uploaded_by_id', uploadedById.toString())



      // Usar XMLHttpRequest nativo para subida de archivos (más confiable que Axios)
      const response = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        // Configurar progreso de subida
        xhr.upload.onprogress = (e) => {
          if (onProgress && e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total)
            onProgress(progress)
          }
        }
        
        // Manejar respuesta exitosa
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve({ data })
            } catch (error) {
              reject(new Error('Invalid JSON response'))
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
          }
        }
        
        // Manejar errores de red
        xhr.onerror = () => reject(new Error('Network error'))
        
        // Configurar URL y headers
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        const fullURL = `${baseURL}${this.BASE_PATH}/${uploadRequest.id}`
        
        xhr.open('POST', fullURL)
        
        // Agregar token de autorización
        const token = localStorage.getItem('auth_token')
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        
        xhr.send(formData)
      })

      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || response.data.error || 'Error al subir el archivo')

    } catch (error: any) {
      console.error('Error uploading test result:', error)
      
      // Manejar errores específicos de la API
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      
      // Manejar errores de red/conexión
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Error de conexión. Verifica tu conexión a internet.')
      }
      
      // Error genérico
      throw new Error(error.message || 'No se pudo subir el archivo')
    }
  }

  /**
   * Obtiene información de un archivo subido previamente
   * @param testOrderId - ID del test order
   * @returns Información del archivo
   */
  static async getUploadedFile(testOrderId: number): Promise<FileUploadResponse> {
    try {
      const response = await apiClient.get<FileUploadResponse>(
        `${this.BASE_PATH}/${testOrderId}/info`
      )

      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || 'Error al obtener información del archivo')

    } catch (error: any) {
      console.error('Error getting uploaded file info:', error)
      throw new Error(error.message || 'No se pudo obtener la información del archivo')
    }
  }

  /**
   * Elimina un archivo subido
   * @param testOrderId - ID del test order
   * @returns Confirmación de eliminación
   */
  static async deleteUploadedFile(testOrderId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message?: string }>(
        `${this.BASE_PATH}/${testOrderId}`
      )

      if (response.data.success) {
        return response.data
      }

      throw new Error(response.data.message || 'Error al eliminar el archivo')

    } catch (error: any) {
      console.error('Error deleting uploaded file:', error)
      throw new Error(error.message || 'No se pudo eliminar el archivo')
    }
  }

  /**
   * Obtiene el tamaño de archivo en formato legible
   * @param bytes - Tamaño en bytes
   * @returns Tamaño formateado (ej: "2.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Obtiene el icono apropiado para un tipo de archivo
   * @param fileName - Nombre del archivo
   * @returns Clase de icono de PrimeIcons
   */
  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return 'pi pi-file-pdf'
      case 'doc':
      case 'docx':
        return 'pi pi-file-word'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return 'pi pi-image'
      default:
        return 'pi pi-file'
    }
  }
}