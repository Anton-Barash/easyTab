<template>
  <div class="settings-view">
    <div class="container">
      <div class="header">
        <button class="btn-secondary" @click="goBack">Back</button>
        <h2>Settings</h2>
      </div>

      <div class="settings-section card">
        <h3>Folder Settings</h3>
        <p class="info-text">Select default folders for reports. Files will be saved to Downloads if folder selection is not available.</p>

        <div class="setting-item">
          <label>Templates Folder:</label>
          <div class="folder-row">
            <input :value="configStore.templatesFolder" type="text" readonly class="input-field" />
            <button class="btn-secondary" @click="selectTemplatesFolder">Choose</button>
          </div>
        </div>

        <div class="setting-item">
          <label>Reports Folder:</label>
          <div class="folder-row">
            <input :value="configStore.reportsFolder" type="text" readonly class="input-field" />
            <button class="btn-secondary" @click="selectReportsFolder">Choose</button>
          </div>
        </div>

        <div class="setting-item">
          <label>Media Folder:</label>
          <div class="folder-row">
            <input :value="configStore.mediaFolder" type="text" readonly class="input-field" />
            <button class="btn-secondary" @click="selectMediaFolder">Choose</button>
          </div>
        </div>
      </div>

      <div class="settings-section card">
        <h3>Platform</h3>
        <p class="info-text">Current platform: <strong>{{ configStore.platform }}</strong></p>
        <p class="info-text">The app automatically detects if you're on PC or mobile device.</p>
      </div>

      <div class="settings-section card">
        <h3>About</h3>
        <p class="info-text">EasyTab v1.0</p>
        <p class="info-text">Excel Report Builder with Photos</p>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="saveSettings">Save Settings</button>
        <button class="btn-secondary" @click="resetSettings">Reset to Default</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore'

const router = useRouter()
const configStore = useConfigStore()

const goBack = () => {
  router.push('/')
}

const selectTemplatesFolder = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      configStore.templatesFolder = handle.name
      configStore.templatesFolderHandle = handle
    } else {
      alert('Folder selection not supported in this browser')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(e)
    }
  }
}

const selectReportsFolder = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      configStore.reportsFolder = handle.name
      configStore.reportsFolderHandle = handle
    } else {
      alert('Folder selection not supported in this browser')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(e)
    }
  }
}

const selectMediaFolder = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      configStore.mediaFolder = handle.name
      configStore.mediaFolderHandle = handle
    } else {
      alert('Folder selection not supported in this browser')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(e)
    }
  }
}

const saveSettings = () => {
  configStore.saveConfig()
  alert('Settings saved!')
}

const resetSettings = () => {
  configStore.resetConfig()
  alert('Settings reset!')
}
</script>

<style scoped>
.settings-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.header h2 {
  color: #1e293b;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h3 {
  color: #1e293b;
  margin-bottom: 15px;
}

.info-text {
  color: #64748b;
  margin-bottom: 10px;
  font-size: 14px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item label {
  display: block;
  font-weight: 500;
  color: #475569;
  margin-bottom: 5px;
}

.folder-row {
  display: flex;
  gap: 10px;
}

.folder-row input {
  flex: 1;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
