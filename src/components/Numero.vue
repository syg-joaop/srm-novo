<script setup lang="ts">
import { onMounted, reactive, watch } from 'vue'
import { gsap, movimentoReduzido } from '../lib/movimento'

const props = withDefaults(defineProps<{ valor: number; casas?: number; duracao?: number }>(), { casas: 0, duracao: 1.2 })
const estado = reactive({ v: 0 })

function animar(ate: number) {
  if (movimentoReduzido()) {
    estado.v = ate
    return
  }
  gsap.to(estado, { v: ate, duration: props.duracao, ease: 'expo.out', overwrite: true })
}

onMounted(() => animar(props.valor))
watch(() => props.valor, animar)
</script>

<template>
  <span class="tabular">{{ estado.v.toFixed(casas).replace('.', ',') }}</span>
</template>
