'use client'

import { AppShell } from '@/components/AppShell'

export default function AnalyticsLayoutClient({
    children,
}: {
    children: React.ReactNode
}) {
    return <AppShell>{children}</AppShell>
}
