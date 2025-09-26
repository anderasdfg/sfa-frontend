<template>
  <div class="layout-wrapper">
    <!-- Sidebar -->
    <div class="layout-sidebar" :class="{ 'layout-sidebar-active': sidebarVisible }">
      <AppSidebar />
    </div>

    <!-- Overlay para móvil -->
    <div v-if="sidebarVisible" class="layout-sidebar-mask" @click="toggleSidebar"></div>

    <!-- Main Content -->
    <div class="layout-main">
      <!-- Topbar -->
      <div class="layout-topbar">
        <AppTopbar @toggle-sidebar="toggleSidebar" />
      </div>

      <!-- Content -->
      <div class="layout-content">
        <div class="layout-content-inner">
          <!-- Breadcrumb -->
          <div class="mb-4" v-if="showBreadcrumb">
            <Breadcrumb :model="breadcrumbItems" />
          </div>

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
import { useRoute } from 'vue-router'
import Breadcrumb from 'primevue/breadcrumb'
import ProgressSpinner from 'primevue/progressspinner'

import AppTopbar from '@/core/components/AppTopbar.vue'
import AppSidebar from '@/core/components/AppSidebar.vue'
const route = useRoute()

const sidebarVisible = ref(false)
const isGlobalLoading = ref(false)

const showBreadcrumb = computed(() => route.meta.showBreadcrumb !== false)

const breadcrumbItems = computed(() => {
  const items: Array<{ label: string; route: string }> = []

  if (route.matched.length > 1) {
    route.matched.forEach((match, index) => {
      if (match.name && index > 0) {
        items.push({
          label: (match.meta?.title as string) || String(match.name),
          route: match.path,
        })
      }
    })
  }

  return items
})

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value
}

const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
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
}

.layout-sidebar {
  position: fixed;
  left: -280px;
  top: 0;
  width: 280px;
  height: 100vh;
  background: #ffffff;
  transition: left 0.3s;
  z-index: 1000;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.layout-topbar {
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e9ecef;
  z-index: 997;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.layout-content {
  flex: 1;
  background: #f8f9fa;
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
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.layout-enter-active,
.layout-leave-active {
  transition: all 0.3s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

/* Responsive */
@media (min-width: 768px) {
  .layout-sidebar {
    position: relative;
    left: 0;
    width: 280px;
    box-shadow: none;
  }

  .layout-sidebar-mask {
    display: none;
  }

  .layout-main {
    margin-left: 0;
  }
}

@media (max-width: 767px) {
  .layout-content-inner {
    padding: 1rem;
  }
}
</style>
