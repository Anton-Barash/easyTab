import * as XLSX from 'xlsx'

export const readExcelTemplate = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        const questions = jsonData
          .filter(row => row && row[0])
          .map(row => ({
            text: row[0],
            type: row[1] || 'text'
          }))

        resolve(questions)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export const exportToExcel = (questions, answers, fileName = 'report') => {
  const data = []

  questions.forEach((q, index) => {
    const qIndex = String(index)
    const qAnswers = answers[qIndex] || [{ text: '', attention: false, media: [] }]

    qAnswers.forEach((ans, ansIndex) => {
      const answerText = ans.text || ''
      const attentionMark = ans.attention ? '!' : ''
      const fullAnswer = attentionMark ? `! ${answerText}` : answerText
      const mediaNames = (ans.media || []).map(m => m.name).join('; ')

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

  const excelBlob = new Blob(
    [XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  )

  const url = URL.createObjectURL(excelBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
