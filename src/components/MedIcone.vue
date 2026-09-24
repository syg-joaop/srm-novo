<script setup lang="ts">
import { computed } from 'vue'
import { Brain, Coffee, Heart, Leaf, Moon, Pill, Sprout, Zap } from 'lucide-vue-next'
import type { PerfilFarmaco } from '../types'

const props = withDefaults(defineProps<{ perfil: PerfilFarmaco; cor?: string; tamanho?: number; brilho?: boolean }>(), {
  tamanho: 40,
  brilho: false,
})

const icone = computed(() => {
  const e = props.perfil.etiquetas
  if (e.includes('xantina')) return Coffee
  if (e.includes('hormonio-sono') || e.includes('hipnotico') || e.includes('benzodiazepinico') || e.includes('antipsicotico')) return Moon
  if (e.includes('estimulante')) return Zap
  if (e.includes('reduz-limiar-convulsivo')) return Sprout
  if (e.includes('isrs') || e.includes('irsn')) return Heart
  if (e.includes('serotoninergico')) return Leaf
  if (e.includes('noradrenergico')) return Brain
  if (e.includes('sedativo')) return Moon
  return Pill
})
</script>

<template>
  <span class="med-icone" :class="{ brilho }" :style="{ '--c': cor ?? perfil.cor, width: tamanho + 'px', height: tamanho + 'px' }">
    <component :is="icone" :size="Math.round(tamanho * 0.46)" :stroke-width="2" />
  </span>
</template>

<style scoped>
.med-icone {
  display: inline-grid;
  place-items: center;
  flex: none;
  border-radius: 30%;
  color: var(--c);
  background:
    radial-gradient(120% 120% at 20% 0%, color-mix(in srgb, var(--c) 34%, transparent), transparent 60%),
    color-mix(in srgb, var(--c) 12%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 30%, transparent);
  transition: transform 0.4s var(--ease-spring), box-shadow 0.4s;
}
.brilho {
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--c) 45%, transparent),
    0 0 24px -4px color-mix(in srgb, var(--c) calc(var(--glow) * 70%), transparent);
}
</style>
