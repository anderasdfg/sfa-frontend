<template>
  <div class="app-sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <!-- Logo -->
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon">
          <img src="https://www.clinicasanmiguel.pe/img/logo.png" alt="Logo" class="brand-logo" />
        </div>
      </div>

      <!-- Collapse Toggle (Desktop only) -->
      <button
        v-if="!isMobile"
        @click="$emit('toggle-collapse')"
        class="collapse-toggle"
        :class="{ collapsed: collapsed }"
      >
        <i class="pi pi-angle-left"></i>
      </button>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-content">
      <div class="sidebar-menu">
        <template v-for="item in menuItems" :key="item.label">
          <!-- Menu Item with Submenu -->
          <div v-if="item.items" class="menu-group">
            <div class="menu-group-header" :class="{ collapsed: collapsed }">
              <i :class="item.icon" class="menu-icon"></i>
              <span v-show="!collapsed" class="menu-label">{{ item.label }}</span>
            </div>
            <div v-show="!collapsed" class="menu-group-items">
              <button
                v-for="subItem in item.items"
                :key="subItem.label"
                @click="subItem.command?.()"
                class="menu-item submenu-item"
              >
                <i :class="subItem.icon" class="menu-icon"></i>
                <span class="menu-label">{{ subItem.label }}</span>
              </button>
            </div>
          </div>

          <!-- Single Menu Item -->
          <button
            v-else
            @click="item.command?.()"
            class="menu-item"
            :class="{ collapsed: collapsed }"
          >
            <i :class="item.icon" class="menu-icon"></i>
            <span v-show="!collapsed" class="menu-label">{{ item.label }}</span>
          </button>
        </template>
      </div>
    </div>

    <!-- User Info -->
    <div class="sidebar-footer" v-if="user">
      <div class="user-info" :class="{ collapsed: collapsed }">
        <Avatar
          :label="userInitials"
          class="user-avatar"
          shape="circle"
          size="normal"
          :style="{ backgroundColor: '#059669', color: '#ffffff' }"
        />
        <div v-show="!collapsed" class="user-details">
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
  import Avatar from 'primevue/avatar'
  import { useAuthStore } from '@/stores/auth/authStore'

  interface MenuItem {
    label: string
    icon: string
    command?: () => void | Promise<any>
    items?: MenuItem[]
  }

  interface Props {
    collapsed?: boolean
  }

  withDefaults(defineProps<Props>(), {
    collapsed: false
  })

  defineEmits<{
    'toggle-collapse': []
  }>()

  const router = useRouter()
  const authStore = useAuthStore()

  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const userFullName = computed(() => authStore.getUserFullName)
  const userInitials = computed(() => authStore.getUserInitials)

  const isMobile = computed(() => window.innerWidth <= 768)

  const menuItems = computed(() => {
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

    const items: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => router.push(getDashboardRoute())
      }
    ]

    // Menú específico por rol
    if (authStore.hasRole('admin')) {
      // Gestión de Usuarios
      items.push({
        label: 'Gestión de Usuarios',
        icon: 'pi pi-users',
        items: [
          {
            label: 'Médicos',
            icon: 'pi pi-users',
            command: () => router.push('/admin/doctors')
          },
          {
            label: 'Pacientes',
            icon: 'pi pi-users',
            command: () => router.push('/admin/patients')
          }
        ]
      })

      items.push({
        label: 'Gestión de Citas',
        icon: 'pi pi-calendar',
        items: [
          {
            label: 'Calendario de citas',
            icon: 'pi pi-calendar',
            command: () => router.push('/appointments/calendar')
          },
          {
            label: 'Asignación de turnos',
            icon: 'pi pi-clock',
            command: () => router.push('/admin/schedule-availability')
          },
          {
            label: 'Reprogramaciones',
            icon: 'pi pi-refresh',
            command: () => router.push('/appointments')
          },
          {
            label: 'Cancelaciones',
            icon: 'pi pi-times',
            command: () => router.push('/appointments')
          }
        ]
      })

      // Reportes y Analytics
      items.push({
        label: 'Reportes y Analytics',
        icon: 'pi pi-chart-bar',
        items: [
          {
            label: 'Productividad por médico',
            icon: 'pi pi-chart-line',
            command: () => router.push('/dashboard/admin')
          },
          {
            label: 'Estadísticas de atención',
            icon: 'pi pi-chart-pie',
            command: () => router.push('/dashboard/admin')
          },
          {
            label: 'Reportes financieros',
            icon: 'pi pi-dollar',
            command: () => router.push('/dashboard/admin')
          },
          {
            label: 'Métricas de satisfacción',
            icon: 'pi pi-thumbs-up',
            command: () => router.push('/dashboard/admin')
          }
        ]
      })

      // Configuración del Sistema
      items.push({
        label: 'Configuración del Sistema',
        icon: 'pi pi-sliders-h',
        items: [
          {
            label: 'Parámetros generales',
            icon: 'pi pi-cog',
            command: () => router.push('/admin/settings')
          }
        ]
      })
    }

    // Menú para roles no-admin (doctor, receptionist)
    if (
      (authStore.hasRole('doctor') || authStore.hasRole('receptionist')) &&
      !authStore.hasRole('admin')
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

    // Historial médico solo para doctores no-admin
    if (authStore.hasRole('doctor') && !authStore.hasRole('admin')) {
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

<style scoped src="./AppSidebar.css"></style>
