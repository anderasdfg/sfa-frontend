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

/**
 * Estado de la cola de pacientes
 */
export enum PatientQueueStatus {
  WAITING = 'waiting',
  IN_CONSULTATION = 'in_consultation',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Estado de asistencia de doctores
 */
export enum DoctorAttendanceStatus {
  PRESENTE = 'presente',
  AUSENTE = 'ausente',
  TARDANZA = 'tardanza',
  PERMISO = 'permiso',
  VACACIONES = 'vacaciones'
}

/**
 * Estado de videollamadas
 */
export enum VideoMeetingStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Estado de consultas médicas
 */
export enum ConsultationStatus {
  PENDIENTE = 'pendiente',
  INICIADA = 'iniciada',
  EN_CURSO = 'en_curso',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada'
}
