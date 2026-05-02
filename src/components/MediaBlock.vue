<template>
  <div class="media-block">
    <div class="media-buttons">
      <button class="btn-secondary" @click="handleAddFiles">📁 Добавить файл</button>
    </div>

    <div v-if="media && media.length > 0" class="media-grid">
      <div v-for="(item, index) in media" :key="index" class="media-item">
        <div class="media-preview" :class="{ clickable: item.type.startsWith('image') }">
          <img
            v-if="item.type.startsWith('image')"
            :src="item.url"
            :alt="item.name"
            @click="openViewer(item.url, item.name)"
          />
          <video v-else :src="item.url" controls />
        </div>
        <button class="remove-btn" @click="confirmRemove(index)">✕</button>
      </div>
    </div>

    <ImageViewer ref="viewerRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { selectFromGallery } from '../utils/mediaManager'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  media: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-media', 'remove-media'])
const viewerRef = ref(null)

const openViewer = (url, name) => {
  viewerRef.value?.open(url, name)
}

const handleAddFiles = async () => {
  try {
    const files = await selectFromGallery()
    emit('add-media', files)
  } catch (error) {
    console.error('Ошибка при выборе файлов:', error)
  }
}

const confirmRemove = (index) => {
  if (confirm('Вы уверены, что хотите удалить этот файл?')) {
    emit('remove-media', index)
  }
}
</script>

<style scoped>
.media-block {
  margin-top: 10px;
}

.media-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.media-buttons button {
  padding: 6px 12px;
  font-size: 13px;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.media-item {
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.media-preview {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
}

.media-preview.clickable {
  cursor: pointer;
}

.media-preview.clickable:hover {
  background-color: #f1f5f9;
}

.media-preview img, .media-preview video {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(239, 68, 68, 0.9);
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
}
</style>
