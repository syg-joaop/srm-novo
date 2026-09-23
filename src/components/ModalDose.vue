<script setup lang="ts">
import { computed, ref } from 'vue'
import Modal from './Modal.vue'
import { avisar, dosesDoDia, estado, inicioPessoal, medPorId, medsAtivas, perfilDe, registrarDose } from '../store'
import { chaveDia, deChave, deMinutos, faixaHoras, hhmm, HORA, minutosDe, paraInputDatetime } from '../lib/datas'
import { janelasEfeito } from '../lib/farmaco'
import { ui } from '../ui'

const emit = defineEmits<{ fechar: [] }>()

const inicial = ui.modalDose ?? {}
const medId = ref(inicial.medId ?? medsAtivas.value[0]?.id ?? '')
const med = computed(() => medPorId(medId.value))

function horarioSugerido() {
  const hoje = chaveDia(new Date())
  if (!inicial.dia || inicial.dia === hoje) return paraInputDatetime(new Date())
  const m = med.value
  const tomadas = dosesDoDia(inicial.dia).filter((d) => d.medId === m?.id).length
  const h = [...(m?.horarios ?? [])].sort()[tomadas] ?? m?.horarios[0] ?? '08:00'
  return paraInputDatetime(deChave(inicial.dia).getTime() + minutosDe(h) * 60_000)
}

const quando = ref(horarioSugerido())
const comAlimento = ref(false)
const doseMg = ref(med.value?.doseMg ?? 0)
const salvando = ref(false)

function trocarMed(id: string) {
  medId.value = id
  doseMg.value = medPorId(id)?.doseMg ?? doseMg.value
}

const previsao = computed(() => {
  if (!med.value) return null
  const perfil = perfilDe(med.value)
  const j = janelasEfeito(perfil, comAlimento.value, inicioPessoal(med.value.id))
  const t = new Date(quando.value).getTime()
  const f = (h: number) => hhmm(t + h * HORA)
  return {
    inicio: `${f(j.inicio[0])}–${f(j.inicio[1])}`,
    pico: `${f(j.pico[0])}–${f(j.pico[1])}`,
    fim: `${f(j.duracao[0])}–${f(j.duracao[1])}`,
    faixa: faixaHoras(j.inicio),
    pessoal: inicioPessoal(med.value.id) != null,
    atraso: comAlimento.value && perfil.atrasoComAlimentoH > 0 ? perfil.atrasoComAlimentoH : 0,
  }
})

const horarioPlanejado = computed(() => med.value?.horarios.join(', '))
const ehTardio = computed(() => {
  if (!med.value) return false
  const p = perfilDe(med.value)
  if (p.horasAntesDeDormir == null) return false
  const limite = minutosDe(estado.preferencias.dormir) - p.horasAntesDeDormir * 60
  const d = new Date(quando.value)
  return d.getHours() * 60 + d.getMinutes() > limite && limite > 0
})

function limite() {
  const p = med.value && perfilDe(med.value)
  if (!p || p.horasAntesDeDormir == null) return ''
  return deMinutos(minutosDe(estado.preferencias.dormir) - p.horasAntesDeDormir * 60)
}

function salvar() {
  if (!med.value) return
  salvando.value = true
  registrarDose(med.value, new Date(quando.value), comAlimento.value, Number(doseMg.value) || med.value.doseMg)
  avisar(`${med.value.nome} registrado às ${hhmm(quando.value)}`, perfilDe(med.value).emoji)
  setTimeout(() => emit('fechar'), 650)
}
</script>

<template>
  <Modal titulo="Registrar dose" subtitulo="Marque o momento em que tomou" @fechar="emit('fechar')">
    <div class="meds">
      <button
        v-for="m in medsAtivas"
        :key="m.id"
        type="button"
        class="med"
        :class="{ ativo: m.id === medId }"
        :style="{ '--cor': m.cor }"
        @click="trocarMed(m.id)"
      >
        <span class="emoji">{{ perfilDe(m).emoji }}</span>
        <span>
          <strong>{{ m.nome }}</strong>
          <span class="tiny faint" style="display: block">{{ m.doseMg }} mg</span>
        </span>
      </button>
    </div>

    <div class="grid-campos">
      <label>
        Quando
        <input v-model="quando" type="datetime-local" />
      </label>
      <label>
        Dose (mg)
        <input v-model.number="doseMg" type="number" min="0" step="any" />
      </label>
    </div>
    <p v-if="horarioPlanejado" class="tiny faint">Horário planejado: {{ horarioPlanejado }}</p>

    <button type="button" class="toggle" :class="{ on: comAlimento }" @click="comAlimento = !comAlimento">
      <span class="trilho"><span class="bola" /></span>
      <span>
        <strong class="small">Tomei com refeição</strong>
        <span class="tiny faint" style="display: block">A comida pode atrasar o início do efeito</span>
      </span>
    </button>

    <Transition name="fade" mode="out-in">
      <div v-if="previsao" :key="previsao.inicio" class="previsao">
        <div class="linha-prev">
          <span>✨</span>
          <span class="small">Início previsto</span>
          <strong class="tabular">{{ previsao.inicio }}</strong>
        </div>
        <div class="linha-prev">
          <span>🔥</span>
          <span class="small">Pico</span>
          <strong class="tabular">{{ previsao.pico }}</strong>
        </div>
        <div class="linha-prev">
          <span>🌅</span>
          <span class="small">Termina</span>
          <strong class="tabular">{{ previsao.fim }}</strong>
        </div>
        <p class="tiny faint">
          {{ previsao.pessoal ? 'Ajustado com base nos seus registros anteriores.' : 'Baseado na referência da bula. Registre quando sentir o efeito para personalizar.' }}
          <span v-if="previsao.atraso"> Refeição adiciona ~{{ faixaHoras([previsao.atraso, previsao.atraso]) }}.</span>
        </p>
      </div>
    </Transition>

    <Transition name="fade">
      <p v-if="ehTardio" class="alerta small">⚠️ Depois das {{ limite() }} esta medicação pode atrapalhar o sono (você dorme às {{ estado.preferencias.dormir }}).</p>
    </Transition>

    <template #rodape>
      <button class="btn btn-ghost" @click="emit('fechar')">Cancelar</button>
      <button class="btn btn-primary" :class="{ explodir: salvando }" :disabled="!med || salvando" @click="salvar">
        <span>💊 Registrar</span>
        <i v-for="n in 10" :key="n" class="particula" :style="{ '--a': n * 36 + 'deg' }" />
      </button>
    </template>
  </Modal>
</template>

<style scoped>
.meds {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.med {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1.5px solid var(--border);
  background: var(--surface-2);
  transition: transform 0.3s var(--ease-spring), border-color 0.2s, background 0.2s;
}
.med .emoji {
  font-size: 1.4rem;
}
.med.ativo {
  border-color: var(--cor);
  background: color-mix(in srgb, var(--cor) 14%, transparent);
  transform: scale(1.03);
}
.grid-campos {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 10px;
}
.toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
.trilho {
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--border);
  position: relative;
  flex: none;
  transition: background 0.25s;
}
.bola {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.35s var(--ease-spring);
}
.toggle.on .trilho {
  background: var(--primary);
}
.toggle.on .bola {
  transform: translateX(18px);
}
.previsao {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-soft), transparent);
  border: 1px solid var(--border);
}
.linha-prev {
  display: grid;
  grid-template-columns: 24px 1fr auto;
  align-items: center;
}
.alerta {
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--warning) 14%, transparent);
  color: var(--text);
}
.particula {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  opacity: 0;
  pointer-events: none;
}
.explodir {
  overflow: visible;
}
.explodir .particula {
  animation: estourar 0.7s var(--ease-out) forwards;
}
@keyframes estourar {
  0% {
    opacity: 1;
    transform: rotate(var(--a)) translateX(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--a)) translateX(70px) scale(0.3);
  }
}
</style>
