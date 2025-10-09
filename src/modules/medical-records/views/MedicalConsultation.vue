<template>
  <div class="medical-consultation">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
      <p class="text-gray-600 mt-4">Cargando consulta...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4"></i>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Error al cargar la consulta</h2>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <Button label="Volver" icon="pi pi-arrow-left" @click="goBack" />
    </div>

    <!-- Main Content -->
    <div v-else-if="appointment" class="consultation-container">
      <!-- Patient Header -->
      <div class="patient-header">
        <div class="patient-info-section">
          <div class="patient-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="patient-details">
            <h1 class="patient-name">{{ patientFullName }}</h1>
            <div class="patient-meta">
              <span class="meta-item">
                <i class="pi pi-id-card"></i>
                {{ patientDocument }}
              </span>
              <span class="meta-item">
                <i class="pi pi-calendar"></i>
                {{ patientAge }} años
              </span>
              <span class="meta-item">
                <i class="pi pi-venus-mars"></i>
                {{ patientGender }}
              </span>
            </div>
          </div>
        </div>

        <div class="appointment-info-section">
          <div class="info-badge">
            <i class="pi pi-calendar-clock"></i>
            <span>{{ formatDate(appointment.appointment_date) }}</span>
          </div>
          <div class="info-badge">
            <i class="pi pi-clock"></i>
            <span>{{ formatTime(appointment.slot.scheduled_at) }}</span>
          </div>
          <Tag
            :value="appointment.modality"
            :severity="appointment.modality === 'presencial' ? 'info' : 'success'"
          />
        </div>

        <div class="header-actions">
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            @click="goBack"
          />
          <Button
            label="Finalizar Consulta"
            icon="pi pi-check"
            severity="success"
            @click="finishConsultation"
          />
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <div class="tabs-navigation">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Signos Vitales -->
        <!--  <div v-if="activeTab === 'vitals'" class="tab-panel">
          <h2 class="tab-title">Signos Vitales</h2>
          <p class="text-gray-500">Contenido de Signos Vitales</p>
        </div> -->

        <!-- Anamnesis -->
        <div v-if="activeTab === 'anamnesis'" class="tab-panel">
          <AnamnesisTab
            v-if="currentConsultation"
            :consultation-id="currentConsultation?.id"
            :patient-id="patient?.id"
            @next-tab="activeTab = $event"
          />
        </div>

        <!-- Historial -->
        <div v-if="activeTab === 'history'" class="tab-panel">
          <h2 class="tab-title">Historial</h2>
          <p class="text-gray-500">Contenido de Historial</p>
        </div>

        <!-- Diagnóstico -->
        <div v-if="activeTab === 'diagnosis'" class="tab-panel">
          <DiagnosisTab
            v-if="appointment"
            :consultation-id="appointmentId"
            :patient-id="appointment.patient_id"
          />
        </div>

        <!-- Indicaciones -->
        <div v-if="activeTab === 'indications'" class="tab-panel">
          <h2 class="tab-title">Indicaciones</h2>
          <p class="text-gray-500">Contenido de Indicaciones</p>
        </div>

        <!-- Exámenes Auxiliares -->
        <div v-if="activeTab === 'auxiliary'" class="tab-panel">
          <h2 class="tab-title">Exámenes Auxiliares</h2>
          <p class="text-gray-500">Contenido de Exámenes Auxiliares</p>
        </div>

        <!-- Prescripción Médica -->
        <div v-if="activeTab === 'prescription'" class="tab-panel">
          <h2 class="tab-title">Prescripción Médica</h2>
          <p class="text-gray-500">Contenido de Prescripción Médica</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import Button from 'primevue/button'
  import Tag from 'primevue/tag'
  import ProgressSpinner from 'primevue/progressspinner'
  import { AppointmentService } from '@/services/appointments.service'
  import { formatTime } from '@/shared/lib/formatters'
  import type { Appointment } from '@/types/appointments.types'
  import DiagnosisTab from '../components/DiagnosisTab.vue'
  import { usePatients } from '@/core/composables/usePatients'
  import { useConsultationStore } from '@/stores/consultation/consultationStore'
  import AnamnesisTab from '../components/AnamnesisTab.vue'

  const router = useRouter()
  const route = useRoute()

  const appointment = ref<Appointment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const activeTab = ref('anamnesis')
  const { patientFullName, patientAge, patientGender, patientDocument, patient } = usePatients()
  const { currentConsultation } = useConsultationStore()

  const appointmentId = computed(() => Number(route.params.id))

  const tabs = [
    /* { id: 'vitals', label: 'Signos Vitales', icon: 'pi pi-heart' }, */
    { id: 'anamnesis', label: 'Anamnesis', icon: 'pi pi-file-edit' },
    /*  { id: 'history', label: 'Historial', icon: 'pi pi-history' }, */
    { id: 'diagnosis', label: 'Diagnóstico', icon: 'pi pi-search' },
    { id: 'indications', label: 'Indicaciones', icon: 'pi pi-list' },
    { id: 'auxiliary', label: 'Exámenes Auxiliares', icon: 'pi pi-flask' },
    { id: 'prescription', label: 'Prescripción Médica', icon: 'pi pi-shopping-bag' }
  ]

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date)
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

  const finishConsultation = () => {
    // TODO: Implementar lógica para finalizar consulta
    console.log('Finalizar consulta')
  }

  onMounted(async () => {
    await fetchAppointment()
  })
</script>

<style scoped>
  .medical-consultation {
    min-height: 100vh;
    background: #f8f9fa;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    text-align: center;
  }

  .consultation-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 72px);
  }

  /* Patient Header */
  .patient-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.5rem 2rem;
    background: white;
    border-bottom: 2px solid #e5e7eb;
    flex-shrink: 0;
  }

  .patient-info-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .patient-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
  }

  .patient-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .patient-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }

  .patient-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .meta-item i {
    color: var(--color-sf-green-normal);
  }

  .appointment-info-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .info-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .info-badge i {
    color: var(--color-sf-green-normal);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* Tabs */
  .tabs-container {
    background: white;
    border-bottom: 2px solid #e5e7eb;
    flex-shrink: 0;
  }

  .tabs-navigation {
    display: flex;
    gap: 0;
    overflow-x: auto;
    padding: 0 2rem;
  }

  .tabs-navigation::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-navigation::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .tab-button:hover {
    color: var(--color-sf-green-normal);
    background: #f9fafb;
  }

  .tab-button.active {
    color: var(--color-sf-green-normal);
    border-bottom-color: var(--color-sf-green-normal);
    background: #f0fdf4;
  }

  .tab-button i {
    font-size: 1rem;
  }

  /* Tab Content */
  .tab-content {
    flex: 1;
    overflow-y: auto;
    background: #f8f9fa;
  }

  .tab-panel {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  .tab-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .patient-header {
      flex-wrap: wrap;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  @media (max-width: 768px) {
    .patient-header {
      padding: 1rem;
    }

    .patient-avatar {
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
    }

    .patient-name {
      font-size: 1.25rem;
    }

    .patient-meta {
      gap: 1rem;
    }

    .appointment-info-section {
      width: 100%;
      justify-content: space-between;
    }

    .tabs-navigation {
      padding: 0 1rem;
    }

    .tab-button {
      padding: 0.75rem 1rem;
      font-size: 0.8125rem;
    }

    .tab-panel {
      padding: 1rem;
    }

    .header-actions {
      gap: 0.5rem;
    }

    .header-actions button {
      flex: 1;
    }
  }
</style>
