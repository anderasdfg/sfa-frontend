/**
 * Composable para manejar notificaciones con PrimeVue Toast
 */

import { useToast } from 'primevue/usetoast'
import { useNotificationStore } from '@/stores/ui/notificationStore'

export const useNotifications = () => {
  const toast = useToast()
  const notificationStore = useNotificationStore()

  const showSuccess = (title: string, message: string) => {
    toast.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 5000
    })

    notificationStore.addNotification({
      title,
      message,
      type: 'success'
    })
  }

  const showError = (title: string, message: string, persistent = false) => {
    toast.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: persistent ? 0 : 8000
    })

    notificationStore.addNotification({
      title,
      message,
      type: 'error',
      persistent
    })
  }

  const showWarning = (title: string, message: string) => {
    toast.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 6000
    })

    notificationStore.addNotification({
      title,
      message,
      type: 'warning'
    })
  }

  const showInfo = (title: string, message: string) => {
    toast.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 5000
    })

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
