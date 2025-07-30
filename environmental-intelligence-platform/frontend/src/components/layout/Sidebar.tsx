'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  X
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { icon: Globe, label: 'Interactive Map', href: '/dashboard' },
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
      className="bg-dark-secondary flex flex-col py-6 shadow-xl z-50"
    >
      <div className="flex items-center justify-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
             onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={clsx(
                'nav-item group relative',
                isActive && 'bg-glass-white border border-glass-border'
              )}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className={clsx(
                'w-5 h-5',
                isActive ? 'text-accent-blue' : 'text-text-secondary group-hover:text-accent-blue'
              )} />
              
              {!isExpanded && (
                <div className="absolute left-16 bg-dark-secondary px-3 py-2 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                  {item.label}
                </div>
              )}
              
              {isExpanded && (
                <span className={clsx(
                  'ml-4 text-sm font-medium',
                  isActive ? 'text-white' : 'text-text-secondary'
                )}>
                  {item.label}
                </span>
              )}
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