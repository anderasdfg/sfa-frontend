<template>
  <div class="app-sidebar">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">
        <i class="pi pi-heart text-primary text-2xl"></i>
        <span class="logo-text">ClínicaPro</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-content">
      <PanelMenu :model="menuItems" class="sidebar-menu" />
    </div>

    <!-- User Info -->
    <div class="sidebar-footer" v-if="user">
      <div class="user-info">
        <Avatar :label="userInitials" class="mr-2" shape="circle" size="normal" />
        <div class="user-details">
          <div class="user-name">{{ userFullName }}</div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import PanelMenu from 'primevue/panelmenu'
  import Avatar from 'primevue/avatar'
  import { useAuthStore } from '@/stores/auth/authStore'

  const router = useRouter()
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const userFullName = computed(() => authStore.getUserFullName)
  const userInitials = computed(() => authStore.getUserInitials)

  const menuItems = computed(() => {
    // Obtener la ruta del dashboard según el rol del usuario
    const getDashboardRoute = () => {
      const role = authStore.userRole
      switch (role) {
        case 'patient':
          return '/dashboard/patient'
        case 'doctor':
          return '/dashboard/doctor'
        case 'admin':
          return '/dashboard/admin'
        case 'receptionist':
          return '/dashboard/receptionist'
        default:
          return '/dashboard/patient'
      }
    }

    const items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => router.push(getDashboardRoute())
      }
    ]

    // Menú específico por rol
    if (authStore.hasRole('admin')) {
      items.push({
        label: 'Gestión',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Usuarios',
            icon: 'pi pi-users',
            command: () => router.push('/admin/users')
          },
          {
            label: 'Configuración',
            icon: 'pi pi-sliders-h',
            command: () => router.push('/admin/settings')
          }
        ]
      })
    }

    if (
      authStore.hasRole('doctor') ||
      authStore.hasRole('admin') ||
      authStore.hasRole('receptionist')
    ) {
      items.push(
        {
          label: 'Pacientes',
          icon: 'pi pi-users',
          items: [
            {
              label: 'Lista de Pacientes',
              icon: 'pi pi-list',
              command: () => router.push('/patients')
            },
            {
              label: 'Nuevo Paciente',
              icon: 'pi pi-user-plus',
              command: () => router.push('/patients/new')
            }
          ]
        },
        {
          label: 'Citas',
          icon: 'pi pi-calendar',
          items: [
            {
              label: 'Agenda',
              icon: 'pi pi-calendar',
              command: () => router.push('/appointments')
            },
            {
              label: 'Nueva Cita',
              icon: 'pi pi-plus',
              command: () => router.push('/appointments/new')
            }
          ]
        }
      )
    }

    if (authStore.hasRole('doctor') || authStore.hasRole('admin')) {
      items.push({
        label: 'Historial Médico',
        icon: 'pi pi-file-medical',
        command: () => router.push('/medical-records')
      })
    }

    if (authStore.hasRole('patient')) {
      items.push(
        {
          label: 'Mis Citas',
          icon: 'pi pi-calendar',
          command: () => router.push('/appointments')
        },
        {
          label: 'Mi Historial',
          icon: 'pi pi-file',
          command: () => router.push(`/medical-records/patient/${user.value?.id}`)
        }
      )
    }

    return items
  })
</script>

<style scoped>
  .app-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
  }

  .sidebar-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #495057;
  }

  .sidebar-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  .sidebar-menu {
    border: none;
    width: 100%;
  }

  .sidebar-footer {
    padding: 1rem;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-name {
    font-weight: 500;
    color: #495057;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role {
    color: #6c757d;
    font-size: 0.75rem;
    text-transform: capitalize;
  }
</style>
