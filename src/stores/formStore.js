import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fileToBase64 } from '../utils/mediaManager'

const saveFileToFolder = async (folderHandle, fileName, content) => {
  const fileHandle = await folderHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

const readFileFromFolder = async (folderHandle, subFolderName, fileName) => {
  try {
    const subFolderHandle = await folderHandle.getDirectoryHandle(subFolderName)
    const fileHandle = await subFolderHandle.getFileHandle(fileName)
    return await fileHandle.getFile()
  } catch (e) {
    console.error('Error reading file from folder:', e)
    return null
  }
}

export const useFormStore = defineStore('form', () => {
  const questions = ref([])
  const answers = ref({})
  const media = ref({})
  const currentIndex = ref(0)
  const reportName = ref('')
  const reportFolder = ref('')
  const folderHandle = ref(null)
  let saveTimeout = null

  const debouncedSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      autoSaveDraft()
    }, 500)
  }

  const autoSaveDraft = async () => {
    if (!folderHandle.value || !reportName.value) {
      return
    }

    const answersToSave = JSON.parse(JSON.stringify(answers.value))
    for (const qIndex in answersToSave) {
      if (answersToSave[qIndex] && Array.isArray(answersToSave[qIndex])) {
        for (const ans of answersToSave[qIndex]) {
          if (ans.media) {
            ans.media = ans.media.map(m => {
              const { url, base64, ...rest } = m
              return {
                ...rest,
                relativePath: m.relativePath || `./${m.attention ? 'X' : 'photos'}/${m.name}`
              }
            })
          }
        }
      }
    }

    const draft = {
      reportName: reportName.value,
      questions: questions.value,
      answers: answersToSave,
      mediaCounter: mediaCounter,
      timestamp: Date.now()
    }

    try {
      const fileHandle = await folderHandle.value.getFileHandle(`${reportName.value}.json`, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(JSON.stringify(draft, null, 2))
      await writable.close()
    } catch (e) {
      console.error('Error saving to folder:', e)
    }
  }

  const setQuestions = (q) => {
    questions.value = q
    answers.value = {}
    q.forEach((_, index) => {
      answers.value[index] = [{ text: '', attention: false, media: [], _empty: true }]
    })
    debouncedSave()
  }

  const addQuestion = (index = -1) => {
    const newIndex = index === -1 ? questions.value.length : index + 1
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'text'
    }
    questions.value.splice(newIndex, 0, newQuestion)
    
    const newAnswers = {}
    Object.keys(answers.value).forEach(key => {
      const k = parseInt(key)
      if (k >= newIndex) {
        newAnswers[String(k + 1)] = answers.value[key]
      } else {
        newAnswers[key] = answers.value[key]
      }
    })
    newAnswers[String(newIndex)] = [{ text: '', attention: false, media: [], _empty: true }]
    answers.value = newAnswers
    debouncedSave()
    return newIndex
  }

  const addAnswer = (questionIndex) => {
    if (!answers.value[questionIndex]) {
      answers.value[questionIndex] = []
    }
    answers.value[questionIndex].push({ text: '', attention: false, media: [], _empty: true })
    debouncedSave()
  }

  const removeAnswer = (questionIndex, answerIndex) => {
    if (answers.value[questionIndex] && answers.value[questionIndex].length > 1) {
      answers.value[questionIndex].splice(answerIndex, 1)
      debouncedSave()
    }
  }

  const setAnswerText = (questionIndex, answerIndex, text) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      answers.value[questionIndex][answerIndex].text = text
      answers.value[questionIndex][answerIndex]._empty = false
      debouncedSave()
    }
  }

  const setAnswerAttention = async (questionIndex, answerIndex, attention) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      answers.value[questionIndex][answerIndex].attention = attention
      
      if (folderHandle.value && answers.value[questionIndex][answerIndex].media?.length > 0) {
        const fromFolderName = !attention ? 'X' : 'photos'
        const toFolderName = attention ? 'X' : 'photos'
        
        try {
          const fromSubFolder = await folderHandle.value.getDirectoryHandle(fromFolderName, { create: true })
          const toSubFolder = await folderHandle.value.getDirectoryHandle(toFolderName, { create: true })
          
          for (const media of answers.value[questionIndex][answerIndex].media) {
            try {
              const fileHandle = await fromSubFolder.getFileHandle(media.name)
              const file = await fileHandle.getFile()
              
              const toFileHandle = await toSubFolder.getFileHandle(media.name, { create: true })
              const writable = await toFileHandle.createWritable()
              await writable.write(file)
              await writable.close()
              
              await fromSubFolder.removeEntry(media.name)
              
              if (!media.url || media.url.startsWith('blob:')) {
                media.url = URL.createObjectURL(file)
              }
            } catch (e) {
              console.error('Error moving media file:', media.name, e)
            }
          }
        } catch (e) {
          console.error('Error accessing folders to move media:', e)
        }
      }
      
      debouncedSave()
    }
  }

  let mediaCounter = { photos: 1, X: 1 }

  const addMedia = async (questionIndex, answerIndex, file, isAttention = false) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex]) {
      if (!answers.value[questionIndex][answerIndex].media) {
        answers.value[questionIndex][answerIndex].media = []
      }

      // Mark answer as not empty
      answers.value[questionIndex][answerIndex]._empty = false

      const folderName = isAttention ? 'X' : 'photos'
      const counter = isAttention ? mediaCounter.X : mediaCounter.photos
      const ext = file.name.split('.').pop()
      const fileName = `${String(counter).padStart(3, '0')}.${ext}`

      let mediaItem = {
        name: fileName,
        type: file.type,
        attention: isAttention,
        originalName: file.name
      }

      if (folderHandle.value) {
        try {
          const subFolderHandle = await folderHandle.value.getDirectoryHandle(folderName, { create: true })
          const fileHandle = await subFolderHandle.getFileHandle(fileName, { create: true })
          const writable = await fileHandle.createWritable()
          await writable.write(file)
          await writable.close()
        } catch (e) {
          console.error('Error saving media to folder:', e)
        }
      }

      mediaItem.url = URL.createObjectURL(file)
      mediaItem.base64 = await fileToBase64(file)
      answers.value[questionIndex][answerIndex].media.push(mediaItem)

      if (isAttention) {
        mediaCounter.X++
      } else {
        mediaCounter.photos++
      }
      debouncedSave()
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

  const removeMedia = async (questionIndex, answerIndex, mediaIndex) => {
    if (answers.value[questionIndex] && answers.value[questionIndex][answerIndex] && answers.value[questionIndex][answerIndex].media) {
      const media = answers.value[questionIndex][answerIndex].media[mediaIndex]
      
      if (folderHandle.value && media) {
        try {
          const folderName = media.attention ? 'X' : 'photos'
          const subFolder = await folderHandle.value.getDirectoryHandle(folderName, { create: true })
          await subFolder.removeEntry(media.name)
        } catch (e) {
          console.error('Error deleting media file:', media.name, e)
        }
      }
      
      answers.value[questionIndex][answerIndex].media.splice(mediaIndex, 1)
      debouncedSave()
    }
  }

  const setReportName = (name) => {
    reportName.value = name
    debouncedSave()
  }

  const setReportFolder = (folder) => {
    reportFolder.value = folder
  }

  const setFolderHandle = (handle) => {
    folderHandle.value = handle
    const lastFolderKey = `lastMediaFolder_${reportName.value}`
    localStorage.setItem(lastFolderKey, handle.name || 'selected')
    debouncedSave()
  }

  const saveDraft = async () => {
    const answersToSave = JSON.parse(JSON.stringify(answers.value))
    for (const qIndex in answersToSave) {
      if (answersToSave[qIndex] && Array.isArray(answersToSave[qIndex])) {
        for (const ans of answersToSave[qIndex]) {
          if (ans.media) {
            ans.media = ans.media.map(m => {
              const { url, base64, ...rest } = m
              return {
                ...rest,
                relativePath: m.relativePath || `./${m.attention ? 'X' : 'photos'}/${m.name}`
              }
            })
          }
        }
      }
    }
    const draft = {
      reportName: reportName.value,
      questions: questions.value,
      answers: answersToSave,
      mediaCounter: mediaCounter,
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
      reader.onload = async (e) => {
        try {
          const draft = JSON.parse(e.target.result)
          reportName.value = draft.reportName || file.name.replace('.json', '')
          questions.value = draft.questions || []
          mediaCounter = draft.mediaCounter || { photos: 1, X: 1 }
          
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
            const loadedAnswers = JSON.parse(JSON.stringify(draft.answers))
            for (const qIndex in loadedAnswers) {
              if (loadedAnswers[qIndex] && Array.isArray(loadedAnswers[qIndex])) {
                for (const ans of loadedAnswers[qIndex]) {
                  const isEmpty = ans.text?.trim() === '' && ans.media?.length === 0
                  ans._empty = ans._empty ?? isEmpty
                }
                if (loadedAnswers[qIndex].length === 0) {
                  loadedAnswers[qIndex] = [{ text: '', attention: false, media: [], _empty: true }]
                }
              }
            }
            answers.value = loadedAnswers
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

  const loadMediaFromFolder = async (selectedFolderHandle = null) => {
    try {
      console.log('[loadMediaFromFolder] Starting...')
      console.log('[loadMediaFromFolder] answers.value:', answers.value)
      
      const handle = selectedFolderHandle || await window.showDirectoryPicker({ mode: 'readwrite' })
      console.log('[loadMediaFromFolder] handle:', handle)
      
      setFolderHandle(handle)
      
      let loadedCount = 0
      for (const qIndex in answers.value) {
        if (answers.value[qIndex] && Array.isArray(answers.value[qIndex])) {
          for (const ans of answers.value[qIndex]) {
            if (ans.media && ans.media.length > 0) {
              console.log('[loadMediaFromFolder] Found media in qIndex:', qIndex, 'ans.media:', ans.media)
              for (const m of ans.media) {
                try {
                  const folderName = m.attention ? 'X' : 'photos'
                  console.log('[loadMediaFromFolder] Loading media:', m.name, 'from folder:', folderName)
                  const subFolderHandle = await handle.getDirectoryHandle(folderName, { create: true })
                  const fileHandle = await subFolderHandle.getFileHandle(m.name)
                  const file = await fileHandle.getFile()
                  m.url = URL.createObjectURL(file)
                  m.base64 = await fileToBase64(file)
                  m.relativePath = m.relativePath || `./${folderName}/${m.name}`
                  console.log('[loadMediaFromFolder] Loaded successfully:', m.name, 'url:', m.url)
                  loadedCount++
                } catch (err) {
                  console.error('[loadMediaFromFolder] Error loading media:', m.name, err)
                }
              }
            }
          }
        }
      }
      console.log('[loadMediaFromFolder] Done. Loaded:', loadedCount, 'files')
    } catch (e) {
      console.error('[loadMediaFromFolder] Error:', e)
    }
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
    addQuestion,
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
    loadMediaFromFolder,
    clearForm,
    debouncedSave
  }
})
