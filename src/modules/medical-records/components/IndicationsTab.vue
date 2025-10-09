<template>
  <div class="p-4 space-y-4">
    <h3 class="text-lg font-semibold text-gray-700">Indicaciones del médico</h3>

    <textarea
      v-model="indications"
      rows="6"
      class="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
      placeholder="Escribe aquí las indicaciones o recomendaciones para el paciente..."
    ></textarea>

    <div class="flex justify-end">
      <Button
        :disabled="saving"
        @click="saveIndications"
        icon="pi pi-save"
        class="w-[120px] bg-sf-green-light text-white rounded-lg hover:bg-sf-green-light disabled:opacity-50"
        label="Guardar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import Button from 'primevue/button'
  import { useConsultationStore } from '@/stores/consultation/consultationStore'

  const consultationStore = useConsultationStore()
  const indications = ref('')
  const saving = ref(false)

  interface Props {
    consultationId: number
  }

  defineProps<Props>()

  // ✅ Mantiene sincronizado con el store, incluso si currentConsultation llega después
  watch(
    () => consultationStore.currentConsultation?.treatment_plan,
    newVal => {
      if (newVal !== undefined && newVal !== null) {
        indications.value = newVal
      }
    },
    { immediate: true }
  )

  const saveIndications = async () => {
    if (saving.value) return

    saving.value = true
    try {
      await consultationStore.updateConsultationField('treatment_plan', indications.value)
    } catch (err) {
      console.error('Error al guardar indicaciones:', err)
    } finally {
      saving.value = false
    }
  }
</script>
