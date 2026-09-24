<script setup lang="ts">
import { Brain, ClipboardList, Clock, Lightbulb, TriangleAlert } from 'lucide-vue-next'
import { ref } from 'vue'
import CurvaPerfil from './CurvaPerfil.vue'
import { duracao, faixaHoras } from '../lib/datas'
import { fatorAcumulo } from '../lib/farmaco'
import type { PerfilFarmaco } from '../types'

const props = defineProps<{ perfil: PerfilFarmaco; cor?: string }>()
const comAlimento = ref(false)
const acumulo = fatorAcumulo(props.perfil.pk.meiaVidaH, 24 / Math.max(1, props.perfil.vezesAoDia))
</script>

<template>
  <div class="ficha" :style="{ '--cor': cor ?? perfil.cor }">
    <p class="small muted">{{ perfil.classe }}</p>

    <div class="grafico">
      <CurvaPerfil :key="String(comAlimento)" :perfil="perfil" :cor="cor" :com-alimento="comAlimento" />
      <label v-if="perfil.atrasoComAlimentoH > 0" class="row tiny" style="display: flex; gap: 6px; cursor: pointer">
        <input v-model="comAlimento" type="checkbox" style="width: auto" /> Simular tomada com refeição (+{{ duracao(perfil.atrasoComAlimentoH) }})
      </label>
    </div>

    <div class="metricas">
      <div>
        <span class="tiny faint">Começa</span>
        <strong>{{ faixaHoras(perfil.efeito.inicioH) }}</strong>
      </div>
      <div>
        <span class="tiny faint">Pico</span>
        <strong>{{ faixaHoras(perfil.efeito.picoH) }}</strong>
      </div>
      <div>
        <span class="tiny faint">Dura</span>
        <strong>{{ faixaHoras(perfil.efeito.duracaoH) }}</strong>
      </div>
      <div>
        <span class="tiny faint">Meia-vida</span>
        <strong>{{ duracao(perfil.pk.meiaVidaH) }}</strong>
      </div>
    </div>

    <div v-if="perfil.efeitoTerapeutico" class="terapeutico small">
      <strong>Efeito terapêutico:</strong> começa em {{ perfil.efeitoTerapeutico.inicioSemanas[0] }}–{{ perfil.efeitoTerapeutico.inicioSemanas[1] }} semanas e fica pleno em
      {{ perfil.efeitoTerapeutico.plenoSemanas[0] }}–{{ perfil.efeitoTerapeutico.plenoSemanas[1] }} semanas.
      <span v-if="perfil.equilibrioDias"> Nível estável após ~{{ perfil.equilibrioDias }} dias (acúmulo ≈ {{ acumulo.toFixed(1) }}× a primeira dose).</span>
    </div>

    <details open>
      <summary><Brain :size="15" /> Como age no organismo</summary>
      <p class="small">{{ perfil.mecanismo }}</p>
    </details>
    <details>
      <summary><Clock :size="15" /> Melhor horário</summary>
      <p class="small">{{ perfil.melhorHorario }}</p>
    </details>
    <details v-if="perfil.dicas.length">
      <summary><Lightbulb :size="15" /> Dicas</summary>
      <ul class="small">
        <li v-for="d in perfil.dicas" :key="d">{{ d }}</li>
      </ul>
    </details>
    <details v-if="perfil.efeitosComuns.length">
      <summary><ClipboardList :size="15" /> Efeitos colaterais comuns</summary>
      <div class="row wrap" style="gap: 6px">
        <span v-for="e in perfil.efeitosComuns" :key="e" class="chip">{{ e }}</span>
      </div>
    </details>
    <details v-if="perfil.alertas.length">
      <summary><TriangleAlert :size="15" /> Alertas</summary>
      <ul class="small">
        <li v-for="a in perfil.alertas" :key="a">{{ a }}</li>
      </ul>
    </details>
    <p v-if="perfil.marcas.length" class="tiny faint">Também conhecido como: {{ perfil.marcas.join(', ') }}</p>
  </div>
</template>

<style scoped>
.ficha {
  display: grid;
  gap: 12px;
}
.grafico {
  padding: 12px;
  border-radius: 16px;
  background: var(--surface-2);
  display: grid;
  gap: 6px;
}
.metricas {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.metricas div {
  display: grid;
  gap: 2px;
  padding: 10px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--cor) 10%, transparent);
  text-align: center;
}
.metricas strong {
  font-size: 0.85rem;
}
@media (max-width: 420px) {
  .metricas {
    grid-template-columns: repeat(2, 1fr);
  }
}
.terapeutico {
  padding: 10px 12px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--cor) 12%, transparent);
}
details {
  border-radius: 14px;
  background: var(--surface-2);
  padding: 10px 12px;
}
summary {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
details[open] summary {
  margin-bottom: 8px;
}
details[open] > :not(summary) {
  animation: pop-in 0.35s var(--ease-out);
}
ul {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 4px;
}
</style>
