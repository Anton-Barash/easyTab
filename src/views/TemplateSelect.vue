<template>
  <div class="template-select">
    <div class="container">
      <div class="header">
        <button class="btn-secondary" @click="goBack">← Back</button>
        <h2>New Report</h2>
      </div>

      <div class="report-info card">
        <div class="form-group">
          <label>Report Name:</label>
          <input v-model="reportName" type="text" placeholder="Enter report name" class="input-field" />
        </div>

        <div class="form-group">
          <label>Save Folder:</label>
          <div class="folder-row">
            <input :value="folderName" type="text" readonly placeholder="Select folder..." class="input-field" />
            <button class="btn-secondary" @click="selectFolder">Choose Folder</button>
          </div>
        </div>
      </div>

      <h3 class="section-title">Select Template:</h3>

      <div class="template-list">
        <div class="template-item card" @click="useDefaultTemplate">
          <div class="template-icon">📊</div>
          <div class="template-info">
            <h3>Built-in Template</h3>
            <p>Sample report</p>
          </div>
          <div class="template-action">
            <span class="badge">Built-in</span>
          </div>
        </div>

        <div class="template-upload card">
          <div class="upload-wrapper">
            <div class="upload-area" @click="triggerFileInput">
              <div class="upload-icon">📁</div>
              <p>Upload your Excel template (.xlsx)</p>
            </div>
            <button class="help-btn" @click="showHelp = true">?</button>
          </div>
          <input ref="fileInput" type="file" accept=".xlsx,.xls" @change="onFileSelect" style="display: none" />
        </div>
      </div>

      <div v-if="selectedTemplate" class="selected-preview card">
        <h3>Preview</h3>
        <div class="preview-list">
          <div v-for="(q, index) in selectedTemplate.slice(0, 5)" :key="index" class="preview-item">
            <span>{{ index + 1 }}.</span> {{ q.text }}
          </div>
        </div>
        <button class="btn-primary" @click="useTemplate" :disabled="!canContinue">Use Template</button>
      </div>

      <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h4>Excel Template Format</h4>
            <button class="close-btn" @click="showHelp = false">×</button>
          </div>
          <div class="modal-body">
            <p>File must be .xlsx with columns:</p>
            <ul>
              <li><strong>Column A</strong> - Question text</li>
              <li><strong>Column B</strong> - Type (text/media)</li>
            </ul>
            <p>First row is header, data starts from row 2.</p>
            <p>Type column: use "media" for photo/video questions, "text" for text answers.</p>
          </div>
        </div>
      </div>

      <div v-if="showExistingFileModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h4>File Already Exists</h4>
          </div>
          <div class="modal-body">
            <p>A report with name "{{ reportName.trim() }}" already exists in this folder.</p>
            <p>What would you like to do?</p>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="openExisting">Open Existing</button>
            <button class="btn-danger" @click="overwriteExisting">Overwrite</button>
            <button class="btn-secondary" @click="showExistingFileModal = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { readExcelTemplate } from '../utils/excelLogic'
import { useFormStore } from '../stores/formStore'

const router = useRouter()
const formStore = useFormStore()

const fileInput = ref(null)
const selectedTemplate = ref(null)
const reportName = ref('')
const folderName = ref('Downloads')
const folderHandle = ref(null)
const showHelp = ref(false)
const showExistingFileModal = ref(false)

const canContinue = computed(() => {
  return reportName.value.trim() && selectedTemplate.value
})

const defaultTemplate = [
  { text: 'Object Name', type: 'text' },
  { text: 'Inspection Date', type: 'text' },
  { text: 'Equipment Status', type: 'text' },
  { text: 'Comments', type: 'text' },
  { text: 'Photo/Video Materials', type: 'media' }
]

const goBack = () => {
  router.push('/')
}

const selectFolder = async () => {
  try {
    if ('showDirectoryPicker' in window) {
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' })
      folderHandle.value = handle
      folderName.value = handle.name
    } else {
      folderName.value = 'Downloads'
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error(e)
    }
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const onFileSelect = async (e) => {
  if (e.target.files && e.target.files[0]) {
    try {
      const questions = await readExcelTemplate(e.target.files[0])
      selectedTemplate.value = questions
    } catch (error) {
      alert('Error reading file: ' + error.message)
    }
  }
}

const useDefaultTemplate = () => {
  selectedTemplate.value = defaultTemplate
}

const checkFileExists = async (folder, fileName) => {
  try {
    await folder.getFileHandle(fileName)
    return true
  } catch (e) {
    if (e.name === 'NotFoundError') {
      return false
    }
    throw e
  }
}

const createEmptyJson = async (folder, fileName, questions) => {
  const emptyDraft = {
    reportName: fileName.slice(0, -5),
    questions: questions,
    answers: {},
    media: {},
    timestamp: Date.now()
  }
  
  questions.forEach((_, index) => {
    emptyDraft.answers[index] = [{ text: '', attention: false, media: [] }]
  })
  
  const fileHandle = await folder.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(emptyDraft, null, 2))
  await writable.close()
}

const useTemplate = async () => {
  if (!selectedTemplate.value || !reportName.value.trim()) return
  
  let currentFolderHandle = folderHandle.value
  if (!currentFolderHandle) {
    try {
      currentFolderHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
      folderHandle.value = currentFolderHandle
      folderName.value = currentFolderHandle.name
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error(e)
      }
      return
    }
  }
  
  const fileName = reportName.value.trim() + '.json'
  const exists = await checkFileExists(currentFolderHandle, fileName)
  
  if (exists) {
    showExistingFileModal.value = true
  } else {
    await createEmptyJson(currentFolderHandle, fileName, selectedTemplate.value)
    formStore.reportName = reportName.value.trim()
    formStore.reportFolder = folderName.value
    formStore.folderHandle = folderHandle.value
    formStore.setQuestions(selectedTemplate.value)
    router.push('/fill')
  }
}

const openExisting = async () => {
  showExistingFileModal.value = false
  
  const fileName = reportName.value.trim() + '.json'
  const fileHandle = await folderHandle.value.getFileHandle(fileName)
  const file = await fileHandle.getFile()
  const fileContent = await file.text()
  const draft = JSON.parse(fileContent)
  
  formStore.reportName = reportName.value.trim()
  formStore.reportFolder = folderName.value
  formStore.folderHandle = folderHandle.value
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
  
  router.push('/fill')
}

const overwriteExisting = async () => {
  showExistingFileModal.value = false
  
  const fileName = reportName.value.trim() + '.json'
  await createEmptyJson(folderHandle.value, fileName, selectedTemplate.value)
  formStore.reportName = reportName.value.trim()
  formStore.reportFolder = folderName.value
  formStore.folderHandle = folderHandle.value
  formStore.setQuestions(selectedTemplate.value)
  router.push('/fill')
}
</script>

<style scoped>
.template-select {
  min-height: 100vh;
  padding: 20px;
  background: #f8fafc;
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

.report-info {
  margin-bottom: 30px;
  background: white;
}

.form-group {
  margin-bottom: 15px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
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

.section-title {
  color: #1e293b;
  margin-bottom: 15px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.template-item, .template-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-item:hover, .template-upload:hover {
  transform: translateY(-2px);
}

.template-icon, .upload-icon {
  font-size: 40px;
}

.template-info {
  flex: 1;
}

.template-info h3 {
  color: #1e293b;
  margin-bottom: 5px;
}

.template-info p {
  color: #64748b;
  font-size: 14px;
}

.badge {
  background-color: #2563eb;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.upload-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.upload-area {
  flex: 1;
  text-align: center;
  padding: 30px;
  color: #64748b;
}

.upload-area p {
  margin-top: 10px;
}

.help-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #64748b;
  color: white;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
}

.help-btn:hover {
  background: #475569;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h4 {
  margin: 0;
  color: #1e293b;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2e8f0;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #cbd5e1;
}

.modal-body {
  padding: 20px;
  font-size: 14px;
  color: #475569;
}

.modal-body p {
  margin-bottom: 10px;
}

.modal-body ul {
  padding-left: 20px;
  margin-bottom: 10px;
}

.modal-body li {
  margin-bottom: 5px;
}

.modal-body strong {
  color: #2563eb;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  justify-content: flex-end;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.selected-preview {
  background: white;
}

.selected-preview h3 {
  margin-bottom: 15px;
  color: #1e293b;
}

.preview-list {
  margin-bottom: 20px;
}

.preview-item {
  padding: 10px 0;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
}

.preview-item:last-child {
  border-bottom: none;
}
</style>
