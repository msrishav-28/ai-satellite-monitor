'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface HazardRadarProps {
    data: { label: string; value: number; max?: number }[]
    size?: number
    className?: string
}

export default function HazardRadar({ data, size = 280, className = '' }: HazardRadarProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const center = size / 2
    const radius = size * 0.38
    const rings = 5

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = size * dpr
        canvas.height = size * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, size, size)

        const angleStep = (2 * Math.PI) / data.length
        const startAngle = -Math.PI / 2

        // Draw rings
        for (let i = 1; i <= rings; i++) {
            const r = (radius / rings) * i
            ctx.beginPath()
            for (let j = 0; j <= data.length; j++) {
                const angle = startAngle + angleStep * j
                const x = center + r * Math.cos(angle)
                const y = center + r * Math.sin(angle)
                j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.strokeStyle = `rgba(255,255,255,${i === rings ? 0.1 : 0.04})`
            ctx.lineWidth = 0.5
            ctx.stroke()
        }

        // Draw axes
        data.forEach((_, i) => {
            const angle = startAngle + angleStep * i
            ctx.beginPath()
            ctx.moveTo(center, center)
            ctx.lineTo(center + radius * Math.cos(angle), center + radius * Math.sin(angle))
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'
            ctx.lineWidth = 0.5
            ctx.stroke()
        })

        // Draw data polygon
        ctx.beginPath()
        data.forEach((d, i) => {
            const max = d.max || 100
            const val = Math.min(d.value / max, 1)
            const angle = startAngle + angleStep * i
            const x = center + radius * val * Math.cos(angle)
            const y = center + radius * val * Math.sin(angle)
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.closePath()

        // Glowing fill
        const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius)
        gradient.addColorStop(0, 'rgba(239,68,68,0.15)')
        gradient.addColorStop(1, 'rgba(239,68,68,0.03)')
        ctx.fillStyle = gradient
        ctx.fill()

        // Glowing stroke
        ctx.strokeStyle = 'rgba(239,68,68,0.6)'
        ctx.lineWidth = 1.5
        ctx.shadowColor = '#EF4444'
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.shadowBlur = 0

        // Draw data points
        data.forEach((d, i) => {
            const max = d.max || 100
            const val = Math.min(d.value / max, 1)
            const angle = startAngle + angleStep * i
            const x = center + radius * val * Math.cos(angle)
            const y = center + radius * val * Math.sin(angle)

            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fillStyle = '#EF4444'
            ctx.shadowColor = '#EF4444'
            ctx.shadowBlur = 8
            ctx.fill()
            ctx.shadowBlur = 0
        })

        // Draw labels
        ctx.font = '9px "Plus Jakarta Sans", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        data.forEach((d, i) => {
            const angle = startAngle + angleStep * i
            const labelR = radius + 22
            const x = center + labelR * Math.cos(angle)
            const y = center + labelR * Math.sin(angle)
            ctx.fillStyle = 'rgba(255,255,255,0.4)'
            ctx.fillText(d.label.toUpperCase(), x, y)
        })

    }, [data, size, center, radius])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ width: size, height: size }}
            />
        </motion.div>
    )
}
