<template>
  <div class="start-view">
    <div class="container">
      <h1>EasyTab</h1>
      <p class="subtitle">Excel Report Builder</p>

      <div class="actions">
        <button class="btn-primary action-btn" @click="router.push('/templates')">
          + Create New Report
        </button>
        <button class="btn-secondary action-btn" @click="openExisting">
          Open Existing Report
        </button>
        <button class="btn-secondary action-btn" @click="router.push('/reports')">
          Your Reports
        </button>
        <button class="btn-secondary action-btn" @click="router.push('/settings')">
          Settings
        </button>
        <div class="view-toggle-info">
          <span>Формы:</span>
          <router-link to="/fill" class="view-link">Лента</router-link>
          <span>|</span>
          <router-link to="/fill-card" class="view-link">Карточки</router-link>
        </div>
      </div>

      <div class="instructions card">
        <h3>Instructions:</h3>
        <ol>
          <li>Select a template or create new</li>
          <li>Fill answers, add photos/video</li>
          <li>Save draft as JSON</li>
          <li>Export as ZIP with Excel + HTML + media</li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'

const router = useRouter()
const formStore = useFormStore()

const openExisting = async () => {
  try {
    const folderHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    
    let jsonFile = null
    let jsonCount = 0
    let foundFileName = ''
    
    for await (const entry of folderHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.json')) {
        jsonCount++
        jsonFile = entry
        foundFileName = entry.name
      }
    }
    
    if (jsonCount === 0) {
      alert('В папке нет JSON файлов. Выберите папку с файлом отчета.')
      return
    }
    
    if (jsonCount > 1) {
      alert(`В папке найдено ${jsonCount} JSON файлов. Должен быть только один файл.\nУдалите лишние или выберите другую папку.`)
      return
    }
    
    const file = await jsonFile.getFile()
    console.log('[openExisting] File:', file.name)
    
    await formStore.loadDraftFromFile(file)
    console.log('[openExisting] Draft loaded')
    
    formStore.setFolderHandle(folderHandle)
    console.log('[openExisting] Loading media...')
    await formStore.loadMediaFromFolder(folderHandle)
    console.log('[openExisting] Media loading complete')

    router.push('/fill')
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('[openExisting] Error:', e)
    }
  }
}
</script>

<style scoped>
.start-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

h1 {
  text-align: center;
  color: #1e293b;
  margin-bottom: 5px;
}

.subtitle {
  text-align: center;
  color: #64748b;
  margin-bottom: 30px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.action-btn {
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
}

.instructions {
  background: #f8fafc;
}

.instructions h3 {
  margin-bottom: 15px;
  color: #1e293b;
}

.instructions ol {
  padding-left: 20px;
  color: #475569;
}

.instructions li {
  margin-bottom: 8px;
}

.view-toggle-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 10px;
  margin-top: 10px;
  font-size: 14px;
  color: #475569;
}

.view-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 6px;
  transition: background 0.2s;
}

.view-link:hover {
  background: #dbeafe;
}
</style>
