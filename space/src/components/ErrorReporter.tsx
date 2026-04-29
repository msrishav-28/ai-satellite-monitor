'use client'

/*
  Embedded error reporter for dev overlays and the global error route.
  Updated in Phase 4 to use safe timer refs, preserve iframe reporting, and
  expose a retry action when Next.js provides a reset callback.
*/

import { useEffect, useRef } from 'react'

type ReporterProps = {
  error?: Error & { digest?: string }
  reset?: () => void
}

export default function ErrorReporter({ error, reset }: ReporterProps) {
  const lastOverlayMsg = useRef('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const inIframe = window.parent !== window
    if (!inIframe) return

    const send = (payload: unknown) => window.parent.postMessage(payload, '*')

    const onError = (event: ErrorEvent) =>
      send({
        type: 'ERROR_CAPTURED',
        error: {
          message: event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'window.onerror',
        },
        timestamp: Date.now(),
      })

    const onReject = (event: PromiseRejectionEvent) =>
      send({
        type: 'ERROR_CAPTURED',
        error: {
          message: event.reason?.message ?? String(event.reason),
          stack: event.reason?.stack,
          source: 'unhandledrejection',
        },
        timestamp: Date.now(),
      })

    const pollOverlay = () => {
      const overlay = document.querySelector('[data-nextjs-dialog-overlay]')
      const node =
        overlay?.querySelector(
          'h1, h2, .error-message, [data-nextjs-dialog-body]'
        ) ?? null
      const text = node?.textContent ?? node?.innerHTML ?? ''

      if (text && text !== lastOverlayMsg.current) {
        lastOverlayMsg.current = text
        send({
          type: 'ERROR_CAPTURED',
          error: { message: text, source: 'nextjs-dev-overlay' },
          timestamp: Date.now(),
        })
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onReject)
    pollRef.current = setInterval(pollOverlay, 1000)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onReject)

      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!error) return

    window.parent.postMessage(
      {
        type: 'global-error-reset',
        error: {
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          name: error.name,
        },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      },
      '*'
    )
  }, [error])

  if (!error) return null

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-destructive">
              Something went wrong
            </h1>
            <p className="text-muted-foreground">
              An unexpected error interrupted this view. Retry the route or
              inspect the details below.
            </p>
          </div>

          <div className="space-y-3">
            {reset && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                Retry
              </button>
            )}

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {error.message}
                  {error.stack && (
                    <div className="mt-2 text-muted-foreground">
                      {error.stack}
                    </div>
                  )}
                  {error.digest && (
                    <div className="mt-2 text-muted-foreground">
                      Digest: {error.digest}
                    </div>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
