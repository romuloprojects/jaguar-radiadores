import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 12,
        retry: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Só revalida ao montar quando alguma mutação marcou o cache como inválido.
        // Queries normais continuam estáveis e não recarregam por navegação.
        refetchOnMount: (query) => query.state.isInvalidated,
      },
      mutations: { retry: 0 },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 60 * 5,
  });

  return router;
};
