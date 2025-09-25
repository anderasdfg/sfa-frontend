<template>
  <section id="como-funciona" class="how-it-works-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Cómo Funciona</h2>
        <p class="section-subtitle">
          Agenda tu cita médica en 4 simples pasos
        </p>
      </div>
      
      <div class="steps-grid">
        <Card 
          v-for="step in STEPS" 
          :key="step.id" 
          class="step-card"
        >
          <template #content>
            <div class="step-content">
              <div class="step-number">
                <Avatar 
                  :label="step.id.toString()" 
                  class="step-avatar"
                  size="xlarge"
                />
              </div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
              <div class="step-icon">
                <i :class="step.icon" class="step-icon-element"></i>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'

const STEPS = [
  {
    id: 1,
    title: 'Busca Especialista',
    description: 'Encuentra el médico adecuado para tu necesidad.',
    icon: 'pi pi-search'
  },
  {
    id: 2,
    title: 'Agenda tu Cita',
    description: 'Selecciona fecha y hora según disponibilidad.',
    icon: 'pi pi-calendar-plus'
  },
  {
    id: 3,
    title: 'Recibe Atención',
    description: 'Acude a tu cita o conéctate de forma virtual.',
    icon: 'pi pi-video'
  },
  {
    id: 4,
    title: 'Seguimiento',
    description: 'Recibe seguimiento de tu salud y recibe recomendaciones.',
    icon: 'pi pi-chart-line'
  },
]
</script>

<style scoped>
.how-it-works-section {
  padding: 5rem 5%;
  background: white;
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
  color: var(--color-sf-green-dark);
}

.section-subtitle {
  font-size: 1.1rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step-card {
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(109, 189, 119, 0.15);
  border-color: var(--color-sf-green-light);
}

.step-content {
  padding: 1rem;
}

.step-number {
  margin-bottom: 1.5rem;
}

.step-avatar {
  background: linear-gradient(135deg, var(--color-sf-green-light) 0%, var(--color-sf-green-normal) 100%);
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-sf-green-dark);
  margin-bottom: 1rem;
}

.step-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.step-icon {
  display: flex;
  justify-content: center;
}

.step-icon-element {
  font-size: 2rem;
  color: var(--color-sf-green-normal);
}

@media (max-width: 768px) {
  .how-it-works-section {
    padding: 3rem 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
