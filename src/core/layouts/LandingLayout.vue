<template>
  <div class="landing-layout">
    <!-- Navigation Header -->
    <header class="landing-header">
      <nav class="landing-nav">
        <div class="nav-brand">
          <img src="https://www.clinicasanmiguel.pe/img/logo.png" alt="Logo" class="brand-logo" />
        </div>
        <div class="nav-actions">
          <Button
            :label="isAuthenticated ? userName : 'Iniciar Sesión'"
            class="p-button-text"
            @click="navigateToLogin"
          />
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="landing-main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-brand">
            <img src="https://www.clinicasanmiguel.pe/img/logo.png" alt="Logo" class="brand-logo" />
          </div>
          <p class="footer-description">
            Sistema integral de gestión médica para el cuidado de tu salud.
          </p>
        </div>
        <div class="footer-section">
          <h4>Enlaces</h4>
          <ul class="footer-links">
            <li><a href="#services">Servicios</a></li>
            <li><a href="#contact">Contacto</a></li>
            <li><a href="/auth/login">Iniciar Sesión</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contacto</h4>
          <div class="footer-contact">
            <p>
              <i class="pi pi-phone"></i>
              +1 (555) 123-4567
            </p>
            <p>
              <i class="pi pi-envelope"></i>
              info@sanmiguelarcangel.com
            </p>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 SISFAHD. Todos los derechos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import Button from 'primevue/button'
  import { useAuthStore } from '@/stores/auth/authStore'
  import { computed } from 'vue'
  const useAuth = useAuthStore()
  const router = useRouter()

  const navigateToLogin = () => {
    router.push('/auth/login')
  }

  const isAuthenticated = computed(() => {
    return useAuth.isAuthenticated
  })

  const userName = computed(() => {
    return useAuth.user?.first_name + ' ' + useAuth.user?.last_name
  })
</script>

<style scoped>
  .landing-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .landing-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .landing-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .brand-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
  }

  .landing-main {
    flex: 1;
    padding-top: 80px; /* Account for fixed header */
  }

  .landing-footer {
    background: var(--color-sf-green-dark);
    color: white;
    padding: 3rem 5% 1rem;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-section h4 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--color-sf-green-light);
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .footer-description {
    color: #a0aec0;
    line-height: 1.6;
  }

  .footer-links {
    list-style: none;
    padding: 0;
  }

  .footer-links li {
    margin-bottom: 0.5rem;
  }

  .footer-links a {
    color: #a0aec0;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .footer-links a:hover {
    color: #667eea;
  }

  .footer-contact p {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    color: #a0aec0;
  }

  .footer-contact i {
    color: var(--color-sf-green-light);
  }

  .footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #2d3748;
    color: #718096;
  }

  .brand-logo {
    border-radius: 1rem;
  }

  @media (max-width: 768px) {
    .landing-nav {
      padding: 1rem 2rem;
    }

    .nav-actions {
      display: none;
    }

    .landing-footer {
      padding: 2rem;
    }

    .footer-content {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
