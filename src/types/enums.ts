/**
 * Estado de las citas médicas
 */
export enum AppointmentStatus {
  RESERVADA = 'reservada',
  PAGADA = 'pagada',
  REALIZADA = 'realizada',
  CANCELADA = 'cancelada',
  CONFIRMADA = 'confirmada'
}

/**
 * Modalidad de las citas médicas
 */
export enum AppointmentModality {
  TELECONSULTA = 'teleconsulta',
  PRESENCIAL = 'presencial'
}

/**
 * Estado de los slots de horarios
 */
export enum SlotStatus {
  DISPONIBLE = 'disponible',
  PENDIENTE = 'pendiente',
  OCUPADO = 'ocupado',
  CANCELADO = 'cancelado'
}

/**
 * Estado de las especialidades
 */
export enum SpecialtyStatus {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo'
}
