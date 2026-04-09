'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
    children: React.ReactNode
}

/**
 * Iris aperture page transition.
 * Wraps children in an AnimatePresence with a circle clip-path reveal.
 */
export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ clipPath: 'circle(0% at 50% 50%)', opacity: 0 }}
                animate={{
                    clipPath: 'circle(150% at 50% 50%)',
                    opacity: 1,
                    transition: {
                        clipPath: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.3 },
                    },
                }}
                exit={{
                    clipPath: 'circle(0% at 50% 50%)',
                    opacity: 0,
                    transition: {
                        clipPath: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
                        opacity: { duration: 0.2, delay: 0.3 },
                    },
                }}
                className="min-h-screen"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
