<template>
  <div class="nav-control">
    <button class="btn-secondary" @click="$emit('back')" :disabled="disableBack">
      Назад
    </button>
    <button class="btn-primary" @click="$emit('save-draft')">
      Сохранить черновик
    </button>
    <button class="btn-primary" @click="$emit('export')" :disabled="disableExport">
      Экспорт
    </button>
    <button class="btn-primary" @click="$emit('next')" :disabled="disableNext">
      Далее
    </button>
  </div>
</template>

<script setup>
defineProps({
  disableBack: { type: Boolean, default: false },
  disableNext: { type: Boolean, default: false },
  disableExport: { type: Boolean, default: false }
})

defineEmits(['back', 'next', 'save-draft', 'export'])
</script>

<style scoped>
.nav-control {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  position: sticky;
  bottom: 0;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
