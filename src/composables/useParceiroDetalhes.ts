import { reactive, type ComputedRef } from "vue";
import {
  FORNECEDOR_TABS,
  type FornecedorTab,
  type LoadStatus,
  type ParceiroTabsState,
} from "~/types/parceiro-detalhes";
import {
  normalizeAtendimento,
  normalizeCarga,
  normalizeCheckin,
  normalizeColeta,
  normalizeContato,
  normalizePreco,
} from "~/utils/parceiro/normalization";
import { useFornecedorDetalhesService } from "./useFornecedorDetalhesService";
import { toErrorMessage } from "~/utils/offline/helpers";

const createTabState = <T>() => ({
  items: [] as T[],
  status: "idle" as LoadStatus,
  error: null as string | null,
});

export const useParceiroDetalhes = (
  fornecedorId: ComputedRef<string | undefined>,
  fornecedorCodcom: ComputedRef<string | undefined>,
) => {
  const fornecedorService = useFornecedorDetalhesService();

  const tabState = reactive<ParceiroTabsState>({
    precos: createTabState(),
    contatos: createTabState(),
    cargas: createTabState(),
    atendimentos: createTabState(),
    coletas: createTabState(),
    checkins: createTabState(),
  });

  const resetTabState = () => {
    FORNECEDOR_TABS.forEach((tab) => {
      tabState[tab].items = [];
      tabState[tab].status = "idle";
      tabState[tab].error = null;
    });
  };

  const isTabLoading = (tab: FornecedorTab): boolean => tabState[tab].status === "loading";

  const hasTabError = (tab: FornecedorTab): boolean => tabState[tab].status === "error";

  const isFornecedorTab = (tabId: string): tabId is FornecedorTab =>
    FORNECEDOR_TABS.includes(tabId as FornecedorTab);

  const loadTab = async (tab: FornecedorTab) => {
    if (!fornecedorId.value) return;

    const state = tabState[tab];
    if (state.status === "loading") return;
    if (state.status === "success") return;

    state.status = "loading";
    state.error = null;

    try {
      let raw: unknown[] = [];

      switch (tab) {
        case "precos":
          raw = await fornecedorService.fetchPrecos(fornecedorId.value);
          state.items = raw.map((item) => normalizePreco(item as Record<string, unknown>));
          break;
        case "contatos":
          raw = await fornecedorService.fetchContatos(fornecedorId.value);
          state.items = raw.map((item) => normalizeContato(item as Record<string, unknown>));
          break;
        case "cargas":
          raw = await fornecedorService.fetchCargas(fornecedorId.value);
          state.items = raw.map((item) => normalizeCarga(item as Record<string, unknown>));
          break;
        case "atendimentos":
          raw = await fornecedorService.fetchAtendimentos(fornecedorId.value);
          state.items = raw.map((item) => normalizeAtendimento(item as Record<string, unknown>));
          break;
        case "coletas":
          raw = await fornecedorService.fetchColetas(fornecedorId.value);
          state.items = raw.map((item) => normalizeColeta(item as Record<string, unknown>));
          break;
        case "checkins":
          raw = await fornecedorService.fetchCheckins(fornecedorId.value, fornecedorCodcom.value);
          state.items = raw.map((item) => normalizeCheckin(item as Record<string, unknown>));
          break;
      }

      state.status = "success";
    } catch (error) {
      state.status = "error";
      state.error = toErrorMessage(error);
    }
  };

  return {
    tabState,
    resetTabState,
    isTabLoading,
    hasTabError,
    isFornecedorTab,
    loadTab,
  };
};
