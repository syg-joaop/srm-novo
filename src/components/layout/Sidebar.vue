<template>
  <div>
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 bg-black/50 z-[40] backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <aside
      class="sidebar"
      :class="{
        expanded: isExpanded,
        'mobile-open': isOpen,
        '-translate-x-full lg:translate-x-0': !isOpen,
      }"
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
    >
      <div class="logo-container">
        <div class="logo-bg">
          <img src="~/assets/img/srm.png" alt="SRM Logo" class="logo-img" />
        </div>
      </div>

      <nav class="nav-menu">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :title="!isExpanded ? item.label : ''"
          @click="$emit('close')"
        >
          <component :is="item.icon" :size="24" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div class="footer">
        <button class="nav-item w-full text-left">
          <Info :size="24" class="nav-icon" />
          <span class="nav-label">Ajuda</span>
        </button>
        <button @click="handleLogout" class="nav-item w-full text-left">
          <LogOut :size="24" class="nav-icon" />
          <span class="nav-label">Sair</span>
        </button>

        <div class="version-info">
          <span v-show="isExpanded">v{{ appVersion }}</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutGrid,
  Recycle,
  HeartHandshake,
  MessageSquare,
  MapPin,
  Route,
  Crosshair,
  Users,
  Info,
  LogOut,
} from "lucide-vue-next";

const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits(["update:expanded", "close"]);

const config = useRuntimeConfig();
const appVersion = config.public.appVersion;
const isExpanded = ref(false);
const { logout } = useAuth();

watch(isExpanded, (newValue) => {
  emit("update:expanded", newValue);
});

const handleLogout = async () => {
  await logout();
};

const menuItems = [
  { label: "Início", path: "/", icon: LayoutGrid },
  { label: "Fornecedores", path: "/fornecedores", icon: Recycle },
  { label: "Prospectos", path: "/prospectos", icon: HeartHandshake },
  { label: "Ocorrências", path: "/ocorrencias", icon: MessageSquare },
  { label: "Check-in", path: "/checkin", icon: MapPin },
  { label: "Rota", path: "/rotas", icon: Route },
  { label: "Concorrentes", path: "/concorrentes", icon: Crosshair },
  { label: "Time", path: "/equipe", icon: Users },
];
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: var(--color-primary);
  color: white;
  width: var(--sidebar-width-collapsed);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: none;
}

@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-width) !important;
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .nav-label,
  .version-info {
    opacity: 1 !important;
    transform: none !important;
    pointer-events: auto !important;
  }

  .logo-bg {
    width: 100% !important;
    height: 64px !important;
  }
}

.sidebar.expanded {
  width: var(--sidebar-width);
  transition-duration: 0.4s;
}

.logo-container {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  min-height: 80px;
}

.logo-bg {
  background-color: white;
  border-radius: 1rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
  width: 40px;
  height: 40px;
}

.expanded .logo-bg {
  width: 100%;
  height: 64px;
}

.logo-img {
  object-fit: contain;
  width: 100%;
  height: 100%;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  padding-left: 20px;
  color: white;
  text-decoration: none;
  transition: background-color 0.2s;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  border-left: 4px solid #fff;
  padding-left: 16px;
}

.nav-icon {
  min-width: 24px;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.nav-label {
  margin-left: 1rem;
  opacity: 0;
  transform: translateX(-10px);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.expanded .nav-label {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
  transition-delay: 0.1s;
}

.footer {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: none;
}

.version-info {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  height: 20px;
  opacity: 0;
  transition: opacity 0.3s;
}

.expanded .version-info {
  opacity: 1;
  transition-delay: 0.1s;
}
</style>
