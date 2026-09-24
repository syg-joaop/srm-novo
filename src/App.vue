<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, watchEffect } from 'vue'
import { CalendarDays, ChartLine, House, Link2, Pill, Plus, Settings2 } from 'lucide-vue-next'
import ModalAjustes from './components/ModalAjustes.vue'
import ModalDose from './components/ModalDose.vue'
import ModalEfeito from './components/ModalEfeito.vue'
import Calendario from './views/Calendario.vue'
import Hoje from './views/Hoje.vue'
import Interacoes from './views/Interacoes.vue'
import Medicacoes from './views/Medicacoes.vue'
import Padroes from './views/Padroes.vue'
import { corDoCeu } from './dia'
import { agendarLembretesDoDia, agora, estado, toasts } from './store'
import { temaEscuro } from './lib/tema'
import { ceu, irPara, ui, type Aba } from './ui'

const ABAS: { id: Aba; rotulo: string; icone: unknown }[] = [
  { id: 'hoje', rotulo: 'Hoje', icone: House },
  { id: 'calendario', rotulo: 'Calendário', icone: CalendarDays },
  { id: 'medicacoes', rotulo: 'Remédios', icone: Pill },
  { id: 'interacoes', rotulo: 'Interações', icone: Link2 },
  { id: 'padroes', rotulo: 'Padrões', icone: ChartLine },
]

const VIEWS = { hoje: Hoje, calendario: Calendario, medicacoes: Medicacoes, interacoes: Interacoes, padroes: Padroes }

onMounted(() => {
  if (estado.preferencias.notificacoes) agendarLembretesDoDia()
})

/* ---------- céu ambiente ---------- */

const escuro = ref(temaEscuro())
const mq = window.matchMedia?.('(prefers-color-scheme: light)')
mq?.addEventListener?.('change', () => (escuro.value = temaEscuro()))
new MutationObserver(() => (escuro.value = temaEscuro())).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

// Fora da tela Hoje, o céu acompanha a hora real.
watch(
  [() => ui.aba, agora],
  () => {
    if (ui.aba !== 'hoje') {
      const d = new Date(agora.value)
      ceu.hora = d.getHours() + d.getMinutes() / 60
    }
  },
  { immediate: true },
)

watchEffect(() => {
  const [a, b] = corDoCeu(ceu.hora, escuro.value)
  const s = document.documentElement.style
  s.setProperty('--ceu-1', a)
  s.setProperty('--ceu-2', b)
})

/* ---------- indicador deslizante da navegação ---------- */

const navTopo = ref<HTMLElement | null>(null)
const navBaixo = ref<HTMLElement | null>(null)
const indTopo = ref({ x: 0, w: 0 })
const indBaixo = ref({ x: 0, w: 0 })

function medir() {
  const i = ABAS.findIndex((a) => a.id === ui.aba)
  const bt = navTopo.value?.querySelectorAll<HTMLElement>('button')[i]
  if (bt) indTopo.value = { x: bt.offsetLeft, w: bt.offsetWidth }
  const bb = navBaixo.value?.querySelectorAll<HTMLElement>('button')[i]
  if (bb) indBaixo.value = { x: bb.offsetLeft, w: bb.offsetWidth }
}
watch(() => ui.aba, () => nextTick(medir))
onMounted(() => {
  medir()
  document.fonts?.ready.then(medir)
  window.addEventListener('resize', medir)
})

const mostrarFab = computed(() => ui.aba !== 'hoje')
</script>

<template>
  <div class="ambiente" aria-hidden="true">
    <div class="aurora a1" />
    <div class="aurora a2" />
    <div class="grao" />
  </div>

  <header class="topo">
    <button class="marca" aria-label="Ir para Hoje" @click="irPara('hoje')">
      <svg class="logo" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="2.5" />
        <path d="M16 3 A13 13 0 0 1 28.4 20" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <line x1="16" y1="16" x2="23" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#8b7bff" />
            <stop offset="1" stop-color="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <span class="nome-app">MedTempo</span>
    </button>

    <nav ref="navTopo" class="abas-topo" aria-label="Seções">
      <span class="indicador" :style="{ transform: `translateX(${indTopo.x}px)`, width: indTopo.w + 'px' }" />
      <button v-for="a in ABAS" :key="a.id" :class="{ ativa: ui.aba === a.id }" :aria-current="ui.aba === a.id ? 'page' : undefined" @click="irPara(a.id)">
        <component :is="a.icone" :size="15" :stroke-width="2" />
        {{ a.rotulo }}
      </button>
    </nav>

    <button class="btn btn-icon btn-ghost engrenagem" aria-label="Ajustes" @click="ui.modalAjustes = true"><Settings2 :size="19" /></button>
  </header>

  <main :style="{ '--dir': ui.direcao }">
    <Transition name="aba" mode="out-in">
      <KeepAlive>
        <component :is="VIEWS[ui.aba]" :key="ui.aba" />
      </KeepAlive>
    </Transition>
    <p class="aviso tiny faint">MedTempo é uma ferramenta pessoal e educativa. As curvas são estimativas e não substituem orientação médica.</p>
  </main>

  <nav ref="navBaixo" class="abas-baixo" aria-label="Seções">
    <span class="indicador" :style="{ transform: `translateX(${indBaixo.x}px)`, width: indBaixo.w + 'px' }" />
    <button v-for="a in ABAS" :key="a.id" :class="{ ativa: ui.aba === a.id }" :aria-current="ui.aba === a.id ? 'page' : undefined" @click="irPara(a.id)">
      <component :is="a.icone" :size="20" :stroke-width="ui.aba === a.id ? 2.3 : 1.8" />
      <span>{{ a.rotulo }}</span>
    </button>
  </nav>

  <Transition name="fab">
    <button v-if="mostrarFab" class="fab" aria-label="Registrar dose" @click="ui.modalDose = {}"><Plus :size="24" /></button>
  </Transition>

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
@property --ceu-1 {
  syntax: '<color>';
  inherits: true;
  initial-value: #1b1f4a;
}
@property --ceu-2 {
  syntax: '<color>';
  inherits: true;
  initial-value: #07080e;
}
:root {
  transition: --ceu-1 1.2s ease, --ceu-2 1.2s ease;
}

.ambiente {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  background: linear-gradient(180deg, var(--ceu-1) -30%, var(--ceu-2) 55%, var(--bg) 100%);
}
.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: calc(var(--glow) * 0.55);
  mix-blend-mode: screen;
}
.a1 {
  width: 60vmax;
  height: 40vmax;
  top: -20vmax;
  left: -10vmax;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--primary) 70%, transparent), transparent);
  animation: deriva 28s ease-in-out infinite alternate;
}
.a2 {
  width: 50vmax;
  height: 36vmax;
  top: -14vmax;
  right: -14vmax;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--ceu-1) 90%, #34d399 10%), transparent);
  animation: deriva 34s ease-in-out -10s infinite alternate-reverse;
}
@keyframes deriva {
  from {
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
  to {
    transform: translate(8vmax, 4vmax) rotate(12deg) scale(1.15);
  }
}
.grao {
  position: absolute;
  inset: -50%;
  opacity: var(--grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grao 1.2s steps(4) infinite;
}
@keyframes grao {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-3%, 2%);
  }
  50% {
    transform: translate(2%, -3%);
  }
  75% {
    transform: translate(-2%, -1%);
  }
}

/* ---------- topo ---------- */
.topo {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  max-width: 1160px;
  margin: 0 auto;
  padding: 14px 20px;
  padding-top: max(14px, env(safe-area-inset-top));
}
.topo::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(to bottom, color-mix(in srgb, var(--bg) 70%, transparent), transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  mask: linear-gradient(to bottom, #000 60%, transparent);
}
.marca {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
  color: var(--text);
}
.logo line {
  transform-origin: 16px 16px;
  animation: ponteiro 12s linear infinite;
}
@keyframes ponteiro {
  to {
    transform: rotate(360deg);
  }
}
.nome-app {
  font-weight: 650;
  letter-spacing: -0.03em;
  font-size: 1.05rem;
}
.abas-topo {
  position: relative;
  display: flex;
  gap: 2px;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 4px;
  border-radius: 999px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.abas-topo .indicador,
.abas-baixo .indicador {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  border-radius: 999px;
  background: var(--text);
  transition: transform 0.55s var(--ease-spring), width 0.55s var(--ease-spring);
  z-index: 0;
}
.abas-topo button {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 15px;
  border-radius: 999px;
  font-size: 0.84rem;
  font-weight: 550;
  color: var(--text-2);
  transition: color 0.35s;
}
.abas-topo button:hover {
  color: var(--text);
}
.abas-topo button.ativa {
  color: var(--bg);
}
.engrenagem {
  justify-self: end;
}
.engrenagem svg {
  transition: transform 0.7s var(--ease-spring);
}
.engrenagem:hover svg {
  transform: rotate(90deg);
}

main {
  max-width: 1160px;
  margin: 0 auto;
  padding: 8px 20px 120px;
}
.aviso {
  text-align: center;
  margin-top: 36px;
}

.abas-baixo {
  display: none;
}
.fab {
  display: none;
}

@media (max-width: 860px) {
  .topo {
    grid-template-columns: 1fr auto;
    padding-left: 16px;
    padding-right: 16px;
  }
  .abas-topo {
    display: none;
  }
  main {
    padding: 4px 16px 130px;
  }
  .abas-baixo {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: max(12px, env(safe-area-inset-bottom));
    z-index: 30;
    background: color-mix(in srgb, var(--surface-solid) 82%, transparent);
    border: 1px solid var(--border);
    border-radius: 24px;
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    padding: 5px;
  }
  .abas-baixo .indicador {
    top: 5px;
    bottom: 5px;
    border-radius: 19px;
    background: var(--surface-3);
  }
  .abas-baixo button {
    position: relative;
    z-index: 1;
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 8px 0 7px;
    border-radius: 19px;
    color: var(--text-3);
    font-size: 0.66rem;
    font-weight: 600;
    transition: color 0.3s;
  }
  .abas-baixo button svg {
    transition: transform 0.5s var(--ease-spring);
  }
  .abas-baixo button.ativa {
    color: var(--text);
  }
  .abas-baixo button.ativa svg {
    transform: translateY(-1px) scale(1.08);
  }
  .fab {
    display: grid;
    place-items: center;
    position: fixed;
    right: 18px;
    bottom: calc(max(12px, env(safe-area-inset-bottom)) + 82px);
    z-index: 29;
    width: 56px;
    height: 56px;
    border-radius: 18px;
    background: var(--text);
    color: var(--bg);
    box-shadow: 0 16px 34px -12px rgba(0, 0, 0, 0.6);
    transition: transform 0.4s var(--ease-spring);
  }
  .fab:active {
    transform: scale(0.9) rotate(90deg);
  }
}

.fab-enter-active,
.fab-leave-active {
  transition: transform 0.45s var(--ease-spring), opacity 0.3s;
}
.fab-enter-from,
.fab-leave-to {
  transform: scale(0.4) rotate(-90deg);
  opacity: 0;
}

/* ---------- modais ---------- */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.35s ease;
}
.modal-enter-active .janela {
  transition: transform 0.55s var(--ease-spring), opacity 0.35s, filter 0.35s;
}
.modal-leave-active .janela {
  transition: transform 0.25s ease, opacity 0.2s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .janela {
  transform: translateY(40px) scale(0.96);
  opacity: 0;
  filter: blur(6px);
}
.modal-leave-to .janela {
  transform: translateY(20px) scale(0.98);
  opacity: 0;
}

/* ---------- toasts ---------- */
.toasts {
  position: fixed;
  bottom: max(24px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: grid;
  justify-items: center;
  gap: 8px;
  width: min(440px, calc(100% - 32px));
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px 11px 14px;
  border-radius: 999px;
  background: var(--text);
  color: var(--bg);
  box-shadow: 0 20px 40px -16px rgba(0, 0, 0, 0.6);
  font-weight: 500;
}
.toast .emoji {
  font-size: 1.05rem;
}
.toast-enter-active {
  transition: transform 0.6s var(--ease-spring), opacity 0.4s, filter 0.4s;
}
.toast-leave-active {
  transition: transform 0.35s ease, opacity 0.3s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  filter: blur(6px);
}
.toast-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
@media (max-width: 860px) {
  .toasts {
    bottom: calc(max(12px, env(safe-area-inset-bottom)) + 84px);
  }
}
</style>
