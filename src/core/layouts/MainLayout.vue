<template>
  <div class="layout-wrapper" :class="{ 'layout-sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <div
      class="layout-sidebar"
      :class="{
        'layout-sidebar-active': sidebarVisible,
        'layout-sidebar-collapsed': sidebarCollapsed
      }"
    >
      <AppSidebar :collapsed="sidebarCollapsed" @toggle-collapse="toggleSidebarCollapse" />
    </div>

    <!-- Overlay para móvil -->
    <div v-if="sidebarVisible && isMobile" class="layout-sidebar-mask" @click="closeSidebar"></div>

    <!-- Main Content -->
    <div class="layout-main">
      <!-- Topbar -->
      <div class="layout-topbar">
        <AppTopbar
          @toggle-sidebar="toggleSidebar"
          @toggle-collapse="toggleSidebarCollapse"
          :sidebar-collapsed="sidebarCollapsed"
        />
      </div>

      <!-- Content -->
      <div class="layout-content">
        <div class="layout-content-inner">
          <!-- Router View -->
          <router-view v-slot="{ Component }">
            <transition name="layout" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>

    <!-- Global Loading -->
    <div v-if="isGlobalLoading" class="global-loading">
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import ProgressSpinner from 'primevue/progressspinner'

  import AppTopbar from '@/core/components/AppTopbar.vue'
  import AppSidebar from '@/core/components/AppSidebar.vue'

  const sidebarVisible = ref(false)
  const sidebarCollapsed = ref(false)
  const isGlobalLoading = ref(false)
  const windowWidth = ref(window.innerWidth)

  const isMobile = computed(() => windowWidth.value <= 768)

  const toggleSidebar = () => {
    if (isMobile.value) {
      sidebarVisible.value = !sidebarVisible.value
    } else {
      toggleSidebarCollapse()
    }
  }

  const closeSidebar = () => {
    sidebarVisible.value = false
  }

  const toggleSidebarCollapse = () => {
    if (!isMobile.value) {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }
  }

  const handleResize = () => {
    windowWidth.value = window.innerWidth
    if (isMobile.value) {
      sidebarCollapsed.value = false
      sidebarVisible.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
</script>

<style scoped>
  .layout-wrapper {
    display: flex;
    min-height: 100vh;
    position: relative;
    background: #f8fafc;
  }

  .layout-sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    width: 280px;
    height: 100vh;
    background: #ffffff;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1000;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .layout-sidebar-active {
    left: 0;
  }


  .layout-sidebar-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    backdrop-filter: blur(4px);
  }

  .layout-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .layout-topbar {
    height: 72px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    z-index: 997;
    flex-shrink: 0;
    position: relative;
  }

  .layout-content {
    flex: 1;
    background: #f8fafc;
    overflow-y: auto;
  }

  .layout-content-inner {
    padding: 2rem;
  }

  .global-loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .layout-enter-active,
  .layout-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .layout-enter-from,
  .layout-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }

  /* Desktop Layout */
  @media (min-width: 769px) {
    .layout-sidebar {
      position: fixed;
      left: 0;
      width: 280px;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .layout-sidebar-mask {
      display: none;
    }

    .layout-main {
      margin-left: 280px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }


    .layout-content-inner {
      padding: 2.5rem;
      max-width: none;
    }

    /* Collapsed state - higher specificity */
    .layout-wrapper.layout-sidebar-collapsed .layout-sidebar {
      width: 80px;
    }

    .layout-wrapper.layout-sidebar-collapsed .layout-main {
      margin-left: 80px;
    }
  }

  /* Tablet Layout */
  @media (max-width: 768px) and (min-width: 481px) {
    .layout-content-inner {
      padding: 1.5rem;
    }
  }

  /* Mobile Layout */
  @media (max-width: 480px) {
    .layout-content-inner {
      padding: 1rem;
    }

    .layout-topbar {
      height: 64px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .layout-wrapper {
      background: #0f172a;
    }

    .layout-content {
      background: #0f172a;
    }
  }
</style>
