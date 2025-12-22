export function useTheme() {
  const theme = ref<"light" | "dark">("light");
  const isDark = computed(() => theme.value === "dark");

  const applyTheme = () => {
    if (!import.meta.client) return;

    const html = document.documentElement;
    html.classList.toggle("dark", theme.value === "dark");
    html.setAttribute("data-theme", theme.value);
  };

  const saveTheme = () => {
    if (!import.meta.client) return;
    localStorage.setItem("theme", theme.value);
  };

  const loadTheme = () => {
    if (!import.meta.client) return;

    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved === "light" || saved === "dark") {
      theme.value = saved;
      return;
    }

    theme.value = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const setTheme = (newTheme: "light" | "dark") => {
    theme.value = newTheme;
    applyTheme();
    saveTheme();
  };

  const toggleTheme = () => {
    setTheme(theme.value === "light" ? "dark" : "light");
  };

  const initializeTheme = () => {
    if (!import.meta.client) return;

    loadTheme();
    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme")) return;
      theme.value = e.matches ? "dark" : "light";
      applyTheme();
    };

    mediaQuery.addEventListener("change", handleChange);
    onUnmounted(() => mediaQuery.removeEventListener("change", handleChange));
  };

  onMounted(initializeTheme);

  return {
    theme: readonly(theme),
    isDark,
    toggleTheme,
    setTheme,
    initializeTheme,
  };
}
