<template>
  <div class="reports-view">
    <div class="container">
      <div class="header">
        <button class="btn-secondary" @click="goBack">Back</button>
        <h2>Your Reports</h2>
      </div>

      <div class="actions">
        <button class="btn-secondary" @click="openJsonFile">
          Open JSON Report
        </button>
      </div>

      <div v-if="reports.length === 0" class="empty-state card">
        <p>No reports yet.</p>
        <p>Create a new report or open an existing JSON file.</p>
      </div>

      <div v-else class="reports-list">
        <div v-for="report in reports" :key="report.id" class="report-item card">
          <div class="report-info">
            <h3>{{ report.name }}</h3>
            <p>{{ report.date }}</p>
          </div>
          <div class="report-actions">
            <button class="btn-secondary btn-small" @click="continueReport(report)">Continue</button>
            <button class="btn-secondary btn-small" @click="reExportReport(report)">Export Again</button>
            <button class="btn-danger btn-small" @click="deleteReport(report.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'
import { useReportStore } from '../stores/reportStore'
import { exportReport } from '../utils/zipExporter'

const router = useRouter()
const formStore = useFormStore()
const reportStore = useReportStore()

const reports = ref([])

onMounted(() => {
  reports.value = reportStore.reports
})

const goBack = () => {
  router.push('/')
}

const openJsonFile = async () => {
  try {
    if ('showOpenFilePicker' in window) {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false
      })
      
      const file = await fileHandle.getFile()
      const fileContent = await file.text()
      const draft = JSON.parse(fileContent)
      
      const fileName = file.name
      const reportName = fileName.endsWith('.json') ? fileName.slice(0, -5) : fileName
      
      formStore.reportName = reportName
      formStore.questions = draft.questions || []
      
      let answersData = draft.answers
      let attentionData = draft.attention
      let mediaData = draft.media

      if (attentionData) {
        const migratedAnswers = {}
        Object.keys(answersData || {}).forEach(key => {
          const questionMedia = mediaData && mediaData[key] ? mediaData[key] : []
          migratedAnswers[key] = [{
            text: answersData[key] || '',
            attention: attentionData[key] || false,
            media: questionMedia
          }]
        })
        formStore.answers = migratedAnswers
      } else if (answersData) {
        formStore.answers = answersData
      }
      
      try {
        const folderHandle = await fileHandle.getParent()
        formStore.folderHandle = folderHandle
        formStore.reportFolder = folderHandle.name
      } catch (e) {
        console.error('Could not get parent folder:', e)
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
        formStore.folderHandle = handle
        formStore.reportFolder = handle.name
      }
      
      router.push('/fill')
    } else {
      alert('File System Access API not supported in this browser.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error opening JSON file:', e)
      alert('Error: ' + e.message)
    }
  }
}

const continueReport = async (report) => {
  try {
    if ('showOpenFilePicker' in window) {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false
      })
      
      const file = await fileHandle.getFile()
      const fileContent = await file.text()
      const draft = JSON.parse(fileContent)
      
      formStore.reportName = report.name
      formStore.questions = draft.questions || []
      
      let answersData = draft.answers
      let attentionData = draft.attention
      let mediaData = draft.media

      if (attentionData) {
        const migratedAnswers = {}
        Object.keys(answersData || {}).forEach(key => {
          const questionMedia = mediaData && mediaData[key] ? mediaData[key] : []
          migratedAnswers[key] = [{
            text: answersData[key] || '',
            attention: attentionData[key] || false,
            media: questionMedia
          }]
        })
        formStore.answers = migratedAnswers
      } else if (answersData) {
        formStore.answers = answersData
      }
      
      try {
        const folderHandle = await fileHandle.getParent()
        formStore.folderHandle = folderHandle
        formStore.reportFolder = folderHandle.name
      } catch (e) {
        console.error('Could not get parent folder:', e)
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
        formStore.folderHandle = handle
        formStore.reportFolder = handle.name
      }
      
      router.push('/fill')
    } else {
      alert('File System Access API not supported in this browser.')
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error opening report:', e)
      alert('Error: ' + e.message)
    }
  }
}

const reExportReport = async (report) => {
  let answersData = report.answers
  let attentionData = report.attention
  let mediaData = report.media

  if (attentionData) {
    const migratedAnswers = {}
    Object.keys(answersData || {}).forEach(key => {
      const questionMedia = mediaData && mediaData[key] ? mediaData[key] : []
      migratedAnswers[key] = [{
        text: answersData[key] || '',
        attention: attentionData[key] || false,
        media: questionMedia
      }]
    })
    answersData = migratedAnswers
  } else if (answersData) {
    const migratedAnswers = {}
    Object.keys(answersData).forEach(key => {
      if (answersData[key] && answersData[key].length > 0) {
        migratedAnswers[key] = answersData[key].map(ans => ({
          text: ans.text || '',
          attention: ans.attention || false,
          media: ans.media || []
        }))
      }
    })
    answersData = migratedAnswers
  }

  await exportReport(report.questions, answersData, report.name)
}

const deleteReport = (id) => {
  if (confirm('Delete this report?')) {
    reportStore.removeReport(id)
    reports.value = reportStore.reports
  }
}
</script>

<style scoped>
.reports-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.container {
  max-width: 800px;
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

.actions {
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty-state p {
  margin-bottom: 10px;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.report-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.report-info h3 {
  color: #1e293b;
  margin-bottom: 5px;
}

.report-info p {
  color: #64748b;
  font-size: 14px;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.btn-small {
  padding: 8px 12px;
  font-size: 14px;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
}

.btn-danger:hover {
  background-color: #dc2626;
}
</style>
