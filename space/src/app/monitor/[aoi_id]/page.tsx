'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Flame, Droplets, CloudRain, Wind, TreePine, TrendingDown, TrendingUp, Calendar, MapPin, Satellite, AlertTriangle } from 'lucide-react'
import { Magnetic } from '@/components/ui/Magnetic'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'

const HazardRadar = dynamic(() => import('@/components/charts/HazardRadar'), { ssr: false })
const NDVITimeline = dynamic(() => import('@/components/charts/NDVITimeline'), { ssr: false })
const ComparisonSplit = dynamic(() => import('@/components/charts/ComparisonSplit'), { ssr: false })
const EmissionsGraph = dynamic(() => import('@/components/charts/EmissionsGraph'), { ssr: false })
const RiskGauge = dynamic(() => import('@/components/charts/RiskGauge'), { ssr: false })
const RiskHeatmap = dynamic(() => import('@/components/charts/RiskHeatmap'), { ssr: false })

// --- Mock Data ---
const aoiMockData: Record<string, {
    name: string; region: string; coordinates: string; riskIndex: number
    area: string; lastScan: string; satellites: string[]
}> = {
    'amazon-basin': {
        name: 'Amazon Basin', region: 'South America', coordinates: '-3.4653, -62.2159',
        riskIndex: 78, area: '12,400 km²', lastScan: '2 hours ago', satellites: ['Sentinel-2', 'Landsat-9', 'MODIS']
    },
    'california-coast': {
        name: 'California Coast', region: 'North America', coordinates: '36.7783, -119.4179',
        riskIndex: 45, area: '5,800 km²', lastScan: '4 hours ago', satellites: ['Sentinel-2', 'GOES-18']
    },
    'congo-rainforest': {
        name: 'Congo Rainforest', region: 'Africa', coordinates: '-0.2280, 25.9237',
        riskIndex: 62, area: '18,200 km²', lastScan: '6 hours ago', satellites: ['Sentinel-2', 'Landsat-9']
    },
}

const defaultAOI = {
    name: 'Unknown AOI', region: 'Unknown', coordinates: '0.0, 0.0',
    riskIndex: 50, area: '—', lastScan: '—', satellites: ['Sentinel-2']
}

const hazardTabs = [
    { id: 'fire', label: 'Wildfire', icon: Flame, color: '#EF4444' },
    { id: 'flood', label: 'Flood', icon: Droplets, color: '#3B82F6' },
    { id: 'drought', label: 'Drought', icon: CloudRain, color: '#F59E0B' },
    { id: 'air', label: 'Air Quality', icon: Wind, color: '#8B5CF6' },
    { id: 'deforestation', label: 'Deforestation', icon: TreePine, color: '#10B981' },
]

const radarData = [
    { label: 'Wildfire', value: 72, max: 100 },
    { label: 'Flood', value: 35, max: 100 },
    { label: 'Drought', value: 58, max: 100 },
    { label: 'Air Quality', value: 41, max: 100 },
    { label: 'Deforestation', value: 85, max: 100 },
]

const ndviData = Array.from({ length: 24 }, (_, i) => ({
    date: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i % 12]} ${i < 12 ? '24' : '25'}`,
    value: 0.45 + Math.sin(i * 0.5) * 0.15 + (Math.random() - 0.5) * 0.05,
    anomaly: i === 8 || i === 19,
}))

const emissionsData = Array.from({ length: 12 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 120 + Math.sin(i * 0.6) * 40 + Math.random() * 20,
}))

const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    row: Math.floor(i / 6), col: i % 6,
    value: Math.floor(Math.random() * 100),
}))

const tabContent: Record<string, { title: string; description: string; severity: string; trend: number }> = {
    fire: { title: 'Wildfire Risk Assessment', description: 'Active fire detection via MODIS thermal anomalies. Fuel moisture index below critical threshold in northeast quadrant. VIIRS hotspots detected within 50km radius.', severity: 'HIGH', trend: 12 },
    flood: { title: 'Flood Risk Analysis', description: 'Soil moisture at 78% saturation. River gauge levels nominal but rising. Precipitation forecast indicates moderate rainfall over next 72 hours.', severity: 'MODERATE', trend: -5 },
    drought: { title: 'Drought Monitoring', description: 'Palmer Drought Severity Index at -2.3 (moderate drought). Evapotranspiration rates elevated 15% above seasonal average. Groundwater reserves declining.', severity: 'MODERATE', trend: 8 },
    air: { title: 'Air Quality Assessment', description: 'PM2.5 concentrations at 34 µg/m³ (moderate). Tropospheric NO2 column density elevated near industrial zones. AOD values indicate moderate aerosol loading.', severity: 'LOW', trend: -3 },
    deforestation: { title: 'Deforestation Detection', description: 'Change detection analysis reveals 2.4 km² of canopy loss in past 30 days. Edge regression rate accelerating compared to prior quarter. Logging road network expanding.', severity: 'CRITICAL', trend: 22 },
}

export default function AOIDeepDivePage() {
    const params = useParams()
    const router = useRouter()
    const aoiId = params.aoi_id as string
    const aoi = aoiMockData[aoiId] || defaultAOI
    const [activeTab, setActiveTab] = useState('fire')
    const currentTab = tabContent[activeTab]

    const severityColor: Record<string, string> = {
        LOW: '#10B981', MODERATE: '#F59E0B', HIGH: '#EF4444', CRITICAL: '#EF4444'
    }

    return (
        <div className="min-h-screen bg-[#0E0E0E] text-white">
            {/* Hero Banner */}
            <div className="relative h-[320px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E0E0E]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E]/80 to-transparent" />
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80)` }}
                />

                {/* Back button */}
                <div className="absolute top-8 left-8 z-20">
                    <Magnetic strength={0.3}>
                        <button
                            onClick={() => router.push('/monitor')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Monitor
                        </button>
                    </Magnetic>
                </div>

                {/* Hero content */}
                <div className="absolute bottom-8 left-8 right-8 z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-white/40" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                                {aoi.region} • {aoi.coordinates}
                            </span>
                        </div>
                        <h1 className="text-5xl font-bold tracking-tighter uppercase">{aoi.name}</h1>
                        <div className="flex items-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                                <Satellite className="w-3.5 h-3.5" />
                                {aoi.satellites.join(' · ')}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5" />
                                Last scan: {aoi.lastScan}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Overview Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Risk Gauge */}
                    <PerspectiveCard className="h-full">
                        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8 flex flex-col items-center justify-center h-full">
                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">Composite Risk Index</p>
                            <RiskGauge value={aoi.riskIndex} size={200} />
                        </div>
                    </PerspectiveCard>

                    {/* Hazard Radar */}
                    <PerspectiveCard className="h-full">
                        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8 flex flex-col items-center justify-center h-full">
                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">Hazard Distribution</p>
                            <HazardRadar data={radarData} size={260} />
                        </div>
                    </PerspectiveCard>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        {[
                            { label: 'Area Monitored', value: aoi.area, icon: MapPin },
                            { label: 'Active Alerts', value: '3', icon: AlertTriangle, alert: true },
                            { label: 'Change Rate', value: '-2.4%', icon: TrendingDown },
                            { label: 'Coverage', value: '94%', icon: Satellite },
                        ].map((stat) => (
                            <PerspectiveCard key={stat.label}>
                                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.alert ? 'bg-red-500/10' : 'bg-white/5'}`}>
                                            <stat.icon className={`w-4 h-4 ${stat.alert ? 'text-red-400' : 'text-white/40'}`} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</span>
                                    </div>
                                    <span className="text-lg font-bold text-white">{stat.value}</span>
                                </div>
                            </PerspectiveCard>
                        ))}
                    </div>
                </div>

                {/* Tabbed Hazard Breakdown */}
                <section className="mb-16">
                    <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">Hazard Analysis</h2>

                    {/* Tab buttons */}
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                        {hazardTabs.map((tab) => (
                            <Magnetic key={tab.id} strength={0.2}>
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'text-white'
                                            : 'text-white/30 hover:text-white/60 hover:bg-white/[0.03]'
                                    }`}
                                    style={activeTab === tab.id ? { backgroundColor: `${tab.color}20`, boxShadow: `0 0 20px ${tab.color}15` } : {}}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            </Magnetic>
                        ))}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight">{currentTab.title}</h3>
                                    <p className="text-sm text-white/40 mt-2 max-w-xl leading-relaxed normal-case tracking-normal">
                                        {currentTab.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span
                                        className="text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1.5 rounded-full"
                                        style={{ color: severityColor[currentTab.severity], backgroundColor: `${severityColor[currentTab.severity]}15` }}
                                    >
                                        {currentTab.severity}
                                    </span>
                                    <div className={`flex items-center gap-1 text-[10px] font-bold ${currentTab.trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {currentTab.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(currentTab.trend)}%
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* NDVI Timeline */}
                <section className="mb-16">
                    <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">Vegetation Health (NDVI)</h2>
                    <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8">
                        <NDVITimeline data={ndviData} width={900} height={260} className="w-full overflow-x-auto" />
                    </div>
                </section>

                {/* Before/After Comparison */}
                <section className="mb-16">
                    <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">Satellite Comparison</h2>
                    <ComparisonSplit
                        beforeSrc="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80"
                        afterSrc="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80"
                        beforeLabel="Jan 2025"
                        afterLabel="Mar 2025"
                        className="max-w-4xl"
                    />
                </section>

                {/* Bottom Grid: Emissions + Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section>
                        <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">CO₂ Emissions Trend</h2>
                        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8">
                            <EmissionsGraph data={emissionsData} width={480} height={220} />
                        </div>
                    </section>
                    <section>
                        <h2 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-6">Risk Distribution</h2>
                        <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-8">
                            <RiskHeatmap
                                data={heatmapData}
                                rows={5}
                                cols={6}
                                cellSize={44}
                                rowLabels={['Fire', 'Flood', 'Drought', 'Air', 'Deforest']}
                                colLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
