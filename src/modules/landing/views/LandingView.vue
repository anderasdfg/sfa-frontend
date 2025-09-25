<template>
  <main class="main-content">
    <hero-section />
    <how-it-works-section />
    <specialties-section />
    <doctors-section />
    <statistics-section />
    <faq-section />
  </main>
</template>

<script setup lang="ts">
  import DoctorsSection from '../components/DoctorsSection.vue'
  import FaqSection from '../components/FaqSection.vue'
  import HeroSection from '../components/HeroSection.vue'
  import HowItWorksSection from '../components/HowItWorksSection.vue'
  import SpecialtiesSection from '../components/SpecialtiesSection.vue'
  import StatisticsSection from '../components/StatisticsSection.vue'
</script>

<style scoped>
  .main-content {
    flex: 1;
  }
</style>
