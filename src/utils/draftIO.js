export const saveDraftToFile = async (questions, answers, attention, media) => {
  const mediaData = {}
  for (const [index, items] of Object.entries(media)) {
    if (items && items.length > 0) {
      mediaData[index] = items.map(item => ({
        name: item.name,
        type: item.type,
        base64: item.base64
      }))
    }
  }
  
  const draft = {
    questions,
    answers,
    attention,
    media: mediaData,
    timestamp: Date.now(),
    version: '1.0'
  }
  
  const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `draft_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const loadDraftFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const draft = JSON.parse(e.target.result)
        const restoredMedia = {}
        
        for (const [index, items] of Object.entries(draft.media || {})) {
          if (items && items.length > 0) {
            restoredMedia[index] = items.map(item => {
              const byteString = atob(item.base64.split(',')[1])
              const mimeType = item.base64.split(',')[0].split(':')[1].split(';')[0]
              const ab = new ArrayBuffer(byteString.length)
              const ia = new Uint8Array(ab)
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i)
              }
              const blob = new Blob([ab], { type: mimeType })
              return {
                name: item.name,
                type: item.type,
                base64: item.base64,
                url: URL.createObjectURL(blob)
              }
            })
          }
        }
        
        resolve({
          questions: draft.questions || [],
          answers: draft.answers || {},
          attention: draft.attention || {},
          media: restoredMedia,
          timestamp: draft.timestamp
        })
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export const exportDraftAsReport = async (questions, answers, attention, media) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `report_${timestamp}`
  
  const { exportToExcel } = await import('./excelLogic.js')
  const { exportToZip } = await import('./zipExporter.js')
  
  exportToExcel(questions, answers, attention, media, fileName)
  await exportToZip(questions, answers, attention, media, fileName)
  
  return fileName
}
