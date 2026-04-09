'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, Flame, Droplets, Wind, TreePine, CloudRain, X, Check, ChevronDown, MapPin, Clock, Filter } from 'lucide-react'
import { Magnetic } from '@/components/ui/Magnetic'
import { TextReveal } from '@/components/ui/TextReveal'

type Severity = 'critical' | 'high' | 'moderate' | 'low'
type AlertStatus = 'active' | 'acknowledged' | 'resolved'

interface Alert {
    id: string
    title: string
    description: string
    severity: Severity
    status: AlertStatus
    aoi: string
    type: string
    timestamp: string
    icon: React.ElementType
}

const severityConfig: Record<Severity, { color: string; bg: string; label: string }> = {
    critical: { color: '#EF4444', bg: 'bg-red-500/10', label: 'CRITICAL' },
    high: { color: '#F97316', bg: 'bg-orange-500/10', label: 'HIGH' },
    moderate: { color: '#F59E0B', bg: 'bg-amber-500/10', label: 'MODERATE' },
    low: { color: '#10B981', bg: 'bg-emerald-500/10', label: 'LOW' },
}

const typeIcons: Record<string, React.ElementType> = {
    wildfire: Flame, flood: Droplets, drought: CloudRain, air: Wind, deforestation: TreePine
}

const mockAlerts: Alert[] = [
    { id: 'a1', title: 'Active Fire Detected', description: 'VIIRS thermal anomaly cluster detected within Amazon Basin AOI. 12 hotspots above 350K brightness temperature threshold. Confidence: 95%.', severity: 'critical', status: 'active', aoi: 'Amazon Basin', type: 'wildfire', timestamp: '12 min ago', icon: Flame },
    { id: 'a2', title: 'Rapid Canopy Loss', description: 'Change detection algorithm flagged 1.8 km² of forest cover loss in northeast sector over past 7 days. Rate exceeds historical baseline by 340%.', severity: 'critical', status: 'active', aoi: 'Borneo Lowlands', type: 'deforestation', timestamp: '28 min ago', icon: TreePine },
    { id: 'a3', title: 'Flood Risk Elevated', description: 'Soil moisture saturation at 92%. Combined with precipitation forecast of 45mm/24hr, flood probability exceeds 70% for low-lying zones.', severity: 'high', status: 'active', aoi: 'Congo Rainforest', type: 'flood', timestamp: '1 hr ago', icon: Droplets },
    { id: 'a4', title: 'Air Quality Degradation', description: 'PM2.5 readings exceeded 55 µg/m³ (unhealthy for sensitive groups). Smoke plume from nearby agricultural burning detected via MODIS.', severity: 'moderate', status: 'acknowledged', aoi: 'Siberian Taiga', type: 'air', timestamp: '2 hrs ago', icon: Wind },
    { id: 'a5', title: 'Drought Index Rising', description: 'Palmer Drought Severity Index dropped to -3.1 (severe drought). Evapotranspiration rates 25% above seasonal norm.', severity: 'moderate', status: 'acknowledged', aoi: 'Sahel Region', type: 'drought', timestamp: '3 hrs ago', icon: CloudRain },
    { id: 'a6', title: 'Vegetation Anomaly', description: 'NDVI values dropped 0.12 below 30-day rolling average in southeast quadrant. Possible early-stage drought stress or pest infestation.', severity: 'low', status: 'resolved', aoi: 'Mediterranean Basin', type: 'drought', timestamp: '6 hrs ago', icon: CloudRain },
    { id: 'a7', title: 'Fire Weather Watch', description: 'Relative humidity forecast below 15% with wind gusts above 40 km/h. Red Flag Warning conditions expected for next 48 hours.', severity: 'high', status: 'active', aoi: 'California Coast', type: 'wildfire', timestamp: '45 min ago', icon: Flame },
    { id: 'a8', title: 'Normal Conditions', description: 'All monitored parameters within normal ranges. No anomalies detected in latest satellite pass.', severity: 'low', status: 'resolved', aoi: 'Great Barrier Reef', type: 'flood', timestamp: '8 hrs ago', icon: Droplets },
]

export default function AlertsPage() {
    const [alerts, setAlerts] = useState(mockAlerts)
    const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
    const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all')
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const filtered = alerts.filter(a =>
        (severityFilter === 'all' || a.severity === severityFilter) &&
        (statusFilter === 'all' || a.status === statusFilter)
    )

    const counts = {
        active: alerts.filter(a => a.status === 'active').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
    }

    const acknowledge = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' as AlertStatus } : a))
    }
    const resolve = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as AlertStatus } : a))
    }

    return (
        <div className="min-h-screen bg-[#0E0E0E] p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-10">
                <div>
                    <TextReveal text="Alerts" className="text-4xl font-bold text-white" />
                    <p className="text-sm text-white/30 mt-2 normal-case tracking-normal">
                        Real-time environmental alerts and notifications
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Active badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">{counts.active} Active</span>
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-3 mb-8">
                {[
                    { key: 'all' as const, label: 'All Alerts', count: alerts.length },
                    { key: 'active' as const, label: 'Active', count: counts.active },
                    { key: 'acknowledged' as const, label: 'Acknowledged', count: counts.acknowledged },
                    { key: 'resolved' as const, label: 'Resolved', count: counts.resolved },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                            statusFilter === tab.key
                                ? 'bg-white/[0.08] text-white'
                                : 'text-white/30 hover:text-white/60'
                        }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-white/20">{tab.count}</span>
                    </button>
                ))}

                <div className="ml-auto flex items-center gap-2">
                    {(['critical', 'high', 'moderate', 'low'] as Severity[]).map((sev) => (
                        <button
                            key={sev}
                            onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
                            className={`w-3 h-3 rounded-full border-2 transition-all ${
                                severityFilter === sev ? 'scale-125' : 'opacity-50 hover:opacity-80'
                            }`}
                            style={{ borderColor: severityConfig[sev].color, backgroundColor: severityFilter === sev ? severityConfig[sev].color : 'transparent' }}
                            title={severityConfig[sev].label}
                        />
                    ))}
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {filtered.map((alert, i) => {
                        const config = severityConfig[alert.severity]
                        const isExpanded = expandedId === alert.id

                        return (
                            <motion.div
                                key={alert.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: i * 0.03, duration: 0.3 }}
                                className={`bg-white/[0.02] border backdrop-blur-xl rounded-[1.25rem] overflow-hidden transition-colors ${
                                    alert.status === 'active' ? 'border-white/10' : 'border-white/[0.03]'
                                }`}
                            >
                                {/* Alert header row */}
                                <div
                                    className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.015] transition-colors"
                                    onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                                >
                                    {/* Severity indicator */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                                        <alert.icon className="w-4.5 h-4.5" style={{ color: config.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-sm font-semibold truncate">{alert.title}</h3>
                                            <span
                                                className="text-[8px] font-bold uppercase tracking-[0.3em] px-2 py-0.5 rounded-full flex-shrink-0"
                                                style={{ color: config.color, backgroundColor: `${config.color}15` }}
                                            >
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                <MapPin className="w-2.5 h-2.5" /> {alert.aoi}
                                            </span>
                                            <span className="text-[10px] text-white/20 flex items-center gap-1">
                                                <Clock className="w-2.5 h-2.5" /> {alert.timestamp}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status + actions */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {alert.status === 'active' && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        )}
                                        {alert.status === 'acknowledged' && (
                                            <span className="text-[9px] text-amber-400/60 font-bold uppercase tracking-widest">Ack&apos;d</span>
                                        )}
                                        {alert.status === 'resolved' && (
                                            <span className="text-[9px] text-emerald-400/60 font-bold uppercase tracking-widest">Resolved</span>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-5 pt-0 border-t border-white/[0.03]">
                                                <p className="text-sm text-white/40 leading-relaxed mt-4 mb-5 normal-case tracking-normal">
                                                    {alert.description}
                                                </p>
                                                {alert.status !== 'resolved' && (
                                                    <div className="flex items-center gap-2">
                                                        {alert.status === 'active' && (
                                                            <Magnetic strength={0.2}>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); acknowledge(alert.id) }}
                                                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:bg-amber-500/20 transition-all"
                                                                >
                                                                    <Bell className="w-3 h-3" />
                                                                    Acknowledge
                                                                </button>
                                                            </Magnetic>
                                                        )}
                                                        <Magnetic strength={0.2}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); resolve(alert.id) }}
                                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/20 transition-all"
                                                            >
                                                                <Check className="w-3 h-3" />
                                                                Resolve
                                                            </button>
                                                        </Magnetic>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <Bell className="w-8 h-8 text-white/10 mx-auto mb-4" />
                        <p className="text-sm text-white/20">No alerts match the current filters</p>
                    </div>
                )}
            </div>
        </div>
    )
}
