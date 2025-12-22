<template>
  <div>
    <div
      class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-[var(--color-background)] rounded-t-lg border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
    >
      <div class="col-span-4">Usuário</div>
      <div class="col-span-5">E-mail</div>
      <div class="col-span-3">Setor</div>
    </div>

    <div class="flex flex-col gap-1.5 md:gap-0">
      <div
        v-for="membro in membros"
        :key="membro.id"
        class="group/item relative bg-[var(--color-surface)] md:rounded-none first:md:rounded-t-none last:md:rounded-b-lg rounded-lg border border-[var(--color-border-subtle)] md:border-[var(--color-border)] md:border-t-0 first:md:border-t hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-soft)] transition-all duration-300 ease-out hover:shadow-sm px-3 py-3 md:px-5 md:py-2.5 cursor-pointer"
        @click="$emit('select', membro)"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-[var(--color-primary)] rounded-r-full opacity-0 group-hover/item:h-6 group-hover/item:opacity-100 transition-all duration-300"
        ></div>

        <div class="hidden md:grid md:grid-cols-12 gap-4 items-center">
          <div class="col-span-4 flex items-center gap-3">
            <div
              class="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)] group-hover/item:scale-105 transition-transform duration-200"
            >
              <User class="w-4 h-4" />
            </div>
            <span
              class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
            >
              {{ membro.nome }}
            </span>
          </div>

          <div class="col-span-5 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)] truncate">
              {{ membro.email }}
            </span>
          </div>

          <div class="col-span-3 flex items-center">
            <span class="text-sm text-[var(--color-text-muted)] font-medium uppercase">
              {{ membro.setor }}
            </span>
          </div>
        </div>

        <div class="flex md:hidden flex-col gap-1.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
              >
                <User class="w-3.5 h-3.5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-[var(--color-text)] text-sm group-hover/item:text-[var(--color-primary)] transition-colors truncate"
                >
                  {{ membro.nome }}
                </span>
                <span class="text-[11px] text-[var(--color-text-muted)] truncate">
                  {{ membro.email }}
                </span>
              </div>
            </div>
            <span
              class="text-[11px] text-[var(--color-text-muted)] whitespace-nowrap flex-shrink-0 uppercase"
            >
              {{ membro.setor }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User } from "lucide-vue-next";

export interface Membro {
  id: number;
  nome: string;
  email: string;
  setor: string;
}

defineProps<{
  membros: Membro[];
}>();

defineEmits<{
  (e: "select", membro: Membro): void;
}>();
</script>
