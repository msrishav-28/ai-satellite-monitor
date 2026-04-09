export const dynamic = 'force-dynamic'

import AnalyticsLayoutClient from './layout-client'

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AnalyticsLayoutClient>{children}</AnalyticsLayoutClient>
}
