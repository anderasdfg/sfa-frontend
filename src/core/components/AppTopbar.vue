<template>
  <div class="app-topbar">
    <!-- Left Section -->
    <div class="topbar-left">
      <!-- Mobile Menu Button -->
      <Button
        icon="pi pi-bars"
        class="p-button-text p-button-plain md:hidden"
        @click="$emit('toggle-sidebar')"
      />

      <!-- Page Title -->
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <!-- Right Section -->
    <div class="topbar-right">
      <!-- Notifications -->
      <div class="topbar-item">
        <Button
          icon="pi pi-bell"
          class="p-button-text p-button-plain"
          :badge="notificationCount > 0 ? notificationCount.toString() : undefined"
          badge-class="p-badge-danger"
          @click="showNotifications"
        />
      </div>

      <!-- User Menu -->
      <div class="topbar-item">
        <Button
          class="p-button-text user-button"
          @click="toggleUserMenu"
          aria-haspopup="true"
          aria-controls="user_menu"
        >
          <Avatar :label="userInitials" class="mr-2" size="small" shape="circle" />
          <span class="hidden md:inline">{{ userFullName }}</span>
          <i class="pi pi-angle-down ml-2"></i>
        </Button>

        <Menu ref="userMenu" id="user_menu" :model="userMenuItems" :popup="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import Button from 'primevue/button'
  import Avatar from 'primevue/avatar'
  import Menu from 'primevue/menu'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { useNotificationStore } from '@/stores/ui/notificationStore'

  // Emits
  defineEmits<{
    'toggle-sidebar': []
  }>()

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  const userMenu = ref()

  const user = computed(() => authStore.user)
  const notificationCount = computed(() => notificationStore.unreadCount)
  const userFullName = computed(() => authStore.getUserFullName)
  const userInitials = computed(() => authStore.getUserInitials)

  const pageTitle = computed(() => {
    return (route.meta.title as string) || (route.name as string) || 'Dashboard'
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

<style scoped>
  .app-topbar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    background: #ffffff;
  }

  .topbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .topbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #495057;
    margin: 0;
  }

  .topbar-item {
    display: flex;
    align-items: center;
  }

  .user-button {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }

  .user-button:hover {
    background: #f8f9fa;
  }

  @media (max-width: 767px) {
    .app-topbar {
      padding: 0 1rem;
    }

    .page-title {
      font-size: 1.25rem;
    }
  }
</style>
