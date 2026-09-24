import { createApp } from 'vue'
import App from './App.vue'
import { aplicarTema } from './lib/tema'
import { iniciarRolagemSuave, vInclinar, vMagnetico } from './lib/movimento'
import './styles.css'

aplicarTema()
createApp(App).directive('magnetico', vMagnetico).directive('inclinar', vInclinar).mount('#app')
iniciarRolagemSuave()
