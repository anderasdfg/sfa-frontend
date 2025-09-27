import { ref, computed } from 'vue'
import { SlotService } from '@/services/slots.service'
import { DoctorService } from '@/services/doctors.service'
import { SpecialtyService } from '@/services/specialty.service'
import type { AppointmentSlot } from '@/types/slots.types'
import type { Doctor } from '@/types/doctor.types'
import type { Specialty } from '@/types/specialty.types'
import { AppointmentModality } from '@/types/enums'

// Interfaz para el doctor con color asignado
interface DoctorWithColor extends Doctor {
  color: string
  name: string
}

// Interfaz para eventos del calendario
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor: string
  extendedProps: {
    doctorId: number
    slotId: number
    status: 'available' | 'occupied'
    patientName?: string
    appointmentId?: number
    price: number
    modality: AppointmentModality
  }
}

// Interfaz para la semana actual
interface WeekRange {
  start: Date
  end: Date
}

// Colores predefinidos para los médicos
const DOCTOR_COLORS = [
  '#3498db', // Azul
  '#e74c3c', // Rojo
  '#2ecc71', // Verde
  '#f39c12', // Naranja
  '#9b59b6', // Púrpura
  '#1abc9c', // Turquesa
  '#34495e', // Gris oscuro
  '#e67e22', // Naranja oscuro
  '#8e44ad', // Púrpura oscuro
  '#27ae60', // Verde oscuro
  '#2980b9', // Azul oscuro
  '#c0392b'  // Rojo oscuro
]

export function useScheduleCalendar() {
  // Estado reactivo
  const loading = ref(false)
  const error = ref<string | null>(null)
  const availableDoctors = ref<DoctorWithColor[]>([])
  const selectedDoctors = ref<number[]>([])
  const appointmentSlots = ref<AppointmentSlot[]>([])
  const availableSpecialties = ref<Specialty[]>([])
  const selectedSpecialtyId = ref<number>(0) // 0 = todas las especialidades
  
  // Semana actual
  const currentWeek = ref<WeekRange>({
    start: getStartOfWeek(new Date()),
    end: getEndOfWeek(new Date())
  })

  // Computed
  const allDoctorsSelected = computed({
    get: () => selectedDoctors.value.length === availableDoctors.value.length,
    set: (value: boolean) => {
      if (value) {
        selectedDoctors.value = availableDoctors.value.map(d => d.id)
      } else {
        selectedDoctors.value = []
      }
    }
  })

  // Médicos filtrados por especialidad
  const filteredDoctors = computed(() => {
    if (selectedSpecialtyId.value === 0) {
      return availableDoctors.value
    }
    return availableDoctors.value.filter(doctor => doctor.specialty_id === selectedSpecialtyId.value)
  })

  // Eventos filtrados para el calendario
  const calendarEvents = computed(() => {
    return appointmentSlots.value
      .filter(slot => {
        // Filtrar por médicos seleccionados
        const isDoctorSelected = selectedDoctors.value.includes(slot.doctor_data.id)
        
        // Filtrar por especialidad si está seleccionada
        const isSpecialtyMatch = selectedSpecialtyId.value === 0 || 
          slot.doctor_data.specialty_id === selectedSpecialtyId.value
        
        return isDoctorSelected && isSpecialtyMatch
      })
      .map(slot => transformSlotToEvent(slot))
  })

  // Funciones auxiliares para fechas
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Lunes como primer día
    return new Date(d.setDate(diff))
  }

  function getEndOfWeek(date: Date): Date {
    const start = getStartOfWeek(date)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end
  }

  function formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0]
  }

  // Transformar slot a evento del calendario
  function transformSlotToEvent(slot: AppointmentSlot): CalendarEvent {
    const doctor = availableDoctors.value.find(d => d.id === slot.doctor_data.id)
    const doctorColor = doctor?.color || '#6c757d'
    
    // Crear fecha y hora de inicio - manejar zona horaria correctamente
    const scheduledAtString = typeof slot.scheduled_at === 'string' 
      ? slot.scheduled_at 
      : slot.scheduled_at.toISOString()
    
    // Si viene con Z (UTC), convertir a fecha local manteniendo la hora
    let slotDate: Date
    if (scheduledAtString.endsWith('Z')) {
      // Remover Z y tratar como hora local
      const localDateString = scheduledAtString.replace('Z', '')
      slotDate = new Date(localDateString)
    } else {
      slotDate = new Date(scheduledAtString)
    }
    
    const startTime = slotDate.toISOString()
    
    // Calcular fecha y hora de fin
    const endTime = new Date(slotDate.getTime() + slot.duration_minutes * 60000).toISOString()
    
    // Determinar estado - usar el status del backend o fallback a lógica anterior
    const backendStatus = slot.status?.toLowerCase()
    let status: 'available' | 'occupied'
    
    if (backendStatus === 'disponible') {
      status = 'available'
    } else if (backendStatus === 'ocupado') {
      status = 'occupied'
    } else {
      // Fallback a lógica anterior
      const isOccupied = slot.patient_data !== null
      status = isOccupied ? 'occupied' : 'available'
    }
    
    // Verificar si es un evento pasado
    const now = new Date()
    const isPast = slotDate < now
    
    // Título del evento - solo nombre del médico
    const title = `Dr. ${slot.doctor_data.first_name} ${slot.doctor_data.last_name}`
    
    // Ajustar color para eventos pasados
    let backgroundColor = doctorColor
    let textColor = '#ffffff'
    
    if (isPast) {
      // Hacer el color más opaco para eventos pasados
      backgroundColor = doctorColor + '60' // Agregar transparencia
      textColor = 'rgba(255, 255, 255, 0.7)'
    }

    return {
      id: `slot-${slot.id}`,
      title,
      start: startTime,
      end: endTime,
      backgroundColor,
      borderColor: backgroundColor,
      textColor,
      extendedProps: {
        doctorId: slot.doctor_data.id,
        slotId: slot.id,
        status,
        patientName: slot.patient_data ? 
          `${slot.patient_data.first_name} ${slot.patient_data.last_name}` : 
          undefined,
        appointmentId: undefined, // TODO: Obtener del slot si está disponible
        price: slot.price,
        modality: slot.schedule_modality
      }
    }
  }

  // Asignar colores a los médicos
  function assignDoctorColors(doctors: Doctor[]): DoctorWithColor[] {
    return doctors.map((doctor, index) => ({
      ...doctor,
      name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      color: DOCTOR_COLORS[index % DOCTOR_COLORS.length]
    }))
  }

  // Cargar especialidades disponibles
  async function loadAvailableSpecialties() {
    try {
      const specialties = await SpecialtyService.getActiveSpecialties()
      availableSpecialties.value = specialties
    } catch (err) {
      console.error('Error loading specialties:', err)
      error.value = 'No se pudieron cargar las especialidades'
    }
  }

  // Cargar médicos disponibles
  async function loadAvailableDoctors() {
    try {
      const doctors = await DoctorService.getDoctors()
      availableDoctors.value = assignDoctorColors(doctors)
      
      // Seleccionar todos los médicos por defecto
      selectedDoctors.value = availableDoctors.value.map(d => d.id)
    } catch (err) {
      console.error('Error loading doctors:', err)
      error.value = 'No se pudieron cargar los médicos'
    }
  }

  // Cargar slots de una semana específica
  async function loadWeekSlots(weekStart: Date, weekEnd: Date) {
    try {
      loading.value = true
      const slots: AppointmentSlot[] = []
      
      // Cargar slots para cada día de la semana
      const currentDate = new Date(weekStart)
      while (currentDate <= weekEnd) {
        try {
          // Crear query params sin specialty_id cuando es 0
          const queryParams: any = {
            date: formatDateForAPI(currentDate),
            modality: undefined, // Sin filtro de modalidad
            doctor_id: null // Sin filtro de médico específico
          }
          
          // Solo agregar specialty_id si no es 0
          // No enviamos specialty_id para obtener todas las especialidades
          
          const daySlots = await SlotService.getSlots(queryParams)
          slots.push(...daySlots)
        } catch (dayError) {
          console.warn(`Error loading slots for ${formatDateForAPI(currentDate)}:`, dayError)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      appointmentSlots.value = slots
    } catch (err) {
      console.error('Error loading week slots:', err)
      error.value = 'No se pudieron cargar los horarios de la semana'
    } finally {
      loading.value = false
    }
  }

  // Cargar datos de la semana actual
  async function loadWeekData() {
    await Promise.all([
      loadAvailableSpecialties(),
      loadAvailableDoctors(),
      loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
    ])
  }

  // Cambiar especialidad seleccionada
  function changeSpecialty(specialtyId: number) {
    selectedSpecialtyId.value = specialtyId
    
    // Actualizar médicos seleccionados basado en la especialidad
    if (specialtyId === 0) {
      // Todas las especialidades - seleccionar todos los médicos
      selectedDoctors.value = availableDoctors.value.map(d => d.id)
    } else {
      // Especialidad específica - seleccionar solo médicos de esa especialidad
      selectedDoctors.value = availableDoctors.value
        .filter(doctor => doctor.specialty_id === specialtyId)
        .map(d => d.id)
    }
  }

  // Navegación de semanas
  function previousWeek() {
    const newStart = new Date(currentWeek.value.start)
    newStart.setDate(newStart.getDate() - 7)
    
    currentWeek.value = {
      start: newStart,
      end: getEndOfWeek(newStart)
    }
    
    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  function nextWeek() {
    const newStart = new Date(currentWeek.value.start)
    newStart.setDate(newStart.getDate() + 7)
    
    currentWeek.value = {
      start: newStart,
      end: getEndOfWeek(newStart)
    }
    
    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  function goToToday() {
    const today = new Date()
    currentWeek.value = {
      start: getStartOfWeek(today),
      end: getEndOfWeek(today)
    }
    
    loadWeekSlots(currentWeek.value.start, currentWeek.value.end)
  }

  // Toggle de selección de médicos
  function toggleAllDoctors() {
    allDoctorsSelected.value = !allDoctorsSelected.value
  }

  return {
    // Estado
    loading,
    error,
    availableDoctors,
    selectedDoctors,
    appointmentSlots,
    currentWeek,
    availableSpecialties,
    selectedSpecialtyId,
    
    // Computed
    allDoctorsSelected,
    calendarEvents,
    filteredDoctors,
    
    // Métodos
    loadWeekData,
    loadAvailableDoctors,
    loadAvailableSpecialties,
    loadWeekSlots,
    changeSpecialty,
    previousWeek,
    nextWeek,
    goToToday,
    toggleAllDoctors
  }
}
