import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'
import TemplateSelect from '../views/TemplateSelect.vue'
import FormFillView from '../views/FormFillView.vue'
import FormCardView from '../views/FormCardView.vue'
import ReportView from '../views/ReportView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/',
    name: 'Start',
    component: StartView
  },
  {
    path: '/templates',
    name: 'Templates',
    component: TemplateSelect
  },
  {
    path: '/fill',
    name: 'Form',
    component: FormFillView
  },
  {
    path: '/fill-card',
    name: 'FormCard',
    component: FormCardView
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
