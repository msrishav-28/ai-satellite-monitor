'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect user's prefers-reduced-motion preference.
 * Returns true if the user prefers reduced motion.
 */
export function useReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(false)

    useEffect(() => {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReduced(mql.matches)

        const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
        mql.addEventListener('change', handler)
        return () => mql.removeEventListener('change', handler)
    }, [])

    return prefersReduced
}
