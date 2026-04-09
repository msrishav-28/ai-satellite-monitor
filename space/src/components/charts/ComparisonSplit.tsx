'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface ComparisonSplitProps {
    beforeSrc: string
    afterSrc: string
    beforeLabel?: string
    afterLabel?: string
    className?: string
}

export default function ComparisonSplit({
    beforeSrc,
    afterSrc,
    beforeLabel = 'Before',
    afterLabel = 'After',
    className = '',
}: ComparisonSplitProps) {
    const [split, setSplit] = useState(50)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current || !isDragging.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = ((clientX - rect.left) / rect.width) * 100
        setSplit(Math.max(2, Math.min(98, x)))
    }, [])

    const handleMouseDown = () => { isDragging.current = true }
    const handleMouseUp = () => { isDragging.current = false }
    const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX)
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX)

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`relative overflow-hidden rounded-2xl border border-white/5 select-none cursor-col-resize ${className}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ aspectRatio: '16/9' }}
        >
            {/* After image (full width, underneath) */}
            <div className="absolute inset-0">
                <img src={afterSrc} alt={afterLabel} className="w-full h-full object-cover" />
            </div>

            {/* Before image (clipped) */}
            <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            >
                <img src={beforeSrc} alt={beforeLabel} className="w-full h-full object-cover" />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-px bg-white/60 z-10"
                style={{ left: `${split}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                        <div className="w-0.5 h-3 bg-white/60 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {beforeLabel}
                </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {afterLabel}
                </span>
            </div>
        </motion.div>
    )
}
