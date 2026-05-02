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
              ref="textareaRefs"
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
import { ref, watch, nextTick, watchEffect } from 'vue'
import MediaBlock from './MediaBlock.vue'

const props = defineProps({
  index: { type: Number, required: true },
  question: { type: Object, required: true },
  initialAnswers: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:answers', 'add-answer', 'remove-answer', 'add-media', 'remove-media', 'update:question-text'])

const answers = ref([...props.initialAnswers])
const textareaRefs = ref([])

const adjustTextareaHeight = (textarea) => {
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

const onQuestionTextChange = (text) => {
  emit('update:question-text', text)
}

const onAnswerChange = (ansIndex, text) => {
  nextTick(() => {
    if (textareaRefs.value[ansIndex]) {
      adjustTextareaHeight(textareaRefs.value[ansIndex])
    }
  })
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

watchEffect(() => {
  nextTick(() => {
    const textareas = document.querySelectorAll('.question-card .input-field')
    textareas.forEach((textarea) => {
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  })
})

watch(() => props.initialAnswers, (newVal) => {
  answers.value = [...newVal]
  nextTick(() => {
    textareaRefs.value.forEach((textarea) => {
      if (textarea) {
        adjustTextareaHeight(textarea)
      }
    })
  })
}, { deep: true })

watch(() => answers.value.length, () => {
  nextTick(() => {
    textareaRefs.value.forEach((textarea) => {
      if (textarea) {
        adjustTextareaHeight(textarea)
      }
    })
  })
})
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
  color: #1e293b;
  font-size: 14px;
  min-width: 24px;
}

.question-input {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.question-input:focus {
  outline: none;
  border-color: #94a3b8;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
}

.question-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
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
  width: 100%;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 8px 14px;
  box-sizing: border-box;
  background: #FFFFFF;
}

.answer-item.attention-item {
  border-color: #f59e0b;
  background: #fffbeb;
}

.answer-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.answer-row .input-field {
  flex: 1;
  max-width: 550px;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  overflow: hidden;
  padding: 0;
  margin: 0;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 450;
  color: #333333;
  min-height: 24px;
  box-sizing: border-box;
}

.answer-row .input-field::placeholder {
  color: #8E95A1;
  font-weight: 400;
}

.input-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.attach-button {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: none;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #555;
  transition: 0.2s;
}

.attach-button:hover {
  background: #E2E8F0;
}

.answer-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: stretch;
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
