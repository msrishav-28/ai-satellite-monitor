'use client'

import { motion } from 'framer-motion'

interface GlassPanelProps {
    children: React.ReactNode
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
        default: 'bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem]',
        purple: 'bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem]',
        elevated: 'bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]'
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
