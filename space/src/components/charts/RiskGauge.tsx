'use client'

import { motion } from 'framer-motion'

interface RiskGaugeProps {
  value: number
}

export function RiskGauge({ value }: RiskGaugeProps) {
  const percentage = Math.max(0, Math.min(100, value))
  const color =
    percentage > 75
      ? 'text-red-500'
      : percentage > 50
      ? 'text-orange-500'
      : percentage > 25
      ? 'text-yellow-500'
      : 'text-green-500'

  return (
    <div className="relative w-24 h-24">
      <motion.svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        initial={{ strokeDashoffset: 283 }}
        animate={{ strokeDashoffset: 283 - (percentage / 100) * 283 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <motion.circle
          className={color}
          strokeWidth="10"
          strokeDasharray="283"
          strokeDashoffset="0"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </motion.svg>
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-2xl ${color}`}>
        {percentage}
      </div>
    </div>
  )
}
