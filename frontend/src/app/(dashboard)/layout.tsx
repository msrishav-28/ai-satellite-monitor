'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-dark-primary">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  )
}