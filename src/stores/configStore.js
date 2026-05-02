import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfigStore = defineStore('config', () => {
  const templatesFolder = ref('Not selected')
  const reportsFolder = ref('Not selected')
  const mediaFolder = ref('Not selected')
  const templatesFolderHandle = ref(null)
  const reportsFolderHandle = ref(null)
  const mediaFolderHandle = ref(null)
  const lastTemplate = ref('')
  const platform = ref('PC')

  const detectPlatform = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    platform.value = isMobile ? 'Mobile' : 'PC'
  }

  const saveConfig = () => {
    const config = {
      templatesFolder: templatesFolder.value,
      reportsFolder: reportsFolder.value,
      mediaFolder: mediaFolder.value,
      lastTemplate: lastTemplate.value,
      platform: platform.value
    }
    localStorage.setItem('easytab_config', JSON.stringify(config))
  }

  const loadConfig = () => {
    const saved = localStorage.getItem('easytab_config')
    if (saved) {
      const config = JSON.parse(saved)
      templatesFolder.value = config.templatesFolder || 'Not selected'
      reportsFolder.value = config.reportsFolder || 'Not selected'
      mediaFolder.value = config.mediaFolder || 'Not selected'
      lastTemplate.value = config.lastTemplate || ''
      platform.value = config.platform || 'PC'
    }
    detectPlatform()
  }

  const resetConfig = () => {
    templatesFolder.value = 'Not selected'
    reportsFolder.value = 'Not selected'
    mediaFolder.value = 'Not selected'
    lastTemplate.value = ''
    templatesFolderHandle.value = null
    reportsFolderHandle.value = null
    mediaFolderHandle.value = null
    localStorage.removeItem('easytab_config')
  }

  loadConfig()

  return {
    templatesFolder,
    reportsFolder,
    mediaFolder,
    templatesFolderHandle,
    reportsFolderHandle,
    mediaFolderHandle,
    lastTemplate,
    platform,
    saveConfig,
    loadConfig,
    resetConfig,
    detectPlatform
  }
})
