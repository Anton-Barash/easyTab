export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const capturePhoto = async () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.capture = 'environment'
    
    input.onchange = async (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        const processedFile = await processMediaFile(file)
        resolve(processedFile)
      } else {
        reject(new Error('Файл не выбран'))
      }
    }
    
    input.onerror = reject
    input.click()
  })
}

export const selectFromGallery = async () => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*'
    input.multiple = true
    
    input.onchange = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = await Promise.all(Array.from(e.target.files).map(processMediaFile))
        resolve(files)
      } else {
        reject(new Error('Файлы не выбраны'))
      }
    }
    
    input.onerror = reject
    input.click()
  })
}

const processMediaFile = async (file) => {
  const now = new Date()
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  const ext = file.name.split('.').pop()
  const newName = `${timestamp}.${ext}`
  const base64 = await fileToBase64(file)
  
  return {
    file,
    name: newName,
    type: file.type,
    url: URL.createObjectURL(file),
    base64
  }
}

export const isValidMediaType = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'video/mp4']
  return validTypes.includes(file.type)
}
