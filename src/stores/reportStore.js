import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReportStore = defineStore('report', () => {
  const reports = ref([])

  const addReport = (report) => {
    reports.value.unshift({
      ...report,
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU')
    })
    saveReports()
  }

  const removeReport = (id) => {
    reports.value = reports.value.filter(r => r.id !== id)
    saveReports()
  }

  const saveReports = () => {
    localStorage.setItem('easytab_reports', JSON.stringify(reports.value))
  }

  const loadReports = () => {
    const saved = localStorage.getItem('easytab_reports')
    if (saved) {
      reports.value = JSON.parse(saved)
    }
  }

  return {
    reports,
    addReport,
    removeReport,
    loadReports
  }
})
