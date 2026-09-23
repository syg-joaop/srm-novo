<script setup lang="ts">
import { onMounted } from 'vue'
import ModalAjustes from './components/ModalAjustes.vue'
import ModalDose from './components/ModalDose.vue'
import ModalEfeito from './components/ModalEfeito.vue'
import Calendario from './views/Calendario.vue'
import Hoje from './views/Hoje.vue'
import Interacoes from './views/Interacoes.vue'
import Medicacoes from './views/Medicacoes.vue'
import Padroes from './views/Padroes.vue'
import { agendarLembretesDoDia, estado, toasts } from './store'
import { irPara, ui, type Aba } from './ui'

const ABAS: { id: Aba; rotulo: string; emoji: string }[] = [
  { id: 'hoje', rotulo: 'Hoje', emoji: '🏠' },
  { id: 'calendario', rotulo: 'Calendário', emoji: '📅' },
  { id: 'medicacoes', rotulo: 'Remédios', emoji: '💊' },
  { id: 'interacoes', rotulo: 'Interações', emoji: '🔗' },
  { id: 'padroes', rotulo: 'Padrões', emoji: '📈' },
]

const VIEWS = { hoje: Hoje, calendario: Calendario, medicacoes: Medicacoes, interacoes: Interacoes, padroes: Padroes }

onMounted(() => {
  if (estado.preferencias.notificacoes) agendarLembretesDoDia()
})
</script>

<template>
  <div class="blobs" aria-hidden="true">
    <span class="blob b1" />
    <span class="blob b2" />
    <span class="blob b3" />
  </div>

  <header class="topo">
    <div class="marca">
      <img :src="'./icon.svg'" alt="" width="34" height="34" class="logo" />
      <div>
        <strong>MedTempo</strong>
        <span class="tiny faint">quando o remédio bate</span>
      </div>
    </div>
    <nav class="abas-topo" aria-label="Seções">
      <button v-for="a in ABAS" :key="a.id" :class="{ ativa: ui.aba === a.id }" @click="irPara(a.id)">
        <span>{{ a.emoji }}</span> {{ a.rotulo }}
      </button>
    </nav>
    <button class="btn btn-ghost engrenagem" aria-label="Ajustes" @click="ui.modalAjustes = true">⚙️</button>
  </header>

  <main :style="{ '--dir': ui.direcao }">
    <Transition name="aba" mode="out-in">
      <KeepAlive>
        <component :is="VIEWS[ui.aba]" :key="ui.aba" />
      </KeepAlive>
    </Transition>
    <p class="aviso tiny faint">
      O MedTempo é uma ferramenta de acompanhamento pessoal e educativa. As curvas são estimativas e não substituem a orientação médica.
    </p>
  </main>

  <nav class="abas-baixo" aria-label="Seções">
    <button v-for="a in ABAS" :key="a.id" :class="{ ativa: ui.aba === a.id }" @click="irPara(a.id)">
      <span class="emoji">{{ a.emoji }}</span>
      <span class="tiny">{{ a.rotulo }}</span>
    </button>
  </nav>

  <button class="fab" aria-label="Registrar dose" @click="ui.modalDose = {}">💊</button>

  <Transition name="modal">
    <ModalDose v-if="ui.modalDose" @fechar="ui.modalDose = null" />
  </Transition>
  <Transition name="modal">
    <ModalEfeito v-if="ui.modalEfeito" @fechar="ui.modalEfeito = null" />
  </Transition>
  <Transition name="modal">
    <ModalAjustes v-if="ui.modalAjustes" @fechar="ui.modalAjustes = false" />
  </Transition>

  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast">
        <span class="emoji">{{ t.emoji }}</span>
        <span class="small">{{ t.texto }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.blobs {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(ellipse at top, var(--bg-2), var(--bg) 70%);
}
.blob {
  position: absolute;
  width: 46vmax;
  height: 46vmax;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: flutuar 22s ease-in-out infinite;
}
.b1 {
  background: var(--blob-1);
  top: -18vmax;
  left: -12vmax;
}
.b2 {
  background: var(--blob-2);
  bottom: -20vmax;
  right: -14vmax;
  animation-delay: -7s;
  animation-duration: 26s;
}
.b3 {
  background: var(--blob-3);
  top: 30%;
  left: 45%;
  width: 30vmax;
  height: 30vmax;
  animation-delay: -14s;
  opacity: 0.35;
}

.topo {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.marca {
  display: flex;
  align-items: center;
  gap: 10px;
}
.marca div {
  display: grid;
  line-height: 1.15;
}
.logo {
  border-radius: 10px;
  animation: balanco 6s ease-in-out infinite;
}
.abas-topo {
  display: flex;
  gap: 4px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 4px;
  border-radius: 999px;
  box-shadow: var(--shadow);
}
.abas-topo button {
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-2);
  transition: background 0.3s, color 0.3s, transform 0.3s var(--ease-spring);
}
.abas-topo button.ativa {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  color: #fff;
  transform: scale(1.04);
}
.engrenagem {
  font-size: 1.15rem;
  transition: transform 0.6s var(--ease-spring);
}
.engrenagem:hover {
  transform: rotate(120deg);
}

main {
  max-width: 1080px;
  margin: 0 auto;
  padding: 8px 16px 110px;
}
.aviso {
  text-align: center;
  margin-top: 28px;
}

.abas-baixo {
  display: none;
}
.fab {
  display: none;
}

@media (max-width: 820px) {
  .abas-topo {
    display: none;
  }
  .topo {
    justify-content: space-between;
  }
  .abas-baixo {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    position: fixed;
    left: 10px;
    right: 10px;
    bottom: max(10px, env(safe-area-inset-bottom));
    z-index: 30;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 22px;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    padding: 6px;
  }
  .abas-baixo button {
    display: grid;
    justify-items: center;
    gap: 1px;
    padding: 6px 0;
    border-radius: 16px;
    color: var(--text-3);
    font-weight: 600;
    transition: background 0.3s, color 0.3s;
  }
  .abas-baixo .emoji {
    font-size: 1.2rem;
    transition: transform 0.4s var(--ease-spring);
  }
  .abas-baixo button.ativa {
    background: var(--primary-soft);
    color: var(--primary);
  }
  .abas-baixo button.ativa .emoji {
    transform: translateY(-3px) scale(1.18);
  }
  .fab {
    display: grid;
    place-items: center;
    position: fixed;
    right: 18px;
    bottom: calc(max(10px, env(safe-area-inset-bottom)) + 84px);
    z-index: 29;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    font-size: 1.5rem;
    background: linear-gradient(135deg, var(--primary), var(--primary-2));
    box-shadow: 0 12px 28px -8px var(--primary);
    transition: transform 0.35s var(--ease-spring);
  }
  .fab:active {
    transform: scale(0.9) rotate(-20deg);
  }
}

/* modais */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-active .janela,
.modal-leave-active .janela {
  transition: transform 0.4s var(--ease-spring), opacity 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .janela,
.modal-leave-to .janela {
  transform: translateY(40px) scale(0.94);
  opacity: 0;
}

/* toasts */
.toasts {
  position: fixed;
  top: max(14px, env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: grid;
  gap: 8px;
  width: min(420px, calc(100% - 32px));
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
}
.toast .emoji {
  font-size: 1.3rem;
  animation: balanco 0.8s ease-in-out 2;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.45s var(--ease-spring);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(60px);
}
</style>
