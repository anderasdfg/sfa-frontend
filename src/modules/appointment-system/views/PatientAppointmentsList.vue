<template>
  <div class="patient-appointments-view">
    <!--  <div class="appointments-header">
      <h1 class="page-title">Mis Citas</h1>
      <p class="page-subtitle">Aquí puedes ver todas tus citas médicas programadas</p>
    </div> -->

    <div class="appointments-content">
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        <p class="text-gray-600 mt-3">Cargando tus citas...</p>
      </div>

      <!-- Mensaje de error -->
      <Message v-else-if="error" severity="error" :closable="false">
        {{ error }}
        <template #icon>
          <i class="pi pi-exclamation-circle"></i>
        </template>
      </Message>

      <!-- Lista de citas -->
      <div v-else class="appointments-list-container">
        <!-- Filtros y acciones -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label class="filter-label">Fecha</label>
              <Calendar
                v-model="filters.date"
                dateFormat="dd/mm/yy"
                placeholder="Seleccionar fecha"
                :showIcon="true"
                showButtonBar
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Doctor</label>
              <Dropdown
                v-model="filters.doctor"
                :options="doctorOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos los doctores"
                :showClear="true"
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Especialidad</label>
              <Dropdown
                v-model="filters.specialty"
                :options="specialtyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todas las especialidades"
                :showClear="true"
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group">
              <label class="filter-label">Estado</label>
              <Dropdown
                v-model="filters.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Todos los estados"
                :showClear="true"
                @update:model-value="applyFilters"
              />
            </div>

            <div class="filter-group filter-actions">
              <Button
                label="Limpiar filtros"
                icon="pi pi-filter-slash"
                @click="clearFilters"
                class="p-button-outlined p-button-secondary"
                :disabled="!hasActiveFilters"
              />
            </div>
          </div>

          <div class="appointments-actions">
            <Button
              label="Agendar nueva cita"
              icon="pi pi-plus"
              @click="navigateToSchedule"
              class="p-button-primary"
            />
            <Button
              label="Actualizar"
              icon="pi pi-refresh"
              @click="refreshAppointments"
              :loading="loading"
              class="p-button-outlined"
            />
          </div>
        </div>

        <!-- Lista de citas filtradas -->
        <div v-if="filteredAppointments.length > 0" class="appointments-list">
          <div
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
            class="appointment-card"
          >
            <div class="appointment-time">
              <div class="time">{{ formatTime(appointment.slot?.scheduled_at) }}</div>
              <div class="date">{{ formatDate(appointment.slot?.scheduled_at) }}</div>
            </div>

            <div class="appointment-details">
              <div class="appointment-doctor">{{ getDoctorName(appointment) }}</div>
              <div class="appointment-specialty">{{ getSpecialty(appointment) }}</div>
            </div>

            <div class="appointment-status">
              <Tag
                :value="getStatusLabel(appointment.status)"
                :severity="getStatusSeverity(appointment.status)"
                class="status-tag"
              />
            </div>

            <div class="appointment-actions">
              <Button
                v-if="canPayAppointment(appointment)"
                label="Pagar ahora"
                icon="pi pi-credit-card"
                size="small"
                :loading="processingPayment === appointment.id"
                :disabled="!!processingPayment"
                @click="handlePayment(appointment)"
                class="p-button-success p-button-sm"
              />
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <i class="pi pi-calendar text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500">
            {{
              hasActiveFilters
                ? 'No se encontraron citas con los filtros aplicados'
                : 'No tienes citas programadas en este momento'
            }}
          </p>
          <Button label="Agendar mi primera cita" class="mt-3" @click="navigateToSchedule" />
        </div>

        <!-- Información adicional -->
        <div v-if="filteredAppointments.length > 0" class="appointments-info">
          <Card>
            <template #content>
              <div class="info-content">
                <i class="pi pi-info-circle text-blue-500 text-2xl"></i>
                <div class="info-text">
                  <h3 class="info-title">¿Necesitas ayuda?</h3>
                  <p class="info-description">
                    Si necesitas cancelar o reprogramar una cita, por favor contacta con nuestro
                    equipo de atención al paciente.
                  </p>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { usePatientAppointments } from '@/modules/user-roles/patient/composables/usePatientAppointments'
  import { usePayments } from '@/modules/appointment-system/composables/usePayments'
  import { useNotifications } from '@/composables/useNotifications'
  import type { Appointment } from '@/types/appointments.types'
  import Button from 'primevue/button'
  import ProgressSpinner from 'primevue/progressspinner'
  import Message from 'primevue/message'
  import Card from 'primevue/card'
  import Tag from 'primevue/tag'
  import Calendar from 'primevue/calendar'
  import Dropdown from 'primevue/dropdown'
  import { formatTime } from '@/shared/lib/formatters'
  import { getDoctorName, getSpecialty, formatDate } from '@/utils/appointment.utils'

  const router = useRouter()
  const route = useRoute()
  const { appointments, loading, error, fetchPatientAppointments } = usePatientAppointments()
  const paymentsComposable = usePayments()
  const notifications = useNotifications()

  // Estado de pagos
  const processingPayment = ref<number | null>(null)

  // Filtros
  const filters = ref({
    date: null as Date | null,
    doctor: null as string | null,
    specialty: null as string | null,
    status: null as string | null
  })

  // Opciones para los filtros
  const doctorOptions = computed(() => {
    const doctors = new Set<string>()
    appointments.value.forEach(apt => {
      const doctorName = getDoctorName(apt)
      if (doctorName && doctorName !== 'Doctor') {
        doctors.add(doctorName)
      }
    })
    return Array.from(doctors).map(name => ({ label: name, value: name }))
  })

  const specialtyOptions = computed(() => {
    const specialties = new Set<string>()
    appointments.value.forEach(apt => {
      const specialty = getSpecialty(apt)
      if (specialty && specialty !== 'General') {
        specialties.add(specialty)
      }
    })
    return Array.from(specialties).map(name => ({ label: name, value: name }))
  })

  const statusOptions = [
    { label: 'Programada', value: 'reservada' },
    { label: 'Pagada', value: 'pagada' },
    { label: 'Completada', value: 'completed' },
    { label: 'Cancelada', value: 'cancelled' },
    { label: 'En progreso', value: 'in_progress' }
  ]

  // Citas filtradas
  const filteredAppointments = computed(() => {
    let filtered = [...appointments.value]

    // Filtro por fecha
    if (filters.value.date) {
      const selectedDate = new Date(filters.value.date)
      selectedDate.setHours(0, 0, 0, 0)

      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.slot?.scheduled_at || apt.appointment_date)
        aptDate.setHours(0, 0, 0, 0)
        return aptDate.getTime() === selectedDate.getTime()
      })
    }

    // Filtro por doctor
    if (filters.value.doctor) {
      filtered = filtered.filter(apt => getDoctorName(apt) === filters.value.doctor)
    }

    // Filtro por especialidad
    if (filters.value.specialty) {
      filtered = filtered.filter(apt => getSpecialty(apt) === filters.value.specialty)
    }

    // Filtro por estado
    if (filters.value.status) {
      filtered = filtered.filter(apt => apt.status === filters.value.status)
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.slot?.scheduled_at || a.appointment_date).getTime()
      const dateB = new Date(b.slot?.scheduled_at || b.appointment_date).getTime()
      return dateB - dateA
    })
  })

  const hasActiveFilters = computed(() => {
    return !!(
      filters.value.date ||
      filters.value.doctor ||
      filters.value.specialty ||
      filters.value.status
    )
  })

  // Funciones de utilidad
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      reservada: 'Programada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      in_progress: 'En progreso',
      pagada: 'Pagada'
    }
    return statusMap[status] || status
  }

  const getStatusSeverity = (status: string): string => {
    const severityMap: Record<string, string> = {
      reservada: 'info',
      completed: 'success',
      cancelled: 'danger',
      in_progress: 'warning',
      pagada: 'success'
    }
    return severityMap[status] || 'info'
  }

  const canPayAppointment = (appointment: Appointment): boolean => {
    // Puede pagar si está en estado 'reservada' (no pagada)
    return appointment.status === 'reservada'
  }

  // Funciones de acción
  const applyFilters = () => {
    // Los filtros se aplican automáticamente a través del computed
  }

  const clearFilters = () => {
    filters.value = {
      date: null,
      doctor: null,
      specialty: null,
      status: null
    }
  }

  const handlePayment = async (appointment: Appointment) => {
    try {
      processingPayment.value = appointment.id
      const success = await paymentsComposable.createAndRedirectToPayment(appointment)

      if (!success) {
        notifications.showError(
          'Error en el pago',
          paymentsComposable.error.value ||
            'No se pudo procesar el pago. Por favor, intente nuevamente.'
        )
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      notifications.showError(
        'Error',
        'Ocurrió un error al procesar el pago. Por favor, intente nuevamente.'
      )
    } finally {
      processingPayment.value = null
    }
  }

  const refreshAppointments = async () => {
    await fetchPatientAppointments()
  }

  const navigateToSchedule = () => {
    router.push('/appointment-booking')
  }

  // Lifecycle
  onMounted(async () => {
    await fetchPatientAppointments()
  })

  // Watch para cuando cambie el patient_id en los query params
  watch(
    () => route.query.patient_id,
    async newPatientId => {
      if (newPatientId) {
        await fetchPatientAppointments()
      }
    }
  )
</script>

<style scoped>
  .patient-appointments-view {
    max-width: 1200px;
    margin: 0 auto;
  }

  .appointments-header {
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
    color: #718096;
    margin: 0;
  }

  .appointments-content {
    border-radius: 12px;

    min-height: 400px;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 0rem;
  }

  .appointments-list-container {
    display: flex;
    flex-direction: column;
    gap: 0rem;
  }

  /* Filtros */
  .filters-section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-weight: 500;
    font-size: 0.9rem;
    color: #4a5568;
  }

  .filter-actions {
    display: flex;
    align-items: flex-end;
  }

  .appointments-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    flex-wrap: wrap;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  /* Lista de citas */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-card {
    display: flex;
    align-items: center;
    padding: 1.25rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    gap: 1rem;
  }

  .appointment-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .appointment-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 8px;
    text-align: center;
  }

  .appointment-time .time {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    line-height: 1.2;
  }

  .appointment-time .date {
    font-size: 0.8rem;
    font-weight: 400;
    color: #718096;
    margin-top: 4px;
  }

  .appointment-details {
    flex: 1;
    min-width: 0;
  }

  .appointment-doctor {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }

  .appointment-specialty {
    font-size: 0.9rem;
    color: #718096;
  }

  .appointment-status {
    display: flex;
    align-items: center;
  }

  .status-tag {
    white-space: nowrap;
  }

  .appointment-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  /* Estado vacío */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
  }

  .appointments-info {
    margin-top: 2rem;
  }

  .info-content {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-text {
    flex: 1;
  }

  .info-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
  }

  .info-description {
    color: #718096;
    margin: 0;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .patient-appointments-view {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .appointments-content {
      padding: 1rem;
    }

    .filters-section {
      padding: 1rem;
    }

    .filters-row {
      grid-template-columns: 1fr;
    }

    .filter-actions {
      align-items: stretch;
    }

    .appointments-actions {
      flex-direction: column;
    }

    .appointments-actions button {
      width: 100%;
    }

    .appointment-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .appointment-time {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }

    .appointment-actions {
      width: 100%;
    }

    .appointment-actions button {
      flex: 1;
    }
  }
</style>
