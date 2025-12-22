<template>
  <div
    class="app-layout min-h-screen flex flex-col lg:flex-row"
    style="background-color: var(--color-background); transition: background-color 0.3s ease"
  >
    <div
      class="lg:hidden fixed top-0 left-0 h-16 w-full flex items-center justify-between px-4 z-30"
      style="
        background-color: var(--color-background);
        border-bottom: 1px solid var(--color-border);
        transition:
          background-color 0.3s ease,
          border-color 0.3s ease;
      "
    >
      <div class="flex items-center gap-3" @click="handleMobileMenuOpen()">
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
          <User class="w-5 h-5 text-white" />
        </div>

        <div class="flex flex-col">
          <span class="font-bold text-sm leading-tight" style="color: var(--color-text)"
            >Olá, {{ userName }}</span
          >
          <span
            class="text-[10px] font-medium tracking-wide uppercase"
            style="color: var(--color-text-muted)"
            >{{ userRole }}</span
          >
        </div>
      </div>

      <div class="flex items-center gap-2">
        <OfflineIndicator />
        <button
          @click="toggleTheme"
          class="header-btn p-2 transition-colors rounded-lg"
          :title="theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
        >
          <Sun v-if="theme === 'dark'" :size="24" />
          <Moon v-else :size="24" />
        </button>
        <button @click="mobileMenuOpen = true" class="header-btn p-2 transition-colors rounded-lg">
          <Menu :size="24" />
        </button>
      </div>
    </div>

    <div
      class="hidden lg:flex fixed top-0 right-0 h-16 z-20 items-center justify-end px-6 gap-4"
      style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      :style="{
        left: sidebarWidth,
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
      }"
    >
      <OfflineIndicator />

      <button
        @click="toggleTheme"
        class="header-btn p-2 transition-colors rounded-lg"
        :title="theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
      >
        <Sun v-if="theme === 'dark'" :size="20" />
        <Moon v-else :size="20" />
      </button>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm font-medium" style="color: var(--color-text)">
            {{ userName }}
          </p>
          <p class="text-xs" style="color: var(--color-text-muted)">
            {{ userRole }}
          </p>
        </div>
        <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <User class="w-5 h-5 text-white" />
        </div>
      </div>
    </div>

    <LayoutSidebar
      :is-open="mobileMenuOpen"
      @update:expanded="handleSidebarExpand"
      @close="mobileMenuOpen = false"
    />

    <Profile v-if="profileOpen" :is-open="profileOpen" @close="profileOpen = false" />

    <main
      class="main-content flex-1 pt-16"
      style="transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      :style="{
        marginLeft: sidebarWidth,
      }"
    >
      <slot />
    </main>

    <ChatSuporteWidget />
  </div>
</template>

<script setup lang="ts">
import { Menu, Moon, Sun, User } from "lucide-vue-next";
import OfflineIndicator from "~/components/common/OfflineIndicator.vue";
import Profile from "~/layouts/profile.vue";

const { theme, toggleTheme } = useTheme();
const { userName, userRole } = useAuth();
const { isOnline } = useNetworkStatus();
const { pendingCount } = useSyncManager();

const isSidebarExpanded = ref(false);
const mobileMenuOpen = ref(false);
const profileOpen = ref(false);
const windowWidth = ref(0);

const handleSidebarExpand = (expanded: boolean) => {
  isSidebarExpanded.value = expanded;
};

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  updateWidth();
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateWidth);
});

const isDesktop = computed(() => windowWidth.value >= 1024);

const sidebarWidth = computed(() => {
  if (windowWidth.value < 1024) {
    return "0px";
  }
  return isSidebarExpanded.value ? "var(--sidebar-width)" : "var(--sidebar-width-collapsed)";
});

const showStatusBar = computed(() => !isOnline.value || pendingCount.value > 0);

const handleMobileMenuOpen = () => {
  if (windowWidth.value < 1024) {
    //toggle profile open
    profileOpen.value = !profileOpen.value;
  }
};
</script>

<style scoped>
.main-content {
  width: 100%;
}

.header-btn {
  color: var(--color-text-muted);
}

.header-btn:hover {
  background-color: var(--color-hover);
}
</style>
