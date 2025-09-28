import type { User, UserCreate } from '@/types/user.types'
import type { ApiResponse } from '@/types/api.types'
import apiClient from '@/shared/lib/axios.config'

export class UserService {
  private static readonly BASE_PATH = '/users'

  /**
   * Obtiene todos los usuarios
   */
  static async getUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>(`${this.BASE_PATH}`)
      
      if (response.data.success && response.data.data) {
        return response.data.data
      } else if (Array.isArray(response.data)) {
        return response.data as User[]
      } else {
        console.warn('Unexpected API response structure:', response.data)
        return []
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('No se pudieron cargar los usuarios')
    }
  }

  /**
   * Crea un nuevo usuario (puede ser doctor, patient, admin)
   */
  static async createUser(userData: UserCreate): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(`${this.BASE_PATH}`, userData)
      
      if (response.data.success && response.data.data) {
        return response.data.data
      } else {
        console.warn('Unexpected API response structure for user creation:', response.data)
        throw new Error('Estructura de respuesta inesperada')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('No se pudo crear el usuario')
    }
  }

  /**
   * Crea un nuevo doctor (helper method)
   */
  static async createDoctor(doctorData: {
    email: string
    first_name: string
    last_name: string
    gender?: 'masculino' | 'femenino'
    document_type: string
    document_number: string
    phone?: string
    photo?: string
    birth_date?: string
    password: string
    specialty_id?: number
    license_number?: string
  }): Promise<User> {
    const userData: UserCreate = {
      username: doctorData.email, // El username es el email para doctores
      first_name: doctorData.first_name,
      last_name: doctorData.last_name,
      gender: doctorData.gender,
      document_type: doctorData.document_type,
      document_number: doctorData.document_number,
      phone: doctorData.phone,
      photo: doctorData.photo,
      birth_date: doctorData.birth_date,
      password: doctorData.password,
      role: 'doctor', // Rol específico para doctores
      status: 'activo',
      specialty_id: doctorData.specialty_id,
      license_number: doctorData.license_number
    }

    return this.createUser(userData)
  }
}
