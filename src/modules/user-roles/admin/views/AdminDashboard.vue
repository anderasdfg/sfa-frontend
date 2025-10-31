<template>
  <div class="admin-dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <h1 class="welcome-title">¡Bienvenido, Admin Sistema!</h1>
      <p class="welcome-subtitle">Buenas tardes. Gestiona tu clínica de manera eficiente.</p>
    </div>

    <!-- Quick Stats -->
    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <i class="pi pi-dollar"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">
            S/.{{ formatNumber(statistics?.daily_info.daily_revenue ?? 0) }}
          </div>
          <div class="stat-label">Ingresos del Día</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics?.daily_info.total_appointments_today ?? 0 }}</div>
          <div class="stat-label">Citas del Día</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon purple">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics?.daily_info.completed_appointments ?? 0 }}</div>
          <div class="stat-label">Citas Completadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statistics?.daily_info.pending_appointments ?? 0 }}</div>
          <div class="stat-label">Citas Pendientes</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading" class="content-grid">
      <div class="overview-card">
        <h3 class="card-title">Resumen del Sistema</h3>
        <div class="overview-grid">
          <div class="overview-item">
            <div class="overview-number">{{ statistics?.summary.total_users ?? 0 }}</div>
            <div class="overview-label">Total Usuarios</div>
          </div>
          <div class="overview-item">
            <div class="overview-number">{{ statistics?.summary.total_doctors ?? 0 }}</div>
            <div class="overview-label">Doctores Activos</div>
          </div>
          <div class="overview-item">
            <div class="overview-number">{{ statistics?.summary.total_patients ?? 0 }}</div>
            <div class="overview-label">Pacientes Registrados</div>
          </div>
          <div class="overview-item">
            <div class="overview-number">
              {{ statistics?.summary.future_appointments_scheduled_today ?? 0 }}
            </div>
            <div class="overview-label">Citas Programadas Hoy</div>
          </div>
        </div>
      </div>

      <div class="actions-card">
        <h3 class="card-title">Gestión Rápida</h3>
        <div class="quick-actions">
          <button @click="goToQueue" class="action-btn green">
            <i class="pi pi-list"></i>
            <span>Cola de Pacientes</span>
          </button>
          <button @click="goToCheckIn" class="action-btn blue">
            <i class="pi pi-clock"></i>
            <span>Asistencia Doctores</span>
          </button>
          <button @click="goToAppointments" class="action-btn purple">
            <i class="pi pi-calendar"></i>
            <span>Ver Agenda</span>
          </button>
          <button @click="goToNewAppointment" class="action-btn orange">
            <i class="pi pi-plus"></i>
            <span>Nueva Cita</span>
          </button>
        </div>
      </div>

      <!-- Acceso rápido a Citas de Hoy -->
      <div class="quick-link-card">
        <h3 class="card-title">Citas de Hoy</h3>
        <p class="card-description">Gestiona las llegadas y atenciones del día</p>
        <button @click="goToTodayAppointments" class="btn-view-all">
          Ver todas las citas de hoy →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { StatisticsService } from '@/services/statistics.service'
  import type { DashboardStatistics } from '@/types/statistics.types'

  const router = useRouter()
  const statistics = ref<DashboardStatistics | null>(null)
  const loading = ref(true)

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-ES').format(value)
  }

  const loadStatistics = async () => {
    try {
      loading.value = true
      statistics.value = await StatisticsService.getDashboardStatistics()
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      loading.value = false
    }
  }

  const goToQueue = () => router.push('/patient-queue')
  const goToCheckIn = () => router.push('/doctor-attendance/check-in')
  const goToAppointments = () => router.push('/appointments')
  const goToNewAppointment = () => router.push('/appointments/new')
  const goToTodayAppointments = () => router.push('/appointments/today')

  onMounted(() => {
    loadStatistics()
  })
</script>

<style scoped>
  .admin-dashboard {
    padding: 0;
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    color: var(--color-sf-green-normal);
  }

  .welcome-header {
    background: linear-gradient(
      135deg,
      var(--color-sf-green-light) 0%,
      var(--color-sf-green-normal) 100%
    );
    color: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .welcome-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .welcome-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
  }

  .stat-icon.green {
    background: #10b981;
  }
  .stat-icon.blue {
    background: #3b82f6;
  }
  .stat-icon.purple {
    background: #8b5cf6;
  }
  .stat-icon.orange {
    background: #f59e0b;
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .overview-card,
  .actions-card,
  .activity-card,
  .quick-link-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1.5rem 0;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .overview-item {
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .overview-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #059669;
    margin-bottom: 0.25rem;
  }

  .overview-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .action-btn.green {
    background: #10b981;
  }
  .action-btn.blue {
    background: #3b82f6;
  }
  .action-btn.purple {
    background: #8b5cf6;
  }
  .action-btn.orange {
    background: #f59e0b;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    color: white;
  }

  .activity-icon.blue {
    background: #3b82f6;
  }
  .activity-icon.green {
    background: #10b981;
  }
  .activity-icon.purple {
    background: #8b5cf6;
  }

  .activity-content {
    flex: 1;
  }

  .activity-description {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .activity-time {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .appointments-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    grid-column: 1 / -1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .btn-refresh {
    padding: 0.5rem 1rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-refresh:hover {
    background: #3182ce;
  }

  .loading-state,
  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #718096;
  }

  .appointments-table {
    overflow-x: auto;
  }

  .appointments-table table {
    width: 100%;
    border-collapse: collapse;
  }

  .appointments-table th {
    text-align: left;
    padding: 0.75rem;
    background: #f7fafc;
    color: #4a5568;
    font-weight: 600;
    font-size: 0.875rem;
    border-bottom: 2px solid #e2e8f0;
  }

  .appointments-table td {
    padding: 1rem 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    display: inline-block;
  }

  .status-reservada {
    background: #feebc8;
    color: #7c2d12;
  }

  .status-pagada {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-realizada {
    background: #e9d8fd;
    color: #44337a;
  }

  .status-cancelada {
    background: #fed7d7;
    color: #742a2a;
  }

  .arrived-badge {
    color: #38a169;
    font-weight: 500;
  }

  .not-arrived {
    color: #a0aec0;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .quick-link-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .card-description {
    color: #6b7280;
    margin: 0.5rem 0 1.5rem 0;
  }

  .btn-view-all {
    padding: 0.75rem 2rem;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-view-all:hover {
    background: #3182ce;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .overview-grid {
      grid-template-columns: 1fr;
    }

    .welcome-header {
      padding: 1.5rem;
    }

    .welcome-title {
      font-size: 1.5rem;
    }
  }
</style>
