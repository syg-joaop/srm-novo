import { useAuthStore } from "~/stores/auth";

export type PagedBodyBuilder<Filters> = (page: number, size: number, filters: Filters) => unknown;

export interface UsePagedPostAsyncDataConfig<Filters> {
  key: string;
  endpoint: string;
  buildBody: PagedBodyBuilder<Filters>;
  homol?: boolean;
}

export const usePagedPostAsyncData = <Response, Filters>(
  config: UsePagedPostAsyncDataConfig<Filters>,
) => {
  const api = useMainApi(config.homol);
  const authStore = useAuthStore();

  return (page: Ref<number>, size: Ref<number>, filters: Ref<Filters>) =>
    useAsyncData<Response>(
      config.key,
      () =>
        api<Response>(config.endpoint, {
          method: "POST",
          body: config.buildBody(page.value, size.value, filters.value) as BodyInit,
        }),
      {
        immediate: authStore.isAuthenticated,
        lazy: true,
        watch: [page, size, filters],
      },
    );
};
