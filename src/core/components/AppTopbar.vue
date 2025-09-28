<template>
  <div class="app-topbar">
    <!-- Left Section -->
    <div class="topbar-left">
      <!-- Mobile Menu Button -->
      <button v-if="isMobile" @click="$emit('toggle-sidebar')" class="mobile-menu-btn">
        <i class="pi pi-bars"></i>
      </button>

      <!-- Page Title -->
      <div class="page-info">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
      </div>
    </div>

    <!-- Right Section -->
    <div class="topbar-right">
      <!-- Search (Desktop only) -->
      <div v-if="!isMobile" class="search-container">
        <div class="search-input">
          <i class="pi pi-search search-icon"></i>
          <input type="text" placeholder="Buscar..." class="search-field" v-model="searchQuery" />
        </div>
      </div>

      <!-- Notifications -->
      <div class="topbar-item">
        <button
          @click="showNotifications"
          class="notification-btn"
          :class="{ 'has-notifications': notificationCount > 0 }"
        >
          <i class="pi pi-bell"></i>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>
      </div>

      <!-- User Menu -->
      <div class="topbar-item">
        <button
          @click="toggleUserMenu"
          class="user-button"
          aria-haspopup="true"
          aria-controls="user_menu"
        >
          <Avatar
            :label="userInitials"
            class="user-avatar"
            size="small"
            shape="circle"
            :style="{ backgroundColor: '#059669', color: '#ffffff' }"
          />
          <div v-if="!isMobile" class="user-info">
            <span class="user-name">{{ userFullName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <i class="pi pi-angle-down user-dropdown-icon"></i>
        </button>

        <Menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Avatar from 'primevue/avatar'
  import Menu from 'primevue/menu'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { useNotificationStore } from '@/stores/ui/notificationStore'

  interface Props {
    sidebarCollapsed?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    sidebarCollapsed: false
  })

  // Emits
  defineEmits<{
    'toggle-sidebar': []
    'toggle-collapse': []
  }>()

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  const userMenu = ref()
  const searchQuery = ref('')

  const isMobile = computed(() => window.innerWidth <= 768)
  const notificationCount = computed(() => notificationStore.unreadCount)
  const userFullName = computed(() => authStore.getUserFullName)
  const userInitials = computed(() => authStore.getUserInitials)
  const userRole = computed(() => authStore.userRole)

  const pageTitle = computed(() => {
    return (route.meta.title as string) || (route.name as string) || 'Dashboard'
  })

  const pageSubtitle = computed(() => {
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return (
      now.toLocaleDateString('es-ES', options).charAt(0).toUpperCase() +
      now.toLocaleDateString('es-ES', options).slice(1)
    )
  })

  const userMenuItems = computed(() => [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => {
        router.push('/profile')
      }
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => {
        router.push('/settings')
      }
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: async () => {
        await authStore.logout()
        router.push('/auth/login')
      }
    }
  ])

  const toggleUserMenu = (event: Event) => {
    userMenu.value.toggle(event)
  }

  const showNotifications = () => {
    // Implementar panel de notificaciones
    console.log('Mostrar notificaciones')
  }
</script>

<style scoped src="./AppTopbar.css"></style>
