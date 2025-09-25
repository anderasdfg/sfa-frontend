<template>
  <section id="faq" class="faq-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Preguntas Frecuentes</h2>
        <p class="section-subtitle">
          Encuentra respuestas a las dudas más comunes sobre nuestros servicios
        </p>
      </div>
      
      <div class="faq-content">
        <Accordion :activeIndex="0" class="faq-accordion">
          <AccordionTab 
            v-for="(item, index) in faqItems" 
            :key="index"
            :header="item.question"
            class="faq-tab"
          >
            <p class="faq-answer">{{ item.answer }}</p>
          </AccordionTab>
        </Accordion>
      </div>
      
      <div class="section-footer">
        <Card class="contact-card">
          <template #title>
            <h3 class="contact-title">¿No encuentras tu respuesta?</h3>
          </template>
          <template #content>
            <p class="contact-description">
              Nuestro equipo de soporte está aquí para ayudarte
            </p>
            <div class="contact-actions">
              <Button 
                label="Contactar Soporte" 
                icon="pi pi-phone"
                class="contact-button"
                @click="navigateToContact"
              />
              <Button 
                label="Chat en Vivo" 
                icon="pi pi-comments"
                class="contact-button"
                outlined
                @click="openLiveChat"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()

const faqItems = [
  {
    question: '¿Cómo puedo agendar una cita?',
    answer: 'Puedes agendar una cita registrándote en nuestra plataforma, seleccionando la especialidad médica deseada y eligiendo la fecha y hora que más te convenga según la disponibilidad.'
  },
  {
    question: '¿Puedo cancelar o reprogramar mi cita?',
    answer: 'Sí, puedes cancelar o reprogramar tu cita hasta 24 horas antes de la hora programada sin ningún costo adicional.'
  },
  {
    question: '¿Cómo funcionan las citas virtuales?',
    answer: 'Las citas virtuales se realizan a través de nuestra plataforma segura. Recibirás un enlace antes de tu cita y simplemente deberás hacer clic en él para conectarte con tu médico.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos pagos con tarjetas de crédito, débito, transferencias bancarias y diversos medios de pago electrónicos.'
  },
  {
    question: '¿Necesito seguro médico?',
    answer: 'No es necesario tener seguro médico para usar nuestros servicios. Ofrecemos precios accesibles y planes de pago flexibles.'
  },
  {
    question: '¿Qué pasa si llego tarde a mi cita?',
    answer: 'Si llegas tarde, haremos nuestro mejor esfuerzo para atenderte, pero es posible que tengas que esperar o reprogramar tu cita dependiendo de la disponibilidad del médico.'
  }
]

const navigateToContact = () => {
  router.push({
    path: '/auth/login',
    query: { 
      redirect: '/contact',
    }
  })
}

const openLiveChat = () => {
  // Aquí se puede integrar un sistema de chat en vivo
  console.log('Opening live chat...')
}
</script>

<style scoped>
.faq-section {
  padding: 5rem 5%;
  background: #f8f9fa;
}

.section-container {
  max-width: 1000px;
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

.faq-content {
  margin-bottom: 3rem;
}

.faq-accordion {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.faq-answer {
  color: #718096;
  line-height: 1.7;
  font-size: 1rem;
}

.section-footer {
  display: flex;
  justify-content: center;
}

.contact-card {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.contact-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-sf-green-dark);
  margin-bottom: 0.5rem;
}

.contact-description {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.contact-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-button {
  min-width: 150px;
}

@media (max-width: 768px) {
  .faq-section {
    padding: 3rem 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .contact-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .contact-button {
    width: 100%;
    max-width: 250px;
  }
}

/* Override PrimeVue Accordion styles */
:deep(.p-accordion .p-accordion-tab .p-accordion-header .p-accordion-header-link) {
  padding: 1.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-sf-green-dark);
}

:deep(.p-accordion .p-accordion-tab .p-accordion-header .p-accordion-header-link:hover) {
  background: #f7fafc;
}

:deep(.p-accordion .p-accordion-tab .p-accordion-content) {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

:deep(.p-accordion .p-accordion-tab) {
  border-bottom: 1px solid #e2e8f0;
}

:deep(.p-accordion .p-accordion-tab:last-child) {
  border-bottom: none;
}
</style>
