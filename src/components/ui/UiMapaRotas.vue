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
        <path
          d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
        />
      </svg>
      <svg
        v-else
        class="w-5 h-5 text-blue-600 animate-pulse"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { UiMapaStatusConfig } from "./maps.types";

export interface RotaPonto {
  id: number | string;
  latitude: number | string;
  longitude: number | string;
  titulo: string;
  subtitulo?: string;
  sequencia?: number;
  status?: string;
  endereco?: {
    rua?: string;
    numero?: string;
    cidade?: string;
    bairro?: string;
  };
}

export interface RotaPolylineConfig {
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
}

const props = withDefaults(
  defineProps<{
    pontos?: RotaPonto[];
    polyline?: string; // Encoded polyline string
    polylineCoords?: [number, number][]; // Ou coordenadas jÃ¡ decodificadas
    centro?: [number, number];
    zoomInicial?: number;
    fitBoundsPadding?: [number, number];
    autoFitBounds?: boolean;
    showSequence?: boolean;
    statusConfig?: UiMapaStatusConfig;
    polylineConfig?: RotaPolylineConfig;
    mapType?: "roadmap" | "satellite" | "hybrid" | "terrain";
    userLocation?: { latitude: number; longitude: number } | null;
    includeUserInFitBounds?: boolean;
    showUserToRouteLine?: boolean;
    showMyLocationButton?: boolean;
  }>(),
  {
    pontos: () => [],
    centro: () => [-15.7801, -47.9292] as [number, number],
    zoomInicial: 4,
    fitBoundsPadding: () => [50, 50],
    autoFitBounds: true,
    showSequence: true,
    statusConfig: () => ({
      aguardando: { color: "#6b7280", label: "Aguardando" },
      pendente: { color: "#f59e0b", label: "Pendente" },
      em_andamento: { color: "#3b82f6", label: "Em Andamento" },
      concluida: { color: "#10b981", label: "Concluída" },
      cancelada: { color: "#ef4444", label: "Cancelada" },
    }),
    polylineConfig: () => ({
      color: "#4285F4", // Cor do Google Maps
      weight: 5,
      opacity: 1,
    }),
    mapType: "roadmap",
    userLocation: null,
    includeUserInFitBounds: false,
    showUserToRouteLine: true,
    showMyLocationButton: true,
  },
);

// Geolocalização

const { position: geoPosition, getCurrentPosition } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000,
});

const isGettingLocation = ref(false);

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

const emit = defineEmits<{
  (e: "markerClick", ponto: RotaPonto): void;
}>();

const resolvedStatusConfig = computed<UiMapaStatusConfig>(() => ({
  aguardando: { color: "#6b7280", label: "Aguardando" },
  pendente: { color: "#f59e0b", label: "Pendente" },
  em_andamento: { color: "#3b82f6", label: "Em Andamento" },
  concluida: { color: "#10b981", label: "Concluída" },
  cancelada: { color: "#ef4444", label: "Cancelada" },
  ...props.statusConfig,
}));

const mapContainer = ref<HTMLElement | null>(null);
let map: L.Map | null = null;
let markers: L.Marker[] = [];
let polylineLayer: L.Polyline | null = null;
let userMarker: L.CircleMarker | null = null;
let userToRouteLayer: L.Polyline | null = null;

const normalizeStatus = (status?: string) => (status ?? "aguardando").toLowerCase().trim();

const getStatusConfig = (status?: string) => {
  const normalized = normalizeStatus(status);
  return resolvedStatusConfig.value[normalized] || resolvedStatusConfig.value.aguardando;
};

/**
 * Cria Ã­cone numerado para o marker
 */
const createSequenceIcon = (sequencia: number, status?: string) => {
  const { color } = getStatusConfig(status);

  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    ">${sequencia}</div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

/**
 * Cria Ã­cone simples (sem nÃºmero)
 */
const createSimpleIcon = (status?: string) => {
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

/**
 * Cria HTML do popup
 */
const createPopupHtml = (ponto: RotaPonto) => {
  const { color, label } = getStatusConfig(ponto.status);

  const subtitleHtml = ponto.subtitulo
    ? `<p style="color: #666; margin-bottom: 4px;">${ponto.subtitulo}</p>`
    : "";

  const enderecoHtml = ponto.endereco
    ? `<p style="margin-bottom: 4px; color: #666; font-size: 12px;">
        ${[ponto.endereco.rua, ponto.endereco.numero, ponto.endereco.bairro, ponto.endereco.cidade]
          .filter(Boolean)
          .join(", ")}
       </p>`
    : "";

  const sequenciaHtml =
    ponto.sequencia !== undefined
      ? `<p style="margin-bottom: 4px;"><strong>Sequência:</strong> ${ponto.sequencia}</p>`
      : "";

  return `
    <div style="min-width: 200px;">
      <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
        ${ponto.titulo}
      </h3>
      ${subtitleHtml}
      ${enderecoHtml}
      ${sequenciaHtml}
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

const clearPolyline = () => {
  if (polylineLayer) {
    polylineLayer.remove();
    polylineLayer = null;
  }
};

const clearUserLocation = () => {
  if (userMarker) {
    userMarker.remove();
    userMarker = null;
  }
};

const clearUserToRouteLine = () => {
  if (userToRouteLayer) {
    userToRouteLayer.remove();
    userToRouteLayer = null;
  }
};

const toNumber = (value: number | string) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Adiciona marker ao mapa
 */
const addMarker = (ponto: RotaPonto) => {
  if (!map) return null;

  const lat = toNumber(ponto.latitude);
  const lng = toNumber(ponto.longitude);
  if (lat === null || lng === null) return null;

  const icon =
    props.showSequence && ponto.sequencia !== undefined
      ? createSequenceIcon(ponto.sequencia, ponto.status)
      : createSimpleIcon(ponto.status);

  const marker = L.marker([lat, lng], { icon });

  marker.bindPopup(createPopupHtml(ponto));
  marker.on("click", () => emit("markerClick", ponto));
  marker.addTo(map);
  markers.push(marker);

  return [lat, lng] as [number, number];
};

/**
 * Renderiza a polyline no mapa
 */
const renderPolyline = () => {
  if (!map) return;

  clearPolyline();

  let coordinates: [number, number][] = [];
  let isFallback = false;

  // Se tiver polyline encoded, decodifica
  if (props.polyline) {
    const normalized = props.polyline.trim().replace(/\s+/g, "");
    const encoded =
      (normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'"))
        ? normalized.slice(1, -1)
        : normalized;

    if (!encoded) return;

    const isValidLatLng = (lat: number, lng: number) =>
      Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

    const getBoundsCenter = (coords: [number, number][]): [number, number] | null => {
      if (coords.length === 0) return null;

      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      for (const [lat, lng] of coords) {
        if (!isValidLatLng(lat, lng)) continue;
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      }

      if (!Number.isFinite(minLat) || !Number.isFinite(minLng)) return null;
      return [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
    };

    const referenceCoords: [number, number][] = [];
    for (const ponto of props.pontos) {
      const lat = toNumber(ponto.latitude);
      const lng = toNumber(ponto.longitude);
      if (lat === null || lng === null) continue;
      referenceCoords.push([lat, lng]);
    }

    const refCenter = getBoundsCenter(referenceCoords);

    const decoded5 = decodePolyline(encoded, 5).filter(([lat, lng]) => isValidLatLng(lat, lng));
    const decoded6 = decodePolyline(encoded, 6).filter(([lat, lng]) => isValidLatLng(lat, lng));

    coordinates = decodePolyline(encoded).filter(([lat, lng]) => isValidLatLng(lat, lng));

    if (refCenter) {
      const dist2 = (a: [number, number], b: [number, number]) =>
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

      const center5 = getBoundsCenter(decoded5);
      const center6 = getBoundsCenter(decoded6);

      const score5 = center5 ? dist2(center5, refCenter) : Number.POSITIVE_INFINITY;
      const score6 = center6 ? dist2(center6, refCenter) : Number.POSITIVE_INFINITY;

      coordinates = score6 < score5 ? decoded6 : decoded5;
    }
  }
  // Se tiver coordenadas jÃ¡ decodificadas
  else if (props.polylineCoords && props.polylineCoords.length > 0) {
    coordinates = props.polylineCoords;
  }

  // Fallback: desenha uma linha reta conectando os pontos quando não há polyline (ou decode falha).
  if (coordinates.length < 2) {
    const fallbackCoords: [number, number][] = [];
    const sortedPontos = [...props.pontos].sort((a, b) => (a.sequencia || 0) - (b.sequencia || 0));

    for (const ponto of sortedPontos) {
      const lat = toNumber(ponto.latitude);
      const lng = toNumber(ponto.longitude);
      if (lat === null || lng === null) continue;
      fallbackCoords.push([lat, lng]);
    }

    if (fallbackCoords.length >= 2) {
      coordinates = fallbackCoords;
      isFallback = true;
    }
  }

  if (coordinates.length < 2) return;

  const fallbackConfig: RotaPolylineConfig = {
    color: "#9ca3af",
    weight: 3,
    opacity: 0.75,
    dashArray: "6 6",
  };

  const finalConfig = isFallback
    ? { ...props.polylineConfig, ...fallbackConfig }
    : props.polylineConfig;

  polylineLayer = L.polyline(coordinates, {
    color: finalConfig.color,
    weight: finalConfig.weight,
    opacity: finalConfig.opacity,
    dashArray: finalConfig.dashArray,
    lineJoin: "round",
    lineCap: "round",
  });

  polylineLayer.addTo(map);
};

/**
 * Atualiza markers e polyline
 */
const updateMap = () => {
  if (!map) return;

  clearMarkers();
  renderPolyline();
  clearUserToRouteLine();

  const validBounds: [number, number][] = [];

  // Adiciona pontos ordenados por sequÃªncia
  const sortedPontos = [...props.pontos].sort((a, b) => (a.sequencia || 0) - (b.sequencia || 0));

  for (const ponto of sortedPontos) {
    const coords = addMarker(ponto);
    if (coords) validBounds.push(coords);
  }

  // Se tiver polyline, adiciona seus bounds tambÃ©m
  if (polylineLayer) {
    const polylineBounds = polylineLayer.getBounds();
    if (polylineBounds.isValid()) {
      validBounds.push([polylineBounds.getSouth(), polylineBounds.getWest()]);
      validBounds.push([polylineBounds.getNorth(), polylineBounds.getEast()]);
    }
  }

  const hasRouteBounds = validBounds.length > 0;

  // Marker da localizaÃ‡ÃµÃ‡Å“o do usuÃ‡Â­rio (nÃ‡Å“o entra no fitBounds quando hÃ‡Â­ rota)
  let userCoords: [number, number] | null = null;

  if (props.userLocation) {
    const lat = toNumber(props.userLocation.latitude);
    const lng = toNumber(props.userLocation.longitude);
    if (lat !== null && lng !== null) {
      userCoords = [lat, lng];

      if (!userMarker) {
        userMarker = L.circleMarker(userCoords, {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: "#2563eb",
          fillOpacity: 1,
        }).addTo(map);
        userMarker.bindPopup("Sua localização");
      } else {
        userMarker.setLatLng(userCoords);
      }
    } else {
      clearUserLocation();
    }
  } else {
    clearUserLocation();
  }

  if ((!hasRouteBounds || props.includeUserInFitBounds) && userCoords) {
    validBounds.push(userCoords);
  }

  // Linha tracejada: usuario -> inicio da rota
  if (props.showUserToRouteLine && userCoords) {
    let routeStart: [number, number] | null = null;

    if (polylineLayer) {
      const latLngs = polylineLayer.getLatLngs() as L.LatLng[];
      const first = latLngs?.[0];
      if (first) routeStart = [first.lat, first.lng];
    }

    if (!routeStart && sortedPontos.length > 0) {
      const firstPonto = sortedPontos[0];
      const lat = toNumber(firstPonto.latitude);
      const lng = toNumber(firstPonto.longitude);
      if (lat !== null && lng !== null) routeStart = [lat, lng];
    }

    if (routeStart) {
      userToRouteLayer = L.polyline([userCoords, routeStart], {
        color: "#2563eb",
        weight: 3,
        opacity: 0.6,
        dashArray: "4 6",
        lineJoin: "round",
        lineCap: "round",
      }).addTo(map);
    }
  }

  // Ajusta view aos bounds
  if (props.autoFitBounds && validBounds.length > 0) {
    map.fitBounds(validBounds, { padding: props.fitBoundsPadding });
    return;
  }

  map.setView(props.centro, props.zoomInicial);
};

/**
 * Vai para localizaÃ§Ã£o do usuÃ¡rio
 */
const goToMyLocation = async () => {
  isGettingLocation.value = true;

  try {
    const pos = await getCurrentPosition();

    if (pos && map) {
      // Atualiza ou cria marker do usuÃ¡rio
      if (!userMarker) {
        userMarker = L.circleMarker([pos.latitude, pos.longitude], {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: "#4285F4",
          fillOpacity: 1,
        }).addTo(map);
        userMarker.bindPopup("Sua localização");
      } else {
        userMarker.setLatLng([pos.latitude, pos.longitude]);
      }

      map.flyTo([pos.latitude, pos.longitude], 15, {
        duration: 1,
      });
    }
  } catch (err) {
    console.error("[UiMapaRotas] Erro ao obter localizaÃ§Ã£o:", err);
  } finally {
    isGettingLocation.value = false;
  }
};

/**
 * Inicializa o mapa
 */
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

  updateMap();

  // Tenta obter localizaÃ§Ã£o inicial
  if (props.showMyLocationButton && geoPosition.value) {
    if (!userMarker) {
      userMarker = L.circleMarker([geoPosition.value.latitude, geoPosition.value.longitude], {
        radius: 8,
        color: "#ffffff",
        weight: 2,
        fillColor: "#4285F4",
        fillOpacity: 1,
      }).addTo(map);
      userMarker.bindPopup("Sua localização");
    }
  }
};

// Watchers
watch(() => props.pontos, updateMap, { deep: true });
watch(() => props.polyline, updateMap);
watch(() => props.polylineCoords, updateMap, { deep: true });
watch(() => props.userLocation, updateMap, { deep: true });

onMounted(initMap);

onUnmounted(() => {
  clearMarkers();
  clearPolyline();
  clearUserLocation();
  clearUserToRouteLine();
  if (map) {
    map.remove();
    map = null;
  }
});

/**
 * MÃ©todo exposto para forÃ§ar resize do mapa
 */
const invalidateSize = () => {
  if (map) {
    map.invalidateSize();
    setTimeout(() => updateMap(), 0);
  }
};

const panTo = (lat: number, lng: number, zoom?: number) => {
  if (!map) return;
  const nextZoom = typeof zoom === "number" ? zoom : map.getZoom();
  map.setView([lat, lng], nextZoom);
};

defineExpose({ invalidateSize, panTo, goToMyLocation });
</script>

<style scoped>
/* Fix para markers do Leaflet */
:deep(.leaflet-marker-icon) {
  background: none;
  border: none;
}
</style>
