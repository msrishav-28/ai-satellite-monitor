'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Globe, BarChart3, Bell, Flame } from 'lucide-react'

const tabs = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Monitor', href: '/monitor', icon: Globe },
    { name: 'Analysis', href: '/analysis', icon: Flame },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
]

export function MobileTabBar() {
    const pathname = usePathname()

    // Only show on platform routes, not landing page
    const isPlatformRoute = tabs.some(t => pathname.startsWith(t.href))
    if (!isPlatformRoute) return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-[#0E0E0E]/90 backdrop-blur-xl border-t border-white/5 md:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname.startsWith(tab.href)
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-manipulation"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-tab-indicator"
                                    className="absolute -top-px left-3 right-3 h-0.5 bg-white rounded-full"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                            <tab.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/25'}`} />
                            <span className={`text-[8px] font-bold uppercase tracking-[0.15em] transition-colors ${isActive ? 'text-white' : 'text-white/25'}`}>
                                {tab.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
