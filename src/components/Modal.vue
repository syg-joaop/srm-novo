<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

defineProps<{ titulo: string; subtitulo?: string }>()
const emit = defineEmits<{ fechar: [] }>()

function tecla(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('fechar')
}
onMounted(() => window.addEventListener('keydown', tecla))
onBeforeUnmount(() => window.removeEventListener('keydown', tecla))
</script>

<template>
  <div class="fundo" @click.self="emit('fechar')">
    <div class="janela" role="dialog" aria-modal="true" :aria-label="titulo">
      <header class="row between">
        <div>
          <h3>{{ titulo }}</h3>
          <p v-if="subtitulo" class="small muted">{{ subtitulo }}</p>
        </div>
        <button class="btn btn-ghost btn-sm fechar" aria-label="Fechar" @click="emit('fechar')">✕</button>
      </header>
      <div class="conteudo">
        <slot />
      </div>
      <footer v-if="$slots.rodape" class="row">
        <slot name="rodape" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.fundo {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(10, 6, 30, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
.janela {
  width: min(520px, 100%);
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--surface-solid);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
header {
  padding: 18px 18px 8px;
  align-items: flex-start;
}
.conteudo {
  padding: 8px 18px 18px;
  overflow-y: auto;
  display: grid;
  gap: 14px;
}
footer {
  padding: 12px 18px 18px;
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}
.fechar {
  font-size: 1rem;
  transition: transform 0.3s var(--ease-spring);
}
.fechar:hover {
  transform: rotate(90deg);
}
@media (max-width: 560px) {
  .fundo {
    place-items: end center;
    padding: 0;
  }
  .janela {
    border-radius: 24px 24px 0 0;
    max-height: 92dvh;
  }
}
</style>
