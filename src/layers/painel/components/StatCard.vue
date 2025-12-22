<template>
  <UiCard
    class="stat-card group h-full border border-white/10 relative overflow-hidden"
    style="
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    "
    :hoverable="true"
    :no-padding="true"
  >
    <div
      class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
    ></div>

    <div class="relative h-full p-5 flex flex-col justify-between z-10">
      <div
        class="absolute -right-1 -bottom-7 opacity-10 transform rotate-[25deg] transition-all duration-500 ease-out group-hover:rotate-0 group-hover:scale-110 group-hover:opacity-20"
      >
        <component :is="iconComponent" :size="100" class="text-white" />
      </div>

      <div class="flex items-start justify-end mb-4">
        <div
          class="p-2.5 rounded-xl bg-white/20 backdrop-blur-md shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110"
        >
          <component :is="iconComponent" :size="22" class="text-white drop-shadow-md" />
        </div>
      </div>

      <div class="relative">
        <h3 class="text-3xl font-bold text-white mb-1 tracking-tight drop-shadow-md">
          {{ value }}
        </h3>
        <p class="text-xs font-semibold text-white/80 uppercase tracking-widest drop-shadow-sm">
          {{ label }}
        </p>
      </div>
    </div>

    <div
      class="absolute inset-0 rounded-lg ring-2 ring-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
  </UiCard>
</template>

<script setup lang="ts">
import * as LucideIcons from "lucide-vue-next";
import UiCard from "~/components/ui/UiCard.vue";

const props = defineProps<{
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}>();

const iconComponent = computed(() => {
  return (
    ((LucideIcons as Record<string, unknown>)[props.icon] as typeof LucideIcons.HelpCircle) ||
    LucideIcons.HelpCircle
  );
});
</script>

<style scoped>
.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
