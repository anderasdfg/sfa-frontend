import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  persistent?: boolean
  action?: {
    label: string
    handler: () => void
  }
}

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const toasts = ref<Notification[]>([])

  // Getters
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const recentNotifications = computed(() =>
    notifications.value.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
  )

  // Actions
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false,
    }

    notifications.value.unshift(newNotification)

    // Agregar al toast si no es persistente
    if (!notification.persistent) {
      toasts.value.push(newNotification)

      // Auto-remover después de 5 segundos
      setTimeout(() => {
        removeToast(newNotification.id)
      }, 5000)
    }

    return newNotification.id
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach((n) => (n.read = true))
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Métodos de conveniencia
  const showSuccess = (title: string, message: string) => {
    return addNotification({
      title,
      message,
      type: 'success',
    })
  }

  const showError = (title: string, message: string, persistent = false) => {
    return addNotification({
      title,
      message,
      type: 'error',
      persistent,
    })
  }

  const showWarning = (title: string, message: string) => {
    return addNotification({
      title,
      message,
      type: 'warning',
    })
  }

  const showInfo = (title: string, message: string) => {
    return addNotification({
      title,
      message,
      type: 'info',
    })
  }

  return {
    // State
    notifications,
    toasts,

    // Getters
    unreadCount,
    recentNotifications,

    // Actions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeToast,
    clearAllNotifications,

    // Convenience methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
})

// Helper function
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
