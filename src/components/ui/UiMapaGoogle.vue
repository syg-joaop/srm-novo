<template>
  <div class="relative w-full h-full">
    <!-- Mapa -->
    <div ref="mapContainer" class="w-full h-full"></div>

    <!-- Aviso de permissão/localização -->
    <div
      v-if="geoError"
      class="absolute top-4 left-4 right-4 z-10 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg shadow-lg p-3"
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
            @click="goToMyLocation"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="isLoadingMap"
      class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">Carregando mapa...</span>
      </div>
    </div>

    <!-- Botão de localização -->
    <button
      v-if="showMyLocationButton"
      class="absolute bottom-4 right-4 z-10 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      :class="{ 'animate-pulse': isGettingLocation }"
      title="Minha localização"
      @click="goToMyLocation"
    >
      <Navigation
        class="w-5 h-5"
        :class="isGettingLocation ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'"
      />
    </button>

    <!-- Error overlay -->
    <div
      v-if="mapError"
      class="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10"
    >
      <div class="text-center p-4">
        <AlertTriangle class="w-12 h-12 text-red-500 mx-auto mb-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ mapError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Navigation } from "lucide-vue-next";
import type { UiMapaStatusConfig } from "./maps.types";

export interface GoogleMapPonto {
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

const props = withDefaults(
  defineProps<{
    pontos?: GoogleMapPonto[];
    polyline?: string;
    userLocation?: { latitude: number; longitude: number } | null;
    centro?: [number, number];
    zoomInicial?: number;
    autoFitBounds?: boolean;
    showSequence?: boolean;
    showMyLocationButton?: boolean;
    statusConfig?: UiMapaStatusConfig;
    apiKey: string;
  }>(),
  {
    pontos: () => [],
    centro: () => [-15.7801, -47.9292] as [number, number],
    zoomInicial: 4,
    autoFitBounds: true,
    showSequence: true,
    showMyLocationButton: true,
    statusConfig: () => ({
      aguardando: { color: "#6b7280", label: "Aguardando" },
      pendente: { color: "#f59e0b", label: "Pendente" },
      em_andamento: { color: "#3b82f6", label: "Em Andamento" },
      concluida: { color: "#10b981", label: "Concluída" },
      cancelada: { color: "#ef4444", label: "Cancelada" },
    }),
  },
);

const emit = defineEmits<{
  (e: "markerClick", ponto: GoogleMapPonto): void;
  (e: "mapReady"): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
const isLoadingMap = ref(true);
const mapError = ref<string | null>(null);
const isGettingLocation = ref(false);

let map: google.maps.Map | null = null;
let markers: google.maps.Marker[] = [];
let polylineLayer: google.maps.Polyline | null = null;
let userMarker: google.maps.Marker | null = null;
let directionsRenderer: google.maps.DirectionsRenderer | null = null;

// GeolocalizaÃ§Ã£o
const { position, getCurrentPosition, error: geoError } = useGeolocation({
  enableHighAccuracy: false,
  timeout: 20000,
  maximumAge: 60_000,
});

const resolvedStatusConfig = computed<UiMapaStatusConfig>(() => ({
  aguardando: { color: "#6b7280", label: "Aguardando" },
  pendente: { color: "#f59e0b", label: "Pendente" },
  em_andamento: { color: "#3b82f6", label: "Em Andamento" },
  concluida: { color: "#10b981", label: "Concluída" },
  cancelada: { color: "#ef4444", label: "Cancelada" },
  ...props.statusConfig,
}));

const normalizeStatus = (status?: string) => (status ?? "aguardando").toLowerCase().trim();

const getStatusConfig = (status?: string) => {
  const normalized = normalizeStatus(status);
  return resolvedStatusConfig.value[normalized] || resolvedStatusConfig.value.aguardando;
};

const toNumber = (value: number | string) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

/**
 * Cria Ã­cone SVG para marker numerado
 */
const createMarkerIcon = (sequencia: number, status?: string): string => {
  const { color } = getStatusConfig(status);

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="Arial">${sequencia}</text>
    </svg>
  `)}`;
};

/**
 * Cria Ã­cone para localizaÃ§Ã£o do usuÃ¡rio
 */
const createUserLocationIcon = (): string => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#4285f4" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `)}`;
};

/**
 * Limpa markers do mapa
 */
const clearMarkers = () => {
  markers.forEach((m) => m.setMap(null));
  markers = [];
};

/**
 * Limpa polyline do mapa
 */
const clearPolyline = () => {
  if (polylineLayer) {
    polylineLayer.setMap(null);
    polylineLayer = null;
  }
  if (directionsRenderer) {
    directionsRenderer.setMap(null);
    directionsRenderer = null;
  }
};

/**
 * Adiciona marker ao mapa
 */
const addMarker = (ponto: GoogleMapPonto): google.maps.LatLng | null => {
  if (!map) return null;

  const lat = toNumber(ponto.latitude);
  const lng = toNumber(ponto.longitude);
  if (lat === null || lng === null) return null;

  const position = new google.maps.LatLng(lat, lng);
  const { label } = getStatusConfig(ponto.status);

  const marker = new google.maps.Marker({
    position,
    map,
    icon: {
      url: createMarkerIcon(ponto.sequencia || 0, ponto.status),
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20),
    },
    title: ponto.titulo,
  });

  // Info window
  const infoContent = `
    <div style="min-width: 200px; padding: 8px;">
      <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${ponto.titulo}</h3>
      ${ponto.subtitulo ? `<p style="color: #666; margin-bottom: 4px;">${ponto.subtitulo}</p>` : ""}
      ${
        ponto.endereco
          ? `<p style="margin-bottom: 4px; color: #666; font-size: 12px;">
        ${[ponto.endereco.rua, ponto.endereco.numero, ponto.endereco.bairro, ponto.endereco.cidade].filter(Boolean).join(", ")}
      </p>`
          : ""
      }
      ${ponto.sequencia !== undefined ? `<p style="margin-bottom: 4px;"><strong>Sequência:</strong> ${ponto.sequencia}</p>` : ""}
      <p><strong>Status:</strong> <span style="color: ${getStatusConfig(ponto.status).color}; font-weight: bold;">${label}</span></p>
    </div>
  `;

  const infoWindow = new google.maps.InfoWindow({ content: infoContent });

  marker.addListener("click", () => {
    infoWindow.open(map, marker);
    emit("markerClick", ponto);
  });

  markers.push(marker);
  return position;
};

/**
 * Atualiza marker de localizaÃ§Ã£o do usuÃ¡rio
 */
const updateUserLocationMarker = (lat: number, lng: number) => {
  if (!map) return;

  const position = new google.maps.LatLng(lat, lng);

  if (userMarker) {
    userMarker.setPosition(position);
  } else {
    userMarker = new google.maps.Marker({
      position,
      map,
      icon: {
        url: createUserLocationIcon(),
        scaledSize: new google.maps.Size(24, 24),
        anchor: new google.maps.Point(12, 12),
      },
      title: "Sua localizaÃ§Ã£o",
      zIndex: 1000,
    });
  }
};

/**
 * Renderiza polyline no mapa
 */
const renderPolyline = () => {
  if (!map) return;

  clearPolyline();

  if (!props.polyline) return;

  const normalized = props.polyline.trim().replace(/\s+/g, "");
  const encoded =
    (normalized.startsWith("\"") && normalized.endsWith("\"")) ||
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

  // A API que fornece a polyline pode usar precisÃ£o 5 (Google) ou 6 (polyline6).
  // Escolhe a melhor decodificaÃ§Ã£o comparando com o "centro" dos pontos exibidos.
  let decoded5: [number, number][] = [];

  const googleDecodePath = window.google?.maps?.geometry?.encoding?.decodePath;
  if (googleDecodePath) {
    try {
      decoded5 = googleDecodePath(encoded).map((p) => [p.lat(), p.lng()] as [number, number]);
    } catch (err) {
      console.warn("[UiMapaGoogle] Falha ao decodificar polyline via google geometry:", err);
    }
  }

  if (decoded5.length === 0) {
    decoded5 = decodePolyline(encoded, 5);
  }

  decoded5 = decoded5.filter(([lat, lng]) => isValidLatLng(lat, lng));

  const decoded6 = decodePolyline(encoded, 6).filter(([lat, lng]) =>
    isValidLatLng(lat, lng),
  );

  let coordinates = decodePolyline(encoded).filter(([lat, lng]) => isValidLatLng(lat, lng));

  if (refCenter) {
    const dist2 = (a: [number, number], b: [number, number]) =>
      (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

    const center5 = getBoundsCenter(decoded5);
    const center6 = getBoundsCenter(decoded6);

    const score5 = center5 ? dist2(center5, refCenter) : Number.POSITIVE_INFINITY;
    const score6 = center6 ? dist2(center6, refCenter) : Number.POSITIVE_INFINITY;

    coordinates = score6 < score5 ? decoded6 : decoded5;
  }

  if (coordinates.length < 2) return;

  const path = coordinates.map(([lat, lng]) => new google.maps.LatLng(lat, lng));

  polylineLayer = new google.maps.Polyline({
    path,
    geodesic: true,
    strokeColor: "#4285f4",
    strokeOpacity: 1.0,
    strokeWeight: 4,
    map,
  });
};

/**
 * Atualiza o mapa com markers e polyline
 */
const updateMap = () => {
  if (!map) return;

  clearMarkers();
  renderPolyline();

  const bounds = new google.maps.LatLngBounds();
  let hasValidBounds = false;

  // Adiciona pontos
  const sortedPontos = [...props.pontos].sort((a, b) => (a.sequencia || 0) - (b.sequencia || 0));

  for (const ponto of sortedPontos) {
    const position = addMarker(ponto);
    if (position) {
      bounds.extend(position);
      hasValidBounds = true;
    }
  }

  // Atualiza marker de localizaÃ§Ã£o do usuÃ¡rio (nÃ£o entra no fitBounds da rota)
  let userLatLng: google.maps.LatLng | null = null;

  if (props.userLocation) {
    updateUserLocationMarker(props.userLocation.latitude, props.userLocation.longitude);
    userLatLng = new google.maps.LatLng(props.userLocation.latitude, props.userLocation.longitude);
  } else if (position.value) {
    updateUserLocationMarker(position.value.latitude, position.value.longitude);
    userLatLng = new google.maps.LatLng(position.value.latitude, position.value.longitude);
  }

  // Adiciona bounds da polyline
  if (polylineLayer) {
    const path = polylineLayer.getPath();
    path.forEach((point) => {
      bounds.extend(point);
      hasValidBounds = true;
    });
  }

  // Se nÃ£o hÃ¡ pontos/polyline vÃ¡lidos, tenta focar na localizaÃ§Ã£o do usuÃ¡rio
  if (!hasValidBounds && userLatLng) {
    bounds.extend(userLatLng);
    hasValidBounds = true;
  }

  // Ajusta view
  if (props.autoFitBounds && hasValidBounds) {
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  } else {
    map.setCenter(new google.maps.LatLng(props.centro[0], props.centro[1]));
    map.setZoom(props.zoomInicial);
  }
};

/**
 * Vai para localizaÃ§Ã£o do usuÃ¡rio
 */
const goToMyLocation = async () => {
  isGettingLocation.value = true;

  const pos = await getCurrentPosition();

  if (pos && map) {
    updateUserLocationMarker(pos.latitude, pos.longitude);
    map.panTo(new google.maps.LatLng(pos.latitude, pos.longitude));
    map.setZoom(15);
  }

  isGettingLocation.value = false;
};

/**
 * Carrega o script do Google Maps dinamicamente
 */
const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Se jÃ¡ carregou, resolve
    if (window.google?.maps) {
      resolve();
      return;
    }

    // Verifica se o script jÃ¡ estÃ¡ sendo carregado
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Erro ao carregar Google Maps")),
      );
      return;
    }

    // Cria e adiciona o script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${props.apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Erro ao carregar Google Maps"));

    document.head.appendChild(script);
  });
};

/**
 * Inicializa o mapa do Google
 */
const initMap = async () => {
  if (!mapContainer.value || !props.apiKey) {
    mapError.value = "API Key do Google Maps não configurada";
    isLoadingMap.value = false;
    return;
  }

  try {
    // Carrega o script do Google Maps
    await loadGoogleMapsScript();

    // Aguarda o google.maps estar disponível
    if (!window.google?.maps) {
      throw new Error("Google Maps não carregou corretamente");
    }

    map = new google.maps.Map(mapContainer.value, {
      center: { lat: props.centro[0], lng: props.centro[1] },
      zoom: props.zoomInicial,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    isLoadingMap.value = false;
    emit("mapReady");

    // Atualiza o mapa com os dados
    updateMap();

  } catch (err) {
    mapError.value = "Erro ao carregar o Google Maps";
    console.error("[UiMapaGoogle] Erro ao inicializar:", err);
    isLoadingMap.value = false;
  }
};

/**
 * ForÃ§a resize do mapa
 */
const invalidateSize = () => {
  if (map) {
    google.maps.event.trigger(map, "resize");
    setTimeout(() => updateMap(), 0);
  }
};

// Watchers
watch(() => props.pontos, updateMap, { deep: true });
watch(() => props.polyline, updateMap);
watch(
  () => props.userLocation,
  (newLoc) => {
    if (newLoc && map) {
      updateUserLocationMarker(newLoc.latitude, newLoc.longitude);
    }
  },
  { deep: true },
);

onMounted(initMap);

onUnmounted(() => {
  clearMarkers();
  clearPolyline();
  if (userMarker) {
    userMarker.setMap(null);
    userMarker = null;
  }
  map = null;
});

defineExpose({ invalidateSize, goToMyLocation });
</script>
