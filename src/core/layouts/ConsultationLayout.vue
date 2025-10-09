<template>
  <div class="consultation-layout">
    <!-- Topbar simplificado -->
    <!--  <div class="consultation-topbar">
      <AppTopbar :hide-sidebar-toggle="true" />
    </div> -->

    <!-- Content sin padding -->
    <div class="consultation-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
  // import AppTopbar from '@/core/components/AppTopbar.vue'
</script>

<style scoped>
  .consultation-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    background: #f8f9fa;
  }

  .consultation-topbar {
    height: 72px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    z-index: 997;
    flex-shrink: 0;
  }

  .consultation-content {
    flex: 1;
    overflow: auto;
  }

  @media (max-width: 480px) {
    .consultation-topbar {
      height: 64px;
    }
  }
</style>
