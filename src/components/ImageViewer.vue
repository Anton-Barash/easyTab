<template>
  <Teleport to="body">
    <div v-if="isOpen" class="lightbox-overlay" @click="close">
      <div class="lightbox-content" @click.stop>
        <button class="close-btn" @click="close">×</button>
        <img :src="imageSrc" :alt="imageAlt" class="lightbox-image" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const imageSrc = ref('')
const imageAlt = ref('')

const open = (src, alt = '') => {
  imageSrc.value = src
  imageAlt.value = alt
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

const close = () => {
  isOpen.value = false
  imageSrc.value = ''
  document.body.style.overflow = ''
}

defineExpose({ open, close })
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.lightbox-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
