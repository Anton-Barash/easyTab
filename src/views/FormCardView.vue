<template>
  <div class="form-card-view">
    <div class="sidebar">
      <div class="sidebar-header">
        <button class="btn-secondary" @click="goBack">← Назад</button>
        <h3>{{ formStore.reportName || 'Report' }}</h3>
        <button class="btn-secondary" @click="loadMediaFromFolder">📁 Загрузить медиа</button>
        <button class="btn-secondary view-toggle" @click="router.push('/fill')">Лента</button>
      </div>
      
      <div class="questions-sidebar">
        <div
          v-for="(question, index) in formStore.questions"
          :key="question.id || index"
          class="question-nav-item"
          :class="{ active: currentQuestionIndex === index }"
          @click="setCurrentQuestion(index)"
        >
          <span class="question-nav-number">{{ index + 1 }}</span>
          <span class="question-nav-text">{{ question.text || `Вопрос ${index + 1}` }}</span>
          <span class="question-nav-stats">
            <span class="answers-count">{{ getAnswerCount(index) }}</span>
            <span v-if="getAttentionCount(index) > 0" class="attention-count">!{{ getAttentionCount(index) }}</span>
          </span>
        </div>
      </div>

      <button class="add-question-sidebar-btn" @click="addNewQuestion">
        + Добавить вопрос
      </button>
    </div>

    <div class="main-content">
      <div v-if="currentQuestion" class="question-card-container">
        <div class="nav-buttons">
          <button
            class="nav-btn"
            :disabled="currentQuestionIndex === 0"
            @click="prevQuestion"
          >
            ← Предыдущий
          </button>
          <span class="question-counter">{{ currentQuestionIndex + 1 }} / {{ formStore.questions.length }}</span>
          <button
            class="nav-btn"
            :disabled="currentQuestionIndex === formStore.questions.length - 1"
            @click="nextQuestion"
          >
            Следующий →
          </button>
        </div>

        <div class="question-card">
          <div class="question-header">
            <span class="question-number">{{ currentQuestionIndex + 1 }}.</span>
            <input
              type="text"
              :value="currentQuestion.text"
              @input="updateQuestionText($event.target.value)"
              class="question-input"
              placeholder="Введите текст вопроса..."
            />
          </div>

          <div class="answers-container">
            <div
              v-for="(answer, ansIndex) in currentAnswers"
              :key="ansIndex"
              class="answer-item"
              :class="{ 'attention-item': answer.attention }"
            >
              <div class="answer-row">
                <textarea
                  v-model="answer.text"
                  @input="updateAnswerText(ansIndex, answer.text)"
                  class="input-field"
                  rows="3"
                  placeholder="Введите ответ..."
                ></textarea>
                <div class="answer-controls">
                  <label class="attention-label">
                    <input
                      type="checkbox"
                      v-model="answer.attention"
                      @change="updateAnswerAttention(ansIndex, answer.attention)"
                    >
                    !
                  </label>
                  <button
                    v-if="formStore.answers[currentQuestionIndex.value]?.length > 1"
                    class="remove-btn"
                    @click="removeAnswer(ansIndex)"
                    title="Удалить ответ"
                  >
                    ×
                  </button>
                </div>
              </div>

              <MediaBlock
                :media="answer.media"
                @add-media="(files) => addMedia(ansIndex, files)"
                @remove-media="(mediaIndex) => removeMedia(ansIndex, mediaIndex)"
              />
            </div>

            <button class="add-answer-btn" @click="addAnswer">
              + Добавить ответ
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Нет вопросов</p>
        <button class="btn-primary" @click="addNewQuestion">Создать первый вопрос</button>
      </div>

      <div class="bottom-controls">
        <button class="btn-secondary" @click="saveDraft">💾 Сохранить черновик</button>
        <button class="btn-primary" @click="exportReportFunc">📤 Экспорт</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'
import MediaBlock from '../components/MediaBlock.vue'

const router = useRouter()
const formStore = useFormStore()

const currentQuestionIndex = ref(0)

onMounted(() => {
  if (formStore.questions.length === 0) {
    router.push('/')
  }
})

const currentQuestion = computed(() => formStore.questions[currentQuestionIndex.value])

const currentAnswers = computed(() => {
  const answers = formStore.answers[currentQuestionIndex.value] || []
  return answers.length > 0 ? answers : [{ text: '', attention: false, media: [], _empty: true }]
})

const getAnswerCount = (questionIndex) => {
  const answers = formStore.answers[questionIndex] || []
  return answers.filter(a => a.text?.trim() !== '' || a.media?.length > 0).length
}

const getAttentionCount = (questionIndex) => {
  const answers = formStore.answers[questionIndex] || []
  return answers.filter(a => a.attention && (a.text?.trim() !== '' || a.media?.length > 0)).length
}

const setCurrentQuestion = (index) => {
  currentQuestionIndex.value = index
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < formStore.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const addNewQuestion = () => {
  const newIndex = formStore.addQuestion(currentQuestionIndex.value)
  currentQuestionIndex.value = newIndex
}

const updateQuestionText = (text) => {
  if (formStore.questions[currentQuestionIndex.value]) {
    formStore.questions[currentQuestionIndex.value].text = text
    formStore.debouncedSave()
  }
}

const addAnswer = () => {
  formStore.addAnswer(currentQuestionIndex.value)
}

const removeAnswer = (ansIndex) => {
  formStore.removeAnswer(currentQuestionIndex.value, ansIndex)
}

const updateAnswerText = (ansIndex, text) => {
  formStore.setAnswerText(currentQuestionIndex.value, ansIndex, text)
}

const updateAnswerAttention = (ansIndex, attention) => {
  formStore.setAnswerAttention(currentQuestionIndex.value, ansIndex, attention)
}

const addMedia = async (ansIndex, files) => {
  const isAttention = formStore.answers[currentQuestionIndex.value]?.[ansIndex]?.attention || false
  for (const file of files) {
    await formStore.addMedia(currentQuestionIndex.value, ansIndex, file, isAttention)
  }
}

const loadMediaFromFolder = async () => {
  await formStore.loadMediaFromFolder()
}

const removeMedia = (ansIndex, mediaIndex) => {
  formStore.removeMedia(currentQuestionIndex.value, ansIndex, mediaIndex)
}

const goBack = () => {
  router.push('/')
}

const saveDraft = async () => {
  await formStore.saveDraft()
}

const exportReportFunc = async () => {
  const fileName = formStore.reportName || 'report'
  const result = await exportReport(formStore.questions, formStore.answers, fileName, formStore.folderHandle)
  if (result) {
    formStore.setFolderHandle(result.folderHandle)
    formStore.mediaCounter = result.mediaCounter
    formStore.debouncedSave()
  }
}

import { exportReport } from '../utils/zipExporter'
</script>

<style scoped>
.form-card-view {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-header button {
  align-self: flex-start;
}

.sidebar-header h3 {
  color: #1e293b;
  font-size: 18px;
}

.questions-sidebar {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.question-nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.question-nav-item:hover {
  background: #f1f5f9;
}

.question-nav-item.active {
  background: #dbeafe;
}

.question-nav-number {
  font-weight: 700;
  color: #2563eb;
  font-size: 16px;
  margin-right: 10px;
  min-width: 24px;
}

.question-nav-text {
  flex: 1;
  font-size: 14px;
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-nav-stats {
  display: flex;
  gap: 5px;
  font-size: 12px;
}

.answers-count {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #64748b;
}

.attention-count {
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
  color: #d97706;
  font-weight: 600;
}

.add-question-sidebar-btn {
  padding: 12px;
  margin: 10px;
  border: 2px dashed #94a3b8;
  border-radius: 8px;
  background: transparent;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
}

.add-question-sidebar-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.nav-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #475569;
  cursor: pointer;
  font-size: 14px;
}

.nav-btn:hover:not(:disabled) {
  background: #f1f5f9;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-counter {
  font-size: 14px;
  color: #64748b;
}

.question-card-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 30px;
}

.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
}

.question-number {
  font-weight: 700;
  color: #2563eb;
  font-size: 24px;
}

.question-input {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  padding: 10px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.question-input:focus {
  outline: none;
  border-color: #2563eb;
}

.answers-container {
  margin-top: 20px;
}

.answer-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fafafa;
}

.answer-item.attention-item {
  border-color: #f59e0b;
  background: #fffbeb;
}

.answer-item.empty-answer {
  background: #f0f0f0;
  opacity: 0.7;
}

.answer-item.empty-answer .input-field {
  cursor: not-allowed;
}

.answer-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.answer-row .input-field {
  flex: 1;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.answer-controls {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.attention-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 700;
  color: #d97706;
  font-size: 16px;
  padding: 10px;
  background: #fef3c7;
  border-radius: 6px;
}

.attention-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #fecaca;
}

.add-answer-btn {
  width: 100%;
  padding: 12px;
  border: 2px dashed #94a3b8;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.add-answer-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state p {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 20px;
}

.bottom-controls {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.bottom-controls .btn-secondary,
.bottom-controls .btn-primary {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
}

.bottom-controls .btn-secondary {
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
}

.bottom-controls .btn-secondary:hover {
  background: #f1f5f9;
}

.bottom-controls .btn-primary {
  background: #2563eb;
  color: white;
  border: none;
}

.bottom-controls .btn-primary:hover {
  background: #1d4ed8;
}

.view-toggle {
  background: #f0f9ff;
  color: #2563eb;
  border-color: #2563eb;
  font-size: 12px;
  padding: 6px 12px;
}

.view-toggle:hover {
  background: #dbeafe;
}
</style>