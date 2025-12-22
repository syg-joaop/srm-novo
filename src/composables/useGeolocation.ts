
export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
  } = options;

  const position = ref<GeolocationPosition | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const isSupported = ref(typeof navigator !== "undefined" && "geolocation" in navigator);

  let watchId: number | null = null;

  const geolocationOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge,
  };

  /**
   * Callback de sucesso da geolocalização
   */
  const onSuccess = (pos: globalThis.GeolocationPosition) => {
    position.value = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    };
    error.value = null;
    isLoading.value = false;

    console.log("[useGeolocation] Posição obtida:", position.value);
  };

  /**
   * Callback de erro da geolocalização
   */
  const onError = (err: GeolocationPositionError) => {
    isLoading.value = false;

    switch (err.code) {
      case err.PERMISSION_DENIED:
        error.value = "Permissão de localização negada. Habilite nas configurações do navegador.";
        break;
      case err.POSITION_UNAVAILABLE:
        error.value = "Localização indisponível. Verifique se o GPS está ativado.";
        break;
      case err.TIMEOUT:
        error.value = "Tempo esgotado ao obter localização.";
        break;
      default:
        error.value = "Erro desconhecido ao obter localização.";
    }

    console.error("[useGeolocation] Erro:", error.value);
  };

  /**
   * Obtém a posição atual uma vez
   */
  const getCurrentPosition = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!isSupported.value) {
        error.value = "Geolocalização não suportada neste navegador.";
        resolve(null);
        return;
      }

      isLoading.value = true;
      error.value = null;

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSuccess(pos);
          resolve(position.value);
        },
        (err) => {
          onError(err);
          resolve(null);
        },
        geolocationOptions
      );
    });
  };

  /**
   * Inicia o monitoramento contínuo da posição
   */
  const startWatching = () => {
    if (!isSupported.value) {
      error.value = "Geolocalização não suportada neste navegador.";
      return;
    }

    if (watchId !== null) {
      stopWatching();
    }

    isLoading.value = true;
    error.value = null;

    watchId = navigator.geolocation.watchPosition(onSuccess, onError, geolocationOptions);
  };

  /**
   * Para o monitoramento da posição
   */
  const stopWatching = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  /**
   * Solicita permissão de localização ao usuário
   */
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      error.value = "Geolocalização não suportada neste navegador.";
      return false;
    }

    try {
      // Tenta obter a posição para disparar o prompt de permissão
      const result = await getCurrentPosition();
      return result !== null;
    } catch {
      return false;
    }
  };

  // Se watch estiver ativado, inicia automaticamente
  onMounted(() => {
    if (watch && isSupported.value) {
      startWatching();
    }
  });

  // Limpa o watch ao desmontar
  onUnmounted(() => {
    stopWatching();
  });

  return {
    // Estado
    position,
    error,
    isLoading,
    isSupported,

    // Métodos
    getCurrentPosition,
    startWatching,
    stopWatching,
    requestPermission,
  };
};
