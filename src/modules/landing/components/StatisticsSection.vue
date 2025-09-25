<template>
  <section id="estadisticas" class="statistics-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Nuestros Números Hablan</h2>
        <p class="section-subtitle">
          La confianza de miles de pacientes nos respalda
        </p>
      </div>
      
      <div class="statistics-grid">
        <Card 
          v-for="stat in STATISTICS" 
          :key="stat.label" 
          class="statistic-card"
        >
          <template #content>
            <div class="statistic-content">
              <div class="statistic-icon">
                <i :class="stat.icon" class="stat-icon-element"></i>
              </div>
              <div class="statistic-number">{{ stat.number }}</div>
              <h3 class="statistic-label">{{ stat.label }}</h3>
              <p class="statistic-description">{{ stat.description }}</p>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Card from 'primevue/card'

const STATISTICS = [
  {
    number: '15,000+',
    label: 'Pacientes atendidos',
    description: 'Personas satisfechas con nuestro servicio',
    icon: 'pi pi-users'
  },
  {
    number: '300+',
    label: 'Médicos especialistas',
    description: 'Profesionales calificados a su disposición',
    icon: 'pi pi-user-plus'
  },
  {
    number: '25+',
    label: 'Especialidades',
    description: 'Cubriendo todas sus necesidades de salud',
    icon: 'pi pi-heart'
  },
  {
    number: '98%',
    label: 'Índice de satisfacción',
    description: 'Comprometidos con la excelencia en el servicio',
    icon: 'pi pi-star-fill'
  },
]
</script>

<style scoped>
.statistics-section {
  padding: 5rem 5%;
  background: linear-gradient(135deg, var(--color-sf-green-dark) 0%, var(--color-sf-green-normal) 100%);
  color: white;
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
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.statistic-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.statistic-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.statistic-content {
  text-align: center;
  padding: 1rem;
}

.statistic-icon {
  margin-bottom: 1rem;
}

.stat-icon-element {
  font-size: 3rem;
  color: var(--color-sf-green-light);
}

.statistic-number {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-sf-green-light) 0%, white 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.statistic-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
}

.statistic-description {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .statistics-section {
    padding: 3rem 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .statistics-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .statistic-number {
    font-size: 2.5rem;
  }
}

/* Override PrimeVue Card styles for glass effect */
:deep(.p-card .p-card-body) {
  background: transparent;
  color: white;
}

:deep(.p-card .p-card-content) {
  padding: 1rem;
}
</style>
