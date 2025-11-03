import { ref } from 'vue'
import { AppointmentService } from '@/services/appointments.service'
import { TestOrderService } from '@/services/testOrder.service'
import { useNotifications } from '@/composables/useNotifications'
import type { DoctorActivityItem } from './useDoctorAppointments'

/**
 * Composable para manejar las acciones de las actividades del doctor
 * Centraliza toda la lógica de cambios de estado y notificaciones
 */
export function useDoctorActivityActions() {
  const notifications = useNotifications()
  const loading = ref(false)

  // ====== FUNCIONES DE VALIDACIÓN ======

  /**
   * Verifica si se puede iniciar una consulta
   */
  const canStartConsultation = (activity: DoctorActivityItem): boolean => {
    return activity.type === 'appointment' && ['en_espera', 'pagada', 'en_proceso'].includes(activity.status)
  }

  /**
   * Verifica si se puede iniciar el procesamiento de un examen
   */
  const canStartTestProcessing = (activity: DoctorActivityItem): boolean => {
    return activity.type === 'test_order' && ['pagado', 'en_espera'].includes(activity.status)
  }

  /**
   * Verifica si se puede completar el procesamiento de un examen
   */
  const canCompleteTestProcessing = (activity: DoctorActivityItem): boolean => {
    return activity.type === 'test_order' && activity.status === 'en_proceso'
  }

  /**
   * Verifica si se pueden subir resultados de un examen
   */
  const canUploadResults = (activity: DoctorActivityItem): boolean => {
    return activity.type === 'test_order' && activity.status === 'pendiente_subir'
  }

  // ====== FUNCIONES DE UTILIDAD ======

  /**
   * Obtiene el label en español para un estado
   */
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      // Estados de citas (AppointmentStatus)
      reservada: 'Reservada',
      pagada: 'Pagada',
      en_espera: 'En Espera',
      en_proceso: 'En Proceso',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      // Estados de órdenes de examen (TestOrderStatus)
      pendiente: 'Pendiente',
      pagado: 'Pagado',
      pendiente_subir: 'Pendiente Subir',
      completado: 'Completado',
      cancelado: 'Cancelado'
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  /**
   * Obtiene la severidad (color) para un estado
   */
  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      // Estados de citas (AppointmentStatus)
      reservada: 'info',       // Azul - recién reservada
      pagada: 'success',       // Verde - pagada y confirmada
      en_espera: 'warning',    // Amarillo - en espera
      en_proceso: 'warning',   // Amarillo - en consulta
      realizada: 'success',    // Verde - consulta completada
      cancelada: 'danger',     // Rojo - cancelada
      // Estados de órdenes de examen (TestOrderStatus)
      pendiente: 'warning',    // Amarillo - esperando pago
      pagado: 'info',          // Azul - pagado, esperando procesamiento
      pendiente_subir: 'warning', // Amarillo - esperando subir resultados
      completado: 'success',   // Verde - examen completado
      cancelado: 'danger'      // Rojo - cancelado
    }
    return severityMap[status] || 'info'
  }

  // ====== ACCIONES DE CITAS MÉDICAS ======

  /**
   * Inicia una consulta médica cambiando el estado a 'en_proceso'
   */
  const startConsultation = async (
    activity: DoctorActivityItem,
    onSuccess?: (updatedActivity: DoctorActivityItem) => void
  ): Promise<boolean> => {
    if (activity.type !== 'appointment') {
      notifications.showError('Error', 'Esta acción solo es válida para citas médicas')
      return false
    }

    if (!canStartConsultation(activity)) {
      notifications.showError('Error', 'No se puede iniciar la consulta en el estado actual')
      return false
    }

    // Si ya está en proceso, no actualizar el estado, solo ejecutar callback
    if (activity.status === 'en_proceso') {
      console.log('La consulta ya está en proceso para:', activity.patient_name)
      
      // Ejecutar callback si se proporciona (para mantener consistencia en UI)
      onSuccess?.(activity)
      
      return true
    }

    loading.value = true
    try {
      console.log('Iniciando consulta médica para:', activity.patient_name, 'Estado actual:', activity.status)
      
      // Cambiar estado a 'en_proceso'
      await AppointmentService.updateAppointmentStatus(activity.id, { status: 'en_proceso' })
      
      // Crear objeto actualizado
      const updatedActivity = { ...activity, status: 'en_proceso' }
      
      // Ejecutar callback si se proporciona
      onSuccess?.(updatedActivity)

      notifications.showSuccess('Consulta iniciada', 'El estado de la cita ha sido actualizado a "En proceso"')
      
      return true
    } catch (error) {
      console.error('Error updating appointment status:', error)
      notifications.showError('Error', 'No se pudo iniciar la consulta. Por favor, intente nuevamente.')
      return false
    } finally {
      loading.value = false
    }
  }

  // ====== ACCIONES DE ÓRDENES DE EXAMEN ======

  /**
   * Inicia el procesamiento de un examen cambiando el estado a 'en_proceso'
   */
  const startTestProcessing = async (
    activity: DoctorActivityItem,
    onSuccess?: (updatedActivity: DoctorActivityItem) => void
  ): Promise<boolean> => {
    if (activity.type !== 'test_order') {
      notifications.showError('Error', 'Esta acción solo es válida para órdenes de examen')
      return false
    }

    if (!canStartTestProcessing(activity)) {
      notifications.showError('Error', 'No se puede iniciar el procesamiento en el estado actual')
      return false
    }

    loading.value = true
    try {
      console.log('Iniciando procesamiento de examen:', activity.diagnostic_test_name, 'ID:', activity.id)
      
      // Cambiar estado a 'en_proceso'
      await TestOrderService.updateTestOrder(activity.id, { status: 'en_proceso' })
      
      // Crear objeto actualizado
      const updatedActivity = { ...activity, status: 'en_proceso' }
      
      // Ejecutar callback si se proporciona
      onSuccess?.(updatedActivity)

      notifications.showSuccess('Examen iniciado', 'El procesamiento del examen ha comenzado')
      
      return true
    } catch (error) {
      console.error('Error updating test order status:', error)
      notifications.showError('Error', 'No se pudo iniciar el procesamiento del examen. Por favor, intente nuevamente.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Completa el procesamiento de un examen cambiando el estado a 'pendiente_subir'
   */
  const completeTestProcessing = async (
    activity: DoctorActivityItem,
    onSuccess?: (updatedActivity: DoctorActivityItem) => void
  ): Promise<boolean> => {
    if (activity.type !== 'test_order') {
      notifications.showError('Error', 'Esta acción solo es válida para órdenes de examen')
      return false
    }

    if (!canCompleteTestProcessing(activity)) {
      notifications.showError('Error', 'No se puede completar el procesamiento en el estado actual')
      return false
    }

    loading.value = true
    try {
      console.log('Completando procesamiento de examen:', activity.diagnostic_test_name, 'ID:', activity.id)
      
      // Cambiar estado a 'pendiente_subir'
      await TestOrderService.updateTestOrder(activity.id, { status: 'pendiente_subir' })
      
      // Crear objeto actualizado
      const updatedActivity = { ...activity, status: 'pendiente_subir' }
      
      // Ejecutar callback si se proporciona
      onSuccess?.(updatedActivity)

      notifications.showSuccess('Examen completado', 'El procesamiento del examen ha finalizado. Ahora puede subir los resultados.')
      
      return true
    } catch (error) {
      console.error('Error updating test order status:', error)
      notifications.showError('Error', 'No se pudo completar el procesamiento del examen. Por favor, intente nuevamente.')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Maneja la subida de resultados de un examen
   * Por ahora solo muestra mensaje, en el futuro abrirá modal de subida
   */
  const uploadResults = async (
    activity: DoctorActivityItem
  ): Promise<boolean> => {
    if (activity.type !== 'test_order') {
      notifications.showError('Error', 'Esta acción solo es válida para órdenes de examen')
      return false
    }

    if (!canUploadResults(activity)) {
      notifications.showError('Error', 'No se pueden subir resultados en el estado actual')
      return false
    }

    console.log('Subiendo resultados para examen:', activity.diagnostic_test_name, 'ID:', activity.id)
    
    // Por ahora, solo mostrar mensaje informativo
    // En el futuro aquí se abriría un modal/dialog para subir archivos
    notifications.showInfo('Subir resultados', 'Funcionalidad de subida de resultados próximamente disponible')
    
    // Cuando se complete la subida, se actualizará el estado a 'completado'
    // try {
    //   await TestOrderService.updateTestOrder(activity.id, { status: 'completado' })
    //   const updatedActivity = { ...activity, status: 'completado' }
    //   onSuccess?.(updatedActivity)
    //   notifications.showSuccess('Resultados subidos', 'Los resultados del examen han sido guardados exitosamente')
    //   return true
    // } catch (error) {
    //   notifications.showError('Error', 'No se pudieron subir los resultados. Por favor, intente nuevamente.')
    //   return false
    // }
    
    return true
  }

  // ====== ACCIONES GENÉRICAS ======

  /**
   * Maneja la visualización de detalles de una actividad
   */
  const viewDetails = (activity: DoctorActivityItem) => {
    if (activity.type === 'appointment') {
      console.log('Navegando a detalles de cita:', activity.id)
      // TODO: Implementar navegación
      // router.push(`/appointments/${activity.id}`)
    } else if (activity.type === 'test_order') {
      console.log('Navegando a detalles de examen:', activity.id)
      // TODO: Implementar navegación
      // router.push(`/test-orders/${activity.id}`)
    }
  }

  return {
    // Estado
    loading,
    
    // Funciones de validación
    canStartConsultation,
    canStartTestProcessing,
    canCompleteTestProcessing,
    canUploadResults,
    
    // Funciones de utilidad
    getStatusLabel,
    getStatusSeverity,
    
    // Acciones de citas médicas
    startConsultation,
    
    // Acciones de órdenes de examen
    startTestProcessing,
    completeTestProcessing,
    uploadResults,
    
    // Acciones genéricas
    viewDetails
  }
}