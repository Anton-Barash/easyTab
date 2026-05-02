<template>
  <div class="question-card card">
    <div class="question-header">
      <span class="question-number">{{ index + 1 }}.</span>
      <input
        type="text"
        :value="question.text"
        @input="onQuestionTextChange($event.target.value)"
        class="question-input"
        placeholder="Введите текст вопроса..."
      />
    </div>
    
    <div class="answers-container">
        <div
          v-for="(answer, ansIndex) in answers"
          :key="ansIndex"
          class="answer-item"
          :class="{ 'attention-item': answer.attention }"
        >
          <div class="answer-row">
            <textarea
              v-model="answer.text"
              @input="onAnswerChange(ansIndex, answer.text)"
              class="input-field"
              rows="2"
              placeholder="Введите ответ..."
            ></textarea>
            <div class="answer-controls">
              <label class="attention-label">
                <input
                  type="checkbox"
                  v-model="answer.attention"
                  @change="onAttentionChange(ansIndex, answer.attention)"
                >
                !
              </label>
              <button
                v-if="answers.length > 1"
                class="remove-btn"
                @click="onRemoveAnswer(ansIndex)"
                title="Удалить ответ"
              >
                ×
              </button>
            </div>
          </div>

          <MediaBlock
            :media="answer.media"
            @add-media="(files) => onAddMedia(ansIndex, files)"
            @remove-media="(mediaIndex) => onRemoveMedia(ansIndex, mediaIndex)"
          />
        </div>

        <button class="add-answer-btn" @click="onAddAnswer">
          + Добавить ответ
        </button>
      </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import MediaBlock from './MediaBlock.vue'

const props = defineProps({
  index: { type: Number, required: true },
  question: { type: Object, required: true },
  initialAnswers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:answers', 'add-answer', 'remove-answer', 'add-media', 'remove-media', 'update:question-text'])

const answers = ref([...props.initialAnswers])

const onQuestionTextChange = (text) => {
  emit('update:question-text', text)
}

const onAnswerChange = (ansIndex, text) => {
  emit('update:answers', answers.value)
}

const onAttentionChange = (ansIndex, attention) => {
  emit('update:answers', answers.value)
}

const onAddAnswer = () => {
  emit('add-answer')
}

const onRemoveAnswer = (ansIndex) => {
  emit('remove-answer', ansIndex)
}

const onAddMedia = (ansIndex, files) => {
  emit('add-media', ansIndex, files)
}

const onRemoveMedia = (ansIndex, mediaIndex) => {
  emit('remove-media', ansIndex, mediaIndex)
}

watch(() => props.initialAnswers, (newVal) => {
  answers.value = [...newVal]
}, { deep: true })
</script>

<style scoped>
.question-card {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: flex-start;
}

.question-number {
  font-weight: 700;
  color: #2563eb;
  font-size: 20px;
}

.question-input {
  flex: 1;
  font-size: 18px;
  color: #1e293b;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
}

.question-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.question-text {
  font-size: 18px;
  color: #1e293b;
  flex: 1;
}

.answers-container {
  margin-bottom: 15px;
}

.answer-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.answer-item.attention-item {
  border-color: #f59e0b;
  background: #fffbeb;
}

.answer-item.empty-answer {
  background: #f8fafc;
  opacity: 0.7;
}

.answer-item.empty-answer .input-field {
  cursor: not-allowed;
}

.answer-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.answer-row .input-field {
  flex: 1;
}

.answer-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.attention-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 700;
  color: #d97706;
  font-size: 18px;
  padding: 8px;
  background: #fef3c7;
  border-radius: 6px;
}

.attention-label input {
  width: 20px;
  height: 20px;
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
  padding: 10px;
  border: 2px dashed #94a3b8;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.add-answer-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
</style>
