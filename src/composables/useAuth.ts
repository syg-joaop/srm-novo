import type { LoginCredentials } from "~/types/auth";
import { useAuthStore } from "~/stores/auth";

/**
 * Facade da autenticação para uso em componentes.
 */
export const useAuth = () => {
  const authStore = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    const result = await authStore.login(credentials);
    if (result.success) await navigateTo("/");
    return result;
  };

  const logout = async () => {
    await authStore.logout();
  };

  const initAuth = async () => {
    return await authStore.initAuth();
  };

  return {
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    userEmail: computed(() => authStore.userEmail),
    userName: computed(() => authStore.userName),
    userRole: computed(() => authStore.userRole),
    userPermissoes: computed(() => authStore.userPermissoes),
    userParametros: computed(() => authStore.userParametros),
    loading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    initialized: computed(() => authStore.initialized),

    login,
    logout,
    initAuth,
    clearError: authStore.clearError,
  };
};
