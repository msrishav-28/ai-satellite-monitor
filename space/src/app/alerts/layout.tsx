export const dynamic = 'force-dynamic'

import AlertsLayoutClient from './layout-client'

export default function AlertsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <AlertsLayoutClient>{children}</AlertsLayoutClient>
}
