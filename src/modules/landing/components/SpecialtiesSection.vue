<template>
  <section id="especialidades" class="specialties-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Nuestras Especialidades</h2>
        <p class="section-subtitle">Todas las especialidades médicas que necesitas para tu salud</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p class="loading-text">Cargando especialidades...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <Message severity="error" :closable="false">
          {{ error }}
        </Message>
        <Button label="Reintentar" icon="pi pi-refresh" @click="loadSpecialties" class="mt-3" />
      </div>

      <!-- Specialties Carousel -->
      <div v-else class="specialties-carousel">
        <Carousel
          :value="activeSpecialties"
          :numVisible="3"
          :numScroll="1"
          :responsiveOptions="carouselResponsiveOptions"
          :autoplayInterval="4000"
          :showNavigators="true"
          :showIndicators="true"
        >
          <template #item="{ data: specialty }">
            <Card class="specialty-card">
              <template #header>
                <div class="specialty-image">
                  <img
                    :src="specialty.image_url"
                    :alt="specialty.name"
                    @error="handleImageError"
                    class="specialty-img"
                  />
                </div>
              </template>
              <template #title>
                <h3 class="specialty-name">{{ specialty.name }}</h3>
              </template>
              <template #content>
                <p class="specialty-description">{{ specialty.description }}</p>
                <div class="specialty-code">
                  <Tag :value="specialty.code" severity="info" />
                </div>
              </template>
              <template #footer>
                <Button
                  label="Agendar Cita"
                  icon="pi pi-calendar-plus"
                  class="specialty-button"
                  @click="navigateToAppointment(specialty)"
                />
              </template>
            </Card>
          </template>
        </Carousel>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && activeSpecialties.length === 0" class="empty-state">
        <i class="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
        <p class="text-gray-600">No hay especialidades disponibles en este momento</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import Tag from 'primevue/tag'
  import Message from 'primevue/message'
  import ProgressSpinner from 'primevue/progressspinner'
  import Carousel from 'primevue/carousel'
  import { specialtyService } from '@/services/specialty.service'
  import type { Specialty } from '@/types/specialty.types'

  const router = useRouter()

  // Reactive state
  const specialties = ref<Specialty[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeSpecialties = computed(() => {
    if (!Array.isArray(specialties.value)) {
      return []
    }
    return specialties.value.filter(specialty => specialty.status === 'activo')
  })

  // Carousel responsive options
  const carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1
    }
  ]

  // Methods
  const loadSpecialties = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await specialtyService.getSpecialties()
      // Asegurarnos de que siempre sea un array
      specialties.value = Array.isArray(result) ? result : []
    } catch (err) {
      console.error('Error loading specialties:', err)
      error.value = err instanceof Error ? err.message : 'Error al cargar las especialidades'
      specialties.value = []
    } finally {
      loading.value = false
    }
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    // Fallback to a default medical icon
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBWMTUwTTUwIDEwMEgxNTAiIHN0cm9rZT0iIzY2N0VFQSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+'
  }

  const navigateToAppointment = (specialty: Specialty) => {
    // Navigate to appointment booking with specialty pre-selected
    router.push({
      path: '/auth/login',
      query: {
        redirect: '/appointments/new',
        specialty: specialty.code
      }
    })
  }

  // Lifecycle
  onMounted(() => {
    loadSpecialties()
  })
</script>

<style scoped>
  .specialties-section {
    padding: 5rem 5%;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-dark) 0%,
      var(--color-sf-green-normal) 100%
    );
  }

  .section-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .loading-container {
    text-align: center;
    padding: 3rem;
    color: white;
  }

  .loading-text {
    margin-top: 1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .error-container {
    text-align: center;
    padding: 2rem;
  }

  .specialties-carousel {
    margin: 2rem 0;
  }

  .specialty-card {
    margin: 0 1rem;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    height: 100%;
  }

  .specialty-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .specialty-image {
    height: 200px;
    overflow: hidden;
    border-radius: 0.5rem 0.5rem 0 0;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .specialty-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .specialty-card:hover .specialty-img {
    transform: scale(1.05);
  }

  .specialty-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.5rem;
  }

  .specialty-description {
    color: #718096;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .specialty-code {
    margin-bottom: 1rem;
  }

  .specialty-button {
    width: 100%;
    justify-content: center;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: white;
  }

  @media (max-width: 768px) {
    .specialties-section {
      padding: 3rem 2rem;
    }

    .section-title {
      font-size: 2rem;
    }
  }

  /* Override PrimeVue Carousel styles for better integration */
  :deep(
    .p-carousel
      .p-carousel-content
      .p-carousel-container
      .p-carousel-items-content
      .p-carousel-items-container
  ) {
    padding: 1rem 0;
  }

  :deep(.p-carousel .p-carousel-indicators) {
    padding: 1rem 0;
  }

  :deep(.p-carousel .p-carousel-indicator button) {
    background-color: rgba(255, 255, 255, 0.5);
  }

  :deep(.p-carousel .p-carousel-indicator.p-highlight button) {
    background-color: white;
  }
</style>
