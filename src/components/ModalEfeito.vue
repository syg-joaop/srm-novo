<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from './Modal.vue'
import Escala from './Escala.vue'
import { avisar, doseAnterior, estado, medPorId, perfilDe, registrarEfeito, statusDe } from '../store'
import { chaveDia, deChave, duracao, hhmm, HORA, paraInputDatetime } from '../lib/datas'
import type { TipoEfeito } from '../types'
import { ui } from '../ui'

const emit = defineEmits<{ fechar: [] }>()
const inicial = ui.modalEfeito ?? {}

const TIPOS: { id: TipoEfeito; rotulo: string; emoji: string; dica: string }[] = [
  { id: 'inicio', rotulo: 'Começou', emoji: '✨', dica: 'Senti o efeito começar agora' },
  { id: 'pico', rotulo: 'No pico', emoji: '🔥', dica: 'Efeito no máximo' },
  { id: 'fim', rotulo: 'Passou', emoji: '🌅', dica: 'Senti o efeito indo embora' },
  { id: 'check', rotulo: 'Check-in', emoji: '📝', dica: 'Só registrar como estou' },
]

const SINTOMAS = ['Boca seca', 'Sem apetite', 'Dor de cabeça', 'Coração acelerado', 'Irritabilidade', 'Insônia', 'Náusea', 'Tensão na mandíbula', 'Sonolência', 'Ansiedade', 'Tremor', 'Suor']

/** Sugere a medicação que está na janela de início (a mais provável de estar "batendo"). */
function medSugerida() {
  if (inicial.medId !== undefined) return inicial.medId
  const ativos = estado.medicacoes.filter((m) => m.ativa).map((m) => statusDe(m))
  const naJanela = ativos.find((s) => (s.fase === 'janela' || s.fase === 'subindo') && !s.sentiuInicio && !s.perfil.efeitoTerapeutico)
  return naJanela?.med.id ?? ativos.find((s) => s.dose)?.med.id ?? ativos[0]?.med.id ?? null
}

const tipo = ref<TipoEfeito>(inicial.tipo ?? 'inicio')
const medId = ref<string | null>(medSugerida())
const quando = ref(
  inicial.dia && inicial.dia !== chaveDia(new Date()) ? paraInputDatetime(deChave(inicial.dia).getTime() + 10 * HORA) : paraInputDatetime(new Date()),
)
const foco = ref(3)
const humor = ref(3)
const energia = ref(3)
const ansiedade = ref(2)
const sintomas = ref<string[]>([])
const nota = ref('')

const tempoDesdeDose = computed(() => {
  if (!medId.value) return null
  const med = medPorId(medId.value)
  const d = doseAnterior(medId.value, new Date(quando.value).getTime(), perfilDe(med).efeito.duracaoH[1] + 4)
  if (!d) return null
  return { h: (new Date(quando.value).getTime() - +new Date(d.em)) / HORA, em: hhmm(d.em) }
})

function alternar(s: string) {
  sintomas.value = sintomas.value.includes(s) ? sintomas.value.filter((x) => x !== s) : [...sintomas.value, s]
}

function salvar() {
  registrarEfeito({
    em: new Date(quando.value).toISOString(),
    medId: medId.value,
    tipo: tipo.value,
    foco: foco.value,
    humor: humor.value,
    energia: energia.value,
    ansiedade: ansiedade.value,
    sintomas: sintomas.value,
    nota: nota.value.trim(),
  })
  const med = medPorId(medId.value)
  const t = tempoDesdeDose.value
  if (tipo.value === 'inicio' && med && t) avisar(`${med.nome} começou ${duracao(t.h)} após a dose`, '✨')
  else avisar('Registro salvo', '📝')
  emit('fechar')
}
</script>

<template>
  <Modal titulo="Como você está?" subtitulo="Registrar efeito" @fechar="emit('fechar')">
    <div class="tipos">
      <button v-for="t in TIPOS" :key="t.id" type="button" :class="{ ativo: tipo === t.id }" :title="t.dica" @click="tipo = t.id">
        <span class="emoji">{{ t.emoji }}</span>
        <span class="tiny">{{ t.rotulo }}</span>
      </button>
    </div>

    <div class="grid-campos">
      <label>
        Medicação
        <select v-model="medId">
          <option :value="null">Geral (nenhuma específica)</option>
          <option v-for="m in estado.medicacoes" :key="m.id" :value="m.id">{{ m.nome }} {{ m.doseMg }} mg</option>
        </select>
      </label>
      <label>
        Quando
        <input v-model="quando" type="datetime-local" />
      </label>
    </div>

    <Transition name="fade" mode="out-in">
      <p v-if="tempoDesdeDose" :key="Math.round(tempoDesdeDose.h * 12)" class="desde small">
        ⏱️ <strong>{{ duracao(tempoDesdeDose.h) }}</strong> depois da dose das {{ tempoDesdeDose.em }}
      </p>
      <p v-else-if="medId" class="desde small faint">Nenhuma dose recente dessa medicação. Registre a dose para medir o tempo de início.</p>
    </Transition>

    <Escala v-model="foco" rotulo="Foco" :emojis="['😵‍💫', '😶', '🙂', '🎯', '🚀']" />
    <Escala v-model="humor" rotulo="Humor" :emojis="['😞', '😕', '😐', '😊', '😄']" />
    <Escala v-model="energia" rotulo="Energia" :emojis="['🪫', '😴', '🙂', '⚡', '🔋']" />
    <Escala v-model="ansiedade" rotulo="Ansiedade" invertido :emojis="['😌', '🙂', '😬', '😰', '😱']" />

    <div>
      <p class="small muted" style="font-weight: 600; margin-bottom: 6px">Sintomas</p>
      <div class="row wrap" style="gap: 6px">
        <button v-for="s in SINTOMAS" :key="s" type="button" class="chip sint" :class="{ on: sintomas.includes(s) }" @click="alternar(s)">{{ s }}</button>
      </div>
    </div>

    <label>
      Nota
      <textarea v-model="nota" rows="2" placeholder="Ex.: consegui focar na reunião, fiquei sem fome no almoço…" />
    </label>

    <template #rodape>
      <button class="btn btn-ghost" @click="emit('fechar')">Cancelar</button>
      <button class="btn btn-primary" @click="salvar">Salvar registro</button>
    </template>
  </Modal>
</template>

<style scoped>
.tipos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.tipos button {
  display: grid;
  justify-items: center;
  gap: 2px;
  padding: 10px 4px;
  border-radius: 16px;
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  transition: transform 0.3s var(--ease-spring), border-color 0.2s, background 0.2s;
}
.tipos .emoji {
  font-size: 1.4rem;
}
.tipos button.ativo {
  border-color: var(--primary);
  background: var(--primary-soft);
  transform: translateY(-3px);
}
.grid-campos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 420px) {
  .grid-campos {
    grid-template-columns: 1fr;
  }
}
.desde {
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--primary-soft);
}
.sint {
  cursor: pointer;
  transition: transform 0.25s var(--ease-spring), background 0.2s;
}
.sint.on {
  background: var(--primary);
  color: #fff;
  border-color: transparent;
  transform: scale(1.05);
}
</style>
