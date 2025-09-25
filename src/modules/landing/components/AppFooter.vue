<template>
  <footer class="bg-white text-sf-green-dark text-center py-6 mt-auto">
    <div class="container mx-auto">
      <p>© {{ year }} SISFAHD - Todos los derechos reservados</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear();
</script>
