<template>
  <section id="inicio" class="hero-section">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">Agenda Tu Cita Médica Online</h1>
        <p class="hero-subtitle">
          Porque tu tiempo vale, agenda tus citas médicas en minutos, desde donde estés y sin perder
          la tranquilidad.
        </p>
        <div class="hero-actions">
          <Button
            label="Reservar una cita"
            icon="pi pi-calendar-plus"
            class="hero-button primary"
            size="large"
            @click="navigateToBooking"
          />
          <Button
            label="Conoce más"
            icon="pi pi-arrow-down"
            class="hero-button secondary"
            size="large"
            outlined
            @click="scrollToServices"
          />
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/images/doctor-home.png" alt="Medical Illustration" class="hero-img" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Button from 'primevue/button'

  const router = useRouter()

  const navigateToBooking = () => {
    router.push('/appointment-booking')
  }

  const scrollToServices = () => {
    const element = document.getElementById('como-funciona')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
</script>

<style scoped>
  .hero-section {
    min-height: 100vh;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-dark) 0%,
      var(--color-sf-green-normal) 100%
    );
    display: flex;
    align-items: center;
    padding: 2rem 5%;
  }

  .hero-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 3rem;
    width: 100%;
  }

  .hero-content {
    flex: 1;
    max-width: 600px;
    color: white;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .hero-button.primary {
    background: white;
    color: var(--color-sf-green-normal);
    border: none;
  }

  .hero-button.primary:hover {
    background: #f8f9fa;
    color: var(--color-sf-green-dark);
  }

  .hero-button.secondary {
    border-color: white;
    color: white;
  }

  .hero-button.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
    color: white;
  }

  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hero-img {
    max-width: 100%;
    height: auto;
    max-height: 600px;
  }

  @media (max-width: 1024px) {
    .hero-container {
      flex-direction: column;
      text-align: center;
    }

    .hero-title {
      font-size: 2.5rem;
    }

    .hero-image {
      order: -1;
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 2rem;
    }

    .hero-title {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 1.1rem;
    }

    .hero-actions {
      justify-content: center;
    }
  }
</style>
