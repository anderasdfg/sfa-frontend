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
          <button class="action-btn green">
            <i class="pi pi-user-plus"></i>
            <span>Nuevo Usuario</span>
          </button>
          <button class="action-btn blue">
            <i class="pi pi-users"></i>
            <span>Gestionar Doctores</span>
          </button>
          <button class="action-btn purple">
            <i class="pi pi-chart-bar"></i>
            <span>Ver Reportes</span>
          </button>
          <button class="action-btn orange">
            <i class="pi pi-cog"></i>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      <div class="activity-card">
        <h3 class="card-title">Actividad Reciente</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon blue">
              <i class="pi pi-user"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">Nuevo doctor registrado: Dr. Martínez</div>
              <div class="activity-time">Hace 20 min</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon green">
              <i class="pi pi-check"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">Sistema actualizado a v2.1.0</div>
              <div class="activity-time">Hace 50 min</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-icon purple">
              <i class="pi pi-database"></i>
            </div>
            <div class="activity-content">
              <div class="activity-description">Backup automático completado</div>
              <div class="activity-time">Hace 2 h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { StatisticsService } from '@/services/statistics.service'
  import type { DashboardStatistics } from '@/types/statistics.types'

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
  .activity-card {
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
