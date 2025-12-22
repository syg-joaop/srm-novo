import type { OcorrenciaFilters, PaginatedOcorrenciaResponse } from "../ocorrencias.types";
import { schemaPaginatedOcorrenciaResponse } from "~/server/schemas/ocorrencias.schema";

const OCORRENCIAS_LIST_ENDPOINT = "/sygecom/chameleon-mode/SRM_GET_OCORRENCIAS";

export const useOcorrenciaService = () => {
  const fetchOcorrencias = useOfflineAsyncData<PaginatedOcorrenciaResponse, OcorrenciaFilters>({
    key: "ocorrencias",
    endpoint: OCORRENCIAS_LIST_ENDPOINT,
    buildBody: buildPagedBody,
    homol: true,
    cacheTtl: 2 * 60 * 1000,
    schema: schemaPaginatedOcorrenciaResponse,
  });

  return { fetchOcorrencias };
};
