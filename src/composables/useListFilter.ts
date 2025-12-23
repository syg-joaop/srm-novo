export interface ListFilterConfig<T> {
  searchFields?: (keyof T)[];
  customFilters?: (item: T) => boolean;
  sortCompare?: (a: T, b: T) => number;
}

export function useListFilter<T>(
  items: Ref<T[] | undefined | null>,
  config: MaybeRef<ListFilterConfig<T>>,
) {
  const search = ref("");

  const filteredItems = computed(() => {
    const list = items.value ?? [];
    const conf = unref(config);
    const term = search.value.trim().toLowerCase();

    let result = list.filter((item) => {
      const matchesSearch =
        !term || !conf.searchFields
          ? true
          : conf.searchFields.some((field) =>
              String(item[field] ?? "")
                .toLowerCase()
                .includes(term),
            );

      const matchesCustom = conf.customFilters ? conf.customFilters(item) : true;
      return matchesSearch && matchesCustom;
    });

    if (conf.sortCompare) {
      result = [...result].sort(conf.sortCompare);
    }

    return result;
  });

  return {
    search,
    filteredItems,
  };
}
