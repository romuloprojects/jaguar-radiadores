import type { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * Revalida dados em segundo plano sem bloquear a interface.
 * Como as queries mantêm o cache atual durante o refetch, a UI não troca
 * tabelas/cards por estados de carregamento após uma mutação.
 */
export function silentInvalidate(queryClient: QueryClient, queryKeys: QueryKey[]) {
  for (const queryKey of queryKeys) {
    void queryClient.invalidateQueries({ queryKey, refetchType: "active" });
  }
}

/** Remove imediatamente um registro de caches de listagem e reconcilia depois. */
export function removeItemFromCachedLists(queryClient: QueryClient, queryKey: QueryKey, id: string) {
  queryClient.setQueriesData({ queryKey }, (old: any) => {
    if (!old || !Array.isArray(old.items)) return old;
    const items = old.items.filter((item: any) => String(item?.id ?? "") !== String(id));
    if (items.length === old.items.length) return old;
    return {
      ...old,
      items,
      total: typeof old.total === "number" ? Math.max(0, old.total - 1) : old.total,
    };
  });
}

/** Substitui um detalhe já carregado sem aguardar um novo GET. */
export function setCachedDetail(queryClient: QueryClient, queryKey: QueryKey, value: unknown) {
  queryClient.setQueryData(queryKey, value);
}
