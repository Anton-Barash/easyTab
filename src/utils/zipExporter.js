import * as XLSX from 'xlsx'

export const generateHTMLReport = (questions, answers) => {
  let imageIndex = 0;
  let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background-color: #94a3b8; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    h1 { color: #1e293b; margin-bottom: 30px; text-align: center; }
    .question { margin-bottom: 15px; }
    .question-text { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 15px; }
    .answers-table { border-collapse: collapse; }
    .answers-table td { padding: 6px 8px; border: 1px solid #d0d0d0; vertical-align: middle; font-size: 12px; }
    .answers-table tr.attention .attention-col { border-color: #f59e0b; background-color: #fffbeb; font-weight: 700; }
    .answers-table tr.attention .answer-text { border-color: #f59e0b; background-color: #fffbeb; }
    .answers-table tr.attention .media-cell { border-color: #f59e0b; background-color: #fffbeb; }
    .num-col { width: 20px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; }
    .attention-col { width: 20px; text-align: center; font-size: 12px; font-weight: 700; color: #d97706; }
    .answer-text { font-size: 12px; color: #1e293b; line-height: 1.4; width: 100%; }
    .media-cell { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-start; width: 200px; min-width: 200px; min-height: 50px; }
    .media-cell-empty { width: 200px; min-width: 200px; }
    .media-item { width: 50px; height: 50px; border-radius: 2px; overflow: hidden; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.2); flex-shrink: 0; }
    .media-item:hover { opacity: 0.8; }
    .media-item img { width: 100%; height: 100%; object-fit: cover; }
    .media-item video { width: 100%; height: 100%; object-fit: cover; }
    .date { text-align: center; color: #94a3b8; margin-top: 30px; font-size: 14px; }
    .lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; }
    .lightbox.active { display: flex; }
    .lightbox-controls { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; z-index: 10000; }
    .lightbox-controls button { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; transition: background 0.2s; }
    .lightbox-controls button:hover { background: rgba(255,255,255,0.3); }
    .lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.2); border: none; color: white; padding: 15px 20px; border-radius: 4px; cursor: pointer; font-size: 20px; transition: background 0.2s; }
    .lightbox-nav:hover { background: rgba(255,255,255,0.3); }
    .lightbox-nav.prev { left: 20px; }
    .lightbox-nav.next { right: 20px; }
    .lightbox-close { position: absolute; top: 20px; right: 20px; background: none; border: none; color: white; font-size: 32px; cursor: pointer; }
    .lightbox-image-container { position: relative; max-width: 90%; max-height: 90%; overflow: hidden; cursor: grab; }
    .lightbox-image-container.dragging { cursor: grabbing; }
    .lightbox img { max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: center center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Report</h1>
`;

  questions.forEach((q, index) => {
    const qIndex = String(index);
    const questionAnswers = answers[qIndex] || [{ text: '', attention: false, media: [] }];

    html += `
    <div class="question">
      <div class="question-text">${index + 1}. ${q.text}</div>
      <table class="answers-table">
        <tbody>
`;

    questionAnswers.forEach((ans, ansIndex) => {
      const isAttention = ans.attention;
      const answerMedia = ans.media || [];

      const hasMedia = answerMedia.length > 0;
      html += `
          <tr class="${isAttention ? 'attention' : ''}">
            <td class="num-col">${ansIndex + 1}</td>
            <td class="attention-col">${isAttention ? '!' : ''}</td>
            <td class="answer-text">${ans.text || '-'}</td>
            <td>
              <div class="${hasMedia ? 'media-cell' : 'media-cell-empty'}">
`;

      if (hasMedia) {
        answerMedia.forEach(m => {
          const folder = isAttention ? 'X' : 'photos';
          if (m.type && m.type.startsWith('image')) {
            html += `<div class="media-item"><img src="./${folder}/${m.name}" alt="${m.name}" onclick="openLightbox(this.src, ${imageIndex})" /></div>`;
            imageIndex++;
          } else if (m.type && m.type.startsWith('video')) {
            html += `<div class="media-item"><video controls><source src="./${folder}/${m.name}" type="${m.type}" /></video></div>`;
          }
        });
      }

      html += `
              </div>
            </td>
          </tr>
`;
    });

    html += `
        </tbody>
      </table>
    </div>
`;
  });

  html += `
    <div class="date">Created: ${new Date().toLocaleString()}</div>
  </div>
  <div class="lightbox" id="lightbox">
    <button class="lightbox-close" onclick="closeLightbox()">×</button>
    <div class="lightbox-controls">
      <button onclick="zoomIn()">+</button>
      <button onclick="zoomOut()">-</button>
      <button onclick="resetZoom()">100%</button>
    </div>
    <button class="lightbox-nav prev" onclick="prevImage()">←</button>
    <div class="lightbox-image-container" id="lightbox-container">
      <img id="lightbox-img" src="" alt="" />
    </div>
    <button class="lightbox-nav next" onclick="nextImage()">→</button>
  </div>
  <script>
    let currentIndex = 0;
    let images = [];
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    document.addEventListener('DOMContentLoaded', function() {
      const imgElements = document.querySelectorAll('.media-item img');
      images = Array.from(imgElements).map(img => img.src);
    });

    function openLightbox(src, index) {
      currentIndex = index;
      document.getElementById('lightbox-img').src = src;
      document.getElementById('lightbox').classList.add('active');
      resetZoom();
    }

    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('active');
    }

    function nextImage() {
      if (images.length > 1) {
        currentIndex = (currentIndex + 1) % images.length;
        document.getElementById('lightbox-img').src = images[currentIndex];
        resetZoom();
      }
    }

    function prevImage() {
      if (images.length > 1) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        document.getElementById('lightbox-img').src = images[currentIndex];
        resetZoom();
      }
    }

    function zoomIn() { scale = Math.min(scale * 1.2, 5); applyTransform(); }
    function zoomOut() { scale = Math.max(scale / 1.2, 0.5); applyTransform(); }
    function resetZoom() { scale = 1; panX = 0; panY = 0; applyTransform(); }

    function applyTransform() {
      document.getElementById('lightbox-img').style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
    }

    const container = document.getElementById('lightbox-container');
    container.addEventListener('mousedown', function(e) {
      if (scale > 1) { isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY; container.classList.add('dragging'); e.preventDefault(); }
    });
    document.addEventListener('mousemove', function(e) {
      if (isDragging && scale > 1) { panX = e.clientX - startX; panY = e.clientY - startY; applyTransform(); }
    });
    document.addEventListener('mouseup', function() { isDragging = false; container.classList.remove('dragging'); });
    container.addEventListener('wheel', function(e) { e.preventDefault(); if (e.deltaY < 0) zoomIn(); else zoomOut(); });
    document.addEventListener('keydown', function(e) {
      if (document.getElementById('lightbox').classList.contains('active')) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') closeLightbox();
        if (e.key === '+' || e.key === '=') zoomIn();
        if (e.key === '-') zoomOut();
        if (e.key === '0') resetZoom();
      }
    });
  </script>
</body>
</html>
`;

  return html;
};

export const generateExcelFile = (questions, answers) => {
  const data = [];

  questions.forEach((q, index) => {
    const qIndex = String(index);
    const qAnswers = answers[qIndex] || [{ text: '', attention: false, media: [] }];

    qAnswers.forEach((ans, ansIndex) => {
      const answerText = ans.text || '';
      const attentionMark = ans.attention ? '!' : '';
      const fullAnswer = attentionMark ? `! ${answerText}` : answerText;
      const mediaNames = (ans.media || []).map(m => {
        const folder = ans.attention ? 'X' : 'photos';
        return `${folder}/${m.name}`;
      }).join('; ');

      data.push({
        'Question': ansIndex === 0 ? q.text : '',
        'Answer': fullAnswer,
        'Media': mediaNames
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};

const getFileExtension = (fileName) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '.jpg';
};

let fileOperationQueue = Promise.resolve();

const saveFileToFolder = async (folderHandle, fileName, content) => {
  fileOperationQueue = fileOperationQueue.then(async () => {
    const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  });
  return fileOperationQueue;
};

const saveMediaFile = async (folderHandle, mediaFile, number, folderName) => {
  try {
    const subFolderHandle = await folderHandle.getDirectoryHandle(folderName, { create: true });
    const ext = getFileExtension(mediaFile.originalName || mediaFile.name);
    const fileName = `${String(number).padStart(3, '0')}.${ext}`;

    if (mediaFile.base64) {
      const base64Data = mediaFile.base64.split(',')[1];
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      await saveFileToFolder(subFolderHandle, fileName, bytes);
    } else if (mediaFile.url && mediaFile.url.startsWith('blob:')) {
      try {
        const response = await fetch(mediaFile.url);
        const blob = await response.blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        await saveFileToFolder(subFolderHandle, fileName, bytes);
      } catch (e) {
        console.warn('Could not fetch blob URL, skipping file:', e);
      }
    }

    return fileName;
  } catch (e) {
    console.error('Error saving media file:', e);
    return null;
  }
};

export const exportReport = async (questions, answers, fileName = 'report', existingFolderHandle = null) => {
  try {
    const folderHandle = existingFolderHandle || await window.showDirectoryPicker({ mode: 'readwrite' });

    let photoCounter = 1;
    let xCounter = 1;

    for (const [qIndex, questionAnswers] of Object.entries(answers)) {
      if (questionAnswers && questionAnswers.length > 0) {
        for (const ans of questionAnswers) {
          const answerMedia = ans.media || [];
          for (let mIndex = 0; mIndex < answerMedia.length; mIndex++) {
            const folderName = ans.attention ? 'X' : 'photos';
            const counter = ans.attention ? xCounter : photoCounter;
            await saveMediaFile(folderHandle, answerMedia[mIndex], counter, folderName);

            if (ans.attention) {
              xCounter++;
            } else {
              photoCounter++;
            }
          }
        }
      }
    }

    const html = generateHTMLReport(questions, answers);
    await saveFileToFolder(folderHandle, 'report.html', html);

    const excelData = generateExcelFile(questions, answers);
    await saveFileToFolder(folderHandle, 'report.xlsx', excelData);

    alert('Report exported successfully!');
    return { folderHandle, mediaCounter: { photos: photoCounter, X: xCounter } };
  } catch (e) {
    if (e.name !== 'AbortError') {
      console.error('Error exporting report:', e);
      alert('Error exporting report. Please try again.');
    }
    return null;
  }
};
