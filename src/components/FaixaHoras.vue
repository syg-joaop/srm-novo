<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { valorEm, type EventoDia, type SerieDia } from '../dia'
import MedIcone from './MedIcone.vue'

const props = defineProps<{ series: SerieDia[]; eventos: EventoDia[]; horaAgora: number | null }>()
const hora = defineModel<number>('hora', { required: true })

const horas = Array.from({ length: 24 }, (_, i) => i)

const linhas = computed(() =>
  props.series.map((s) => ({
    s,
    celulas: horas.map((h) => {
      // média da hora (4 amostras) normalizada pelo máximo do dia
      let soma = 0
      for (let k = 0; k < 4; k++) soma += valorEm(s.pontos, h + k / 4 + 0.125)
      return Math.min(1, soma / 4 / s.max)
    }),
  })),
)

const eventosPorHora = computed(() => {
  const m = new Map<number, EventoDia[]>()
  for (const e of props.eventos) {
    if (!['dose', 'registro'].includes(e.tipo)) continue
    const h = Math.min(23, Math.floor(e.h))
    m.set(h, [...(m.get(h) ?? []), e])
  }
  return m
})

const horaAtiva = computed(() => Math.min(23, Math.floor(hora.value)))

// No celular a faixa rola: mantém a hora ativa à vista.
const caixa = ref<HTMLElement | null>(null)
watch(horaAtiva, (h) => {
  const el = caixa.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  const alvo = el.querySelectorAll<HTMLElement>('.rotulo')[h]
  if (alvo) el.scrollTo({ left: alvo.offsetLeft - el.clientWidth / 2 + alvo.clientWidth / 2, behavior: 'smooth' })
})
</script>

<template>
  <div ref="caixa" class="faixa">
    <div class="grade">
      <span class="canto" />
      <button
        v-for="h in horas"
        :key="'h' + h"
        class="rotulo"
        :class="{ ativa: h === horaAtiva, agora: horaAgora != null && Math.floor(horaAgora) === h }"
        :aria-label="`Ir para ${h}h`"
        @click="hora = h + 0.5"
      >
        <span class="eventos">
          <i v-for="e in eventosPorHora.get(h) ?? []" :key="e.id" :class="e.tipo" :style="{ '--c': e.cor }" />
        </span>
        <span class="mono tiny">{{ String(h).padStart(2, '0') }}</span>
      </button>

      <template v-for="l in linhas" :key="l.s.med.id">
        <span class="med">
          <MedIcone :perfil="l.s.perfil" :cor="l.s.med.cor" :tamanho="26" />
          <span class="tiny nome">{{ l.s.med.nome }}</span>
        </span>
        <button
          v-for="(v, h) in l.celulas"
          :key="l.s.med.id + h"
          class="celula"
          :class="{ ativa: h === horaAtiva, futura: h > horaAtiva }"
          :style="{ '--c': l.s.med.cor, '--v': v, '--i': h }"
          :aria-label="`${l.s.med.nome} às ${h}h: ${Math.round(v * 100)}% do máximo do dia`"
          @click="hora = h + 0.5"
        >
          <span class="nivel" />
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.faixa {
  overflow-x: auto;
  scrollbar-width: none;
  margin: 0 -4px;
  padding: 4px;
}
.faixa::-webkit-scrollbar {
  display: none;
}
.grade {
  display: grid;
  grid-template-columns: 112px repeat(24, minmax(22px, 1fr));
  gap: 4px 3px;
  min-width: 660px;
  align-items: stretch;
}
.canto {
  display: block;
}
.rotulo {
  display: grid;
  justify-items: center;
  gap: 3px;
  color: var(--text-3);
  padding-bottom: 2px;
  border-radius: 8px;
  transition: color 0.2s;
}
.rotulo.agora {
  color: var(--text);
}
.rotulo.ativa {
  color: var(--text);
  font-weight: 700;
}
.eventos {
  display: flex;
  gap: 2px;
  height: 7px;
}
.eventos i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--c);
}
.eventos i.registro {
  background: #fde68a;
  box-shadow: 0 0 6px #fde68a;
}
.med {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.nome {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-2);
}
.celula {
  height: 34px;
  border-radius: 7px;
  background: color-mix(in srgb, var(--c) 7%, transparent);
  position: relative;
  overflow: hidden;
  transition: transform 0.35s var(--ease-spring), box-shadow 0.3s;
  animation: surgir 0.6s var(--ease-out) both;
  animation-delay: calc(var(--i) * 18ms);
}
.nivel {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--c), color-mix(in srgb, var(--c) 60%, #fff));
  opacity: calc(0.08 + var(--v) * 0.92);
  transform-origin: bottom;
  transform: scaleY(calc(0.15 + var(--v) * 0.85));
  border-radius: inherit;
  transition: transform 0.6s var(--ease-out), opacity 0.6s;
}
.celula.futura .nivel {
  opacity: calc(0.05 + var(--v) * 0.35);
}
.celula.ativa {
  transform: scaleY(1.12);
  box-shadow: 0 0 0 1.5px var(--text), 0 8px 20px -8px var(--c);
  z-index: 1;
}
.celula:hover {
  transform: scaleY(1.08);
}
@keyframes surgir {
  from {
    opacity: 0;
    transform: scaleY(0.3);
  }
}
@media (max-width: 560px) {
  .grade {
    grid-template-columns: 34px repeat(24, 22px);
    min-width: 0;
  }
  .nome {
    display: none;
  }
}
</style>
