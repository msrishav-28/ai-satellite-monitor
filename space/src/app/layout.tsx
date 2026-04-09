import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SatelliteLoader } from "@/components/SatelliteLoader";
import { MobileTabBar } from "@/components/MobileTabBar";
import { PageTransition } from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "SPACE — AI Satellite Environmental Monitor",
  description:
    "Cinematic environmental intelligence platform. Mission Control meets IMAX nature documentary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-red-500/30">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10001] focus:px-6 focus:py-3 focus:bg-white focus:text-black focus:rounded-full focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest"
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
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />

        <SmoothScroll>
          <div id="main-content" role="main">
            <PageTransition>{children}</PageTransition>
          </div>
        </SmoothScroll>

        <MobileTabBar />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
