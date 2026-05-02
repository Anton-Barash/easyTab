export const generateHTMLReport = (questions, answers, attention, media) => {
  let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Отчёт</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; margin-bottom: 30px; text-align: center; }
    .question { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #e2e8f0; }
    .question:last-child { border-bottom: none; }
    .question-text { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 10px; }
    .attention { background-color: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 4px; font-size: 14px; display: inline-block; margin-bottom: 10px; }
    .answer { margin-bottom: 10px; font-size: 16px; color: #475569; }
    .media { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
    .media-item img { max-width: 200px; border-radius: 8px; }
    .media-item video { max-width: 200px; border-radius: 8px; }
    .date { text-align: center; color: #94a3b8; margin-top: 30px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Отчёт</h1>
`

  questions.forEach((q, index) => {
    html += `
    <div class="question">
      <div class="question-text">${index + 1}. ${q.text}</div>
      ${attention[index] ? '<div class="attention">⚠️ Внимание!</div>' : ''}
      <div class="answer"><strong>Ответ:</strong> ${answers[index] || '-'}</div>
      ${media[index] && media[index].length > 0 ? `
        <div class="media">
          ${media[index].map(m => `
            <div class="media-item">
              ${m.type.startsWith('image') 
                ? `<img src="${m.base64 || m.url}" alt="${m.name}">`
                : `<video controls><source src="${m.base64 || m.url}" type="${m.type}"></video>`
              }
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
`
  })

  html += `
    <div class="date">Создан: ${new Date().toLocaleString('ru-RU')}</div>
  </div>
</body>
</html>
`

  return html
}

export const downloadHTMLReport = (html, fileName = 'report') => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${fileName}.html`
  a.click()
  URL.revokeObjectURL(url)
}
