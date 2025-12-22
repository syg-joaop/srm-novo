 Plano: Implementar Funcionalidade Offline com IndexedDB

 Resumo

 Implementar arquitetura offline-first para o SRM App usando IndexedDB, permitindo:
 - Listagens funcionarem offline (dados em cache)
 - Cadastros funcionarem offline (fila de sincronização)
 - Sincronização automática quando reconectar

 Decisões de Arquitetura

 | Decisão               | Escolha          | Motivo                                                              |
 |-----------------------|------------------|---------------------------------------------------------------------|
 | Estratégia de cache   | Network-First    | Dados sempre atualizados, cache só como fallback                    |
 | Entidades com offline | 6 entidades      | fornecedores, prospectos, ocorrências, checkin, concorrentes, rotas |
 | Biblioteca IndexedDB  | API Nativa       | Zero dependências, controle total                                   |
 | Detecção de rede      | navigator.onLine | Simples, funciona em todas plataformas                              |

 Arquitetura Proposta

 ┌─────────────────────────────────────────────────────────────────┐
 │                         UI (Pages/Components)                   │
 └─────────────────────────────────┬───────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼───────────────────────────────┐
 │                   Services (use*Service)                        │
 │        (modificados para usar useOfflineAsyncData)              │
 └─────────────────────────────────┬───────────────────────────────┘
                                   │
 ┌─────────────────────────────────▼───────────────────────────────┐
 │              useOfflineAsyncData / useOfflineMutation           │
 │    - Decide fonte (API ou Cache)                                │
 │    - Atualiza cache após sucesso                                │
 └──────────┬──────────────────────────────────┬───────────────────┘
            │                                  │
            ▼                                  ▼
 ┌──────────────────────┐        ┌─────────────────────────────────┐
 │   API ($fetch)       │        │      useOfflineStorage          │
 └──────────────────────┘        │   (IndexedDB Wrapper)           │
                                 └──────────┬──────────────────────┘
                                            │
                                            ▼
                                 ┌─────────────────────────────────┐
                                 │         IndexedDB               │
                                 │   - srm_cache (listagens)       │
                                 │   - srm_pending (operações)     │
                                 └─────────────────────────────────┘

 Estrutura de Arquivos

 src/
 ├── composables/
 │   ├── useOfflineAsyncData.ts      # Wrapper para fetch com cache
 │   ├── useOfflineMutation.ts       # Wrapper para mutations offline
 │   ├── useOfflineStorage.ts        # Abstração IndexedDB
 │   ├── useNetworkStatus.ts         # Detecção de conexão
 │   └── useSyncManager.ts           # Gerenciador de sincronização
 │
 ├── plugins/
 │   └── offline.client.ts           # Inicializa sistema offline
 │
 ├── utils/offline/
 │   ├── database.ts                 # Schema IndexedDB
 │   ├── cache-config.ts             # TTLs por entidade
 │   └── helpers.ts                  # Utilitários
 │
 ├── components/common/
 │   ├── OfflineIndicator.vue        # Banner de status offline
 │   └── SyncStatusBadge.vue         # Badge com pendências
 │
 ├── types/
 │   └── offline.ts                  # Tipos TypeScript
 │
 └── layers/*/composables/           # Services modificados

 Componentes Principais

 1. useOfflineStorage (IndexedDB Wrapper)

 export const useOfflineStorage = () => {
   // Cache de listagens
   const getCache = async <T>(key: string): Promise<T | null>;
   const setCache = async <T>(key: string, data: T, ttl?: number): Promise<void>;
   const invalidateCache = async (pattern: string): Promise<void>;

   // Fila de operações pendentes
   const addPending = async (operation: PendingOperation): Promise<string>;
   const getPending = async (): Promise<PendingOperation[]>;
   const removePending = async (id: string): Promise<void>;

   return { getCache, setCache, invalidateCache, addPending, getPending, removePending };
 };

 2. useOfflineAsyncData (Fetch com Cache)

 export const useOfflineAsyncData = <Response, Filters>(config) => {
   return (page, size, filters) => {
     const execute = async () => {
       // Se online: tenta API primeiro
       if (isOnline.value) {
         try {
           const response = await api(config.endpoint, { method: "POST", body });
           await storage.setCache(cacheKey, response, config.cacheTtl);
           return response;
         } catch (err) {
           // Fallback para cache se falhar
         }
       }

       // Offline ou erro: usa cache
       return await storage.getCache(cacheKey);
     };

     return { data, status, isFromCache, refresh: execute };
   };
 };

 3. useOfflineMutation (Mutations com Fila)

 export const useOfflineMutation = <T>(config) => {
   const mutate = async (payload: Partial<T>) => {
     if (isOnline.value) {
       try {
         await api(config.endpoint, { method: "POST", body: payload });
         return { success: true, offline: false };
       } catch (err) {
         if (isNetworkError(err)) {
           return saveOffline(payload); // Salva na fila
         }
       }
     }
     return saveOffline(payload);
   };

   return { mutate, isPending };
 };

 4. useSyncManager (Sincronização)

 export const useSyncManager = () => {
   const syncPending = async () => {
     const pending = await storage.getPending();
     for (const op of pending) {
       try {
         await api(op.endpoint, { method: "POST", body: op.payload });
         await storage.removePending(op.id);
         await storage.invalidateCache(`${op.entity}:`);
       } catch (err) {
         // Incrementa retry
       }
     }
   };

   // Sincroniza ao reconectar
   onOnline(() => syncPending());

   return { syncPending, isSyncing, pendingCount };
 };

 5. useNetworkStatus (Detecção de Conexão)

 export const useNetworkStatus = () => {
   const isOnline = ref(navigator.onLine);

   window.addEventListener("online", () => isOnline.value = true);
   window.addEventListener("offline", () => isOnline.value = false);

   const onOnline = (callback: () => void) => { /* ... */ };
   const onOffline = (callback: () => void) => { /* ... */ };

   return { isOnline, onOnline, onOffline };
 };

 Modificação nos Services Existentes

 Antes:
 export const useFornecedorService = () => {
   const fetchFornecedor = usePagedPostAsyncData<...>({
     key: "fornecedores",
     endpoint: "/SRM_GET_FORNECEDORES",
     buildBody: buildPagedListBody,
   });
   return { fetchFornecedor };
 };

 Depois:
 export const useFornecedorService = () => {
   const fetchFornecedor = useOfflineAsyncData<...>({
     key: "fornecedores",
     endpoint: "/SRM_GET_FORNECEDORES",
     buildBody: buildPagedListBody,
     cacheTtl: 5 * 60 * 1000, // 5 min
   });

   const createFornecedor = useOfflineMutation<Fornecedor>({
     entity: "fornecedor",
     endpoint: "/SRM_POST_FORNECEDOR",
   });

   return { fetchFornecedor, createFornecedor };
 };

 TTLs por Entidade

 | Entidade     | TTL Cache | Motivo                       |
 |--------------|-----------|------------------------------|
 | fornecedores | 5 min     | Dados moderadamente estáveis |
 | prospectos   | 5 min     | Dados moderadamente estáveis |
 | concorrentes | 10 min    | Dados mais estáveis          |
 | ocorrencias  | 2 min     | Dados mais voláteis          |
 | checkin      | 1 min     | Dados muito voláteis         |
 | rotas        | 5 min     | Planejamento de visitas      |

 Ordem de Implementação

 Fase 1: Infraestrutura Base

 1. src/types/offline.ts - Tipos TypeScript
 2. src/utils/offline/database.ts - Schema e inicialização IndexedDB nativo
 3. src/utils/offline/helpers.ts - Funções utilitárias (isNetworkError, generateId)
 4. src/composables/useOfflineStorage.ts - Wrapper IndexedDB
 5. src/composables/useNetworkStatus.ts - Detecção via navigator.onLine
 6. src/plugins/offline.client.ts - Plugin de inicialização

 Fase 2: Sistema de Leitura (Cache)

 7. src/utils/offline/cache-config.ts - TTLs por entidade
 8. src/composables/useOfflineAsyncData.ts - Fetch Network-First com cache
 9. Modificar useFornecedorService.ts como piloto
 10. Testar leitura offline

 Fase 3: Sistema de Escrita (Mutations)

 11. src/composables/useOfflineMutation.ts - Mutations com fila
 12. src/composables/useSyncManager.ts - Sincronização automática
 13. Adicionar mutations em useFornecedorService.ts
 14. Testar criação offline e sync

 Fase 4: UI e Feedback Visual

 15. src/components/common/OfflineIndicator.vue - Banner de status
 16. src/components/common/SyncStatusBadge.vue - Badge com pendências
 17. Integrar no src/layouts/default.vue

 Fase 5: Rollout para Todas Entidades

 18. Modificar useProspectoService.ts
 19. Modificar useOcorrenciaService.ts
 20. Modificar useCheckinService.ts
 21. Modificar useConcorrenteService.ts
 22. Criar useRotaService.ts (não existe ainda)

 Arquivos Críticos a Modificar

 Referências (não modificar, apenas consultar)

 - src/composables/usePagedPostAsyncData.ts - Base para o novo composable
 - src/utils/api.ts - Referência para cliente HTTP
 - src/stores/auth.ts - Integração login/logout

 Services a Modificar

 - src/layers/fornecedores/composables/useFornecedorService.ts
 - src/layers/prospectos/composables/useProspectoService.ts
 - src/layers/ocorrencias/composables/useOcorrenciaService.ts
 - src/layers/checkin/composables/useCheckinService.ts
 - src/layers/concorrentes/composables/useConcorrenteService.ts
 - src/layers/rotas/composables/useRotaService.ts (CRIAR - não existe)

 UI a Modificar

 - src/layouts/default.vue - Adicionar indicadores de status offline
