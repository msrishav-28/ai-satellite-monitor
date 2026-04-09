'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

/**
 * Error boundary specifically for 3D canvas and Mapbox components.
 * If Three.js or Mapbox crashes, this prevents the whole page from going white.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[CanvasErrorBoundary] 3D/Map component crashed:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-1">Visualization Error</p>
                    <p className="text-[11px] text-white/20 normal-case tracking-normal max-w-xs text-center">
                        The 3D visualization failed to load. Try refreshing the page.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        Retry
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
