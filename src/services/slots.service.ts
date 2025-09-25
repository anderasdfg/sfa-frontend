import axios from 'axios'
import type { AppointmentSlot, AppointmentSlotQueryParams, AppointmentSlotResponse } from '@/types/slots.types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export class SlotService {
  private static readonly BASE_PATH = '/appointment-slots'

  /** Obtiene los slots */
  static async getSlots(
    queryParams: AppointmentSlotQueryParams
  ): Promise<AppointmentSlot[]> {
    try {
      const url = `${API_BASE}${this.BASE_PATH}`
      const response = await axios.get<AppointmentSlotResponse>(url, { params: queryParams })
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        console.warn('Unexpected API response structure:', response.data)
        return []
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      throw new Error('No se pudieron cargar los slots')
    }
  }
}
