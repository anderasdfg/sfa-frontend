<template>
  <div class="appointments-calendar-view">
    <!-- Header con estadísticas -->
    <div class="calendar-header">
      <div class="header-content">
        <!--  <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-calendar mr-3"></i>
            Calendario de Citas
          </h1>
          <p class="page-subtitle">Visualiza y gestiona todas las citas médicas agendadas</p>
        </div> -->

        <!-- Estadísticas rápidas -->
        <!--  <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-icon total">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.total }}</div>
              <div class="stat-label">Total</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon pagadas">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.pagadas }}</div>
              <div class="stat-label">Pagadas</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon realizadas">
              <i class="pi pi-verified"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.realizadas }}</div>
              <div class="stat-label">Realizadas</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon canceladas">
              <i class="pi pi-times-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.canceladas }}</div>
              <div class="stat-label">Canceladas</div>
            </div>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="calendar-content">
      <!-- Filtros sidebar -->
      <div class="filters-sidebar">
        <Card class="filters-card">
          <template #header>
            <div class="filters-header">
              <h3>
                <i class="pi pi-filter mr-2"></i>
                Filtros
              </h3>
              <Button
                @click="clearFilters"
                label="Limpiar"
                severity="secondary"
                size="small"
                outlined
              />
            </div>
          </template>

          <template #content>
            <div class="filters-content">
              <!-- Filtro por estado -->
              <div class="filter-group">
                <label class="filter-label">Estado</label>
                <Dropdown
                  v-model="filters.statusFilter"
                  :options="statusOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar estado"
                  class="filter-dropdown"
                />
              </div>

              <!-- Filtro por modalidad -->
              <div class="filter-group">
                <label class="filter-label">Modalidad</label>
                <Dropdown
                  v-model="filters.modalityFilter"
                  :options="modalityOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar modalidad"
                  class="filter-dropdown"
                />
              </div>

              <!-- Filtro por especialidad -->
              <div class="filter-group">
                <label class="filter-label">Especialidad</label>
                <Dropdown
                  v-model="filters.specialtyFilter"
                  :options="specialtyOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar especialidad"
                  class="filter-dropdown"
                  @change="onSpecialtyChange"
                />
              </div>

              <!-- Filtro por médico -->
              <div class="filter-group">
                <label class="filter-label">Médico</label>
                <Dropdown
                  v-model="filters.doctorFilter"
                  :options="doctorOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Seleccionar médico"
                  class="filter-dropdown"
                />
              </div>

              <!-- Filtro por rango de fechas -->
              <div class="filter-group">
                <label class="filter-label">Rango de fechas</label>
                <div class="date-range-inputs">
                  <Calendar
                    v-model="dateFrom"
                    placeholder="Fecha desde"
                    date-format="dd/mm/yy"
                    class="date-input"
                    show-icon
                  />
                  <Calendar
                    v-model="dateTo"
                    placeholder="Fecha hasta"
                    date-format="dd/mm/yy"
                    class="date-input"
                    show-icon
                  />
                </div>
                <Button
                  @click="applyDateFilter"
                  label="Aplicar"
                  severity="info"
                  size="small"
                  class="apply-date-btn"
                  :disabled="!dateFrom || !dateTo"
                />
              </div>

              <!-- Leyenda de colores -->
              <div class="color-legend">
                <h4 class="legend-title">Leyenda</h4>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-color reservada"></div>
                    <span>Reservada</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color pagada"></div>
                    <span>Pagada</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color realizada"></div>
                    <span>Realizada</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color cancelada"></div>
                    <span>Cancelada</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Calendario principal -->
      <div class="calendar-container">
        <Card class="calendar-card">
          <template #content>
            <!-- Controles del calendario -->
            <div class="calendar-controls">
              <div class="view-controls">
                <Button
                  label="Mes"
                  @click="changeView('dayGridMonth')"
                  :severity="currentView === 'dayGridMonth' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'dayGridMonth'"
                  size="small"
                />
                <Button
                  label="Semana"
                  @click="changeView('timeGridWeek')"
                  :severity="currentView === 'timeGridWeek' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'timeGridWeek'"
                  size="small"
                />
                <Button
                  label="Día"
                  @click="changeView('timeGridDay')"
                  :severity="currentView === 'timeGridDay' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'timeGridDay'"
                  size="small"
                />
              </div>

              <div class="navigation-controls">
                <Button
                  icon="pi pi-chevron-left"
                  @click="goToPreviousMonth"
                  severity="secondary"
                  outlined
                />
                <span class="current-period">{{ currentPeriodLabel }}</span>
                <Button
                  icon="pi pi-chevron-right"
                  @click="goToNextMonth"
                  severity="secondary"
                  outlined
                />
                <Button label="Hoy" @click="goToToday" severity="info" outlined class="ml-3" />
              </div>

              <div class="action-controls">
                <Button
                  icon="pi pi-plus"
                  label="Registrar Cita"
                  @click="openCreateAppointmentDialog"
                  severity="success"
                  class="mr-2"
                />
                <Button
                  icon="pi pi-refresh"
                  @click="refreshData"
                  severity="secondary"
                  outlined
                  v-tooltip.top="'Actualizar'"
                />
              </div>
            </div>

            <!-- FullCalendar -->
            <div class="calendar-wrapper">
              <FullCalendar ref="calendarRef" :options="calendarOptions" />
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>

    <!-- Modal de registro de cita -->
    <Dialog
      v-model:visible="showCreateAppointmentDialog"
      header="Registrar Nueva Cita"
      modal
      class="create-appointment-modal"
      :style="{ width: '600px' }"
    >
      <div class="create-appointment-content">
        <!-- Paso 1: Buscar o registrar paciente -->
        <div v-if="createStep === 1" class="step-content">
          <h4 class="step-title">Paso 1: Buscar Paciente</h4>

          <div class="dni-search-section">
            <label class="input-label">DNI del Paciente</label>
            <div class="dni-input-group">
              <InputText
                v-model="newAppointment.patientDNI"
                placeholder="Ingrese el DNI (8 dígitos)"
                class="dni-input"
                :disabled="searchingPatient"
                @keyup.enter="searchPatientByDNI"
              />
              <Button
                label="Buscar"
                icon="pi pi-search"
                @click="searchPatientByDNI"
                :loading="searchingPatient"
                :disabled="!newAppointment.patientDNI || newAppointment.patientDNI.length < 8"
              />
            </div>
            <small v-if="patientSearchError" class="error-message">
              {{ patientSearchError }}
            </small>
          </div>

          <!-- Paciente encontrado -->
          <div v-if="foundPatient" class="patient-found">
            <div class="success-message">
              <i class="pi pi-check-circle"></i>
              Paciente encontrado
            </div>
            <div class="patient-info">
              <p><strong>Nombre:</strong> {{ foundPatient.first_name }} {{ foundPatient.last_name }}</p>
              <p><strong>DNI:</strong> {{ foundPatient.document_number }}</p>
              <p v-if="foundPatient.email"><strong>Email:</strong> {{ foundPatient.email }}</p>
              <p v-if="foundPatient.phone"><strong>Teléfono:</strong> {{ foundPatient.phone }}</p>
            </div>
            <Button
              label="Continuar con este paciente"
              icon="pi pi-arrow-right"
              @click="createStep = 2"
              class="mt-3"
            />
          </div>

          <!-- Formulario de registro de paciente -->
          <div v-else-if="showPatientRegistration" class="patient-registration">
            <div class="info-message">
              <i class="pi pi-info-circle"></i>
              No se encontró el paciente. Complete los datos para registrarlo.
            </div>

            <div class="registration-form">
              <div class="form-row">
                <div class="form-field">
                  <label>Nombres *</label>
                  <InputText v-model="newPatient.first_name" placeholder="Nombres" />
                </div>
                <div class="form-field">
                  <label>Apellidos *</label>
                  <InputText v-model="newPatient.last_name" placeholder="Apellidos" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Email *</label>
                  <InputText v-model="newPatient.email" type="email" placeholder="correo@ejemplo.com" />
                </div>
                <div class="form-field">
                  <label>Teléfono *</label>
                  <InputText v-model="newPatient.phone" placeholder="999999999" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Fecha de Nacimiento</label>
                  <Calendar v-model="newPatient.date_of_birth" date-format="dd/mm/yy" show-icon />
                </div>
                <div class="form-field">
                  <label>Género</label>
                  <Dropdown
                    v-model="newPatient.gender"
                    :options="genderOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Seleccionar"
                  />
                </div>
              </div>

              <Button
                label="Registrar y Continuar"
                icon="pi pi-user-plus"
                @click="registerPatient"
                :loading="registeringPatient"
                :disabled="!canRegisterPatient"
                class="mt-3"
              />
            </div>
          </div>
        </div>

        <!-- Paso 2: Seleccionar especialidad, médico y horario -->
        <div v-if="createStep === 2" class="step-content">
          <h4 class="step-title">Paso 2: Datos de la Cita</h4>

          <div class="appointment-form">
            <div class="form-field">
              <label>Especialidad *</label>
              <Dropdown
                v-model="newAppointment.specialty_id"
                :options="specialtyOptions"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar especialidad"
                @change="onAppointmentSpecialtyChange"
              />
            </div>

            <div class="form-field">
              <label>Médico *</label>
              <Dropdown
                v-model="newAppointment.doctor_id"
                :options="filteredDoctorsForAppointment"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar médico"
                :disabled="!newAppointment.specialty_id"
                @change="onDoctorChange"
              />
            </div>

            <div class="form-field">
              <label>Fecha *</label>
              <Calendar
                v-model="newAppointment.date"
                date-format="dd/mm/yy"
                show-icon
                :min-date="new Date()"
                placeholder="Seleccionar fecha"
                :disabled="!newAppointment.doctor_id"
                @date-select="loadAvailableSlots"
              />
            </div>

            <div class="form-field" v-if="availableSlots.length > 0">
              <label>Horario Disponible *</label>
              <Dropdown
                v-model="newAppointment.slot_id"
                :options="slotOptions"
                option-label="label"
                option-value="value"
                placeholder="Seleccionar horario"
              />
            </div>

            <div v-if="loadingSlotsForAppointment" class="loading-slots">
              <ProgressSpinner style="width: 30px; height: 30px" />
              <span>Cargando horarios disponibles...</span>
            </div>

            <div v-if="newAppointment.date && newAppointment.doctor_id && availableSlots.length === 0 && !loadingSlotsForAppointment" class="no-slots-message">
              <i class="pi pi-info-circle"></i>
              No hay horarios disponibles para esta fecha
            </div>

            <div class="form-field">
              <label>Modalidad *</label>
              <div class="modality-options">
                <div
                  class="modality-option"
                  :class="{ active: newAppointment.modality === 'presencial' }"
                  @click="newAppointment.modality = 'presencial'"
                >
                  <i class="pi pi-building"></i>
                  <span>Presencial</span>
                </div>
                <div
                  class="modality-option"
                  :class="{ active: newAppointment.modality === 'teleconsulta' }"
                  @click="newAppointment.modality = 'teleconsulta'"
                >
                  <i class="pi pi-video"></i>
                  <span>Teleconsulta</span>
                </div>
              </div>
            </div>
          </div>

          <div class="dialog-actions">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              @click="createStep = 1"
              severity="secondary"
              outlined
            />
            <Button
              label="Crear Cita"
              icon="pi pi-check"
              @click="createAppointment"
              :loading="creatingAppointment"
              :disabled="!canCreateAppointment"
            />
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Modal de detalles de cita -->
    <Dialog
      v-model:visible="showAppointmentModal"
      :header="modalTitle"
      modal
      class="appointment-modal"
      :style="{ width: '500px' }"
    >
      <div v-if="selectedAppointment" class="appointment-details">
        <div class="detail-section">
          <h4>Información del Paciente</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Nombre:</label>
              <span>{{ selectedAppointment.extendedProps.patientName }}</span>
            </div>
            <div class="detail-item" v-if="selectedAppointment.extendedProps.phone">
              <label>Teléfono:</label>
              <span>{{ selectedAppointment.extendedProps.phone }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Información Médica</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Médico:</label>
              <span>{{ selectedAppointment.extendedProps.doctorName }}</span>
            </div>
            <div class="detail-item">
              <label>Especialidad:</label>
              <span>{{ selectedAppointment.extendedProps.specialty }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4>Detalles de la Cita</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Estado:</label>
              <Tag
                :value="getStatusLabel(selectedAppointment.extendedProps.status)"
                :severity="getStatusSeverity(selectedAppointment.extendedProps.status)"
              />
            </div>
            <div class="detail-item">
              <label>Modalidad:</label>
              <Tag
                :value="getModalityLabel(selectedAppointment.extendedProps.modality)"
                :severity="getModalitySeverity(selectedAppointment.extendedProps.modality)"
              />
            </div>
            <div class="detail-item">
              <label>Fecha y hora:</label>
              <span>{{ formatDateTime(selectedAppointment.start) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useAppointmentsCalendar } from '../composables/useAppointmentsCalendar'
  import { useToast } from 'primevue/usetoast'
  import FullCalendar from '@fullcalendar/vue3'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import Dropdown from 'primevue/dropdown'
  import Calendar from 'primevue/calendar'
  import Dialog from 'primevue/dialog'
  import Tag from 'primevue/tag'
  import ProgressSpinner from 'primevue/progressspinner'
  import InputText from 'primevue/inputtext'
  import { AppointmentStatus, AppointmentModality, SlotStatus } from '@/types/enums'
  import { PatientService } from '@/services/patient.service'
  import { AppointmentService } from '@/services/appointments.service'
  import { SlotService } from '@/services/slots.service'
  import { DoctorService } from '@/services/doctors.service'
  import type { Patient } from '@/types/medical.types'
  import type { AppointmentSlot } from '@/types/slots.types'
  import type { Doctor } from '@/types/doctor.types'
  import apiClient from '@/shared/lib/axios.config'

  // Composable
  const {
    loading,
    filters,
    currentMonth,
    calendarEvents,
    statusOptions,
    modalityOptions,
    specialtyOptions,
    doctorOptions,
    initializeData,
    refreshData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    updateFilters,
    clearFilters,
    applyDateRangeFilter
  } = useAppointmentsCalendar()

  const toast = useToast()

  // Estado local del componente
  const calendarRef = ref()
  const currentView = ref('dayGridMonth')
  const showAppointmentModal = ref(false)
  const selectedAppointment = ref<any>(null)
  const dateFrom = ref<Date | null>(null)
  const dateTo = ref<Date | null>(null)

  // Estado para crear cita
  const showCreateAppointmentDialog = ref(false)
  const createStep = ref(1)
  const searchingPatient = ref(false)
  const registeringPatient = ref(false)
  const creatingAppointment = ref(false)
  const loadingSlotsForAppointment = ref(false)
  const patientSearchError = ref('')
  const foundPatient = ref<Patient | null>(null)
  const showPatientRegistration = ref(false)
  const availableSlots = ref<AppointmentSlot[]>([])
  const allDoctors = ref<Doctor[]>([])

  const newAppointment = ref({
    patientDNI: '',
    patient_id: null as number | null,
    specialty_id: null as number | null,
    doctor_id: null as number | null,
    slot_id: null as number | null,
    date: null as Date | null,
    modality: 'presencial' as 'presencial' | 'teleconsulta'
  })

  const newPatient = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '',
    date_of_birth: null as Date | null,
    gender: 'M'
  })

  const genderOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'O' }
  ]

  // Computed
  const currentPeriodLabel = computed(() => {
    return currentMonth.value.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    })
  })

  const modalTitle = computed(() => {
    if (!selectedAppointment.value) return ''
    return `Cita - ${selectedAppointment.value.extendedProps.patientName}`
  })

  const filteredDoctorsForAppointment = computed(() => {
    if (!newAppointment.value.specialty_id) return []
    return allDoctors.value
      .filter(d => d.specialty_id === newAppointment.value.specialty_id)
      .map(d => ({
        label: `Dr. ${d.first_name} ${d.last_name}`,
        value: d.id
      }))
  })

  const slotOptions = computed(() => {
    return availableSlots.value.map(slot => {
      const startTime = new Date(slot.scheduled_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      const endTime = new Date(new Date(slot.scheduled_at).getTime() + slot.duration_minutes * 60000).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      return {
        label: `${startTime} - ${endTime}`,
        value: slot.id
      }
    })
  })

  const canRegisterPatient = computed(() => {
    return (
      newPatient.value.first_name &&
      newPatient.value.last_name &&
      newPatient.value.email &&
      newPatient.value.phone &&
      newPatient.value.document_number
    )
  })

  const canCreateAppointment = computed(() => {
    return (
      newAppointment.value.patient_id &&
      newAppointment.value.doctor_id &&
      newAppointment.value.slot_id &&
      newAppointment.value.date &&
      newAppointment.value.modality
    )
  })

  // Opciones del calendario
  const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: currentView.value,
    headerToolbar: false as const,
    locale: 'es',
    firstDay: 1,
    height: 'auto',
    events: calendarEvents.value,
    eventClick: handleEventClick,
    eventContent: renderEventContent,
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    weekends: true,
    eventDisplay: 'block',
    dayMaxEvents: 3,
    moreLinkClick: 'popover',
    eventMinHeight: 40, // Altura mínima para eventos en vista de tiempo
    eventShortHeight: 30, // Altura para eventos cortos
    expandRows: true, // Expandir filas para mostrar más contenido
    // Configuración específica para vistas de tiempo
    views: {
      timeGridWeek: {
        eventMinHeight: 50,
        slotEventOverlap: false
      },
      timeGridDay: {
        eventMinHeight: 60,
        slotEventOverlap: false
      }
    }
  }))

  // Event handlers
  const handleEventClick = (info: any) => {
    selectedAppointment.value = info.event
    showAppointmentModal.value = true
  }

  const renderEventContent = (eventInfo: any) => {
    const event = eventInfo.event
    const props = event.extendedProps
    const view = eventInfo.view.type

    const modalityIcon = props.modality === AppointmentModality.TELECONSULTA ? '💻' : '🏥'
    const statusIcon = getStatusIcon(props.status)

    // Diferentes layouts según la vista
    if (view === 'dayGridMonth') {
      // Vista mensual - layout compacto
      return {
        html: `
        <div class="custom-appointment-event month-view">
          <div class="event-header">
            <span class="event-icons">${modalityIcon} ${statusIcon}</span>
          </div>
          <div class="event-title">${props.patientName}</div>
          <div class="event-doctor">${props.doctorName}</div>
        </div>
      `
      }
    } else {
      let eventDate: Date
      const eventStartString = event.start

      if (typeof eventStartString === 'string' && eventStartString.endsWith('Z')) {
        // Remover Z y tratar como hora local
        const localDateString = eventStartString.replace('Z', '')
        eventDate = new Date(localDateString)
      } else {
        eventDate = new Date(eventStartString)
      }

      const startTime = eventDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })

      return {
        html: `
        <div class="custom-appointment-event time-view">
          <div class="event-time-header">
            <span class="event-time">${startTime}</span>
            <span class="event-icons">${modalityIcon} ${statusIcon}</span>
          </div>
          <div class="event-patient">
            <strong>${props.patientName}</strong>
          </div>
          <div class="event-doctor">${props.doctorName}</div>
          <div class="event-specialty">${props.specialty}</div>
        </div>
      `
      }
    }
  }

  // Funciones auxiliares
  const changeView = (view: string) => {
    currentView.value = view
    if (calendarRef.value) {
      calendarRef.value.getApi().changeView(view)
    }
  }

  const onSpecialtyChange = () => {
    // Reset doctor filter when specialty changes
    updateFilters({ doctorFilter: 'all' })
  }

  const applyDateFilter = () => {
    if (dateFrom.value && dateTo.value) {
      const from = dateFrom.value.toISOString().split('T')[0]
      const to = dateTo.value.toISOString().split('T')[0]
      applyDateRangeFilter(from, to)
    }
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      [AppointmentStatus.RESERVADA]: 'Reservada',
      [AppointmentStatus.PAGADA]: 'Pagada',
      [AppointmentStatus.REALIZADA]: 'Realizada',
      [AppointmentStatus.CANCELADA]: 'Cancelada',
      [AppointmentStatus.CONFIRMADA]: 'Confirmada'
    }
    return labels[status] || status
  }

  const getStatusSeverity = (status: AppointmentStatus) => {
    const severities = {
      [AppointmentStatus.RESERVADA]: 'warning',
      [AppointmentStatus.PAGADA]: 'success',
      [AppointmentStatus.REALIZADA]: 'info',
      [AppointmentStatus.CANCELADA]: 'danger',
      [AppointmentStatus.CONFIRMADA]: 'info'
    }
    return severities[status] || 'secondary'
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    const icons = {
      [AppointmentStatus.RESERVADA]: '⏳',
      [AppointmentStatus.PAGADA]: '✅',
      [AppointmentStatus.REALIZADA]: '🏁',
      [AppointmentStatus.CANCELADA]: '❌',
      [AppointmentStatus.CONFIRMADA]: '✅'
    }
    return icons[status] || '📅'
  }

  const getModalityLabel = (modality: AppointmentModality) => {
    const labels = {
      [AppointmentModality.PRESENCIAL]: 'Presencial',
      [AppointmentModality.TELECONSULTA]: 'Teleconsulta'
    }
    return labels[modality] || modality
  }

  const getModalitySeverity = (modality: AppointmentModality) => {
    const severities = {
      [AppointmentModality.PRESENCIAL]: 'info',
      [AppointmentModality.TELECONSULTA]: 'help'
    }
    return severities[modality] || 'secondary'
  }

  const formatDateTime = (dateString: string) => {
    // Manejar zona horaria correctamente
    let date: Date
    if (typeof dateString === 'string' && dateString.endsWith('Z')) {
      // Remover Z y tratar como hora local
      const localDateString = dateString.replace('Z', '')
      date = new Date(localDateString)
    } else {
      date = new Date(dateString)
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Funciones para crear cita
  const openCreateAppointmentDialog = () => {
    showCreateAppointmentDialog.value = true
    createStep.value = 1
    resetCreateAppointmentForm()
  }

  const resetCreateAppointmentForm = () => {
    newAppointment.value = {
      patientDNI: '',
      patient_id: null,
      specialty_id: null,
      doctor_id: null,
      slot_id: null,
      date: null,
      modality: 'presencial'
    }
    newPatient.value = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      document_number: '',
      date_of_birth: null,
      gender: 'M'
    }
    foundPatient.value = null
    showPatientRegistration.value = false
    patientSearchError.value = ''
    availableSlots.value = []
  }

  const searchPatientByDNI = async () => {
    if (!newAppointment.value.patientDNI || newAppointment.value.patientDNI.length < 8) {
      patientSearchError.value = 'Ingrese un DNI válido (8 dígitos)'
      return
    }

    searchingPatient.value = true
    patientSearchError.value = ''
    foundPatient.value = null
    showPatientRegistration.value = false

    try {
      const patient = await PatientService.getPatientByDNI(newAppointment.value.patientDNI)

      if (patient) {
        foundPatient.value = patient
        newAppointment.value.patient_id = patient.id
      } else {
        showPatientRegistration.value = true
        newPatient.value.document_number = newAppointment.value.patientDNI
      }
    } catch (error: any) {
      patientSearchError.value = error.message || 'Error al buscar paciente'
      showPatientRegistration.value = true
      newPatient.value.document_number = newAppointment.value.patientDNI
    } finally {
      searchingPatient.value = false
    }
  }

  const registerPatient = async () => {
    if (!canRegisterPatient.value) return

    registeringPatient.value = true

    try {
      const patientData: any = {
        first_name: newPatient.value.first_name,
        last_name: newPatient.value.last_name,
        email: newPatient.value.email,
        phone: newPatient.value.phone,
        document_number: newPatient.value.document_number,
        gender: newPatient.value.gender
      }

      if (newPatient.value.date_of_birth) {
        patientData.date_of_birth = newPatient.value.date_of_birth.toISOString().split('T')[0]
      }

      const response = await apiClient.post('/patients', patientData)
      const createdPatient = response.data.data || response.data

      foundPatient.value = createdPatient
      newAppointment.value.patient_id = createdPatient.id
      showPatientRegistration.value = false

      toast.add({
        severity: 'success',
        summary: 'Paciente registrado',
        detail: 'El paciente ha sido registrado exitosamente',
        life: 3000
      })

      createStep.value = 2
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo registrar el paciente',
        life: 3000
      })
    } finally {
      registeringPatient.value = false
    }
  }

  const onAppointmentSpecialtyChange = () => {
    newAppointment.value.doctor_id = null
    newAppointment.value.slot_id = null
    availableSlots.value = []
  }

  const onDoctorChange = () => {
    newAppointment.value.slot_id = null
    availableSlots.value = []
  }

  const loadAvailableSlots = async () => {
    if (!newAppointment.value.doctor_id || !newAppointment.value.date) return

    loadingSlotsForAppointment.value = true
    availableSlots.value = []
    newAppointment.value.slot_id = null

    try {
      const dateStr = newAppointment.value.date.toISOString().split('T')[0]
      const slots = await SlotService.getSlots({
        doctor_id: newAppointment.value.doctor_id,
        date: dateStr
      })
      // Filter only available slots
      availableSlots.value = slots.filter(slot => slot.status === SlotStatus.DISPONIBLE)
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los horarios disponibles',
        life: 3000
      })
    } finally {
      loadingSlotsForAppointment.value = false
    }
  }

  const createAppointment = async () => {
    if (!canCreateAppointment.value) return

    creatingAppointment.value = true

    try {
      const appointmentData = {
        patient_id: newAppointment.value.patient_id!,
        doctor_id: newAppointment.value.doctor_id!,
        slot_id: newAppointment.value.slot_id!,
        appointment_date: newAppointment.value.date!.toISOString().split('T')[0],
        status: AppointmentStatus.RESERVADA,
        modality: newAppointment.value.modality === 'presencial'
          ? AppointmentModality.PRESENCIAL
          : AppointmentModality.TELECONSULTA,
        scheduled_at: new Date()
      }

      await AppointmentService.createAppointment(appointmentData)

      toast.add({
        severity: 'success',
        summary: 'Cita creada',
        detail: 'La cita ha sido registrada exitosamente',
        life: 3000
      })

      showCreateAppointmentDialog.value = false
      await refreshData()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo crear la cita',
        life: 3000
      })
    } finally {
      creatingAppointment.value = false
    }
  }

  const loadDoctors = async () => {
    try {
      const doctors = await DoctorService.getDoctors()
      allDoctors.value = doctors
    } catch (error) {
      console.error('Error loading doctors:', error)
    }
  }

  // Lifecycle
  onMounted(() => {
    initializeData()
    loadDoctors()
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden'
    document.body.style.height = '100vh'
  })

  onUnmounted(() => {
    // Restaurar scroll del body al salir
    document.body.style.overflow = ''
    document.body.style.height = ''
  })
</script>

<style scoped src="../styles/AppointmentsCalendar.css"></style>
