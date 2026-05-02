import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFormStore = defineStore('form', () => {
  const questions = ref([])
  const answers = ref({})
  const media = ref({})
  const currentIndex = ref(0)
  const reportName = ref('')
  const reportFolder = ref('')
  const folderHandle = ref(null)

  const setQuestions = (q) => {
    questions.value = q
    answers.value = {}
    q.forEach((_, index) => {
      answers.value[index] = [{ text: '', attention: false, media: [] }]
    })
  }

  const addAnswer = (questionIndex) => {
    if (!answers.value[questionIndex]) {
      answers.value[questionIndex] = []
    }
    answers.value[questionIndex].push({ text: '', attention: false, media: [] })
  }

  const removeAnswer = (questionIndex, answerIndex) => {
    if (answers.value[questionIndex] && answers.value[questionIndex].length > 1) {
      answers.value[questionIndex].splice(answerIndex, 1)
    }
  }

  const setAnswerText = (questionIndex, answerIndex, text) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      answers.value[questionIndex][answerIndex].text = text
    }
  }

  const setAnswerAttention = (questionIndex, answerIndex, attention) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      answers.value[questionIndex][answerIndex].attention = attention
    }
  }

  const addMedia = (questionIndex, answerIndex, file) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      if (!answers.value[questionIndex][answerIndex].media) {
        answers.value[questionIndex][answerIndex].media = []
      }
      const renamedFile = renameMediaFile(file, questionIndex, answerIndex, answers.value[questionIndex][answerIndex].media.length)
      answers.value[questionIndex][answerIndex].media.push(renamedFile)
    }
  }

  const renameMediaFile = (file, questionIndex, answerIndex, mediaIndex) => {
    const ext = file.name.split('.').pop()
    const qNum = String(questionIndex + 1).padStart(2, '0')
    const aNum = String(answerIndex + 1).padStart(2, '0')
    const mNum = String(mediaIndex + 1).padStart(2, '0')
    const baseName = file.name.replace(/\.[^/.]+$/, '')
    const safeName = baseName.replace(/[^a-zA-Z0-9а-яА-ЯёЁ]/g, '_').substring(0, 20)
    const newName = `Q${qNum}_A${aNum}_M${mNum}_${safeName}.${ext}`
    return {
      ...file,
      name: newName,
      originalName: file.name
    }
  }

  const removeMedia = (questionIndex, answerIndex, mediaIndex) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex] && answers.value[questionIndex][answerIndex].media) {
      answers.value[questionIndex][answerIndex].media.splice(mediaIndex, 1)
    }
  }

  const setReportName = (name) => {
    reportName.value = name
  }

  const setReportFolder = (folder) => {
    reportFolder.value = folder
  }

  const setFolderHandle = (handle) => {
    folderHandle.value = handle
  }

  const saveDraft = async () => {
    const draft = {
      reportName: reportName.value,
      questions: questions.value,
      answers: answers.value,
      media: media.value,
      timestamp: Date.now()
    }

    if (folderHandle.value) {
      try {
        const fileHandle = await folderHandle.value.getFileHandle(`${reportName.value}.json`, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(JSON.stringify(draft, null, 2))
        await writable.close()
        alert('Draft saved to selected folder!')
        return true
      } catch (e) {
        console.error('Error saving to folder:', e)
      }
    }

    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportName.value || 'draft'}.json`
    a.click()
    URL.revokeObjectURL(url)
    alert('Draft downloaded!')
    return true
  }

  const loadDraft = () => {
    return false
  }

  const loadDraftFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const draft = JSON.parse(e.target.result)
          reportName.value = draft.reportName || file.name.replace('.json', '')
          questions.value = draft.questions || []
          
          if (draft.attention) {
            const migratedAnswers = {}
            Object.keys(draft.answers || {}).forEach(key => {
              const questionMedia = draft.media && draft.media[key] ? draft.media[key] : []
              migratedAnswers[key] = [{
                text: draft.answers[key] || '',
                attention: draft.attention[key] || false,
                media: questionMedia
              }]
            })
            answers.value = migratedAnswers
          } else if (draft.answers) {
            const migratedAnswers = {}
            Object.keys(draft.answers).forEach(key => {
              if (draft.answers[key] && draft.answers[key].length > 0) {
                migratedAnswers[key] = draft.answers[key].map(ans => ({
                  text: ans.text || '',
                  attention: ans.attention || false,
                  media: ans.media || []
                }))
              }
            })
            answers.value = migratedAnswers
          }
          
          resolve(draft)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const clearForm = () => {
    questions.value = []
    answers.value = {}
    currentIndex.value = 0
    reportName.value = ''
    reportFolder.value = ''
    folderHandle.value = null
  }

  return {
    questions,
    answers,
    currentIndex,
    reportName,
    reportFolder,
    folderHandle,
    setQuestions,
    addAnswer,
    removeAnswer,
    setAnswerText,
    setAnswerAttention,
    addMedia,
    removeMedia,
    setReportName,
    setReportFolder,
    setFolderHandle,
    saveDraft,
    loadDraft,
    loadDraftFromFile,
    clearForm
  }
})
