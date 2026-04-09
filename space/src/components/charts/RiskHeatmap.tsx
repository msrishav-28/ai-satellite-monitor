'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface RiskCell {
    row: number
    col: number
    value: number // 0-100
}

interface RiskHeatmapProps {
    data: RiskCell[]
    rows?: number
    cols?: number
    cellSize?: number
    rowLabels?: string[]
    colLabels?: string[]
    className?: string
}

export default function RiskHeatmap({
    data,
    rows = 5,
    cols = 6,
    cellSize = 44,
    rowLabels,
    colLabels,
    className = ''
}: RiskHeatmapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const labelSpace = 64
    const topLabelSpace = 24
    const width = cols * cellSize + labelSpace
    const height = rows * cellSize + topLabelSpace

    const riskColor = (value: number): string => {
        if (value < 25) return 'rgba(16,185,129,0.6)'
        if (value < 50) return 'rgba(245,158,11,0.5)'
        if (value < 75) return 'rgba(239,68,68,0.5)'
        return 'rgba(239,68,68,0.85)'
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, width, height)

        const gap = 2

        // Draw cells
        data.forEach(cell => {
            const x = labelSpace + cell.col * cellSize
            const y = topLabelSpace + cell.row * cellSize
            ctx.fillStyle = riskColor(cell.value)
            ctx.beginPath()
            ctx.roundRect(x + gap / 2, y + gap / 2, cellSize - gap, cellSize - gap, 6)
            ctx.fill()

            // Value text
            ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = cell.value > 60 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'
            ctx.fillText(cell.value.toString(), x + cellSize / 2, y + cellSize / 2)
        })

        // Row labels
        if (rowLabels) {
            ctx.font = '8px "Plus Jakarta Sans", sans-serif'
            ctx.textAlign = 'right'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            rowLabels.forEach((label, i) => {
                ctx.fillText(label.toUpperCase(), labelSpace - 8, topLabelSpace + i * cellSize + cellSize / 2)
            })
        }

        // Column labels
        if (colLabels) {
            ctx.font = '8px "Plus Jakarta Sans", sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.fillStyle = 'rgba(255,255,255,0.3)'
            colLabels.forEach((label, i) => {
                ctx.fillText(label, labelSpace + i * cellSize + cellSize / 2, topLabelSpace - 6)
            })
        }
    }, [data, rows, cols, cellSize, rowLabels, colLabels, width, height])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={className}
        >
            <canvas ref={canvasRef} style={{ width, height }} />
        </motion.div>
    )
}
