import type { Fornecedor, FornecedorFilters, FornecedorResponse } from "../fornecedores.types";
import { schemaFornecedorResponse } from "~/server/schemas/fornecedores.schema";

const FORNECEDORES_LIST_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_FORNECEDORES";
const FORNECEDORES_CREATE_ENDPOINT = "/sygecom/chameleon-mode/SRM_POST_FORNECEDOR";

export const useFornecedorService = () => {
  const fetchFornecedor = useOfflineAsyncData<FornecedorResponse, FornecedorFilters>({
    key: "fornecedores",
    endpoint: FORNECEDORES_LIST_ENDPOINT,
    buildBody: buildPagedListBody,
    homol: true,
    cacheTtl: 5 * 60 * 1000,
    schema: schemaFornecedorResponse,
  });

  const createFornecedor = useOfflineMutation<Partial<Fornecedor>>({
    entity: "fornecedor",
    endpoint: FORNECEDORES_CREATE_ENDPOINT,
    homol: true,
    cacheKeyPrefix: "fornecedores:",
  });

  return { fetchFornecedor, createFornecedor };
};
