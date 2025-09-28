import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { LoginCredentials, AuthResponse } from '@/types/auth.types'
import { authService } from '@/services/auth.service'
import type { User } from '@/types/user.types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed((): 'admin' | 'doctor' | 'patient' | 'receptionist' | null => {
    if (!user.value) return null

    if (user.value.admin_id) return 'admin'
    if (user.value.doctor_id) return 'doctor'
    if (user.value.patient_id) return 'patient'

    // Por ahora no hay lógica específica para receptionist
    // Se puede agregar cuando se defina en el backend

    return null
  })
  const userPermissions = computed(() => {
    // Por ahora retornamos array vacío ya que no hay sistema de permisos específicos
    // Se puede implementar más adelante basado en roles
    return []
  })

  // Helper functions para obtener datos del usuario fácilmente
  const getUserFullName = computed(() => {
    if (!user.value) return 'Usuario'
    return `${user.value.first_name} ${user.value.last_name}`
  })

  const getUserInitials = computed(() => {
    if (!user.value) return 'U'
    const firstName = user.value.first_name || ''
    const lastName = user.value.last_name || ''
    return `${firstName[0] || ''}${lastName[0] || ''}`
  })

  const getUserDisplayName = computed(() => {
    if (!user.value) return 'Usuario'
    const role = userRole.value

    switch (role) {
      case 'doctor':
        return `Dr. ${user.value.last_name}`
      case 'admin':
        return getUserFullName.value
      case 'patient':
        return getUserFullName.value
      default:
        return getUserFullName.value
    }
  })

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      isLoading.value = true
      error.value = null

      // Paso 1: Autenticar y obtener token
      const authResponse: AuthResponse = await authService.login(credentials)

      token.value = authResponse.access_token

      // Paso 2: Obtener datos del usuario con el token
      const userProfile = await authService.getUserProfile(authResponse.access_token)

      // El endpoint devuelve { success: true, data: {...} }
      user.value = userProfile.data

      localStorage.setItem('auth_token', authResponse.access_token)
      localStorage.setItem('user_data', JSON.stringify(userProfile.data))

      return true
    } catch (err: any) {
      console.log(err)
      error.value = err.message || 'Error de autenticación'

      user.value = null
      token.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (token.value) {
        // await authService.logout()
      }
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      // Limpiar estado
      user.value = null
      token.value = null
      refreshToken.value = null

      // Limpiar localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
    }
  }

  const refreshTokens = async (): Promise<boolean> => {
    try {
      if (!refreshToken.value) return false

      // const response = await authService.refreshToken(refreshToken.value)
      // token.value = response.token
      // refreshToken.value = response.refreshToken
      // localStorage.setItem('auth_token', response.token)
      // localStorage.setItem('refresh_token', response.refreshToken)

      // Por ahora retornamos false hasta implementar el refresh
      return false
    } catch (err) {
      await logout()
      return false
    }
  }

  const initializeAuth = (): void => {
    const storedUser = localStorage.getItem('user_data')
    if (storedUser && token.value) {
      try {
        const userData = JSON.parse(storedUser)
        user.value = userData
      } catch (err) {
        console.error('Error al parsear datos de usuario:', err)
        logout()
      }
    }
  }

  const clearUserData = (): void => {
    user.value = null
    localStorage.removeItem('user_data')
  }

  const hasRole = (role: string): boolean => {
    if (!user.value) return false

    switch (role) {
      case 'admin':
        return !!user.value.admin_id
      case 'doctor':
        return !!user.value.doctor_id
      case 'patient':
        return !!user.value.patient_id
      case 'receptionist':
        // Por ahora asumimos que receptionist es un tipo de admin o tiene su propio campo
        // Esto se puede ajustar según la lógica del backend
        return !!user.value.admin_id // temporal
      default:
        return false
    }
  }

  const fetchUserProfile = async (): Promise<void> => {
    if (!token.value) return

    try {
      const userProfileResponse = await authService.getUserProfile(token.value)
      user.value = userProfileResponse.data
      localStorage.setItem('user_data', JSON.stringify(userProfileResponse.data))
    } catch (err) {
      console.error('Error al obtener perfil de usuario:', err)
      await logout()
    }
  }

  return {
    // State
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Getters
    isAuthenticated,
    userRole,
    userPermissions,
    getUserFullName,
    getUserInitials,
    getUserDisplayName,

    // Actions
    login,
    logout,
    refreshTokens,
    initializeAuth,
    hasRole,
    fetchUserProfile,
    clearUserData
  }
})
