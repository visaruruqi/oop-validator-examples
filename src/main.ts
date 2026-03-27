import { createApp } from 'vue'
import { VueValidationPlugin } from 'oop-validator/vue'
import App from './App.vue'
import router from './router'
import './assets/style.css'

const app = createApp(App)
app.use(router)
app.use(VueValidationPlugin)
app.mount('#app')
