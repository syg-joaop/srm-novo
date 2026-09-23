import { createApp } from 'vue'
import App from './App.vue'
import { aplicarTema } from './lib/tema'
import './styles.css'

aplicarTema()
createApp(App).mount('#app')
