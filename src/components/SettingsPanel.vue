<template>
  <div class="settings-panel">
    <div class="setting-item">
      <label class="setting-label">📁 Папка с шаблонами</label>
      <div class="setting-input-group">
        <input
          type="text"
          class="input-field"
          :value="templateFolder"
          placeholder="Выберите папку..."
          readonly
        />
      </div>
    </div>
    
    <div class="setting-item">
      <label class="setting-label">📸 Папка для фото/видео</label>
      <div class="setting-input-group">
        <input
          type="text"
          class="input-field"
          :value="mediaFolder"
          placeholder="Выберите папку..."
          readonly
        />
      </div>
    </div>
    
    <div class="setting-item">
      <label class="setting-label">📄 Папка для готовых отчётов</label>
      <div class="setting-input-group">
        <input
          type="text"
          class="input-field"
          :value="reportsFolder"
          placeholder="Выберите папку..."
          readonly
        />
      </div>
    </div>
    
    <div class="setting-info">
      <p><strong>Платформа:</strong> {{ isMobile ? 'Мобильное устройство' : 'ПК' }}</p>
      <p class="hint">На мобильных устройствах файлы будут сохраняться в папку загрузок.</p>
    </div>
    
    <div class="settings-buttons">
      <button class="btn-primary" @click="$emit('save')">Сохранить настройки</button>
      <button class="btn-secondary" @click="$emit('reset')">Сбросить</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  templateFolder: { type: String, default: '' },
  mediaFolder: { type: String, default: '' },
  reportsFolder: { type: String, default: '' },
  isMobile: { type: Boolean, default: false }
})

defineEmits(['save', 'reset'])
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-weight: 600;
  color: #475569;
}

.setting-input-group {
  display: flex;
  gap: 10px;
}

.setting-info {
  padding: 15px;
  background-color: #f1f5f9;
  border-radius: 8px;
}

.setting-info p {
  margin: 5px 0;
}

.hint {
  color: #64748b;
  font-size: 14px;
}

.settings-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}
</style>
