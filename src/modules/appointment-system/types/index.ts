export interface Doctor {
  id: number
  name: string
  specialtyName: string
  cmp: string
  consultationType: 'TELECONSULTA' | 'PRESENCIAL'
  location: string
  avatar: string
  availableSlots: TimeSlot[]
}

export interface TimeSlot {
  time: string
  price: number
  available: boolean
  date: string
}

export interface AppointmentBooking {
  doctorId: number
  doctorName: string
  specialty: string
  date: string
  time: string
  price: number
  consultationType: 'TELECONSULTA' | 'PRESENCIAL'
  location: string
  patientName: string
  patientEmail: string
  patientPhone: string
  status: 'pending' | 'confirmed' | 'cancelled'
}
