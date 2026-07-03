'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { isForbiddenError } from '@/lib/api/errors';

export default function AppQueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            // Don't retry 4xx (403/404/etc.) — the answer won't change, and
            // retrying a forbidden request just delays the UI settling.
            retry: (failureCount, error) => {
              const status = (error as { statusCode?: number })?.statusCode;
              if (status && status >= 400 && status < 500) return false;
              return failureCount < 2;
            },
            // A 403 must NEVER crash the app shell. Background/ancillary queries
            // (sidebar badges, counts, secondary widgets) that 403 are handled
            // silently — their local `error` is simply ignored. Access control
            // for whole routes is done up-front and flicker-free by <RouteGuard>
            // from the session's permission set, so we don't need queries to
            // throw to surface a ForbiddenState. A query may still opt in
            // explicitly with `meta: { forbidden403: "boundary" }` if it ever
            // needs the backend's 403 to drive the page state directly.
            throwOnError: (error, query) =>
              isForbiddenError(error) && query.meta?.forbidden403 === "boundary",
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
