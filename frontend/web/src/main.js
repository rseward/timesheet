import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { globalTheme } from './composables/useTheme'

import './assets/main.css'

// Initialize theme before creating app
globalTheme.initializeTheme()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
