import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { AppointmentSelection } from '../types'

export const useSlotsStore = defineStore('slots', () => {
  // Estado del slot seleccionado con persistencia
  const selectedAppointment = ref<AppointmentSelection | null>(
    // Cargar desde localStorage al inicializar
    (() => {
      try {
        const stored = localStorage.getItem('selectedAppointment')
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    })()
  )

  // Getters
  const getSelectedAppointment = computed(() => selectedAppointment.value)
  const hasSelectedAppointment = computed(() => !!selectedAppointment.value)

  // Actions
  const setSelectedAppointment = (appointment: AppointmentSelection | null) => {
    console.log('Setting selected appointment in store:', appointment)
    selectedAppointment.value = appointment
    
    // Persistir en localStorage
    if (appointment) {
      localStorage.setItem('selectedAppointment', JSON.stringify(appointment))
    } else {
      localStorage.removeItem('selectedAppointment')
    }
  }

  const clearSelectedAppointment = () => {
    selectedAppointment.value = null
    localStorage.removeItem('selectedAppointment')
  }

  return {
    selectedAppointment: readonly(selectedAppointment),

    // Getters
    getSelectedAppointment,
    hasSelectedAppointment,

    // Actions
    setSelectedAppointment,
    clearSelectedAppointment
  }
})
