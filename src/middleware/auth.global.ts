export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return;

  const publicRoutes = new Set(["/login"]);
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initAuth();
  }

  if (authStore.isAuthenticated && to.path === "/login") {
    return navigateTo("/");
  }

  if (!authStore.isAuthenticated && !publicRoutes.has(to.path)) {
    return navigateTo("/login");
  }
});
