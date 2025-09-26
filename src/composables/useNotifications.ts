/**
 * Composable para manejar notificaciones con PrimeVue Toast
 */

import { useToast } from 'primevue/usetoast'
import { useNotificationStore } from '@/stores/ui/notificationStore'

export const useNotifications = () => {
  const toast = useToast()
  const notificationStore = useNotificationStore()

  const showSuccess = (title: string, message: string) => {
    // Mostrar toast de PrimeVue
    toast.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 5000
    })
    
    // También agregar al store para historial
    notificationStore.addNotification({
      title,
      message,
      type: 'success'
    })
  }

  const showError = (title: string, message: string, persistent = false) => {
    // Mostrar toast de PrimeVue
    toast.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: persistent ? 0 : 8000
    })
    
    // También agregar al store para historial
    notificationStore.addNotification({
      title,
      message,
      type: 'error',
      persistent
    })
  }

  const showWarning = (title: string, message: string) => {
    // Mostrar toast de PrimeVue
    toast.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 6000
    })
    
    // También agregar al store para historial
    notificationStore.addNotification({
      title,
      message,
      type: 'warning'
    })
  }

  const showInfo = (title: string, message: string) => {
    // Mostrar toast de PrimeVue
    toast.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 5000
    })
    
    // También agregar al store para historial
    notificationStore.addNotification({
      title,
      message,
      type: 'info'
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
