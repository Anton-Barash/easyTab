<template>
  <div class="form-fill">
    <div class="container">
      <div class="header">
        <button class="btn-secondary" @click="goBack">Back</button>
        <h2>{{ formStore.reportName || 'Fill Report' }}</h2>
        <button class="btn-secondary" @click="addNewQuestion">+ Add Question</button>
        <button class="btn-secondary" @click="loadMediaFromFolder">📁 Загрузить медиа</button>
        <button class="btn-secondary view-toggle" @click="router.push('/fill-card')">Карточки</button>
      </div>

      <div class="questions-list">
        <template v-for="(question, index) in formStore.questions" :key="question.id || index">
          <QuestionCard
            :index="index"
            :question="question"
            :initial-answers="formStore.answers[index]"
            @update:answers="(val) => updateAnswers(index, val)"
            @update:question-text="(text) => updateQuestionText(index, text)"
            @add-answer="() => formStore.addAnswer(index)"
            @remove-answer="(ansIndex) => formStore.removeAnswer(index, ansIndex)"
            @add-media="(ansIndex, files) => addMedia(index, ansIndex, files)"
            @remove-media="(ansIndex, mediaIndex) => formStore.removeMedia(index, ansIndex, mediaIndex)"
          />
          <button class="add-question-after-btn" @click="addQuestionAfter(index)">
            + Add Question After #{{ index + 1 }}
          </button>
        </template>
      </div>

      <NavControl @back="goBack" @save-draft="saveDraft" @export="exportReportFunc" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFormStore } from '../stores/formStore'
import { exportReport } from '../utils/zipExporter'
import QuestionCard from '../components/QuestionCard.vue'
import NavControl from '../components/NavControl.vue'

const router = useRouter()
const formStore = useFormStore()

onMounted(() => {
  if (formStore.questions.length === 0) {
    router.push('/')
  }
})

const goBack = () => {
  router.push('/')
}

const addNewQuestion = () => {
  formStore.addQuestion()
}

const addQuestionAfter = (index) => {
  formStore.addQuestion(index)
}

const updateQuestionText = (index, text) => {
  if (formStore.questions[index]) {
    formStore.questions[index].text = text
    formStore.debouncedSave ? formStore.debouncedSave() : null
  }
}

const saveDraft = async () => {
  await formStore.saveDraft()
}

const addMedia = async (questionIndex, answerIndex, files) => {
  const isAttention = formStore.answers[questionIndex]?.[answerIndex]?.attention || false
  for (const file of files) {
    await formStore.addMedia(questionIndex, answerIndex, file, isAttention)
  }
}

const loadMediaFromFolder = async () => {
  await formStore.loadMediaFromFolder()
}

const updateAnswers = (questionIndex, answersList) => {
  answersList.forEach((ans, ansIndex) => {
    formStore.setAnswerText(questionIndex, ansIndex, ans.text)
    formStore.setAnswerAttention(questionIndex, ansIndex, ans.attention)
  })
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
</script>

<style scoped>
.form-fill { padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
.header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.header h2 { color: #1e293b; flex: 1; }
.questions-list { margin-bottom: 20px; }
.add-question-after-btn {
  width: 100%;
  padding: 10px;
  border: 2px dashed #10b981;
  border-radius: 8px;
  background: #ecfdf5;
  color: #10b981;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 20px;
}
.add-question-after-btn:hover {
  border-color: #059669;
  background: #d1fae5;
}
.view-toggle {
  background: #f0f9ff;
  color: #2563eb;
  border-color: #2563eb;
}
.view-toggle:hover {
  background: #dbeafe;
}
</style>
