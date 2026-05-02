import * as XLSX from 'xlsx'

export const generateHTMLReport = (questions, answers) => {
  let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background-color: #94a3b8; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; margin-bottom: 30px; text-align: center; }
    .question { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .question:last-child { border-bottom: none; }
    .question-text { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px; }
    .answer-item { margin-bottom: 12px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; }
    .answer-item.attention { border-color: #f59e0b; background: #fffbeb; }
    .answer-label { font-weight: 600; color: #64748b; font-size: 12px; margin-bottom: 5px; }
    .answer-text { font-size: 16px; color: #1e293b; margin-bottom: 10px; }
    .attention-mark { color: #d97706; font-weight: 700; margin-right: 5px; }
    .media { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .media-item { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; cursor: pointer; transition: opacity 0.2s; border: 2px solid #e2e8f0; }
    .media-item:hover { opacity: 0.8; }
    .media-item img { width: 100%; height: 100%; object-fit: cover; }
    .media-item video { width: 100%; height: 100%; object-fit: cover; }
    .date { text-align: center; color: #94a3b8; margin-top: 30px; font-size: 14px; }
    .lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; align-items: center; justify-content: center; z-index: 9999; }
    .lightbox.active { display: flex; }
    .lightbox img { max-width: 90%; max-height: 90%; object-fit: contain; }
    .lightbox .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 32px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Report</h1>
`

  questions.forEach((q, index) => {
    const qIndex = String(index)
    const questionAnswers = answers[qIndex] || [{ text: '', attention: false, media: [] }]

    html += `
    <div class="question">
      <div class="question-text">${index + 1}. ${q.text}</div>
`

    questionAnswers.forEach((ans, ansIndex) => {
      const isAttention = ans.attention
      const answerMedia = ans.media || []
      html += `
      <div class="answer-item ${isAttention ? 'attention' : ''}">
        <div class="answer-label">Ответ ${ansIndex + 1}</div>
        <div class="answer-text">
          ${isAttention ? '<span class="attention-mark">!</span>' : ''}
          ${ans.text || '-'}
        </div>
`

      if (answerMedia.length > 0) {
        html += `        <div class="media">`
        answerMedia.forEach(m => {
          const folder = isAttention ? 'X' : 'photos'
          if (m.type && m.type.startsWith('image')) {
            html += `<div class="media-item"><img src="./${folder}/${m.name}" alt="${m.name}" onclick="openLightbox(this.src)" /></div>`
          } else if (m.type && m.type.startsWith('video')) {
            html += `<div class="media-item"><video controls><source src="./${folder}/${m.name}" type="${m.type}" /></video></div>`
          }
        })
        html += `</div>`
      }

      html += `      </div>`
    })

    html += `    </div>`
  })

  html += `
    <div class="date">Created: ${new Date().toLocaleString()}</div>
  </div>
  <div class="lightbox" id="lightbox" onclick="closeLightbox()">
    <button class="close-btn" onclick="closeLightbox()">×</button>
    <img id="lightbox-img" src="" alt="" />
  </div>
  <script>
    function openLightbox(src) {
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox').classList.add('active');
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }
  </script>
</body>
</html>
`

  return html
}

export const generateExcelFile = (questions, answers) => {
  const data = []

  questions.forEach((q, index) => {
    const qIndex = String(index)
    const qAnswers = answers[qIndex] || [{ text: '', attention: false, media: [] }]

    qAnswers.forEach((ans, ansIndex) => {
      const answerText = ans.text || ''
      const attentionMark = ans.attention ? '!' : ''
      const fullAnswer = attentionMark ? `! ${answerText}` : answerText
      const mediaNames = (ans.media || []).map(m => {
        const folder = ans.attention ? 'X' : 'photos'
        return `${folder}/${m.name}`
      }).join('; ')

      data.push({
        'Question': ansIndex === 0 ? q.text : '',
        'Answer': fullAnswer,
        'Media': mediaNames
      })
    })
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
}

const getFileExtension = (fileName) => {
  const parts = fileName.split('.')
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '.jpg'
}

const saveFileToFolder = async (folderHandle, fileName, content) => {
  const fileHandle = await folderHandle.getFileHandle(fileName, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

const saveMediaFile = async (folderHandle, mediaFile, number, folderName) => {
  try {
    const subFolderHandle = await folderHandle.getDirectoryHandle(folderName, { create: true })
    const ext = getFileExtension(mediaFile.originalName || mediaFile.name)
    const fileName = `${String(number).padStart(3, '0')}${ext}`
    
    if (mediaFile.base64) {
      const base64Data = mediaFile.base64.split(',')[1]
      const binary = atob(base64Data)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      
      await saveFileToFolder(subFolderHandle, fileName, bytes)
    } else if (mediaFile.file) {
      await saveFileToFolder(subFolderHandle, fileName, mediaFile.file)
    }
    
    return fileName
  } catch (e) {
    console.error('Error saving media file:', e)
    return null
  }
}

export const exportReport = async (questions, answers, fileName = 'report') => {
  try {
    const folderHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    
    let photoCounter = 1
    let xCounter = 1
    const updatedAnswers = JSON.parse(JSON.stringify(answers))
    
    for (const [qIndex, questionAnswers] of Object.entries(updatedAnswers)) {
      if (questionAnswers && questionAnswers.length > 0) {
        for (const ans of questionAnswers) {
          const answerMedia = ans.media || []
          for (let mIndex = 0; mIndex < answerMedia.length; mIndex++) {
            const folderName = ans.attention ? 'X' : 'photos'
            const counter = ans.attention ? xCounter : photoCounter
            const savedName = await saveMediaFile(folderHandle, answerMedia[mIndex], counter, folderName)
            
            if (savedName) {
              answerMedia[mIndex].name = savedName
              if (ans.attention) {
                xCounter++
              } else {
                photoCounter++
              }
            }
          }
        }
      }
    }
    
    const html = generateHTMLReport(questions, updatedAnswers)
    await saveFileToFolder(folderHandle, 'report.html', html)
    
    const excelData = generateExcelFile(questions, updatedAnswers)
    await saveFileToFolder(folderHandle, 'report.xlsx', excelData)
    
    const draft = {
      reportName: fileName,
      questions: questions,
      answers: updatedAnswers,
      timestamp: Date.now()
    }
    await saveFileToFolder(folderHandle, `${fileName}.json`, JSON.stringify(draft, null, 2))
    
    alert('Report exported successfully!')
    return true
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error exporting report:', e)
      alert('Error exporting report. Please try again.')
    }
    return false
  }
}
