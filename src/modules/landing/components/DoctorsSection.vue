<template>
  <section id="doctores" class="doctors-section">
    <div class="section-container">
      <div class="section-header">
        <h2 class="section-title">Médicos Destacados</h2>
        <p class="section-subtitle">
          Conoce a algunos de los especialistas que forman parte de nuestro equipo y cuidan de tu
          salud con excelencia
        </p>
      </div>

      <div class="doctors-grid">
        <Card v-for="doctor in featuredDoctors" :key="doctor.id" class="doctor-card">
          <template #header>
            <div class="doctor-image">
              <Avatar :image="doctor.image" class="doctor-avatar" size="xlarge" shape="circle" />
            </div>
          </template>
          <template #title>
            <h3 class="doctor-name">{{ doctor.name }}</h3>
          </template>
          <template #content>
            <div class="doctor-info">
              <Tag :value="doctor.specialty" severity="info" class="doctor-specialty" />
              <p class="doctor-description">{{ doctor.description }}</p>
              <div class="doctor-stats">
                <div class="stat">
                  <i class="pi pi-star-fill"></i>
                  <span>{{ doctor.rating }}</span>
                </div>
                <div class="stat">
                  <i class="pi pi-users"></i>
                  <span>{{ doctor.patients }}+ pacientes</span>
                </div>
              </div>
            </div>
          </template>
          <template #footer>
            <Button
              label="Ver Perfil"
              icon="pi pi-user"
              class="doctor-button"
              outlined
              @click="viewDoctorProfile(doctor)"
            />
          </template>
        </Card>
      </div>

      <div class="section-footer">
        <Button
          label="Ver Todos los Doctores"
          icon="pi pi-arrow-right"
          class="view-all-button"
          @click="navigateToAllDoctors"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import Card from 'primevue/card'
  import Button from 'primevue/button'
  import Avatar from 'primevue/avatar'
  import Tag from 'primevue/tag'

  const router = useRouter()

  interface Doctor {
    id: number
    name: string
    specialty: string
    description: string
    image: string
    rating: number
    patients: number
  }

  // Mock data - esto se puede reemplazar con una llamada a API
  const featuredDoctors = ref<Doctor[]>([
    {
      id: 1,
      name: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      description: 'Especialista en medicina general con más de 10 años de experiencia.',
      image:
        'https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png',
      rating: 4.9,
      patients: 500
    },
    {
      id: 2,
      name: 'Dra. María García',
      specialty: 'Medicina General',
      description: 'Experta en atención primaria y medicina preventiva.',
      image:
        'https://onelifeuae.com/cdn/shop/t/131/assets/dr_on_call_near_to_me_1-removebg-preview.webp?v=88858295910964880381711959273',
      rating: 4.8,
      patients: 350
    },
    {
      id: 3,
      name: 'Dr. Romulo Remo',
      specialty: 'Cardiología',
      description: 'Cardiólogo especializado en enfermedades cardiovasculares.',
      image:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB_UfUylRp_Ny5_MeP0qp2FXYAnhVVnDy2w&s',
      rating: 4.9,
      patients: 600
    }
  ])

  const viewDoctorProfile = (doctor: Doctor) => {
    // Navigate to doctor profile or show modal
    router.push({
      path: '/auth/login',
      query: {
        redirect: `/doctors/${doctor.id}`
      }
    })
  }

  const navigateToAllDoctors = () => {
    router.push({
      path: '/auth/login',
      query: {
        redirect: '/doctors'
      }
    })
  }
</script>

<style scoped>
  .doctors-section {
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

  .doctors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .doctor-card {
    text-align: center;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .doctor-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .doctor-image {
    padding: 2rem;
    background: linear-gradient(
      135deg,
      var(--color-sf-green-dark) 0%,
      var(--color-sf-green-normal) 100%
    );
    border-radius: 1rem 1rem 0 0;
  }

  .doctor-avatar {
    width: 120px;
    height: 120px;
    border: 4px solid white;
  }

  .doctor-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-sf-green-dark);
    margin-bottom: 0.5rem;
  }

  .doctor-info {
    padding: 0 1rem;
  }

  .doctor-specialty {
    margin-bottom: 1rem;
  }

  .doctor-description {
    color: #718096;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .doctor-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-sf-green-normal);
    font-weight: 500;
  }

  .stat i {
    color: #fbbf24;
  }

  .doctor-button {
    width: 100%;
  }

  .section-footer {
    text-align: center;
  }

  .view-all-button {
    padding: 0.75rem 2rem;
  }

  @media (max-width: 768px) {
    .doctors-section {
      padding: 3rem 2rem;
    }

    .section-title {
      font-size: 2rem;
    }

    .doctors-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .doctor-stats {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
