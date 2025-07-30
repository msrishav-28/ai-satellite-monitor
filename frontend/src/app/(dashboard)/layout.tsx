'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden bg-gradient-dark relative">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-transparent to-purple-800/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-float-gentle" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/3 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '3s' }} />

        <Sidebar />
        <main className="flex-1 relative overflow-hidden z-10">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  )
}