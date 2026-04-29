/*
  Root application layout for the canonical /space frontend.
  Updated in Phase 4 to align metadata with the environmental monitoring
  product and mount the shared client-side data providers.
*/

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import './globals.css'
import VisualEditsMessenger from '../visual-edits/VisualEditsMessenger'
import ErrorReporter from '@/components/ErrorReporter'
import { CustomCursor } from '@/components/CustomCursor'
import { SmoothScroll } from '@/components/SmoothScroll'
import { SatelliteLoader } from '@/components/SatelliteLoader'
import { AppProviders } from '@/components/providers/AppProviders'

export const metadata: Metadata = {
  title: 'Sentinel - AI Satellite Environmental Monitor',
  description: 'Cinematic environmental intelligence platform for hazard monitoring, satellite analysis, and operational response.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-red-500/30">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10001] focus:rounded-full focus:bg-white focus:px-6 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest focus:text-black"
        >
          Skip to main content
        </a>

        <div className="noise" />
        <CustomCursor />
        <SatelliteLoader />

        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="3a2071db-b72b-497d-8f62-5811be3118b0"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName":"Sentinel","version":"1.0.0","greeting":"hello"}'
        />

        <AppProviders>
          <SmoothScroll>
            <main id="main-content">{children}</main>
          </SmoothScroll>
        </AppProviders>

        <VisualEditsMessenger />
      </body>
    </html>
  )
}
