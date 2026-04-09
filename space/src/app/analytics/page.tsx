'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Download, Filter, Calendar, ArrowUpDown, Search, FileSpreadsheet, FileType } from 'lucide-react'
import { Magnetic } from '@/components/ui/Magnetic'
import { TextReveal } from '@/components/ui/TextReveal'

const EmissionsGraph = dynamic(() => import('@/components/charts/EmissionsGraph'), { ssr: false })
const RiskHeatmap = dynamic(() => import('@/components/charts/RiskHeatmap'), { ssr: false })
const HazardRadar = dynamic(() => import('@/components/charts/HazardRadar'), { ssr: false })

// Mock data
const tableData = [
    { id: 1, aoi: 'Amazon Basin', risk: 78, change: 12, alerts: 3, status: 'CRITICAL', lastScan: '2h ago' },
    { id: 2, aoi: 'California Coast', risk: 45, change: -5, alerts: 1, status: 'MODERATE', lastScan: '4h ago' },
    { id: 3, aoi: 'Congo Rainforest', risk: 62, change: 8, alerts: 2, status: 'HIGH', lastScan: '6h ago' },
    { id: 4, aoi: 'Borneo Lowlands', risk: 88, change: 15, alerts: 5, status: 'CRITICAL', lastScan: '1h ago' },
    { id: 5, aoi: 'Great Barrier Reef', risk: 34, change: -2, alerts: 0, status: 'LOW', lastScan: '3h ago' },
    { id: 6, aoi: 'Siberian Taiga', risk: 52, change: 6, alerts: 1, status: 'MODERATE', lastScan: '8h ago' },
    { id: 7, aoi: 'Sahel Region', risk: 71, change: 10, alerts: 2, status: 'HIGH', lastScan: '5h ago' },
    { id: 8, aoi: 'Mediterranean Basin', risk: 39, change: -8, alerts: 0, status: 'LOW', lastScan: '2h ago' },
]

const emissionsData = Array.from({ length: 12 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    value: 120 + Math.sin(i * 0.6) * 40 + Math.random() * 20,
}))

const radarData = [
    { label: 'Wildfire', value: 65 }, { label: 'Flood', value: 40 },
    { label: 'Drought', value: 55 }, { label: 'Air Quality', value: 30 }, { label: 'Deforestation', value: 75 },
]

const heatmapData = Array.from({ length: 30 }, (_, i) => ({
    row: Math.floor(i / 6), col: i % 6,
    value: Math.floor(Math.random() * 100),
}))

const statusColor: Record<string, string> = {
    LOW: '#10B981', MODERATE: '#F59E0B', HIGH: '#EF4444', CRITICAL: '#EF4444'
}

type SortKey = 'aoi' | 'risk' | 'change' | 'alerts'

export default function AnalyticsPage() {
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState<SortKey>('risk')
    const [sortAsc, setSortAsc] = useState(false)
    const [dateRange, setDateRange] = useState('30d')

    const filtered = tableData
        .filter(r => r.aoi.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const diff = (a[sortKey] as number) - (b[sortKey] as number)
            return sortAsc ? diff : -diff
        })

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortAsc(!sortAsc)
        else { setSortKey(key); setSortAsc(false) }
    }

    const exportCSV = () => {
        const header = 'AOI,Risk Index,Change %,Active Alerts,Status,Last Scan\n'
        const rows = filtered.map(r => `${r.aoi},${r.risk},${r.change},${r.alerts},${r.status},${r.lastScan}`).join('\n')
        const blob = new Blob([header + rows], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'analytics-export.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-[#0E0E0E] p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-10">
                <div>
                    <TextReveal text="Analytics" className="text-4xl font-bold text-white" />
                    <p className="text-sm text-white/30 mt-2 normal-case tracking-normal">
                        Environmental intelligence — aggregated data analysis and export
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {['7d', '30d', '90d', '1y'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                dateRange === range ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">Global Emissions Trend</p>
                    <EmissionsGraph data={emissionsData} width={360} height={180} />
                </div>
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6 flex flex-col items-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">Hazard Distribution</p>
                    <HazardRadar data={radarData} size={220} />
                </div>
                <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/30 mb-4">Monthly Risk Matrix</p>
                    <RiskHeatmap
                        data={heatmapData}
                        rows={5} cols={6} cellSize={36}
                        rowLabels={['Fire', 'Flood', 'Drought', 'Air', 'Deforest']}
                        colLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-[1.5rem] p-6">
                {/* Table toolbar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search AOIs..."
                                className="pl-9 pr-4 py-2 bg-white/[0.03] border border-white/5 rounded-full text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-white/10 w-56"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-all">
                            <Filter className="w-3 h-3" />
                            Filter
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Magnetic strength={0.2}>
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-all"
                            >
                                <FileSpreadsheet className="w-3 h-3" />
                                CSV
                            </button>
                        </Magnetic>
                        <Magnetic strength={0.2}>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-all">
                                <FileType className="w-3 h-3" />
                                PDF
                            </button>
                        </Magnetic>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {[
                                    { key: 'aoi' as SortKey, label: 'AOI Name' },
                                    { key: 'risk' as SortKey, label: 'Risk Index' },
                                    { key: 'change' as SortKey, label: 'Change' },
                                    { key: 'alerts' as SortKey, label: 'Alerts' },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20 cursor-pointer hover:text-white/40 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            <ArrowUpDown className="w-2.5 h-2.5" />
                                        </div>
                                    </th>
                                ))}
                                <th className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Status</th>
                                <th className="text-left py-3 px-4 text-[9px] font-bold uppercase tracking-[0.3em] text-white/20">Last Scan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((row, i) => (
                                <motion.tr
                                    key={row.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                                >
                                    <td className="py-4 px-4 text-sm font-medium">{row.aoi}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${row.risk}%`, backgroundColor: statusColor[row.status] }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold">{row.risk}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`text-sm font-bold ${row.change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {row.change > 0 ? '+' : ''}{row.change}%
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm">{row.alerts}</td>
                                    <td className="py-4 px-4">
                                        <span
                                            className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full"
                                            style={{ color: statusColor[row.status], backgroundColor: `${statusColor[row.status]}15` }}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-white/30">{row.lastScan}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
