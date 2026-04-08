'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function SatelliteLoader() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Only show on first visit per session
        if (sessionStorage.getItem('space-loaded')) {
            setIsVisible(false)
            return
        }
        setIsVisible(true)
        const timer = setTimeout(() => {
            setIsVisible(false)
            sessionStorage.setItem('space-loaded', 'true')
        }, 2500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[10000] bg-[#0E0E0E] flex items-center justify-center"
                    exit={{ clipPath: 'circle(0% at 50% 50%)' }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Satellite orbit rings */}
                    <div className="relative w-40 h-40">
                        {/* Center dot */}
                        <motion.div
                            className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.6, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Inner orbit */}
                        <motion.svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 160 160"
                            initial={{ rotate: 0, opacity: 0 }}
                            animate={{ rotate: 360, opacity: 1 }}
                            transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5 } }}
                        >
                            <ellipse cx="80" cy="80" rx="40" ry="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                            <circle cx="120" cy="80" r="3" fill="#FF0000">
                                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                        </motion.svg>

                        {/* Outer orbit */}
                        <motion.svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 160 160"
                            initial={{ rotate: 45, opacity: 0 }}
                            animate={{ rotate: 405, opacity: 1 }}
                            transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5, delay: 0.2 } }}
                        >
                            <ellipse cx="80" cy="80" rx="60" ry="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                            <circle cx="140" cy="80" r="2" fill="rgba(255,255,255,0.6)">
                                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                        </motion.svg>

                        {/* Third orbit (perpendicular) */}
                        <motion.svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 160 160"
                            initial={{ rotate: -30, opacity: 0 }}
                            animate={{ rotate: -390, opacity: 1 }}
                            transition={{ rotate: { duration: 5, repeat: Infinity, ease: 'linear' }, opacity: { duration: 0.5, delay: 0.4 } }}
                        >
                            <ellipse cx="80" cy="80" rx="70" ry="15" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                            <circle cx="150" cy="80" r="1.5" fill="rgba(255,255,255,0.4)" />
                        </motion.svg>
                    </div>

                    {/* Brand text */}
                    <motion.div
                        className="absolute bottom-20 left-1/2 -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30">
                            Initializing
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
