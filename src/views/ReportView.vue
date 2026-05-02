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

      <input
        ref="jsonFileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="handleJsonFile"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'
import { useReportStore } from '../stores/reportStore'

const router = useRouter()
const formStore = useFormStore()
const reportStore = useReportStore()

const jsonFileInput = ref(null)

const reports = ref([])

onMounted(() => {
  reports.value = reportStore.reports
})

const goBack = () => {
  router.push('/')
}

const openJsonFile = () => {
  jsonFileInput.value?.click()
}

const handleJsonFile = async (e) => {
  if (e.target.files && e.target.files[0]) {
    try {
      await formStore.loadDraftFromFile(e.target.files[0])
      router.push('/fill')
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }
}

const continueReport = (report) => {
  formStore.setQuestions(report.questions)
  formStore.reportName = report.name
  router.push('/fill')
}

const reExportReport = async (report) => {
  const { exportToZip } = await import('../utils/zipExporter')
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

  await exportToZip(
    report.questions,
    answersData,
    report.name
  )
  alert('Report exported!')
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
