type ApiListResponse = { data?: unknown } | unknown;

const PRECO_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_PRECO";
const CONTATO_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_CONTATO";
const CARGA_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_CARGA";
const ATENDIMENTO_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_ATENDIMENTO";
const COLETA_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_COLETA";
const CHECKIN_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES_CHECKIN";

const unwrapList = (response: ApiListResponse): unknown[] => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const data = (response as { data?: unknown }).data;
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown[] }).items)) {
    return (data as { items?: unknown[] }).items ?? [];
  }

  return [];
};

export const useFornecedorDetalhesService = () => {
  const api = useMainApi(true);

  const postList = async (endpoint: string, body: Record<string, unknown>) => {
    const response = await api<ApiListResponse>(endpoint, {
      method: "POST",
      body,
    });

    return unwrapList(response);
  };

  const fetchPrecos = (codfor: string) => postList(PRECO_ENDPOINT, { codfor });
  const fetchContatos = (codfor: string) => postList(CONTATO_ENDPOINT, { codfor });
  const fetchCargas = (codfor: string) => postList(CARGA_ENDPOINT, { codfor });
  const fetchAtendimentos = (codfor: string, limit = 25) =>
    postList(ATENDIMENTO_ENDPOINT, { codfor, limit });
  const fetchColetas = (codfor: string) => postList(COLETA_ENDPOINT, { codfor });
  const fetchCheckins = (codfor: string, codcom?: string) =>
    postList(CHECKIN_ENDPOINT, codcom ? { codfor, codcom } : { codfor });

  return {
    fetchPrecos,
    fetchContatos,
    fetchCargas,
    fetchAtendimentos,
    fetchColetas,
    fetchCheckins,
  };
};
