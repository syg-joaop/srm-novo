import { useAuthStore } from "~/stores/auth";
import type { Parametros } from "~/types/auth";

/**
 * Helpers para ler parâmetros do usuário logado.
 */
export const useParametros = () => {
  const authStore = useAuthStore();

  const parametros = computed<Partial<Parametros>>(
    () => (authStore.user?.parametros as Partial<Parametros>) ?? {},
  );

  const parametro = <K extends keyof Parametros>(nome: K): Parametros[K] | undefined =>
    parametros.value[nome];

  const parametroAtivo = (nome: keyof Parametros): boolean => parametros.value[nome] === true;

  const todosParametrosAtivos = (nomes: (keyof Parametros)[]): boolean =>
    nomes.every(parametroAtivo);

  const algumParametroAtivo = (nomes: (keyof Parametros)[]): boolean => nomes.some(parametroAtivo);

  return {
    parametros,
    parametro,
    parametroAtivo,
    todosParametrosAtivos,
    algumParametroAtivo,
  };
};
