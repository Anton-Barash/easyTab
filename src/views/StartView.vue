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

      <input ref="fileInput" type="file" accept=".json" style="display: none" @change="loadExistingReport" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'

const router = useRouter()
const formStore = useFormStore()

const fileInput = ref(null)

const openExisting = () => {
  fileInput.value?.click()
}

const loadExistingReport = async (e) => {
  if (e.target.files && e.target.files[0]) {
    try {
      await formStore.loadDraftFromFile(e.target.files[0])
      router.push('/fill')
    } catch (error) {
      alert('Error: ' + error.message)
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
</style>
