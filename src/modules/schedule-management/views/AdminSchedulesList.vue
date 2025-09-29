<template>
  <div class="admin-schedules-view">
    <!-- Filters Sidebar -->
    <div class="schedules-content">
      <div class="filters-sidebar">
        <Accordion class="doctors-filter">
          <AccordionPanel value="0">
            <AccordionHeader>
              <i class="pi pi-filter mr-2"></i>
              Filtrar Médicos
            </AccordionHeader>
            <AccordionContent>
              <div class="specialty-filter">
                <Dropdown
                  v-model="selectedSpecialtyId"
                  :options="specialtyOptions"
                  option-label="name"
                  option-value="id"
                  @change="onSpecialtyChange"
                  class="specialty-dropdown"
                />
              </div>
              <div class="doctors-list">
                <div class="select-all-option">
                  <Checkbox
                    v-model="allDoctorsSelected"
                    :binary="true"
                    @change="toggleAllDoctors"
                  />
                  <label class="ml-2 font-semibold">Todos los médicos</label>
                </div>
                <Divider />
                <div v-for="doctor in filteredDoctors" :key="doctor.id" class="doctor-filter-item">
                  <Checkbox v-model="selectedDoctors" :value="doctor.id" :binary="false" />
                  <div class="doctor-info ml-2">
                    <div
                      class="doctor-color-indicator"
                      :style="{ backgroundColor: doctor.color }"
                    ></div>
                    <div class="doctor-details">
                      <span class="doctor-name">{{ doctor.name }}</span>
                      <span class="doctor-specialty">{{ doctor.specialty_name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </div>

      <!-- Calendar -->
      <div class="calendar-container">
        <Card class="calendar-card">
          <template #content>
            <div class="view-controls">
              <!-- View Type Selector -->
              <div class="view-selector">
                <Button
                  label="1 día"
                  @click="changeView('timeGridDay')"
                  :severity="currentView === 'timeGridDay' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'timeGridDay'"
                  size="small"
                />
                <Button
                  label="3 días"
                  @click="changeView('timeGrid3Days')"
                  :severity="currentView === 'timeGrid3Days' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'timeGrid3Days'"
                  size="small"
                />
                <Button
                  label="Semana"
                  @click="changeView('timeGridWeek')"
                  :severity="currentView === 'timeGridWeek' ? 'info' : 'secondary'"
                  :outlined="currentView !== 'timeGridWeek'"
                  size="small"
                />
              </div>

              <!-- Navigation -->
              <div class="week-navigation">
                <Button
                  icon="pi pi-chevron-left"
                  @click="previousPeriod"
                  severity="secondary"
                  outlined
                />
                <span class="current-week">{{ currentPeriodLabel }}</span>
                <Button
                  icon="pi pi-chevron-right"
                  @click="nextPeriod"
                  severity="secondary"
                  outlined
                />
                <Button label="Hoy" @click="goToToday" severity="info" outlined class="ml-3" />
              </div>
            </div>
            <FullCalendar ref="calendarRef" :options="calendarOptions" />
          </template>
        </Card>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>

    <!-- Modal para crear horarios -->
    <CreateScheduleModal
      v-model:visible="showCreateModal"
      :selected-date="selectedDate"
      :available-doctors="availableDoctors"
      :loading="createScheduleLoading"
      @submit="handleCreateSchedule"
    />
  </div>
</template>
<script setup lang="ts">
  import { useScheduleCalendar } from '../composables/useScheduleCalendar'
  import { useCreateSchedule, type ScheduleFormData } from '../composables/useCreateSchedule'
  import CreateScheduleModal from '../components/CreateScheduleModal.vue'
  import FullCalendar from '@fullcalendar/vue3'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import Checkbox from 'primevue/checkbox'
  import Divider from 'primevue/divider'
  import Dropdown from 'primevue/dropdown'
  import ProgressSpinner from 'primevue/progressspinner'
  import { ref, computed, onMounted } from 'vue'
  import Accordion from 'primevue/accordion'
  import AccordionPanel from 'primevue/accordionpanel'
  import AccordionHeader from 'primevue/accordionheader'
  import AccordionContent from 'primevue/accordioncontent'

  // Composables
  const {
    loading,
    currentWeek,
    selectedDoctors,
    calendarEvents,
    availableSpecialties,
    selectedSpecialtyId,
    filteredDoctors,
    loadWeekData,
    changeSpecialty,
    previousWeek,
    nextWeek,
    goToToday,
    toggleAllDoctors,
    allDoctorsSelected
  } = useScheduleCalendar()

  // Composable para crear horarios
  const { loading: createScheduleLoading, createSchedules } = useCreateSchedule()

  // Vista actual del calendario
  const currentView = ref('timeGridWeek')

  // Referencia al calendario
  const calendarRef = ref()

  // Label dinámico según la vista
  const currentPeriodLabel = computed(() => {
    if (currentView.value === 'timeGridDay') {
      return currentWeek.value.start.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }
    const start = currentWeek.value.start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
    const end = currentWeek.value.end.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
    return `${start} - ${end}`
  })

  // Opciones para el dropdown de especialidades
  const specialtyOptions = computed(() => [
    { id: 0, name: 'Todas las especialidades' },
    ...availableSpecialties.value.map(specialty => ({
      id: specialty.id,
      name: specialty.name
    }))
  ])

  // FullCalendar options
  const calendarOptions = computed(() => ({
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: currentView.value,
    headerToolbar: false as const, // Usamos nuestro propio header
    firstDay: 1,
    views: {
      timeGrid3Days: {
        type: 'timeGrid',
        duration: { days: 3 },
        buttonText: '3 días'
      }
    },
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:20:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    weekends: true,
    locale: 'es',
    selectable: true, // Permitir selección
    selectMirror: true,
    events: calendarEvents.value,
    eventClick: handleEventClick,
    eventContent: renderEventContent,
    select: handleDateSelect, // Manejar selección de fechas/horas
    selectAllow: (selectInfo: any) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectInfo.start >= today
    }
  }))

  // Event handlers
  const handleEventClick = (info: any) => {
    console.log('Event clicked:', info.event)
    // TODO: Implementar modal con detalles del slot
  }

  const onSpecialtyChange = () => {
    changeSpecialty(selectedSpecialtyId.value)
  }

  const renderEventContent = (eventInfo: any) => {
    const event = eventInfo.event
    const status = event.extendedProps.status
    const statusClass = status === 'available' ? 'status-available' : 'status-occupied'

    // Extraer solo el nombre del médico (sin especialidad)
    const doctorName = event.title.split(' - ')[0] // Solo la parte antes del " - "

    // Formatear horas de inicio y fin
    const startTime = new Date(event.start).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const endTime = new Date(event.end).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    // Icono y texto según estado
    const statusIcon = status === 'available' ? '🟢' : '🔒'
    //const statusText = status === 'available' ? 'Disponible' : 'Ocupado'

    return {
      html: `
      <div class="custom-event">
        <div class="event-left">
          <div class="event-title">${doctorName}</div>
        </div>
        <div class="event-right">
          <div class="event-time">${startTime} - ${endTime}</div>
          <div class="event-status ${statusClass}">
            ${statusIcon}
          </div>
        </div>
      </div>
    `
    }
  }

  // Funciones para cambiar vista
  const changeView = (newView: string) => {
    currentView.value = newView
    if (calendarRef.value) {
      calendarRef.value.getApi().changeView(newView)
    }
  }

  // Navegación que se adapta a la vista
  const previousPeriod = () => {
    previousWeek()
  }

  const nextPeriod = () => {
    nextWeek()
  }

  // Modal de creación
  const showCreateModal = ref(false)
  const selectedDate = ref<Date | null>(null)

  // Doctores disponibles con nombre completo
  const availableDoctors = computed(() =>
    filteredDoctors.value.map(doctor => ({
      ...doctor,
      fullName: `Dr. ${doctor.first_name} ${doctor.last_name}`
    }))
  )

  // Función para manejar la creación de horarios
  const handleCreateSchedule = async (formData: ScheduleFormData) => {
    const success = await createSchedules(formData)
    if (success) {
      showCreateModal.value = false
      await loadWeekData() // Recargar datos del calendario
    }
  }

  // Función para manejar clic en el calendario (espacios vacíos)
  const handleDateSelect = (selectInfo: any) => {
    const clickedDate = new Date(selectInfo.start)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Solo permitir crear horarios para hoy en adelante
    if (clickedDate >= today) {
      selectedDate.value = clickedDate
      showCreateModal.value = true
    }
  }

  // Lifecycle
  onMounted(() => {
    loadWeekData()
  })
</script>

<style scoped>
  .admin-schedules-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .view-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e9ecef;
    background: white;
    border-radius: 0.5rem;
  }

  .view-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
  }

  .view-subtitle {
    color: #6c757d;
    margin: 0.5rem 0 0 0;
    font-size: 1rem;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .specialty-filter {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .view-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .view-selector {
    display: flex;
    gap: 0.5rem;
  }

  .filter-label {
    font-weight: 500;
    color: #495057;
    font-size: 0.9rem;
  }

  .specialty-dropdown {
    min-width: 200px;
    margin: 1.5rem 0 1.5rem 0;
  }

  .week-navigation {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .current-week {
    font-weight: 500;
    color: #495057;
    min-width: 150px;
    text-align: center;
  }

  .schedules-content {
    flex: 1;
    display: flex;
    gap: 1.5rem;
    overflow: hidden;
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
    flex-shrink: 0;
  }

  .doctors-filter {
    height: fit-content;
  }

  .filter-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #495057;
  }

  .doctors-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .select-all-option {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
  }

  .doctor-filter-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f1f3f4;
  }

  .doctor-filter-item:last-child {
    border-bottom: none;
  }

  .doctor-info {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .doctor-color-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 0.75rem;
    flex-shrink: 0;
  }

  .doctor-details {
    display: flex;
    flex-direction: column;
  }

  .doctor-name {
    font-weight: 500;
    color: #495057;
    font-size: 0.9rem;
  }

  .doctor-specialty {
    color: #6c757d;
    font-size: 0.8rem;
  }

  .calendar-container {
    flex: 1;
    overflow: hidden;
    max-height: calc(100vh - 280px);
  }

  .calendar-card {
    height: 100%;
    overflow: hidden;
  }

  /* Hacer que el scroll sea interno del calendario */
  :deep(.fc-scroller) {
    overflow-y: auto !important;
    max-height: calc(100vh - 380px) !important;
  }

  :deep(.fc-timegrid-body) {
    overflow-y: auto !important;
  }

  /* Reducir altura general del calendario */
  :deep(.fc) {
    height: calc(100vh - 320px) !important;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  /* FullCalendar custom styles */
  :deep(.fc) {
    font-family: inherit;
  }

  :deep(.fc-event) {
    border: none !important;
    border-radius: 3px;
    padding: 0px;
    font-size: 0.7rem;
    min-height: 20px;
  }

  :deep(.custom-event) {
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px 4px;
  }

  :deep(.event-left) {
    flex: 1;
    text-align: left;
    overflow: hidden;
  }

  :deep(.event-right) {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    flex-shrink: 0;
  }

  :deep(.event-title) {
    font-weight: 600;
    line-height: 1;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.event-time) {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1;
    margin-bottom: 1px;
  }

  :deep(.event-status) {
    font-size: 0.5rem;
    font-weight: 500;
    text-transform: capitalize;
    line-height: 1;
    margin-top: 0.3rem;
  }

  :deep(.fc-timegrid-slot) {
    height: 28px !important; /* Más compacto para evitar scroll */
  }

  :deep(.fc-timegrid-slot-label) {
    font-size: 0.85rem;
    font-weight: 500;
  }

  :deep(.fc-col-header-cell) {
    background: #f8f9fa;
    font-weight: 600;
    padding: 8px 4px;
  }

  :deep(.fc-timegrid-axis) {
    width: 80px !important; /* Más espacio para las etiquetas de hora */
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .header-controls {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .view-controls {
      flex-direction: column;
      gap: 1rem;
    }

    .view-selector {
      justify-content: center;
    }

    .schedules-content {
      flex-direction: column;
    }

    .filters-sidebar {
      width: 100%;
      margin-bottom: 1rem;
    }

    .calendar-container {
      overflow-x: auto;
    }

    /* Forzar vista de 1 día en mobile */
    :deep(.fc-timeGridWeek-view),
    :deep(.fc-timeGrid3Days-view) {
      display: none;
    }

    :deep(.fc-timeGridDay-view) {
      display: block;
    }
  }

  /* Estilos para áreas seleccionables del calendario */
  :deep(.fc-highlight) {
    background: rgba(59, 130, 246, 0.1) !important;
    border: 2px dashed #3b82f6 !important;
  }

  :deep(.fc-select-mirror) {
    background: rgba(59, 130, 246, 0.2) !important;
    border: 2px solid #3b82f6 !important;
  }
</style>
