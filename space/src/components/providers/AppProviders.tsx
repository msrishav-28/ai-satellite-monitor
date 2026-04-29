'use client'

/*
  Global client-side providers for the canonical /space app.
  Added in Phase 4 to supply a shared TanStack Query client to all data hooks
  used by the monitor, dashboard, and operational routes.
*/

import { ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface Props {
  children: ReactNode
}

export function AppProviders({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
