'use client'

import { AppShell } from '@/components/AppShell'

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
