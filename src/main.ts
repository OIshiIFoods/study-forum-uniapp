import { createSSRApp } from 'vue'
import App from '@/App.vue'
import { pinia } from '@/stores'
import uviewPlus from '@/plugins/uview-plus'
import router from '@/router'
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uviewPlus)
  app.use(pinia)
  app.use(router)
  return {
    app,
  }
}
