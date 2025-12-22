import type { SavedCredentials } from "~/types/auth";

/**
 * Persistencia do "lembrar-me" (so para preencher o formulario).
 *
 * A sessao do app e gerenciada no client com token salvo em storage.
 * A senha fica apenas obfuscada em base64 (nao e criptografia).
 */
export const useAuthPersistence = () => {
  const STORAGE_KEYS = {
    email: "srm_saved_email",
    password: "srm_saved_password",
    sygecomUser: "srm_saved_sygecom_user",
    sygecomPassword: "srm_saved_sygecom_password",
  } as const;

  const encode = (str: string): string => btoa(str);

  const decode = (str: string): string => {
    try {
      return atob(str);
    } catch {
      return "";
    }
  };

  const setOrRemove = (
    key: string,
    value: string | undefined | null,
    condition: boolean = true,
  ): void => {
    if (!import.meta.client) return;

    if (condition && value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  };

  const persistCredentials = (credentials: SavedCredentials): void => {
    if (!import.meta.client) return;

    setOrRemove(STORAGE_KEYS.email, credentials.email, credentials.remember);
    setOrRemove(
      STORAGE_KEYS.password,
      credentials.password ? encode(credentials.password) : undefined,
      credentials.remember,
    );

    const saveSygecom = Boolean(credentials.remember_colaborador && credentials.colaborador);
    setOrRemove(STORAGE_KEYS.sygecomUser, credentials.colaborador, saveSygecom);
    setOrRemove(
      STORAGE_KEYS.sygecomPassword,
      credentials.password_colaborador ? encode(credentials.password_colaborador) : undefined,
      saveSygecom,
    );
  };

  const loadSavedCredentials = (): SavedCredentials => {
    if (!import.meta.client) return {};

    const result: SavedCredentials = {};

    const email = localStorage.getItem(STORAGE_KEYS.email);
    const passwordEncoded = localStorage.getItem(STORAGE_KEYS.password);

    if (email) {
      result.email = email;
      result.remember = true;
      if (passwordEncoded) {
        result.password = decode(passwordEncoded);
      }
    }

    const sygecomUser = localStorage.getItem(STORAGE_KEYS.sygecomUser);
    const sygecomPasswordEncoded = localStorage.getItem(STORAGE_KEYS.sygecomPassword);

    if (sygecomUser) {
      result.colaborador = sygecomUser;
      result.remember_colaborador = true;
      if (sygecomPasswordEncoded) {
        result.password_colaborador = decode(sygecomPasswordEncoded);
      }
    }

    return result;
  };

  const clearSavedCredentials = (): void => {
    if (!import.meta.client) return;
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  return {
    persistCredentials,
    loadSavedCredentials,
    clearSavedCredentials,
  };
};
