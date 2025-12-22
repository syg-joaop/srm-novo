import { defineStore } from "pinia";
import type { LoginCredentials, Parametros, Permissao, User } from "~/types/auth";
import { loginResponseSchema } from "~/types/auth";

const STORAGE_KEY = "srm_auth_user";
const DEFAULT_ORIGEM = "SRM";

type LoginResult = { success: true; data: { user: User[] } } | { success: false; error: string };

const isClient = () => import.meta.client;

const readStoredUser = (): User | null => {
  if (!isClient()) return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
};

const writeStoredUser = (userData: User) => {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
};

const clearStoredUser = () => {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEY);
};

const buildLoginPayload = (credentials: LoginCredentials) => {
  const payload: Record<string, unknown> = {
    email: credentials.email,
    password: credentials.password,
    origem: credentials.origem ?? DEFAULT_ORIGEM,
    homol: false,
  };

  if (credentials.colaborador) payload.colaborador = credentials.colaborador;
  if (credentials.password_colaborador) {
    payload.password_colaborador = credentials.password_colaborador;
  }

  return payload;
};

const parseLoginResponse = (response: unknown): { user: User | null; error: string | null } => {
  const parsed = loginResponseSchema.safeParse(response);
  if (!parsed.success) {
    return { user: null, error: "Resposta de login invalida" };
  }

  const loggedUser = parsed.data.user?.[0];
  if (!loggedUser) {
    return { user: null, error: "Credenciais invalidas" };
  }

  if (!loggedUser.token) {
    return { user: null, error: "Login sem token" };
  }

  return { user: loggedUser, error: null };
};

const getErrorMessage = (err: unknown): string => {
  const error = err as { data?: { message?: string }; message?: string };
  return error?.data?.message ?? error?.message ?? "Erro ao fazer login";
};

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value?.token));
  const userEmail = computed(() => user.value?.email ?? "");
  const userName = computed(() => user.value?.usuario ?? "");
  const userRole = computed(() => user.value?.role ?? "user");
  const userPermissoes = computed<Permissao[]>(() => (user.value?.permissoes as Permissao[]) ?? []);
  const userParametros = computed<Partial<Parametros>>(
    () => (user.value?.parametros as Partial<Parametros>) ?? {},
  );

  const setUser = (userData: User | null) => {
    user.value = userData;
  };

  const clearSession = () => {
    user.value = null;
    error.value = null;
    initialized.value = false;
    clearStoredUser();
  };

  const initAuth = async (): Promise<boolean> => {
    if (initialized.value) return isAuthenticated.value;

    const savedUser = readStoredUser();
    if (savedUser) {
      user.value = savedUser;
    }

    initialized.value = true;

    if (!user.value) return false;
    if (!isAuthenticated.value) {
      clearSession();
      return false;
    }

    return true;
  };

  const failLogin = (message: string): LoginResult => {
    error.value = message;
    return { success: false, error: message };
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    loading.value = true;
    error.value = null;

    try {
      const api = useAuthApi();
      const response = await api<{ user: User[] }>("/login", {
        method: "POST",
        body: buildLoginPayload(credentials),
      });

      const { user: loggedUser, error: parseError } = parseLoginResponse(response);
      if (!loggedUser) {
        return failLogin(parseError ?? "Erro ao fazer login");
      }

      setUser(loggedUser);
      initialized.value = true;
      writeStoredUser(loggedUser);

      if (credentials.remember || credentials.remember_colaborador) {
        useAuthPersistence().persistCredentials(credentials);
      }

      return { success: true, data: { user: [loggedUser] } };
    } catch (err) {
      return failLogin(getErrorMessage(err));
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    clearSession();
    await navigateTo("/login");
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    initialized: readonly(initialized),

    isAuthenticated,
    userEmail,
    userName,
    userRole,
    userPermissoes,
    userParametros,

    initAuth,
    login,
    logout,
    clearError,
  };
});
