<template>
  <div class="flex flex-col gap-4">
    <UiInput
      label="Nome da rota"
      :model-value="nome"
      placeholder="Ex: Rota dos vinhedos"
      @update:model-value="$emit('update:nome', $event)"
    />

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-[var(--color-text)]"> Período da rota </label>
      <UiCalendario
        :range="true"
        :start-date="dataInicio"
        :end-date="dataFim"
        :disable-past="true"
        placeholder="Selecione o período"
        @update:start-date="$emit('update:dataInicio', $event)"
        @update:end-date="$emit('update:dataFim', $event)"
      />
    </div>

    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-semibold text-[var(--color-text)]"> Observações </label>
      <textarea
        :value="observacoes"
        placeholder="Observações sobre a rota..."
        rows="3"
        class="w-full px-3 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] placeholder:opacity-60 focus:border-[var(--color-primary)] focus:outline-none transition-colors resize-none"
        @input="$emit('update:observacoes', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiInput from "~/components/ui/UiInput.vue";
import UiCalendario from "~/components/ui/UiCalendario.vue";

defineProps<{
  nome: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  observacoes: string;
}>();

defineEmits<{
  "update:nome": [value: string];
  "update:dataInicio": [value: Date | null];
  "update:dataFim": [value: Date | null];
  "update:observacoes": [value: string];
}>();
</script>
