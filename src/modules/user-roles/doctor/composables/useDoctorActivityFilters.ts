

/**
 * Composable para las opciones de filtrado de actividades del doctor
 * Centraliza las opciones de tipos y estados
 */
export function useDoctorActivityFilters() {
  
  // Opciones para filtro de tipos
  const typeOptions = [
    { label: 'Citas', value: 'appointment' },
    { label: 'Órdenes de Examen', value: 'test_order' }
  ]

  // Opciones agrupadas para filtro de estados
  const statusOptions = [
    { label: 'Pendientes', value: 'pendientes', statuses: ['reservada', 'pendiente'] },
    { label: 'Pagadas', value: 'pagadas', statuses: ['pagada', 'pagado'] },
    { label: 'En espera', value: 'en_espera', statuses: ['en_espera'] },
    { label: 'En proceso', value: 'en_proceso', statuses: ['en_proceso'] },
    { label: 'Pendiente subir resultados', value: 'pendiente_subir', statuses: ['pendiente_subir'] },
    { label: 'Completadas', value: 'completadas', statuses: ['realizada', 'completado'] },
    { label: 'Canceladas', value: 'canceladas', statuses: ['cancelada', 'cancelado'] }
  ]

  /**
   * Mapeo de estados agrupados para el filtrado
   */
  const statusGroupMap: Record<string, string[]> = {
    'pendientes': ['reservada', 'pendiente'],
    'pagadas': ['pagada', 'pagado'],
    'en_espera': ['en_espera'],
    'en_proceso': ['en_proceso'],
    'pendiente_subir': ['pendiente_subir'],
    'completadas': ['realizada', 'completado'],
    'canceladas': ['cancelada', 'cancelado']
  }

  /**
   * Función utilitaria para formatear fechas en zona horaria de Lima
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Lima'
    }).format(date)
  }

  /**
   * Filtra actividades completadas para componentes que solo muestran activas
   */
  const filterActiveActivities = (activities: any[]) => {
    return activities.filter((activity: any) => 
      activity.status !== 'realizada' && 
      activity.status !== 'completado'
    )
  }

  /**
   * Verifica si una actividad coincide con el filtro de estado agrupado
   */
  const matchesStatusFilter = (activity: any, statusFilter: string): boolean => {
    if (!statusFilter) return true
    
    const statusGroup = statusGroupMap[statusFilter]
    if (statusGroup) {
      return statusGroup.includes(activity.status)
    }
    
    // Fallback para compatibilidad con estados individuales
    return activity.status === statusFilter
  }

  return {
    typeOptions,
    statusOptions,
    statusGroupMap,
    formatDate,
    filterActiveActivities,
    matchesStatusFilter
  }
}