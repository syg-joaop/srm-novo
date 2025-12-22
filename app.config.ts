export default defineAppConfig({
  // Configurações de tema
  theme: {
    primary: "#3B82F6",
    secondary: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    success: "#10B981",
    info: "#3B82F6",
  },

  // Feature flags
  features: {
    enableAnalytics: false,
    enableNotifications: true,
    enableDarkMode: true,
  },

  // Configurações de UI
  ui: {
    sidebarCollapsed: false,
    itemsPerPage: 10,
  },
});
