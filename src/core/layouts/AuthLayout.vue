<script setup lang="ts">
  import loginBannerImg from '@/assets/images/login-banner.png'
</script>

<template>
  <section
    class="h-screen flex items-center justify-center bg-gradient-to-b from-sf-green-dark from-0% from-50% to-sf-green-light to-50% to-100%"
  >
    <div
      class="bg-white w-[90%] md:w-[70%] min-w-[320px] md:min-w-[750px] h-[90vh] rounded-[20px] shadow-lg flex"
    >
      <div
        class="hidden md:flex w-0 md:w-1/2 items-center justify-center p-4 pl-16 overflow-hidden"
      >
        <img
          :src="loginBannerImg"
          alt="Login Banner"
          class="w-full h-auto object-contain mx-auto"
        />
      </div>
      <div class="w-full md:w-1/2 flex items-center justify-center p-4">
        <router-view />
      </div>
    </div>
  </section>
</template>
