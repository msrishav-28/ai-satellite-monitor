'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import {
    Globe,
    Shield,
    AlertTriangle,
    Satellite,
    TrendingUp,
    TrendingDown,
    Activity,
    Flame,
    Droplets,
    Wind,
    TreePine,
    ArrowUpRight,
    Clock,
    MapPin,
    Eye,
} from 'lucide-react'
import Link from 'next/link'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'
import { Magnetic } from '@/components/ui/Magnetic'
import { TextReveal } from '@/components/ui/TextReveal'

// --- Animated Counter Component ---
function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
    const count = useMotionValue(0)
    const rounded = useTransform(count, (latest) => Math.round(latest))
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        const controls = animate(count, value, {
            duration,
            ease: [0.22, 1, 0.36, 1],
        })
        const unsubscribe = rounded.on('change', (v) => setDisplay(v))
        return () => {
            controls.stop()
            unsubscribe()
        }
    }, [value, duration, count, rounded])

    return <span>{display.toLocaleString()}</span>
}

// --- KPI Card ---
interface KPICardProps {
    title: string
    value: number
    suffix?: string
    trend: number
    icon: React.ElementType
    color: string
}

function KPICard({ title, value, suffix = '', trend, icon: Icon, color }: KPICardProps) {
    const isPositive = trend >= 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
        <PerspectiveCard className="h-full">
            <div className="h-full bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}/10`}>
                        <Icon className={`w-5 h-5 text-${color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${isPositive ? 'text-[var(--status-safe)]' : 'text-[var(--status-critical)]'}`}>
                        <TrendIcon className="w-3 h-3" />
                        {Math.abs(trend)}%
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">
                        {title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-white">
                        <AnimatedCounter value={value} />
                        {suffix && <span className="text-lg text-white/40 ml-1">{suffix}</span>}
                    </p>
                </div>
            </div>
        </PerspectiveCard>
    )
}

// --- Activity Item ---
interface ActivityItemProps {
    time: string
    title: string
    description: string
    type: 'alert' | 'analysis' | 'update' | 'satellite'
}

function ActivityItem({ time, title, description, type }: ActivityItemProps) {
    const iconMap = {
        alert: { icon: AlertTriangle, color: 'text-[var(--status-warning)]' },
        analysis: { icon: Eye, color: 'text-[var(--ops-blue)]' },
        update: { icon: Activity, color: 'text-[var(--status-safe)]' },
        satellite: { icon: Satellite, color: 'text-white/60' },
    }
    const { icon: Icon, color } = iconMap[type]

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 py-4 border-b border-white/5 last:border-0"
        >
            <div className={`w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{title}</p>
                <p className="text-xs text-white/30 mt-0.5">{description}</p>
            </div>
            <span className="text-[10px] text-white/20 tracking-wider flex-shrink-0">{time}</span>
        </motion.div>
    )
}

// --- AOI Card ---
interface AOICardProps {
    name: string
    location: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    lastUpdated: string
    hazards: string[]
}

function AOICard({ name, location, riskLevel, lastUpdated, hazards }: AOICardProps) {
    const riskColors = {
        low: 'bg-[var(--status-safe)] text-black',
        medium: 'bg-[var(--status-warning)] text-black',
        high: 'bg-[var(--status-critical)] text-white',
        critical: 'bg-red-600 text-white',
    }

    return (
        <PerspectiveCard>
            <Link href="/monitor" className="block">
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-5 hover:bg-white/[0.04] transition-colors group">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white normal-case tracking-normal">{name}</h3>
                            <p className="text-[10px] text-white/30 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3" /> {location}
                            </p>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${riskColors[riskLevel]}`}>
                            {riskLevel}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        {hazards.map((hazard) => (
                            <span key={hazard} className="text-[9px] text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                                {hazard}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/20 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lastUpdated}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                </div>
            </Link>
        </PerspectiveCard>
    )
}

// --- Sample Data ---
const kpiData: KPICardProps[] = [
    { title: 'Active AOIs', value: 12, trend: 8, icon: Globe, color: 'white' },
    { title: 'Active Alerts', value: 7, trend: -12, icon: AlertTriangle, color: 'red-500' },
    { title: 'Satellites Tracked', value: 34, trend: 3, icon: Satellite, color: 'white' },
    { title: 'Risk Index', value: 67, suffix: '/100', trend: -5, icon: Shield, color: 'red-500' },
]

const activityData: ActivityItemProps[] = [
    { time: '2m ago', title: 'Wildfire risk elevated', description: 'AOI "Amazon Basin" — fire risk increased to HIGH', type: 'alert' },
    { time: '15m ago', title: 'Analysis complete', description: 'NDVI analysis for "Borneo Rainforest" finished', type: 'analysis' },
    { time: '1h ago', title: 'Sentinel-2 pass', description: 'New imagery available for 8 AOIs', type: 'satellite' },
    { time: '2h ago', title: 'Deforestation detected', description: 'AOI "Congo Basin" — 12 hectares cleared', type: 'alert' },
    { time: '3h ago', title: 'System update', description: 'Hazard prediction model v2.3 deployed', type: 'update' },
    { time: '5h ago', title: 'Flood risk normalized', description: 'AOI "Bangladesh Delta" — risk returned to LOW', type: 'update' },
]

const aoiData: AOICardProps[] = [
    { name: 'Amazon Basin', location: 'Brazil', riskLevel: 'critical', lastUpdated: '2 min ago', hazards: ['Fire', 'Deforestation'] },
    { name: 'Borneo Rainforest', location: 'Indonesia', riskLevel: 'high', lastUpdated: '15 min ago', hazards: ['Deforestation', 'Erosion'] },
    { name: 'Bangladesh Delta', location: 'Bangladesh', riskLevel: 'low', lastUpdated: '1 hr ago', hazards: ['Flood', 'Erosion'] },
    { name: 'California Coast', location: 'USA', riskLevel: 'medium', lastUpdated: '2 hr ago', hazards: ['Fire', 'Drought'] },
    { name: 'Congo Basin', location: 'DRC', riskLevel: 'high', lastUpdated: '30 min ago', hazards: ['Deforestation', 'Air'] },
    { name: 'Great Barrier Reef', location: 'Australia', riskLevel: 'medium', lastUpdated: '4 hr ago', hazards: ['Water', 'Erosion'] },
]

// --- Main Dashboard Page ---
export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#0E0E0E] p-8">
            {/* Header */}
            <div className="mb-12">
                <TextReveal>
                    <h1 className="text-4xl font-bold text-white">Mission Control</h1>
                </TextReveal>
                <p className="text-sm text-white/30 mt-2 normal-case tracking-normal">
                    Environmental intelligence — real-time satellite monitoring overview
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                {kpiData.map((kpi, i) => (
                    <motion.div
                        key={kpi.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <KPICard {...kpi} />
                    </motion.div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Timeline — 1 col */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="lg:col-span-1"
                >
                    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[2rem] p-6 h-full">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6">
                            Live Activity
                        </h2>
                        <div className="space-y-0">
                            {activityData.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.05 }}
                                >
                                    <ActivityItem {...item} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* AOI Grid — 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                            Areas of Interest
                        </h2>
                        <Magnetic strength={0.2}>
                            <Link
                                href="/monitor"
                                className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors flex items-center gap-2"
                            >
                                View All <ArrowUpRight className="w-3 h-3" />
                            </Link>
                        </Magnetic>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {aoiData.map((aoi, i) => (
                            <motion.div
                                key={aoi.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + i * 0.05 }}
                            >
                                <AOICard {...aoi} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
