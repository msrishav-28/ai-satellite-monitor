'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface DataPoint {
    date: string
    value: number
    anomaly?: boolean
}

interface NDVITimelineProps {
    data: DataPoint[]
    width?: number
    height?: number
    className?: string
}

export default function NDVITimeline({ data, width = 600, height = 240, className = '' }: NDVITimelineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DataPoint } | null>(null)

    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
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

        const minVal = Math.min(...data.map(d => d.value)) - 0.05
        const maxVal = Math.max(...data.map(d => d.value)) + 0.05

        const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
        const yScale = (v: number) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH

        // Y-axis grid lines
        const yTicks = 5
        ctx.font = '9px "Plus Jakarta Sans", sans-serif'
        ctx.textAlign = 'right'
        for (let i = 0; i <= yTicks; i++) {
            const val = minVal + (i / yTicks) * (maxVal - minVal)
            const y = yScale(val)
            ctx.beginPath()
            ctx.moveTo(padding.left, y)
            ctx.lineTo(width - padding.right, y)
            ctx.strokeStyle = 'rgba(255,255,255,0.04)'
            ctx.lineWidth = 0.5
            ctx.stroke()
            ctx.fillStyle = 'rgba(255,255,255,0.25)'
            ctx.fillText(val.toFixed(2), padding.left - 8, y + 3)
        }

        // Anomaly regions (shaded bands)
        data.forEach((d, i) => {
            if (d.anomaly) {
                const x = xScale(i)
                ctx.fillStyle = 'rgba(239,68,68,0.06)'
                ctx.fillRect(x - chartW / data.length / 2, padding.top, chartW / data.length, chartH)
            }
        })

        // Area fill
        ctx.beginPath()
        ctx.moveTo(xScale(0), yScale(data[0].value))
        data.forEach((d, i) => ctx.lineTo(xScale(i), yScale(d.value)))
        ctx.lineTo(xScale(data.length - 1), padding.top + chartH)
        ctx.lineTo(xScale(0), padding.top + chartH)
        ctx.closePath()
        const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
        areaGrad.addColorStop(0, 'rgba(16,185,129,0.15)')
        areaGrad.addColorStop(1, 'rgba(16,185,129,0)')
        ctx.fillStyle = areaGrad
        ctx.fill()

        // Line
        ctx.beginPath()
        data.forEach((d, i) => {
            const x = xScale(i)
            const y = yScale(d.value)
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2
        ctx.shadowColor = '#10B981'
        ctx.shadowBlur = 8
        ctx.stroke()
        ctx.shadowBlur = 0

        // Data points
        data.forEach((d, i) => {
            const x = xScale(i)
            const y = yScale(d.value)
            ctx.beginPath()
            ctx.arc(x, y, d.anomaly ? 4 : 2.5, 0, 2 * Math.PI)
            ctx.fillStyle = d.anomaly ? '#EF4444' : '#10B981'
            if (d.anomaly) {
                ctx.shadowColor = '#EF4444'
                ctx.shadowBlur = 10
            }
            ctx.fill()
            ctx.shadowBlur = 0
        })

        // X-axis labels (every nth)
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        const step = Math.max(1, Math.floor(data.length / 6))
        data.forEach((d, i) => {
            if (i % step === 0 || i === data.length - 1) {
                ctx.fillText(d.date, xScale(i), height - 8)
            }
        })

        // Y-axis title
        ctx.save()
        ctx.translate(12, padding.top + chartH / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.font = '8px "Plus Jakarta Sans", sans-serif'
        ctx.fillText('NDVI', 0, 0)
        ctx.restore()

    }, [data, width, height, chartW, chartH, padding.top, padding.right, padding.bottom, padding.left])

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect || data.length < 2) return
        const mx = e.clientX - rect.left
        const idx = Math.round(((mx - padding.left) / chartW) * (data.length - 1))
        if (idx >= 0 && idx < data.length) {
            const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW
            const minVal = Math.min(...data.map(d => d.value)) - 0.05
            const maxVal = Math.max(...data.map(d => d.value)) + 0.05
            const yScale = (v: number) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
            setTooltip({ x: xScale(idx), y: yScale(data[idx].value), point: data[idx] })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`relative ${className}`}
        >
            <canvas
                ref={canvasRef}
                style={{ width, height }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-crosshair"
            />
            {tooltip && (
                <div
                    className="absolute pointer-events-none bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-[10px] z-10"
                    style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
                >
                    <p className="text-white/60">{tooltip.point.date}</p>
                    <p className="text-white font-bold">{tooltip.point.value.toFixed(3)}</p>
                    {tooltip.point.anomaly && (
                        <p className="text-red-400 font-bold">⚠ Anomaly</p>
                    )}
                </div>
            )}
        </motion.div>
    )
}
