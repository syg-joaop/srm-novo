import {
  schemaRota,
  schemaRotaResponse,
  schemaRoteiro,
  schemaRoteiroResponse,
} from "~/server/schemas/rotas.schema";
import { isValidCoordinate } from "~/utils/validators/geo";
import type {
  CreateRoteiroPayload,
  PolylineCache,
  Rota,
  RotaFilters,
  RotaResponse,
  Roteiro,
  RoteiroFilters,
  RoteiroResponse,
  VrpRouteRequest,
  VrpRouteResponse,
  VrpSummary,
  VrpTask,
  VrpVehicle,
} from "../rotas.types";

const LOG_PREFIX = "[useRotaService]";

// Endpoints do backend NestJS
const ROTAS_ENDPOINT = "/srm/rotas";
const ROTEIRO_ENDPOINT = "/srm/roteiro";

// Cache TTL (24 horas)
const POLYLINE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_PREFIX = "polyline:";

// VRP constants
const VRP_TIMEZONE = "America/Sao_Paulo";
const VRP_TASK_DURATION = "00:10";
const VRP_MIN_TASKS_WITH_USER = 1;
const VRP_MIN_TASKS_WITHOUT_USER = 2;
const VRP_MAX_DAYS_WORKING = 1;
const VRP_LOCATION_PRECISION = 4;
const VRP_VEHICLE_ID = 1;
const VRP_VEHICLE_DESCRIPTION = "Veiculo Virtual";
const VRP_VEHICLE_MAX_JOBS = 100;
const VRP_VEHICLE_AVG_SPEED = 60;
const VRP_WORK_START = "06:00";
const VRP_WORK_END = "22:00";

// Sequencing
const TEMP_SEQUENCE_BASE = 10000;
const DEFAULT_ROTA_TIPO = "COMPRA";
const DEFAULT_ROTEIROS_PAGE_SIZE = 100;

const logDebug = (...args: unknown[]) => console.log(LOG_PREFIX, ...args);
const logWarn = (...args: unknown[]) => console.warn(LOG_PREFIX, ...args);
const logError = (...args: unknown[]) => console.error(LOG_PREFIX, ...args);

const toNumber = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

const getRoteiroCoordinates = (
  roteiro: Roteiro,
): { latitude: number; longitude: number } | null => {
  if (!roteiro.endereco) return null;
  const lat = toNumber(roteiro.endereco.latitude);
  const lng = toNumber(roteiro.endereco.longitude);
  if (lat === null || lng === null) return null;
  return isValidCoordinate(lat, lng) ? { latitude: lat, longitude: lng } : null;
};

const sortBySequencia = (a: Roteiro, b: Roteiro) => (a.sequencia ?? 0) - (b.sequencia ?? 0);

type RoteiroWithCoords = {
  roteiro: Roteiro;
  coords: { latitude: number; longitude: number };
};

const getRoteirosWithCoords = (roteiros: Roteiro[]): RoteiroWithCoords[] => {
  return [...roteiros]
    .sort(sortBySequencia)
    .map((roteiro) => {
      const coords = getRoteiroCoordinates(roteiro);
      return coords ? { roteiro, coords } : null;
    })
    .filter((item): item is RoteiroWithCoords => Boolean(item));
};

const isVrpSummary = (value: unknown): value is VrpSummary => {
  if (!value || typeof value !== "object") return false;
  return "distance" in value && "time" in value;
};

const DEFAULT_VRP_SUMMARY: VrpSummary = {
  distance: { meters: 0 },
  time: { duration: 0, traveling: 0 },
};

const appendQueryParam = (params: URLSearchParams, key: string, value?: string | number | null) => {
  if (value === undefined || value === null || value === "") return;
  params.append(key, String(value));
};

export const useRotaService = () => {
  const config = useRuntimeConfig();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Configuração da API VRP (Fallback para valores hardcoded se não houver config)
  // TODO: Mover chaves definitivamente para variáveis de ambiente e remover fallback
  const VRP_API_URL = (config.public?.vrpApiUrl as string) || "";
  const VRP_API_KEY = (config.public?.vrpApiKey as string) || "";

  /**
   * Busca lista de rotas do comprador
   */
  const fetchRotas = async (filters?: RotaFilters): Promise<RotaResponse | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);
      const queryParams = new URLSearchParams();

      appendQueryParam(queryParams, "page", filters?.page ?? null);
      appendQueryParam(queryParams, "itens", filters?.itens ?? null);
      appendQueryParam(queryParams, "status", filters?.status ?? null);
      appendQueryParam(queryParams, "data_inicio", filters?.data_inicio ?? null);
      appendQueryParam(queryParams, "data_fim", filters?.data_fim ?? null);

      const url = queryParams.toString() ? `${ROTAS_ENDPOINT}?${queryParams}` : ROTAS_ENDPOINT;

      const response = await api<RotaResponse>(url, {
        method: "GET",
      });

      return schemaRotaResponse.parse(response) as RotaResponse;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao buscar rotas";
      logError("fetchRotas error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Busca roteiros (pontos) de uma rota específica
   */
  const fetchRoteiros = async (
    idRota: number,
    filters?: RoteiroFilters,
  ): Promise<RoteiroResponse | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);
      const queryParams = new URLSearchParams();

      appendQueryParam(queryParams, "id_rota", idRota);
      appendQueryParam(queryParams, "page", filters?.page ?? null);
      appendQueryParam(queryParams, "itens", filters?.itens ?? null);
      appendQueryParam(queryParams, "id_usuario", filters?.id_usuario ?? null);

      const response = await api<RoteiroResponse>(`${ROTEIRO_ENDPOINT}?${queryParams}`, {
        method: "GET",
      });

      return schemaRoteiroResponse.parse(response) as RoteiroResponse;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao buscar roteiros";
      logError("fetchRoteiros error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Busca uma rota específica por ID
   */
  const fetchRotaById = async (id: number): Promise<Rota | null> => {
    const response = await fetchRotas();
    if (!response?.data) return null;
    return response.data.find((r) => r.id === id) || null;
  };

  /**
   * Gera chave de cache baseada nos IDs dos roteiros
   */
  const generateCacheKey = (roteiros: Roteiro[]): string => {
    const ids = [...roteiros]
      .sort(sortBySequencia)
      .map((r) => `${r.id}:${r.sequencia ?? 0}`)
      .join("-");
    return `${CACHE_PREFIX}${ids}`;
  };

  /**
   * Busca polyline do cache localStorage
   */
  const getPolylineFromCache = (cacheKey: string): PolylineCache | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const data: PolylineCache = JSON.parse(cached);
      const now = Date.now();

      // Verifica se o cache expirou
      if (now - data.timestamp > data.ttl) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  };

  /**
   * Salva polyline no cache localStorage
   */
  const savePolylineToCache = (cacheKey: string, polyline: string, summary: VrpSummary): void => {
    try {
      const data: PolylineCache = {
        polyline,
        summary,
        timestamp: Date.now(),
        ttl: POLYLINE_CACHE_TTL_MS,
      };
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (err) {
      logWarn("Erro ao salvar cache:", err);
    }
  };

  /**
   * Converte roteiros para tasks da API VRP (filtra coordenadas inválidas)
   */
  const roteirosToVrpTasks = (roteiros: Roteiro[]): VrpTask[] => {
    const roteirosWithCoords = getRoteirosWithCoords(roteiros);
    return roteirosWithCoords.map(({ roteiro, coords }) => ({
      id: roteiro.id,
      type: "catch-only" as const,
      description: roteiro.nome || `Ponto ${roteiro.sequencia}`,
      duration: VRP_TASK_DURATION,
      location: coords,
    }));
  };

  /**
   * Cria veículo virtual para calcular polyline
   * Se userLocation for fornecido, usa como ponto de partida
   */
  const createVirtualVehicle = (
    roteiros: Roteiro[],
    userLocation?: { latitude: number; longitude: number } | null,
  ): VrpVehicle | null => {
    const roteirosWithCoords = getRoteirosWithCoords(roteiros);
    if (roteirosWithCoords.length === 0) return null;

    const primeiro = roteirosWithCoords[0];
    const ultimo = roteirosWithCoords[roteirosWithCoords.length - 1];

    const hasValidUserLocation =
      !!userLocation && isValidCoordinate(userLocation.latitude, userLocation.longitude);
    const start = hasValidUserLocation
      ? { latitude: userLocation!.latitude, longitude: userLocation!.longitude }
      : primeiro.coords;

    if (hasValidUserLocation && userLocation) {
      logDebug("Usando localizacao do usuario como ponto de partida:", start);
    }

    return {
      id: VRP_VEHICLE_ID,
      description: VRP_VEHICLE_DESCRIPTION,
      maxJobs: VRP_VEHICLE_MAX_JOBS,
      avgSpeed: VRP_VEHICLE_AVG_SPEED,
      location: {
        start,
        end: ultimo.coords,
      },
      work: {
        start: VRP_WORK_START,
        end: VRP_WORK_END,
      },
    };
  };

  /**
   * Calcula polyline chamando a API VRP
   * @param roteiros - Lista de roteiros
   * @param userLocation - Localização atual do usuário (GPS) para usar como ponto de partida
   */
  const calcularPolyline = async (
    roteiros: Roteiro[],
    userLocation?: { latitude: number; longitude: number } | null,
  ): Promise<{ polyline: string; summary: VrpSummary } | null> => {
    isLoading.value = true;
    error.value = null;

    if (!VRP_API_URL || !VRP_API_KEY) {
      error.value = "VRP API nao configurada";
      logWarn("VRP API config ausente.");
      isLoading.value = false;
      return null;
    }

    try {
      const tasks = roteirosToVrpTasks(roteiros);

      if (tasks.length === 0) {
        error.value = "Nenhum ponto com coordenadas válidas para calcular a rota";
        return null;
      }

      const parseVrpResponse = (response: VrpRouteResponse) => {
        type VrpApiResponseShape = {
          response?: unknown;
          unassignedTasks?: unknown;
          workDays?: Array<{
            plans?: Array<{ route?: { polyline?: unknown }; summary?: unknown }>;
          }>;
          summary?: unknown;
        };

        const responseData = response as unknown as VrpApiResponseShape;
        const vrpData = (responseData.response as VrpApiResponseShape | undefined) ?? responseData;

        const unassignedTasks = Array.isArray(vrpData.unassignedTasks)
          ? vrpData.unassignedTasks
          : [];
        const plan = vrpData.workDays?.[0]?.plans?.[0];
        const polyline = plan?.route?.polyline;
        const summaryData = plan?.summary || vrpData.summary;
        const summary = isVrpSummary(summaryData) ? summaryData : DEFAULT_VRP_SUMMARY;

        return {
          polyline,
          summary,
          unassignedTasks,
          unassignedCount: unassignedTasks.length,
        };
      };

      const callVrp = async (location?: { latitude: number; longitude: number } | null) => {
        const minTasks = location ? VRP_MIN_TASKS_WITH_USER : VRP_MIN_TASKS_WITHOUT_USER;
        if (tasks.length < minTasks) return null;

        // Cache por combinacao de pontos + localizacao (se houver)
        const userLocStr = location
          ? `${location.latitude.toFixed(VRP_LOCATION_PRECISION)},${location.longitude.toFixed(VRP_LOCATION_PRECISION)}`
          : "";
        const cacheKey = generateCacheKey(roteiros) + (userLocStr ? `:user:${userLocStr}` : "");

        const cached = getPolylineFromCache(cacheKey);
        if (cached) {
          logDebug("Polyline encontrada no cache");
          return { polyline: cached.polyline, summary: cached.summary };
        }

        const vehicle = createVirtualVehicle(roteiros, location);
        if (!vehicle || tasks.length < minTasks) {
          return null;
        }

        const request: VrpRouteRequest = {
          timezone: VRP_TIMEZONE,
          maxDaysWorking: VRP_MAX_DAYS_WORKING,
          vehicles: [vehicle],
          tasks,
        };

        logDebug("Chamando API VRP:", request);

        const response = await $fetch(VRP_API_URL + "/route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "x-api-key": VRP_API_KEY,
          },
          body: request,
        });

        logDebug("Resposta API VRP:", response);

        const parsed = parseVrpResponse(response);
        if (!parsed.polyline || typeof parsed.polyline !== "string") {
          return null;
        }

        const result = { polyline: parsed.polyline, summary: parsed.summary };

        // Salva no cache
        savePolylineToCache(cacheKey, result.polyline, result.summary);

        // Se houve tarefas nao atribuidas, tenta recalcular sem localizacao do usuario (quando aplicavel)
        if (parsed.unassignedCount > 0 && location) {
          logWarn(
            "VRP retornou tarefas nao atribuidas ao usar localizacao do usuario; usando fallback sem localizacao.",
            parsed.unassignedTasks,
          );
        }

        return result;
      };

      // 1) Tenta com a localização do usuário (se houver)
      const resultWithUser = await callVrp(userLocation);

      if (!resultWithUser && userLocation && tasks.length >= VRP_MIN_TASKS_WITHOUT_USER) {
        logWarn(
          "VRP nao conseguiu gerar polyline com localizacao do usuario; tentando sem localizacao.",
        );
        const fallback = await callVrp(null);
        if (fallback) return fallback;
      }

      if (resultWithUser) return resultWithUser;

      error.value = "API VRP não retornou polyline";
      return null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao calcular polyline";
      logError("calcularPolyline error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Busca roteiros de uma rota e calcula a polyline
   * @param idRota - ID da rota
   * @param userLocation - Localização atual do usuário (GPS) para usar como ponto de partida
   */
  const fetchRotaComPolyline = async (
    idRota: number,
    userLocation?: { latitude: number; longitude: number } | null,
  ): Promise<{
    rota: Rota | null;
    roteiros: Roteiro[];
    polyline: string | null;
    summary: VrpSummary | null;
  }> => {
    // Busca rota
    const rota = await fetchRotaById(idRota);

    // Busca roteiros
    const roteirosResponse = await fetchRoteiros(idRota, { itens: DEFAULT_ROTEIROS_PAGE_SIZE });
    const roteiros = roteirosResponse?.data || [];
    logDebug("fetchRotaComPolyline - Roteiros carregados:", roteiros.length);
    logDebug("fetchRotaComPolyline - Localizacao do usuario:", userLocation);

    const roteirosWithCoords = getRoteirosWithCoords(roteiros);
    const roteirosValidos = roteirosWithCoords.map((item) => item.roteiro);

    logDebug("fetchRotaComPolyline - Roteiros com coordenadas validas:", roteirosValidos.length);

    let polyline: string | null = null;
    let summary: VrpSummary | null = null;

    const minPontos = userLocation ? VRP_MIN_TASKS_WITH_USER : VRP_MIN_TASKS_WITHOUT_USER;

    if (roteirosValidos.length >= minPontos) {
      logDebug("fetchRotaComPolyline - Calculando polyline com userLocation:", !!userLocation);
      const result = await calcularPolyline(roteirosValidos, userLocation);
      if (result) {
        polyline = result.polyline;
        summary = result.summary;
        logDebug("fetchRotaComPolyline - Polyline calculada:", polyline?.substring(0, 50) + "...");
      } else {
        logDebug("fetchRotaComPolyline - Falha ao calcular polyline");
      }
    } else {
      logWarn(
        "fetchRotaComPolyline - Pontos insuficientes para calcular polyline (minimo:",
        minPontos,
        ")",
      );
    }

    return { rota, roteiros, polyline, summary };
  };

  /**
   * Limpa cache de polylines
   */
  const clearPolylineCache = (): void => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  };

  /**
   * Cria uma nova rota
   */
  const createRota = async (data: {
    tipo?: string;
    data_inicio: string;
    data_fim: string;
    observacao?: string;
  }): Promise<Rota | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);
      const response = await api<{ data: Rota }>(ROTAS_ENDPOINT, {
        method: "POST",
        body: {
          tipo: data.tipo || DEFAULT_ROTA_TIPO,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          observacao: data.observacao || "",
        },
      });

      return response?.data ? (schemaRota.parse(response.data) as Rota) : null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao criar rota";
      logError("createRota error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Cria um novo roteiro (ponto na rota)
   */
  const createRoteiro = async (payload: CreateRoteiroPayload): Promise<Roteiro | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);
      const response = await api<{ data: Roteiro }>(ROTEIRO_ENDPOINT, {
        method: "POST",
        body: payload,
      });

      // Limpa cache de polylines pois os pontos mudaram
      clearPolylineCache();

      return response?.data ? schemaRoteiro.parse(response.data) : null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao criar roteiro";
      logError("createRoteiro error:", err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Deleta um roteiro
   */
  const deleteRoteiro = async (id: number): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);
      await api(`${ROTEIRO_ENDPOINT}/${id}`, {
        method: "DELETE",
      });

      // Limpa cache de polylines pois os pontos mudaram
      clearPolylineCache();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao deletar roteiro";
      logError("deleteRoteiro error:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Atualiza a sequência de um roteiro
   * Usa PUT conforme a API NestJS (não PATCH)
   */
  const updateRoteiroSequencia = async (id: number, sequencia: number): Promise<boolean> => {
    error.value = null;

    try {
      const api = useMainApi(true);
      await api(`${ROTEIRO_ENDPOINT}/${id}`, {
        method: "PUT",
        body: { sequencia },
      });

      // Limpa cache de polylines
      clearPolylineCache();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao atualizar sequência";
      logError("updateRoteiroSequencia error:", err);
      return false;
    }
  };

  /**
   * Reordena múltiplos roteiros de uma vez
   * Como a API valida sequências duplicadas, usamos sequências temporárias
   * para evitar conflitos durante a reordenação
   */
  const reordenarRoteiros = async (
    roteiros: Array<{ id: number; sequencia: number }>,
  ): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const api = useMainApi(true);

      // Estratégia: usar sequências temporárias altas para evitar conflitos
      // 1. Primeiro move todos para sequências temporárias (10000+)
      // 2. Depois move para as sequências finais

      // Passo 1: Mover para sequências temporárias
      for (let i = 0; i < roteiros.length; i++) {
        const roteiro = roteiros[i];
        await api(`${ROTEIRO_ENDPOINT}/${roteiro.id}`, {
          method: "PUT",
          body: { sequencia: TEMP_SEQUENCE_BASE + i },
        });
      }

      // Passo 2: Mover para sequências finais
      for (const roteiro of roteiros) {
        await api(`${ROTEIRO_ENDPOINT}/${roteiro.id}`, {
          method: "PUT",
          body: { sequencia: roteiro.sequencia },
        });
      }

      // Limpa cache de polylines
      clearPolylineCache();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Erro ao reordenar roteiros";
      logError("reordenarRoteiros error:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // Estado
    isLoading,
    error,

    // Métodos de rotas
    fetchRotas,
    fetchRotaById,
    createRota,

    // Métodos de roteiros
    fetchRoteiros,
    createRoteiro,
    deleteRoteiro,
    updateRoteiroSequencia,
    reordenarRoteiros,

    // Métodos de polyline
    calcularPolyline,
    fetchRotaComPolyline,
    clearPolylineCache,

    // Utilitários
    isValidCoordinate,
  };
};

// Composable para usar em páginas com useAsyncData
export const useRotaAsyncData = () => {
  const service = useRotaService();

  const useRotasData = (filters?: Ref<RotaFilters>) => {
    return useAsyncData("rotas-list", () => service.fetchRotas(filters?.value), {
      watch: filters ? [filters] : undefined,
    });
  };

  const useRoteirosData = (idRota: Ref<number>) => {
    return useAsyncData(`roteiros-${idRota.value}`, () => service.fetchRoteiros(idRota.value), {
      watch: [idRota],
    });
  };

  return {
    ...service,
    useRotasData,
    useRoteirosData,
  };
};
