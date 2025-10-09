<template>
  <div class="appointment-preparation">
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p class="text-gray-600 mt-4">Cargando información de la cita...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Error al cargar la cita</h2>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <Button label="Volver al inicio" icon="pi pi-arrow-left" @click="goBack" />
    </div>

    <div v-else-if="appointment" class="content-container">
      <!-- Header -->
      <div class="header">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          class="back-button"
          @click="goBack"
          aria-label="Volver"
        />
        <div class="header-content">
          <h1 class="title">Revisa la información antes de iniciar</h1>
          <p class="subtitle"></p>
        </div>
      </div>

      <div class="info-grid">
        <!-- Patient Information Card -->
        <Card class="patient-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-user"></i>
              <h2>Información del Paciente</h2>
            </div>
          </template>
          <template #content>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Nombre completo</span>
                <span class="info-value">{{ patientFullName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Documento</span>
                <span class="info-value">{{ patient?.medical_record_number }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Edad</span>
                <span class="info-value">{{ patientFormattedAge }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Género</span>
                <span class="info-value">{{ patientGender }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Teléfono</span>
                <span class="info-value">{{ patient?.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ patient?.email }}</span>
              </div>
            </div>
          </template>
        </Card>

        <!-- Appointment Information Card -->
        <Card class="appointment-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-calendar"></i>
              <h2>Información de la Cita</h2>
            </div>
          </template>
          <template #content>
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">Fecha</span>
                <span class="info-value">{{ formatDate(appointment.appointment_date) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hora</span>
                <span class="info-value">{{ formatTime(appointment.slot.scheduled_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Modalidad</span>
                <span class="info-value">
                  <Tag
                    :value="appointment.modality.toUpperCase()"
                    :severity="appointment.modality === 'presencial' ? 'info' : 'success'"
                  />
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Estado</span>
                <span class="info-value">
                  <Tag :value="getStatusLabel(appointment.status)" severity="info" />
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Especialidad</span>
                <span class="info-value">{{ appointment.specialty || 'Medicina General' }}</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="actions">
        <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="goBack" />
        <Button
          label="Iniciar Consulta"
          icon="pi pi-play"
          severity="primary"
          @click="startConsultationProcess"
          :loading="startingConsultation"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import Tag from 'primevue/tag'
  import ProgressSpinner from 'primevue/progressspinner'
  import { AppointmentService } from '@/services/appointments.service'
  import { formatTime } from '@/shared/lib/formatters'
  import { usePatients } from '@/core/composables/usePatients'
  import type { Appointment } from '@/types/appointments.types'
  import type { AppointmentStatus } from '@/types/enums'
  import { useConsultation } from '@/core/composables/useConsultation'

  const router = useRouter()
  const route = useRoute()

  const appointment = ref<Appointment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const startingConsultation = ref(false)

  const appointmentId = computed(() => Number(route.params.id))

  // Usar el composable de pacientes
  const {
    patient,
    patientFullName,
    patientFormattedAge,
    patientGender,
    fetchPatient,
    loading: patientLoading
  } = usePatients()

  const { startConsultation } = useConsultation()

  // Cargar paciente cuando tengamos el appointment
  watch(
    () => appointment.value?.patient_data?.id,
    async patientId => {
      if (patientId) {
        await fetchPatient(patientId)
      }
    }
  )

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
      .format(date)
      .toUpperCase()
  }

  const getStatusLabel = (status: AppointmentStatus): string => {
    const labels: Record<AppointmentStatus, string> = {
      reservada: 'Reservada',
      confirmada: 'Confirmada',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      pagada: 'Pagada'
    }
    return labels[status] || status
  }

  const fetchAppointment = async () => {
    loading.value = true
    error.value = null

    try {
      const appointmentData = await AppointmentService.getAppointmentById(appointmentId.value)
      appointment.value = appointmentData
    } catch (err) {
      console.error('Error fetching appointment:', err)
      error.value = 'No se pudo cargar la información de la cita. Por favor, intente nuevamente.'
    } finally {
      loading.value = false
    }
  }

  const goBack = () => {
    router.push('/dashboard/doctor')
  }

  const startConsultationProcess = async () => {
    try {
      // Crear la consulta con el appointment_id
      const consultation = await startConsultation(appointmentId.value)

      if (consultation) {
        // Navegar a la pantalla de consulta médica
        router.push(`/consultation/${appointmentId.value}`)
      } else {
        error.value = 'No se pudo iniciar la consulta'
      }
    } catch (err) {
      console.error('Error starting consultation:', err)
      error.value = 'Ocurrió un error al iniciar la consulta'
    }
  }

  onMounted(async () => {
    await fetchAppointment()
  })
</script>

<style scoped>
  .appointment-preparation {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .patient-card {
    border-radius: 1rem;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
  }

  .content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .back-button {
    margin-top: 0.25rem;
  }

  .header-content {
    flex: 1;
    margin-top: 0.5rem;
  }

  .title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .subtitle {
    color: #6b7280;
    margin: 0.25rem 0 0 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
    color: white;
    border-radius: 1rem 1rem 0 0;
  }

  .card-header i {
    font-size: 1.5rem;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .info-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .info-label {
    font-weight: 500;
    color: #6b7280;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-weight: 600;
    color: #1f2937;
    font-size: 1rem;
    text-align: right;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
  }

  @media (max-width: 768px) {
    .appointment-preparation {
      padding: 1rem;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .title {
      font-size: 1.5rem;
    }

    .actions {
      flex-direction: column-reverse;
    }

    .actions button {
      width: 100%;
    }
  }
</style>
