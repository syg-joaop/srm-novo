<script setup lang="ts">
const props = defineProps<{ rotulo: string; emojis: string[]; invertido?: boolean }>()
const valor = defineModel<number>({ required: true })
const nomes = props.invertido ? ['Nenhuma', 'Pouca', 'Média', 'Alta', 'Muito alta'] : ['Muito baixo', 'Baixo', 'Ok', 'Bom', 'Ótimo']
</script>

<template>
  <div class="escala">
    <div class="row between">
      <span class="small muted" style="font-weight: 600">{{ rotulo }}</span>
      <span class="tiny faint">{{ nomes[valor - 1] }}</span>
    </div>
    <div class="opcoes">
      <button
        v-for="n in 5"
        :key="n"
        type="button"
        :class="{ ativo: valor === n }"
        :aria-label="`${rotulo}: ${nomes[n - 1]}`"
        :aria-pressed="valor === n"
        @click="valor = n"
      >
        {{ emojis[n - 1] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.escala {
  display: grid;
  gap: 6px;
}
.opcoes {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
button {
  font-size: 1.35rem;
  padding: 8px 0;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  filter: grayscale(0.7);
  opacity: 0.7;
  transition: transform 0.3s var(--ease-spring), filter 0.2s, opacity 0.2s, background 0.2s;
}
button:hover {
  transform: translateY(-2px);
  opacity: 1;
}
button.ativo {
  filter: none;
  opacity: 1;
  background: var(--primary-soft);
  border-color: var(--primary);
  transform: scale(1.12);
}
</style>
