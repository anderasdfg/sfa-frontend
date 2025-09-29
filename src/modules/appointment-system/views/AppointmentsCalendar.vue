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
  import { ref, computed, onMounted } from 'vue'
  import { useAppointmentsCalendar } from '../composables/useAppointmentsCalendar'
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
  import { AppointmentStatus, AppointmentModality } from '@/types/enums'

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

  // Estado local del componente
  const calendarRef = ref()
  const currentView = ref('dayGridMonth')
  const showAppointmentModal = ref(false)
  const selectedAppointment = ref<any>(null)
  const dateFrom = ref<Date | null>(null)
  const dateTo = ref<Date | null>(null)

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
      [AppointmentStatus.CANCELADA]: 'Cancelada'
    }
    return labels[status] || status
  }

  const getStatusSeverity = (status: AppointmentStatus) => {
    const severities = {
      [AppointmentStatus.RESERVADA]: 'warning',
      [AppointmentStatus.PAGADA]: 'success',
      [AppointmentStatus.REALIZADA]: 'info',
      [AppointmentStatus.CANCELADA]: 'danger'
    }
    return severities[status] || 'secondary'
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    const icons = {
      [AppointmentStatus.RESERVADA]: '⏳',
      [AppointmentStatus.PAGADA]: '✅',
      [AppointmentStatus.REALIZADA]: '🏁',
      [AppointmentStatus.CANCELADA]: '❌'
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

  // Lifecycle
  onMounted(() => {
    initializeData()
  })
</script>

<style scoped src="../styles/AppointmentsCalendar.css"></style>
