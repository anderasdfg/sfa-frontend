/**
 * Configuración centralizada de Axios con interceptores de autenticación
 */

import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Interceptor de Request - Agregar token automáticamente
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token desde localStorage
    const token = localStorage.getItem('auth_token')

    // Agregar token si existe
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * Interceptor de Response - Manejar errores de autenticación
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log para debugging (solo en desarrollo)
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status}`, response.data)
    }
    return response
  },
  (error: AxiosError) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.warn('🔒 Token expirado o inválido, cerrando sesión...')

      // Limpiar tokens del localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('refresh_token')

      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login'
      }
    }

    // Manejar otros errores HTTP
    if (error.response?.status === 403) {
      console.error('🚫 Acceso denegado')
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error('🔥 Error del servidor')
    }

    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    return Promise.reject(error)
  }
)

export default apiClient
