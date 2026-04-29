'use client'

/*
  Shared glass surface wrapper for /space overlays and cards.
  Updated in Phase 4 so the variant API maps to the restored global utilities.
*/

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassPanelProps {
    children: ReactNode
    className?: string
    variant?: 'default' | 'purple' | 'elevated'
    animate?: boolean
}

export function GlassPanel({
    children,
    className = '',
    variant = 'default',
    animate = true
}: GlassPanelProps) {
    const baseClasses: Record<string, string> = {
        default: 'glass-panel rounded-[2rem]',
        purple: 'glass-panel-purple rounded-[2rem]',
        elevated: 'glass-panel rounded-[2rem] shadow-glass-lg'
    }

    const MotionComponent = animate ? motion.div : 'div'
    const motionProps = animate ? {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1] as const
        }
    } : {}

    return (
        <MotionComponent
            className={`${baseClasses[variant]} ${className}`}
            {...motionProps}
        >
            {children}
        </MotionComponent>
    )
}
