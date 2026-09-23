<script setup lang="ts">
import { ref } from 'vue'
import Modal from './Modal.vue'
import { agendarLembretesDoDia, apagarTudo, avisar, estado, gerarExemplo, pedirNotificacoes } from '../store'
import { chaveDia } from '../lib/datas'
import { aplicarTema, temaAtual, type Tema } from '../lib/tema'

const emit = defineEmits<{ fechar: [] }>()
const tema = ref<Tema>(temaAtual())
const confirmarApagar = ref(false)

function trocarTema(t: Tema) {
  tema.value = t
  aplicarTema(t)
}

async function alternarNotificacoes() {
  if (estado.preferencias.notificacoes) {
    estado.preferencias.notificacoes = false
    return
  }
  if (await pedirNotificacoes()) {
    agendarLembretesDoDia()
    avisar('Lembretes ativados enquanto o app estiver aberto', '🔔')
  }
}

function exportar() {
  const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `medtempo-${chaveDia(new Date())}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

function importar(ev: Event) {
  const arq = (ev.target as HTMLInputElement).files?.[0]
  if (!arq) return
  arq.text().then((t) => {
    try {
      const dados = JSON.parse(t)
      if (!Array.isArray(dados.medicacoes)) throw new Error('formato')
      Object.assign(estado, dados)
      avisar('Dados importados', '📥')
    } catch {
      avisar('Arquivo inválido', '⚠️')
    }
  })
}

function exemplo() {
  gerarExemplo(21)
  avisar('21 dias de exemplo gerados', '🧪')
  emit('fechar')
}

function apagar() {
  if (!confirmarApagar.value) {
    confirmarApagar.value = true
    return
  }
  apagarTudo()
  avisar('Tudo apagado', '🧹')
  emit('fechar')
}
</script>

<template>
  <Modal titulo="Ajustes" @fechar="emit('fechar')">
    <label>
      Seu nome (opcional)
      <input v-model="estado.preferencias.nome" placeholder="Como quer ser chamado(a)?" />
    </label>
    <div class="dois">
      <label>
        Acordo às
        <input v-model="estado.preferencias.acordar" type="time" />
      </label>
      <label>
        Durmo às
        <input v-model="estado.preferencias.dormir" type="time" />
      </label>
    </div>
    <p class="tiny faint">O horário de sono aparece no gráfico e serve para alertar sobre doses tardias.</p>

    <div>
      <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Tema</p>
      <div class="seg">
        <button v-for="t in (['auto', 'claro', 'escuro'] as Tema[])" :key="t" :class="{ ativo: tema === t }" @click="trocarTema(t)">
          {{ t === 'auto' ? '🌓 Automático' : t === 'claro' ? '☀️ Claro' : '🌙 Escuro' }}
        </button>
      </div>
    </div>

    <button class="btn" @click="alternarNotificacoes">
      {{ estado.preferencias.notificacoes ? '🔔 Lembretes ativados (desativar)' : '🔕 Ativar lembretes de dose e de início' }}
    </button>

    <div class="row wrap">
      <button class="btn btn-sm" @click="exportar">📤 Exportar dados</button>
      <label class="btn btn-sm" style="display: inline-flex; cursor: pointer">
        📥 Importar
        <input type="file" accept="application/json" hidden @change="importar" />
      </label>
      <button class="btn btn-sm" @click="exemplo">🧪 Gerar dados de exemplo</button>
    </div>

    <button class="btn btn-sm btn-danger" @click="apagar">{{ confirmarApagar ? 'Toque de novo para confirmar' : '🗑️ Apagar todos os dados' }}</button>

    <p class="tiny faint">
      Seus dados ficam apenas neste aparelho (armazenamento do navegador). As curvas são estimativas educativas baseadas em bulas e literatura.
      Elas não substituem a orientação do seu médico.
    </p>
  </Modal>
</template>

<style scoped>
.dois {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.seg {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: var(--surface-2);
  padding: 4px;
  border-radius: 14px;
}
.seg button {
  padding: 8px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background 0.25s, box-shadow 0.25s;
}
.seg button.ativo {
  background: var(--surface-solid);
  box-shadow: var(--shadow);
}
</style>
