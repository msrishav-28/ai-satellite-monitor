'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface EmissionsDataPoint {
    label: string
    value: number
}

interface EmissionsGraphProps {
    data: EmissionsDataPoint[]
    width?: number
    height?: number
    color?: string
    className?: string
}

export default function EmissionsGraph({ data, width = 500, height = 200, color = '#3B82F6', className = '' }: EmissionsGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padding = { top: 16, right: 16, bottom: 32, left: 48 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || data.length < 2) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, width, height)

        const maxVal = Math.max(...data.map(d => d.value)) * 1.15
        const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
        const yScale = (v: number) => padding.top + chartH - (v / maxVal) * chartH

        // Grid lines
        ctx.font = '9px "Plus Jakarta Sans", sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= 4; i++) {
            const val = (i / 4) * maxVal
            const y = yScale(val)
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.strokeStyle = 'rgba(255,255,255,0.04)'
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.fillStyle = 'rgba(255,255,255,0.2)'
            ctx.fillText(val.toFixed(0), padding.left - 8, y + 3)
        }

        // Area fill with neon glow gradient
        ctx.beginPath()
        ctx.moveTo(xScale(0), yScale(data[0].value))
        data.forEach((d, i) => ctx.lineTo(xScale(i), yScale(d.value)))
        ctx.lineTo(xScale(data.length - 1), padding.top + chartH)
        ctx.lineTo(xScale(0), padding.top + chartH)
        ctx.closePath()
        const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
        grad.addColorStop(0, `${color}30`)
        grad.addColorStop(0.5, `${color}10`)
        grad.addColorStop(1, `${color}00`)
        ctx.fillStyle = grad
        ctx.fill()

        // Glowing line
        ctx.beginPath()
        data.forEach((d, i) => {
            i === 0 ? ctx.moveTo(xScale(i), yScale(d.value)) : ctx.lineTo(xScale(i), yScale(d.value))
        })
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.shadowColor = color
        ctx.shadowBlur = 12
        ctx.stroke()
        ctx.shadowBlur = 0

        // X labels
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        const step = Math.max(1, Math.floor(data.length / 6))
        data.forEach((d, i) => {
            if (i % step === 0) ctx.fillText(d.label, xScale(i), height - 6)
        })
    }, [data, width, height, color, chartW, chartH, padding.top, padding.right, padding.bottom, padding.left])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={className}
        >
            <canvas ref={canvasRef} style={{ width, height }} />
        </motion.div>
    )
}
