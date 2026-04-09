'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

interface RiskGaugeProps {
    value: number // 0-100
    size?: number
    className?: string
}

export default function RiskGauge({ value, size = 180, className = '' }: RiskGaugeProps) {
    const motionValue = useMotionValue(0)
    const displayValue = useTransform(motionValue, (v) => Math.round(v))
    const center = size / 2
    const radius = size * 0.38
    const strokeWidth = 8
    const circumference = Math.PI * radius // semi-circle

    useEffect(() => {
        animate(motionValue, value, { duration: 1.5, ease: [0.16, 1, 0.3, 1] })
    }, [value, motionValue])

    const progress = useTransform(motionValue, [0, 100], [0, circumference])

    const getColor = (v: number) => {
        if (v < 30) return '#10B981'
        if (v < 60) return '#F59E0B'
        return '#EF4444'
    }
    const color = getColor(value)

    const getSeverity = (v: number) => {
        if (v < 30) return 'LOW RISK'
        if (v < 60) return 'MODERATE'
        return 'HIGH RISK'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`flex flex-col items-center ${className}`}
        >
            <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
                {/* Background arc */}
                <path
                    d={`M ${center - radius} ${size * 0.55} A ${radius} ${radius} 0 0 1 ${center + radius} ${size * 0.55}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <motion.path
                    d={`M ${center - radius} ${size * 0.55} A ${radius} ${radius} 0 0 1 ${center + radius} ${size * 0.55}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={useTransform(progress, (p) => circumference - p)}
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                />
                {/* Value text */}
                <motion.text
                    x={center}
                    y={size * 0.45}
                    textAnchor="middle"
                    fill="white"
                    fontSize="28"
                    fontWeight="bold"
                    fontFamily="'Space Grotesk', sans-serif"
                >
                    {displayValue}
                </motion.text>
            </svg>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] mt-1" style={{ color }}>
                {getSeverity(value)}
            </p>
        </motion.div>
    )
}
