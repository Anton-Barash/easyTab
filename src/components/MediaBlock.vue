<template>
  <div class="media-block">
    <div class="media-row">
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

      <label v-if="!media || media.length === 0" class="attach-btn-small">
        <span class="attach-icon-small">+</span>
        <input type="file" class="file-input" multiple @change="handleFileSelect" />
      </label>

      <label v-else class="attach-btn">
        <span class="attach-icon">+</span>
        <span class="attach-text">Добавить</span>
        <input type="file" class="file-input" multiple @change="handleFileSelect" />
      </label>
    </div>

    <ImageViewer ref="viewerRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  media: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-media', 'remove-media'])
const viewerRef = ref(null)

const openViewer = (url, name) => {
  viewerRef.value?.open(url, name)
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  if (files.length > 0) {
    emit('add-media', files)
  }
  event.target.value = ''
}

const confirmRemove = (index) => {
  if (confirm('Вы уверены, что хотите удалить этот файл?')) {
    emit('remove-media', index)
  }
}
</script>

<style scoped>
.media-block {
  margin-top: 6px;
}

.media-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
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
  background-color: #e2e8f0;
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
  font-size: 10px;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  line-height: 1;
}

.attach-btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.attach-btn-small:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.attach-icon-small {
  font-size: 18px;
  color: #64748b;
  font-weight: 300;
  line-height: 1;
}

.attach-btn-small:hover .attach-icon-small {
  color: #2563eb;
}

.attach-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;
  gap: 4px;
  flex-shrink: 0;
}

.attach-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.attach-icon {
  font-size: 24px;
  color: #64748b;
  font-weight: 300;
  line-height: 1;
}

.attach-text {
  font-size: 11px;
  color: #64748b;
}

.attach-btn:hover .attach-icon,
.attach-btn:hover .attach-text {
  color: #2563eb;
}

.file-input {
  display: none;
}
</style>
