import { useAuthStore } from "~/stores/auth";
import type { Permissao } from "~/types/auth";

/**
 * Helpers para checar permissões do usuário logado.
 */
export const usePermissoes = () => {
  const authStore = useAuthStore();

  const permissoes = computed<Permissao[]>(() => (authStore.user?.permissoes as Permissao[]) ?? []);

  const temPermissao = (alias: string): boolean => {
    const permissao = permissoes.value.find((p) => p.alias === alias);
    return permissao?.acessoPermitido ?? false;
  };

  const temPermissaoPorId = (idfuncao: number): boolean => {
    const permissao = permissoes.value.find((p) => p.idfuncao === idfuncao);
    return permissao?.acessoPermitido ?? false;
  };

  const temTodasPermissoes = (aliases: string[]): boolean => aliases.every(temPermissao);

  const temAlgumaPermissao = (aliases: string[]): boolean => aliases.some(temPermissao);

  return {
    permissoes,
    temPermissao,
    temPermissaoPorId,
    temTodasPermissoes,
    temAlgumaPermissao,
  };
};
