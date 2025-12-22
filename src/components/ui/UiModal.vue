<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div :class="['modal-container', `size-${size}`]" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              v-if="showClose"
              type="button"
              class="modal-close"
              @click="close"
              aria-label="Fechar"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">

type Size = "small" | "medium" | "large" | "full";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: Size;
    showClose?: boolean;
    closeOnOverlay?: boolean;
  }>(),
  {
    title: "",
    size: "medium",
    showClose: true,
    closeOnOverlay: true,
  },
);

defineOptions({ name: "UiModal" });

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

const close = () => {
  emit("update:modelValue", false);
  emit("close");
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) close();
};

watch(
  () => props.modelValue,
  (open) => {
    if (!import.meta.client) return;
    document.body.style.overflow = open ? "hidden" : "";
  },
);

onBeforeUnmount(() => {
  if (!import.meta.client) return;
  document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 12px;
}

@media (min-width: 640px) {
  .modal-overlay {
    padding: 20px;
  }
}

.modal-container {
  background-color: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 24px);
  width: 100%;
}

@media (min-width: 640px) {
  .modal-container {
    max-height: 90vh;
  }
}

.size-small {
  max-width: 100%;
}

@media (min-width: 640px) {
  .size-small {
    max-width: 400px;
  }
}

.size-medium {
  max-width: 100%;
}

@media (min-width: 640px) {
  .size-medium {
    max-width: 600px;
  }
}

.size-large {
  max-width: 100%;
}

@media (min-width: 640px) {
  .size-large {
    max-width: 900px;
  }
}

.size-full {
  max-width: 100%;
  max-height: calc(100vh - 24px);
}

@media (min-width: 640px) {
  .size-full {
    max-width: 95vw;
    max-height: 95vh;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 640px) {
  .modal-header {
    padding: 20px 24px;
  }
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex: 1;
  min-width: 0;
}

@media (min-width: 640px) {
  .modal-title {
    font-size: 1.25rem;
  }
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.modal-close:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

@media (min-width: 640px) {
  .modal-body {
    padding: 24px;
  }
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .modal-footer {
    padding: 16px 24px;
    gap: 12px;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>
