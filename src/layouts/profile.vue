<template>
  <UiModal :model-value="isOpen" size="small" :show-close="true" @close="handleClose">
    <template #title>
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
        >
          <User class="w-4 h-4 text-[var(--color-primary)]" />
        </div>
        <div class="flex flex-col leading-tight min-w-0">
          <span class="text-sm font-semibold text-[var(--color-text)]">Perfil</span>
          <span class="text-[11px] text-[var(--color-text-muted)] truncate">
            {{ userEmail || "—" }}
          </span>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div class="rounded-xl overflow-hidden border border-[var(--color-border)]">
        <div
          class="p-4 sm:p-5"
          style="background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 ring-1 ring-white/25 shadow-sm"
            >
              <User class="w-6 h-6 text-white" />
            </div>
            <div class="min-w-0">
              <p class="text-base font-semibold text-white truncate">
                {{ userName || "—" }}
              </p>
              <p class="text-xs font-medium text-white/80 truncate">
                {{ userRole || "—" }}
              </p>
            </div>
          </div>
        </div>

        <div class="p-4 sm:p-5 bg-[var(--color-surface)]">
          <div class="grid gap-3">
            <div
              class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-hover)] border border-[var(--color-border-subtle)]"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
              >
                <User class="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <div class="min-w-0">
                <p
                  class="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  Nome
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ userName || "—" }}
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-hover)] border border-[var(--color-border-subtle)]"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
              >
                <Briefcase class="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <div class="min-w-0">
                <p
                  class="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  Cargo
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ userRole || "—" }}
                </p>
              </div>
            </div>

            <div
              class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-hover)] border border-[var(--color-border-subtle)]"
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-primary-soft)] border border-[var(--color-primary-border)]"
              >
                <Mail class="w-4 h-4 text-[var(--color-primary)]" />
              </div>
              <div class="min-w-0">
                <p
                  class="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
                >
                  Email
                </p>
                <p class="text-sm font-medium text-[var(--color-text)] truncate">
                  {{ userEmail || "—" }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <UiButton variant="secondary" class="w-full sm:w-auto" @click="handleClose">
        Fechar
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { Briefcase, Mail, User } from "lucide-vue-next";
import UiButton from "~/components/ui/UiButton.vue";
import UiModal from "~/components/ui/UiModal.vue";

const { userName, userRole, userEmail } = useAuth();

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>
