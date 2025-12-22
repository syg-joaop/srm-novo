export default defineNuxtPlugin({
  name: "offline",
  dependsOn: ["auth"],
  async setup() {
    const storage = useOfflineStorage();
    const sync = useSyncManager();

    try {
      await storage.ready();
    } catch (error) {
      console.warn("[offline] Falha ao inicializar IndexedDB:", error);
    } finally {
      await sync.refreshPendingCount();
    }
  },
});
