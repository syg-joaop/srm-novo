<template>
  <div class="relative w-full h-full">
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Botão de geolocalização estilo Google Maps -->
    <button
      v-if="showMyLocationButton"
      class="absolute bottom-24 right-3 z-[1000] bg-white rounded-sm shadow-md hover:shadow-lg transition-shadow w-10 h-10 flex items-center justify-center border border-gray-300"
      :class="{ 'bg-blue-50': isGettingLocation }"
      title="Minha localização"
      @click="goToMyLocation"
    >
      <svg
        v-if="!isGettingLocation"
        class="w-5 h-5 text-gray-700"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </svg>
      <svg
        v-else
        class="w-5 h-5 text-blue-600 animate-pulse"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
      </svg>
    </button>

    <!-- Mensagem de erro de geolocalização -->
    <div
      v-if="geoError"
      class="absolute top-4 left-4 right-4 z-[1000] bg-white rounded shadow-lg p-3 border border-yellow-400"
    >
      <div class="flex items-start gap-2 text-sm">
        <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <div class="flex-1">
          <p class="text-gray-800">{{ geoError }}</p>
          <button
            class="mt-2 text-xs font-medium text-blue-600 hover:underline"
            @click="goToMyLocation"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { UiMapaPonto, UiMapaStatusConfig } from "./maps.types";

const props = withDefaults(
  defineProps<{
    pontos?: UiMapaPonto[];
    centro?: [number, number];
    zoomInicial?: number;
    fitBoundsPadding?: [number, number];
    autoFitBounds?: boolean;
    statusConfig?: UiMapaStatusConfig;
    showMyLocationButton?: boolean;
    mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
  }>(),
  {
    pontos: () => [],
    centro: () => [-15.7801, -47.9292] as [number, number],
    zoomInicial: 4,
    fitBoundsPadding: () => [50, 50],
    autoFitBounds: true,
    showMyLocationButton: true,
    mapType: "roadmap",
    statusConfig: () => ({
      ativo: { color: "#10b981", label: "Ativo" },
      alerta: { color: "#f59e0b", label: "Alerta" },
      inativo: { color: "#ef4444", label: "Inativo" },
    }),
  },
);

const resolvedStatusConfig = computed<UiMapaStatusConfig>(() => ({
  ativo: { color: "#10b981", label: "Ativo" },
  alerta: { color: "#f59e0b", label: "Alerta" },
  inativo: { color: "#ef4444", label: "Inativo" },
  ...props.statusConfig,
}));

const mapContainer = ref<HTMLElement | null>(null);
const isGettingLocation = ref(false);
const geoError = ref<string | null>(null);

let map: L.Map | null = null;
let markers: L.Marker[] = [];
let userMarker: L.CircleMarker | null = null;

// Geolocalização
const { position, getCurrentPosition, error } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
});

// Observa erros de geolocalização
watch(error, (newError) => {
  if (newError) {
    geoError.value = newError;
  }
});

const normalizeStatus = (status?: string) => (status ?? "").toLowerCase().trim();

const getStatusConfig = (status?: string) => {
  const normalized = normalizeStatus(status);
  return resolvedStatusConfig.value[normalized] || resolvedStatusConfig.value.inativo;
};

// Tiles do Google Maps (gratuito, sem API key)
const getTileLayerConfig = (type: string) => {
  const configs = {
    roadmap: {
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
    },
    satellite: {
      url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
    },
    hybrid: {
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
    },
    terrain: {
      url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
    },
  };

  return configs[type as keyof typeof configs] || configs.roadmap;
};

const createCustomIcon = (status?: string) => {
  const { color } = getStatusConfig(status);
  const html = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const createPopupHtml = (ponto: UiMapaPonto) => {
  if (ponto.popupHtml) return ponto.popupHtml;

  const { color, label } = getStatusConfig(ponto.status);

  const subtitleHtml = ponto.subtitulo
    ? `<p style="color: #666; margin-bottom: 4px;">${ponto.subtitulo}</p>`
    : "";

  const linesHtml = (ponto.linhas ?? [])
    .map(
      (line) => `<p style="margin-bottom: 4px;"><strong>${line.rotulo}:</strong> ${line.valor}</p>`,
    )
    .join("");

  return `
    <div style="min-width: 200px;">
      <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
        ${ponto.titulo}
      </h3>
      ${subtitleHtml}
      ${linesHtml}
      <p style="margin-bottom: 0;">
        <strong>Status:</strong>
        <span style="color: ${color}; font-weight: bold;">${label}</span>
      </p>
    </div>
  `;
};

const clearMarkers = () => {
  markers.forEach((m) => m.remove());
  markers = [];
};

const toNumber = (value: number | string) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const addMarker = (ponto: UiMapaPonto) => {
  if (!map) return null;

  const lat = toNumber(ponto.latitude);
  const lng = toNumber(ponto.longitude);
  if (lat === null || lng === null) return null;

  const marker = L.marker([lat, lng], {
    icon: createCustomIcon(ponto.status),
  });

  marker.bindPopup(createPopupHtml(ponto));
  marker.addTo(map);
  markers.push(marker);

  return [lat, lng] as [number, number];
};

const updateUserLocationMarker = (lat: number, lng: number) => {
  if (!map) return;

  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    // Cria marcador estilo Google Maps (círculo azul com borda branca)
    userMarker = L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: "#4285F4",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 1,
    });

    // Adiciona círculo de precisão
    const accuracyCircle = L.circle([lat, lng], {
      radius: 50, // Pode ajustar baseado na precisão real
      fillColor: "#4285F4",
      color: "#4285F4",
      weight: 1,
      opacity: 0.2,
      fillOpacity: 0.1,
    });

    userMarker.addTo(map);
    accuracyCircle.addTo(map);

    userMarker.bindPopup("Sua localização atual");
  }
};

const goToMyLocation = async () => {
  isGettingLocation.value = true;
  geoError.value = null;

  try {
    const pos = await getCurrentPosition();

    if (pos && map) {
      updateUserLocationMarker(pos.latitude, pos.longitude);
      map.flyTo([pos.latitude, pos.longitude], 15, {
        duration: 1,
      });
    }
  } catch (err) {
    geoError.value = "Não foi possível obter sua localização";
  } finally {
    isGettingLocation.value = false;
  }
};

const updateMapMarkers = () => {
  if (!map) return;

  clearMarkers();

  const validBounds: [number, number][] = [];

  for (const ponto of props.pontos) {
    const coords = addMarker(ponto);
    if (coords) validBounds.push(coords);
  }

  if (props.autoFitBounds && validBounds.length > 0) {
    map.fitBounds(validBounds, { padding: props.fitBoundsPadding });
    return;
  }

  map.setView(props.centro, props.zoomInicial);
};

const initMap = async () => {
  if (!mapContainer.value || map) return;

  const tileConfig = getTileLayerConfig(props.mapType);

  map = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: true,
  }).setView(props.centro, props.zoomInicial);

  L.tileLayer(tileConfig.url, {
    attribution: tileConfig.attribution,
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }).addTo(map);

  await nextTick();
  map.invalidateSize();

  updateMapMarkers();

  // Tenta obter localizaÃ§Ã£o inicial
  if (props.showMyLocationButton && position.value) {
    updateUserLocationMarker(position.value.latitude, position.value.longitude);
  }
};

// Observa mudanças na posição do usuário
watch(position, (newPos) => {
  if (newPos && map && !isGettingLocation.value) {
    updateUserLocationMarker(newPos.latitude, newPos.longitude);
  }
}, { deep: true });

watch(() => props.pontos, updateMapMarkers, { deep: true });

onMounted(initMap);

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

defineExpose({
  goToMyLocation,
  map,
});
</script>
