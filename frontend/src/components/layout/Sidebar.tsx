'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Brain,
  BarChart3,
  Satellite,
  Clock,
  Bell,
  Download,
  Settings,
  Menu,
  X,
  Cloud,
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { icon: Globe, label: 'Interactive Map', href: '/dashboard' },
  { icon: Cloud, label: 'Environmental', href: '/dashboard/environmental' },
  { icon: Brain, label: 'AI Insights', href: '/dashboard/analysis' },
  { icon: BarChart3, label: 'Impact Analysis', href: '/dashboard/reports' },
  { icon: Satellite, label: 'Satellite View', href: '/dashboard/satellite' },
  { icon: Clock, label: 'Time-lapse', href: '/dashboard/timelapse' },
  { icon: Bell, label: 'Alerts', href: '/dashboard/alerts' },
  { icon: Download, label: 'Export', href: '/dashboard/export' },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ width: 80 }}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="glass-panel flex flex-col py-6 shadow-glass-lg z-50 border-r border-glass-border-strong relative overflow-hidden"
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-purple-600/5" />

      <div className="flex items-center justify-center mb-8 relative z-10">
        <motion.div
          className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl flex items-center justify-center cursor-pointer shadow-purple group relative overflow-hidden"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {isExpanded ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </motion.div>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-4 relative z-10">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={clsx(
                'nav-item group relative overflow-hidden',
                isActive ? 'nav-item-active' : 'hover:bg-glass-secondary'
              )}
              whileHover={{
                x: 6,
                transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              )}

              <item.icon className={clsx(
                'w-5 h-5 transition-colors duration-200',
                isActive ? 'text-purple-400' : 'text-text-secondary group-hover:text-purple-400'
              )} />

              {!isExpanded && (
                <motion.div
                  className="absolute left-16 glass-panel px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50"
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                >
                  <span className="text-sm font-medium text-text-primary">{item.label}</span>
                </motion.div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    className={clsx(
                      'ml-4 text-sm font-medium transition-colors duration-200',
                      isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      <div className="px-4 mt-auto">
        <motion.button
          onClick={() => router.push('/dashboard/settings')}
          className="nav-item w-full"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="w-5 h-5 text-text-secondary" />
          {isExpanded && (
            <span className="ml-4 text-sm font-medium text-text-secondary">
              Settings
            </span>
          )}
        </motion.button>
      </div>
    </motion.nav>
  )
}