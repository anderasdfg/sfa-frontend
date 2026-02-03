<template>
  <div class="doctor-schedule-view">
    <!-- Calendar -->
    <div class="calendar-container">
      <Card class="calendar-card">
        <template #content>
          <div class="view-controls">
            <!-- View Type Selector -->
            <div class="view-selector">
              <Button
                label="Día"
                :class="{ 'p-button-outlined': currentView !== 'timeGridDay' }"
                @click="changeView('timeGridDay')"
                size="small"
              />
              <Button
                label="3 días"
                :class="{ 'p-button-outlined': currentView !== 'timeGrid3Days' }"
                @click="changeView('timeGrid3Days')"
                size="small"
              />
              <Button
                label="Semana"
                :class="{ 'p-button-outlined': currentView !== 'timeGridWeek' }"
                @click="changeView('timeGridWeek')"
                size="small"
              />
            </div>

            <!-- Navigation -->
            <div class="week-navigation">
              <Button
                icon="pi pi-angle-left"
                @click="previousPeriod"
                class="nav-button"
                outlined
              />
              <span class="current-week">{{ currentPeriodLabel }}</span>
              <Button
                icon="pi pi-angle-right"
                @click="nextPeriod"
                class="nav-button"
                outlined
              />
              <Button label="Hoy" @click="handleGoToToday" severity="info" outlined class="ml-3" />
            </div>
          </div>

          <!-- Leyenda -->
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color available"></div>
              <span>Disponible</span>
            </div>
            <div class="legend-item">
              <div class="legend-color occupied"></div>
              <span>Reservado</span>
            </div>
          </div>

          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </template>
      </Card>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDoctorScheduleCalendar } from '../composables/useDoctorScheduleCalendar'
  import FullCalendar from '@fullcalendar/vue3'
  import timeGridPlugin from '@fullcalendar/timegrid'
  import interactionPlugin from '@fullcalendar/interaction'
  import Button from 'primevue/button'
  import Card from 'primevue/card'
  import ProgressSpinner from 'primevue/progressspinner'
  import { ref, computed, onMounted } from 'vue'

  // Composables
  const {
    loading,
    currentWeek,
    calendarEvents,
    loadWeekData,
    previousWeek,
    nextWeek,
    goToToday
  } = useDoctorScheduleCalendar()

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

  // FullCalendar options
  const calendarOptions = computed(() => ({
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: currentView.value,
    initialDate: currentWeek.value.start,
    headerToolbar: false as const,
    firstDay: 1,
    views: {
      timeGrid3Days: {
        type: 'timeGrid',
        duration: { days: 3 },
        buttonText: '3 días'
      }
    },
    height: 'calc(100vh - 240px)',
    contentHeight: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    slotDuration: '00:20:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    weekends: true,
    locale: 'es',
    selectable: false, // No permitir selección para médicos
    events: calendarEvents.value,
    eventClick: handleEventClick,
    eventContent: renderEventContent
  }))

  // Event handlers
  const handleEventClick = (info: any) => {
    console.log('Event clicked:', info.event)
    // TODO: Implementar modal con detalles del slot
  }

  const renderEventContent = (eventInfo: any) => {
    const event = eventInfo.event
    const status = event.extendedProps.status
    const statusClass = status === 'available' ? 'status-available' : 'status-occupied'

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

    const statusIcon = status === 'available' ? '✓' : '👤'

    return {
      html: `
        <div class="custom-event">
          <div class="event-left">
            <div class="event-title">${event.title}</div>
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
    if (calendarRef.value) {
      const calendarApi = calendarRef.value.getApi()
      calendarApi.prev()
    }
  }

  const nextPeriod = () => {
    nextWeek()
    if (calendarRef.value) {
      const calendarApi = calendarRef.value.getApi()
      calendarApi.next()
    }
  }

  // Sobrescribir goToToday para sincronizar con el calendario
  const handleGoToToday = () => {
    goToToday()
    if (calendarRef.value) {
      const calendarApi = calendarRef.value.getApi()
      calendarApi.today()
    }
  }

  // Lifecycle
  onMounted(() => {
    loadWeekData()
  })
</script>

<style scoped>
  .doctor-schedule-view {
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
    margin-bottom: 1.5rem;
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

  .calendar-container {
    flex: 1;
    overflow: hidden;
    max-height: calc(100vh - 200px);
    min-height: 600px;
  }

  .calendar-card {
    height: 100%;
    overflow: hidden;
  }

  .legend {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 6px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #495057;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }

  .legend-color.available {
    background: #059669;
  }

  .legend-color.occupied {
    background: #3b82f6;
  }

  /* Hacer que el scroll sea interno del calendario */
  :deep(.fc-scroller) {
    overflow-y: auto !important;
    max-height: calc(100vh - 300px) !important;
  }

  :deep(.fc-timegrid-body) {
    overflow-y: auto !important;
  }

  /* Aumentar altura general del calendario */
  :deep(.fc) {
    height: calc(100vh - 240px) !important;
    min-height: 500px !important;
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
    font-size: 0.7rem;
    font-weight: 500;
    line-height: 1;
    margin-top: 0.3rem;
  }

  :deep(.fc-timegrid-slot) {
    height: 35px !important;
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
    width: 80px !important;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .view-controls {
      flex-direction: column;
      gap: 1rem;
    }

    .view-selector {
      justify-content: center;
    }

    .legend {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>