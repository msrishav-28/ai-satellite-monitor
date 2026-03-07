'use client'

import React from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Shield, Brain, Zap, Flame, Droplet, Mountain, Trees, Sun, Wind, ArrowUpRight } from 'lucide-react'
import { Nav } from '@/components/Nav'
import { Space3D } from '@/components/Space3D'
import { TextReveal } from '@/components/ui/TextReveal'
import { Magnetic } from '@/components/ui/Magnetic'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'
import Balancer from 'react-wrap-balancer'

const hazardTypes = [
    { title: 'Wildfire Risk', icon: Flame, desc: 'Real-time fire detection and spread prediction using satellite thermal imaging and AI.', color: 'text-red-500' },
    { title: 'Flood Analysis', icon: Droplet, desc: 'Hydrological modeling and flood susceptibility mapping from precipitation data.', color: 'text-blue-400' },
    { title: 'Landslide Detection', icon: Mountain, desc: 'Terrain stability analysis combining DEM data with rainfall and seismic indicators.', color: 'text-yellow-400' },
    { title: 'Deforestation', icon: Trees, desc: 'Forest cover change detection via NDVI time-series analysis from satellite imagery.', color: 'text-green-400' },
    { title: 'Heat Wave Forecast', icon: Sun, desc: 'Urban heat island mapping and extreme temperature event prediction models.', color: 'text-orange-400' },
    { title: 'Cyclone Tracking', icon: Wind, desc: 'Storm trajectory prediction and intensity modeling from atmospheric datasets.', color: 'text-purple-400' },
]

export default function AnalysisPage() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <div className="min-h-screen bg-[#0E0E0E] text-white selection:bg-red-600/30 overflow-x-hidden relative">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-red-600 origin-left z-[110]"
                style={{ scaleX }}
            />
            <Space3D />
            <Nav />

            {/* Hero Section */}
            <section className="relative pt-64 pb-32 px-8 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-4 text-red-500 font-bold tracking-[0.4em] uppercase text-[10px]"
                        >
                            <span className="w-12 h-px bg-red-500" />
                            Environmental Intelligence
                        </motion.div>

                        <h1 className="text-[12vw] md:text-[10rem] font-light leading-[0.8] tracking-tighter uppercase mb-8">
                            <TextReveal text="Hazard" className="inline-block" /> <br />
                            <motion.span
                                initial={{ opacity: 0, skewX: 20 }}
                                animate={{ opacity: 1, skewX: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="text-white/20 italic font-thin block md:inline"
                            >
                                & Impact
                            </motion.span> <br />
                            <TextReveal text="Analysis" className="inline-block" />
                        </h1>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-end mt-12">
                            <p className="text-white/50 text-xl md:text-3xl leading-tight font-light max-w-2xl">
                                <Balancer>
                                    AI-powered multi-hazard prediction combining satellite imagery, ground sensors, and advanced machine learning for real-time environmental risk assessment.
                                </Balancer>
                            </p>

                            <div className="grid grid-cols-3 gap-12 text-[10px] text-white/30 tracking-[0.3em] uppercase border-t border-white/5 pt-12">
                                <div className="space-y-4">
                                    <span className="block text-white/10">Data Sources</span>
                                    <span className="text-white text-3xl font-light tracking-tighter lowercase">6<span className="text-xs text-red-600 ml-1 uppercase">live</span></span>
                                </div>
                                <div className="space-y-4">
                                    <span className="block text-white/10">Hazard Models</span>
                                    <span className="text-white text-3xl font-light tracking-tighter lowercase">6<span className="text-xs text-red-600 ml-1 uppercase">active</span></span>
                                </div>
                                <div className="space-y-4">
                                    <span className="block text-white/10">Coverage</span>
                                    <span className="text-white text-3xl font-light tracking-tighter lowercase">Global<span className="text-xs text-red-600 ml-1 uppercase">sat</span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hazard Grid */}
            <section className="py-24 px-8 z-10 relative">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 mb-32 border-b border-white/5 pb-16">
                    <div className="space-y-8">
                        <h2 className="text-6xl md:text-[8rem] font-light uppercase tracking-tighter italic leading-none">Hazards</h2>
                        <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-bold">Active Monitoring</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hazardTypes.map((hazard, i) => (
                        <PerspectiveCard key={i}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group h-full p-12 bg-white/[0.01] border border-white/5 rounded-[3rem] hover:bg-white/[0.03] hover:border-red-500/20 transition-all duration-1000 flex flex-col justify-between"
                            >
                                <div>
                                    <hazard.icon className={`w-10 h-10 ${hazard.color} mb-16 group-hover:scale-110 transition-transform duration-700`} />
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-light tracking-tight">{hazard.title}</h3>
                                        <p className="text-white/40 text-sm leading-relaxed font-light">{hazard.desc}</p>
                                    </div>
                                </div>
                                <Magnetic strength={0.2}>
                                    <div className="mt-16 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-700">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </Magnetic>
                            </motion.div>
                        </PerspectiveCard>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-64 px-8 relative overflow-hidden z-10">
                <div className="max-w-7xl mx-auto text-center space-y-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true }}
                        className="text-[10vw] md:text-[12rem] font-light uppercase tracking-tighter leading-none"
                    >
                        Start <br />
                        <span className="text-white/20 italic">Monitoring</span>
                    </motion.h2>
                    <div className="flex justify-center pt-12">
                        <Magnetic strength={0.3}>
                            <a href="/monitor" className="group flex items-center gap-12 px-16 py-10 rounded-full border border-white/10 hover:border-red-600 transition-all duration-1000 bg-[#0E0E0E]/50 backdrop-blur-xl">
                                <span className="text-2xl font-light tracking-[0.3em] uppercase">Open Dashboard</span>
                                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-700">
                                    <ArrowUpRight className="w-8 h-8" />
                                </div>
                            </a>
                        </Magnetic>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-32 px-12 border-t border-white/5 relative z-10 bg-[#0E0E0E]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12 pt-16 border-t border-white/5 text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">
                        <p>© 2025 Environmental Intelligence Platform — All Systems Operational</p>
                        <div className="flex gap-16">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Protocols</a>
                            <a href="#" className="hover:text-white transition-colors">Ethics</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
