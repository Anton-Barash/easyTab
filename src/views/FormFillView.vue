<template>
  <div class="form-fill">
    <div class="container">
      <div class="header">
        <button class="btn-secondary" @click="goBack">Back</button>
        <h2>{{ formStore.reportName || 'Fill Report' }}</h2>
      </div>

      <div class="questions-list">
        <QuestionCard
          v-for="(question, index) in formStore.questions"
          :key="index"
          :index="index"
          :question="question"
          :initial-answers="formStore.answers[index]"
          @update:answers="(val) => updateAnswers(index, val)"
          @add-answer="() => formStore.addAnswer(index)"
          @remove-answer="(ansIndex) => formStore.removeAnswer(index, ansIndex)"
          @add-media="(ansIndex, files) => addMedia(index, ansIndex, files)"
          @remove-media="(ansIndex, mediaIndex) => formStore.removeMedia(index, ansIndex, mediaIndex)"
        />
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

const saveDraft = async () => {
  await formStore.saveDraft()
}

const addMedia = (questionIndex, answerIndex, files) => {
  files.forEach(file => {
    formStore.addMedia(questionIndex, answerIndex, file)
  })
}

const updateAnswers = (questionIndex, answersList) => {
  answersList.forEach((ans, ansIndex) => {
    formStore.setAnswerText(questionIndex, ansIndex, ans.text)
    formStore.setAnswerAttention(questionIndex, ansIndex, ans.attention)
  })
}

const exportReportFunc = async () => {
  const fileName = formStore.reportName || 'report'
  const success = await exportReport(formStore.questions, formStore.answers, fileName)
  if (success) {
    formStore.clearForm()
    router.push('/reports')
  }
}
</script>

<style scoped>
.form-fill { padding-bottom: 80px; }
.container { max-width: 800px; margin: 0 auto; padding: 20px; }
.header { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; }
.header h2 { color: #1e293b; }
.questions-list { margin-bottom: 20px; }
</style>
