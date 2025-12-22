export const useNetworkStatus = () => {
  const isOnline = useState<boolean>("offline:isOnline", () => {
    if (!import.meta.client) return true;
    return navigator.onLine;
  });

  const listenersReady = useState<boolean>("offline:networkListenersReady", () => false);

  const initListeners = () => {
    if (!import.meta.client) return;

    // Sync state immediately in case it differs from server/hydration
    isOnline.value = navigator.onLine;

    if (listenersReady.value) return;

    window.addEventListener("online", () => {
      isOnline.value = true;
    });

    window.addEventListener("offline", () => {
      isOnline.value = false;
    });

    listenersReady.value = true;
  };

  initListeners();

  const onOnline = (callback: () => void) => {
    if (!import.meta.client) return () => {};
    const handler = () => callback();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  };

  const onOffline = (callback: () => void) => {
    if (!import.meta.client) return () => {};
    const handler = () => callback();
    window.addEventListener("offline", handler);
    return () => window.removeEventListener("offline", handler);
  };

  return { isOnline: readonly(isOnline), onOnline, onOffline };
};

