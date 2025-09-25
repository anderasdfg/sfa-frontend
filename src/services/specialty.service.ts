import axios from 'axios'
import type { Specialty } from '@/types/specialty.types'
import { SpecialtyStatus } from '@/types/enums'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class SpecialtyService {
  private static readonly BASE_PATH = '/specialities'

  /**
   * Obtiene todas las especialidades disponibles
   */
  static async getSpecialties(): Promise<Specialty[]> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.get(url)
      const specialtiesData = response.data?.data || response.data

      if (Array.isArray(specialtiesData)) {
        return specialtiesData
      } else if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn('Estructura de respuesta inesperada:', response.data)
        return []
      }
    } catch (error) {
      console.error('Error fetching specialties:', error)
      throw new Error('No se pudieron cargar las especialidades')
    }
  }

  /**
   * Obtiene las especialidades activas únicamente
   */
  static async getActiveSpecialties(): Promise<Specialty[]> {
    try {
      const specialties = await this.getSpecialties()
      return specialties.filter(specialty => specialty.status === SpecialtyStatus.ACTIVO)
    } catch (error) {
      console.error('Error fetching active specialties:', error)
      throw new Error('No se pudieron cargar las especialidades activas')
    }
  }

  /**
   * Obtiene una especialidad por su ID
   */
  static async getSpecialtyById(id: number): Promise<Specialty | null> {
    try {
      const specialties = await this.getSpecialties()
      return specialties.find(specialty => specialty.id === id) || null
    } catch (error) {
      console.error(`Error fetching specialty with id ${id}:`, error)
      throw new Error('No se pudo cargar la especialidad')
    }
  }

  /**
   * Obtiene una especialidad por su código
   */
  static async getSpecialtyByCode(code: string): Promise<Specialty | null> {
    try {
      const specialties = await this.getSpecialties()
      return specialties.find(specialty => specialty.code === code) || null
    } catch (error) {
      console.error(`Error fetching specialty with code ${code}:`, error)
      throw new Error('No se pudo cargar la especialidad')
    }
  }

  /**
   * Crea una nueva especialidad
   */
  static async createSpecialty(specialty: Specialty): Promise<Specialty | null> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.post(url, specialty)
      return response.data
    } catch (error) {
      console.error('Error creating specialty:', error)
      throw new Error('No se pudo crear la especialidad')
    }
  }

  /**
   * Actualiza una especialidad existente
   */
  static async updateSpecialty(specialty: Specialty): Promise<Specialty | null> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${specialty.id}`
      const response = await axios.put(url, specialty)
      return response.data
    } catch (error) {
      console.error('Error updating specialty:', error)
      throw new Error('No se pudo actualizar la especialidad')
    }
  }

  /**
   * Colocar una especialidad como inactiva
   */
  static async deactivateSpecialty(id: number): Promise<void> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${id}`
      await axios.put(url, { status: SpecialtyStatus.INACTIVO })
    } catch (error) {
      console.error('Error deactivating specialty:', error)
      throw new Error('No se pudo desactivar la especialidad')
    }
  }

  /**
   * Elimina una especialidad existente
   */
  static async deleteSpecialty(id: number): Promise<void> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}/${id}`
      await axios.delete(url)
    } catch (error) {
      console.error('Error deleting specialty:', error)
      throw new Error('No se pudo eliminar la especialidad')
    }
  }
}

export const specialtyService = SpecialtyService
