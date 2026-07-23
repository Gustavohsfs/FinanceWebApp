import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

/** Um QueryClient por requisição de servidor — usado para prefetch + hidratação. */
export const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: { queries: { staleTime: 30_000 } },
    }),
);
