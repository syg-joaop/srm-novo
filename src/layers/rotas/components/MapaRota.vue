<template>
  <div class="h-full w-full relative">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-20"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ loadingMessage }}</span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-20"
    >
      <div class="text-center p-4">
        <AlertTriangle class="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ error }}</p>
        <button
          @click="recarregar"
          class="mt-3 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Tentar novamente
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="pontos.length === 0 && !isLoading"
      class="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-20"
    >
      <div class="text-center p-4">
        <MapIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">Nenhum ponto cadastrado nesta rota</p>
      </div>
    </div>

    <!-- Mapa (Leaflet/OpenStreetMap) -->
    <UiMapaRotas
      ref="mapaRef"
      :pontos="pontos"
      :polyline="polyline ?? undefined"
      :user-location="userLocation"
      :include-user-in-fit-bounds="true"
      :show-user-to-route-line="true"
      :show-sequence="true"
      :status-config="statusConfig"
      @marker-click="handleMarkerClick"
    />

    <!-- Aviso de rota -->
    <div
      v-if="routeWarning"
      class="absolute top-20 left-4 right-4 z-[2000] bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-lg shadow-lg p-3"
    >
      <div class="flex items-start gap-2 text-sm">
        <AlertTriangle class="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-orange-800 dark:text-orange-200 leading-snug">
            {{ routeWarning }}
          </p>
        </div>
      </div>
    </div>

    <!-- Aviso de permissão/localização -->
    <div
      v-if="geoError"
      class="absolute top-4 left-4 right-4 z-[2000] bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-3"
    >
      <div class="flex items-start gap-2 text-sm">
        <AlertTriangle class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div class="flex-1 min-w-0">
          <p class="text-yellow-800 dark:text-yellow-200 leading-snug">
            {{ geoError }}
          </p>
          <button
            class="mt-2 text-xs font-medium text-yellow-900 dark:text-yellow-100 underline"
            type="button"
            @click="recalcularApartirDeMim"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>

    <!-- Botão de localização -->
    <button
      class="absolute bottom-2 right-4 z-[2000] p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      :class="{ 'animate-pulse': isGettingLocation }"
      title="Minha localização"
      @click="recalcularApartirDeMim"
    >
      <Navigation
        class="w-5 h-5"
        :class="isGettingLocation ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'"
      />
    </button>

    <!-- Aviso de roteiros sem GPS -->
    <div
      v-if="roteirosInvalidos.length > 0 && !isLoading && !geoError"
      class="absolute top-4 left-4 right-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-3 z-[2000]"
    >
      <div class="flex items-start gap-2 text-sm">
        <AlertTriangle class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <span class="font-medium text-yellow-800 dark:text-yellow-200">
            {{ roteirosInvalidos.length }}
            {{ roteirosInvalidos.length === 1 ? "ponto" : "pontos" }} sem coordenadas GPS
          </span>
          <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
            Esses pontos não serão exibidos no mapa
          </p>
        </div>
      </div>
    </div>

    <!-- Resumo da rota (overlay) -->
    <div
      v-if="(summary || pontos.length > 0) && !isLoading"
      class="absolute bottom-2 left-4 right-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-[2000]"
    >
      <div class="flex items-center justify-between gap-4 text-sm flex-wrap">
        <div class="flex items-center gap-2">
          <MapPin class="w-4 h-4 text-primary-600" />
          <span class="text-gray-600 dark:text-gray-400">
            {{ pontos.length }} {{ pontos.length === 1 ? "ponto" : "pontos" }}
          </span>
        </div>

        <template v-if="summary">
          <div class="flex items-center gap-2">
            <TrendingUp class="w-4 h-4 text-primary-600" />
            <span class="text-gray-600 dark:text-gray-400">
              {{ formatarDistancia(summary.distance.meters) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-primary-600" />
            <span class="text-gray-600 dark:text-gray-400">
              {{ formatarDuracao(summary.time.duration + summary.time.traveling) }}
            </span>
          </div>
        </template>

        <div v-else class="text-xs text-gray-500 dark:text-gray-400">
          {{
            pontos.length >= 2 ? "Calculando rota..." : "Adicione mais pontos para calcular a rota"
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  Clock,
  Map as MapIcon,
  MapPin,
  Navigation,
  TrendingUp,
} from "lucide-vue-next";
import type { RotaPonto } from "~/components/ui/UiMapaRotas.vue";
import type { UiMapaStatusConfig } from "~/components/ui/maps.types";
import type { Roteiro, VrpSummary } from "../rotas.types";

const props = defineProps<{
  roteiros?: Roteiro[];
  polylineEncoded?: string | null;
  summaryData?: VrpSummary | null;
  idRota?: number;
  autoLoad?: boolean;
}>();

const emit = defineEmits<{
  (e: "pontoClick", roteiro: Roteiro): void;
  (e: "loaded", data: { polyline: string | null; summary: VrpSummary | null }): void;
}>();

const mapaRef = ref<{
  invalidateSize: () => void;
  panTo: (lat: number, lng: number, zoom?: number) => void;
} | null>(null);

const {
  position: geoPosition,
  getCurrentPosition,
  error: geoError,
  isLoading: isGettingLocation,
} = useGeolocation({
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 60_000,
});

const userLocation = computed(() => {
  if (!geoPosition.value) return null;
  return {
    latitude: geoPosition.value.latitude,
    longitude: geoPosition.value.longitude,
  };
});

// GeolocalizaÃ§Ã£o do usuÃ¡rio

// Estado local
const isLoading = ref(false);
const loadingMessage = ref("Carregando rota...");
const error = ref<string | null>(null);
const routeWarning = ref<string | null>(null);
const polyline = ref<string | null>(null);
const summary = ref<VrpSummary | null>(null);
const roteirosCarregados = ref<Roteiro[]>([]);

// LocalizaÃ§Ã£o do usuÃ¡rio para o mapa
// Service (auto-imported by Nuxt)
// eslint-disable-next-line no-undef
const rotaService = useRotaService();

// Status config para roteiros
const statusConfig: UiMapaStatusConfig = {
  aguardando: { color: "#6b7280", label: "Aguardando" },
  pendente: { color: "#f59e0b", label: "Pendente" },
  em_andamento: { color: "#3b82f6", label: "Em Andamento" },
  concluida: { color: "#10b981", label: "Concluída" },
  cancelada: { color: "#ef4444", label: "Cancelada" },
};

/**
 * Converte roteiros para pontos do mapa (formato Google Maps)
 */
const pontos = computed<RotaPonto[]>(() => {
  const source = props.roteiros || roteirosCarregados.value;

  return source
    .filter((r) => {
      // Filtra apenas roteiros com coordenadas vÃ¡lidas
      if (!r.endereco) return false;
      return isValidCoordinate(r.endereco.latitude, r.endereco.longitude);
    })
    .sort((a, b) => (a.sequencia || 0) - (b.sequencia || 0))
    .map((r) => {
      // Pega o Ãºltimo status do roteiro
      const ultimoStatus = r.srm_status_roteiro?.[0]?.status?.toLowerCase() || "aguardando";

      // Converte coordenadas para nÃºmero
      const lat =
        typeof r.endereco.latitude === "string"
          ? parseFloat(r.endereco.latitude)
          : r.endereco.latitude;
      const lng =
        typeof r.endereco.longitude === "string"
          ? parseFloat(r.endereco.longitude)
          : r.endereco.longitude;

      return {
        id: r.id,
        latitude: lat,
        longitude: lng,
        titulo: r.nome || `Ponto ${r.sequencia}`,
        subtitulo: r.observacao,
        sequencia: r.sequencia,
        status: ultimoStatus,
        endereco: {
          rua: r.endereco.logradouro,
          numero: r.endereco.numero,
          cidade: r.endereco.cidade,
          bairro: r.endereco.bairro,
        },
      };
    });
});

/**
 * Roteiros sem coordenadas vÃ¡lidas (para exibir aviso)
 */
const roteirosInvalidos = computed(() => {
  const source = props.roteiros || roteirosCarregados.value;
  return source.filter((r) => {
    if (!r.endereco) return true;
    return !isValidCoordinate(r.endereco.latitude, r.endereco.longitude);
  });
});

/**
 * Carrega roteiros e calcula polyline para exibiÃ§Ã£o no mapa
 */
const getRoteirosValidosParaCalculo = () => {
  const source = props.roteiros || roteirosCarregados.value;
  return source.filter((r) => {
    if (!r.endereco) return false;
    return isValidCoordinate(r.endereco.latitude, r.endereco.longitude);
  });
};

const calcularPolylineParaMapa = async (
  userLoc: { latitude: number; longitude: number } | null,
) => {
  const roteirosValidos = getRoteirosValidosParaCalculo();
  const minPontos = userLoc ? 1 : 2;

  if (roteirosValidos.length < minPontos) {
    polyline.value = null;
    summary.value = null;
    routeWarning.value = null;
    emit("loaded", { polyline: null, summary: null });
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    loadingMessage.value = userLoc ? "Calculando rota a partir de você..." : "Calculando rota...";

    const result = await rotaService.calcularPolyline(roteirosValidos, userLoc);

    polyline.value = result?.polyline ?? null;
    summary.value = result?.summary ?? null;
    routeWarning.value = result
      ? null
      : rotaService.error.value ||
        "Não foi possível calcular a rota. Exibindo linha reta entre os pontos.";

    emit("loaded", { polyline: polyline.value, summary: summary.value });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao calcular rota";
    console.error("[MapaRota] calcularPolylineParaMapa error:", err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = "Carregando rota...";
  }
};

const recalcularApartirDeMim = async () => {
  const roteirosValidos = getRoteirosValidosParaCalculo();
  if (roteirosValidos.length === 0) return;

  isLoading.value = true;
  error.value = null;

  try {
    loadingMessage.value = "Obtendo sua localizaÃ§Ã£o...";
    const pos = await getCurrentPosition();
    if (!pos) return;

    mapaRef.value?.panTo(pos.latitude, pos.longitude, 15);

    loadingMessage.value = "Calculando rota...";
    const result = await rotaService.calcularPolyline(roteirosValidos, {
      latitude: pos.latitude,
      longitude: pos.longitude,
    });

    polyline.value = result?.polyline ?? null;
    summary.value = result?.summary ?? null;
    routeWarning.value = result
      ? null
      : rotaService.error.value ||
        "NÃ†o foi possÂ¡vel calcular a rota. Exibindo linha reta entre os pontos.";

    emit("loaded", { polyline: polyline.value, summary: summary.value });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao calcular rota";
    console.error("[MapaRota] recalcularApartirDeMim error:", err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = "Carregando rota...";
  }
};

const carregarRota = async () => {
  if (!props.idRota) return;

  isLoading.value = true;
  error.value = null;

  try {
    loadingMessage.value = "Carregando rota...";

    const result = await rotaService.fetchRotaComPolyline(props.idRota, userLocation.value);

    roteirosCarregados.value = result.roteiros;
    polyline.value = result.polyline;
    summary.value = result.summary;

    emit("loaded", { polyline: result.polyline, summary: result.summary });

    console.log("[MapaRota] Rota carregada:", {
      roteiros: result.roteiros.length,
      polyline: result.polyline ? "sim" : "não",
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro ao carregar rota";
    console.error("[MapaRota] carregarRota error:", err);
  } finally {
    isLoading.value = false;
    loadingMessage.value = "Carregando rota...";
  }
};

/**
 * Recarrega a rota
 */
const recarregar = () => {
  carregarRota();
};

/**
 * Handler de clique no marker
 */
const handleMarkerClick = (ponto: RotaPonto) => {
  const source = props.roteiros || roteirosCarregados.value;
  const roteiro = source.find((r) => r.id === ponto.id);
  if (roteiro) {
    emit("pontoClick", roteiro);
  }
};

/**
 * ForÃ§a resize do mapa (Ãºtil quando o container muda de tamanho)
 */
const invalidateSize = () => {
  mapaRef.value?.invalidateSize();
};

// Watch para polyline/summary passados como prop
watch(
  () => props.polylineEncoded,
  (newVal) => {
    if (newVal !== undefined) {
      polyline.value = newVal;
      if (newVal) routeWarning.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => props.summaryData,
  (newVal) => {
    if (newVal !== undefined) {
      summary.value = newVal;
    }
  },
  { immediate: true },
);

watch(
  () => props.roteiros,
  (newVal) => {
    if (!newVal || newVal.length === 0) return;
    if (props.polylineEncoded) return;
    calcularPolylineParaMapa(userLocation.value);
  },
  { deep: true, immediate: true },
);

// Auto-load se configurado
onMounted(() => {
  if (props.autoLoad && props.idRota) {
    carregarRota();
  }
});

// Watch para mudança de idRota
watch(
  () => props.idRota,
  (newId) => {
    if (props.autoLoad && newId) {
      carregarRota();
    }
  },
);

defineExpose({ invalidateSize, carregarRota });
</script>
