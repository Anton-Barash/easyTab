<template>
  <div class="media-block">
    <div class="media-header">
      <h4>📷 Фото/Видео</h4>
      <div class="media-buttons">
        <button class="btn-secondary" @click="capture">Сделать фото</button>
        <button class="btn-secondary" @click="handleSelectFromGallery">Выбрать из галереи</button>
      </div>
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
        <div class="media-info">
          <span class="media-name">{{ item.name }}</span>
          <button class="remove-btn" @click="onRemove(index)">✕</button>
        </div>
      </div>
    </div>

    <div v-else class="no-media">
      <p>Нет прикрепленных файлов</p>
    </div>

    <ImageViewer ref="viewerRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { capturePhoto, selectFromGallery } from '../utils/mediaManager'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  media: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-media', 'remove-media'])
const viewerRef = ref(null)

const openViewer = (url, name) => {
  viewerRef.value?.open(url, name)
}

const capture = async () => {
  try {
    const file = await capturePhoto()
    emit('add-media', [file])
  } catch (error) {
    console.error('Ошибка при съемке:', error)
  }
}

const handleSelectFromGallery = async () => {
  try {
    const files = await selectFromGallery()
    emit('add-media', files)
  } catch (error) {
    console.error('Ошибка при выборе файлов:', error)
  }
}

const onRemove = (index) => {
  emit('remove-media', index)
}
</script>

<style scoped>
.media-block {
  border-top: 1px solid #e2e8f0;
  padding-top: 15px;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.media-header h4 {
  color: #475569;
  font-size: 16px;
}

.media-buttons {
  display: flex;
  gap: 10px;
}

.media-buttons button {
  padding: 8px 16px;
  font-size: 14px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.media-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.media-preview {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
}

.media-preview.clickable {
  cursor: pointer;
}

.media-preview.clickable:hover {
  background-color: #e2e8f0;
}

.media-preview img, .media-preview video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.media-info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-name {
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.no-media {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}
</style>
