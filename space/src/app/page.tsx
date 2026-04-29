'use client'

/*
  Public landing page for the environmental monitoring platform.
  Rewritten in Phase 4 to preserve the cinematic /space visual language while
  aligning the content with the product's real environmental intelligence goal.
*/

import { motion, useScroll, useSpring } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Globe,
  Layers,
  Shield,
  Waves,
  Wind,
} from 'lucide-react'
import Balancer from 'react-wrap-balancer'
import { Nav } from '@/components/Nav'
import { Space3D } from '@/components/Space3D'
import { TextReveal } from '@/components/ui/TextReveal'
import { Magnetic } from '@/components/ui/Magnetic'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'

const capabilityCards = [
  {
    title: 'Satellite Fusion',
    description: 'Blend optical imagery, terrain, precipitation, and land-cover context into one operational view of a selected area.',
    icon: Layers,
  },
  {
    title: 'Hazard Forecasting',
    description: 'Run wildfire, flood, landslide, heat, and ecosystem-risk analysis against a real AOI instead of static demo scenes.',
    icon: Shield,
  },
  {
    title: 'Atmospheric Context',
    description: 'Overlay live weather and air-quality data so heat, smoke, and storm signals can be interpreted together.',
    icon: Wind,
  },
  {
    title: 'Decision Support',
    description: 'Generate AI summaries, timelapse reviews, and impact signals that help teams prioritize monitoring and response.',
    icon: Brain,
  },
]

const workflowCards = [
  {
    step: '01',
    title: 'Define the AOI',
    description: 'Draw or search for an area of interest directly on the globe and anchor analysis to its exact footprint.',
    icon: Globe,
  },
  {
    step: '02',
    title: 'Fuse the Signals',
    description: 'Pull together environmental, satellite, and hazard-model outputs so teams can see what is changing and why.',
    icon: Waves,
  },
  {
    step: '03',
    title: 'Respond Faster',
    description: 'Use the monitor, analytics, and alerts consoles to move from observation to action with clearer operational context.',
    icon: ArrowUpRight,
  },
]

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0E0E0E] font-sans text-white antialiased selection:bg-red-600/30">
      <motion.div
        className="fixed top-0 left-0 right-0 z-[110] h-1 origin-left bg-red-600"
        style={{ scaleX }}
      />
      <Nav />
      <Space3D />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-8 pt-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 h-[85vw] w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.5em] text-red-500"
          >
            <span className="h-px w-16 bg-red-500" />
            Global Environmental Intelligence
            <span className="h-px w-16 bg-red-500" />
          </motion.div>

          <div className="mt-12 space-y-4">
            <h1 className="select-none text-[12vw] font-light uppercase italic leading-[0.75] tracking-tighter text-white/8 md:text-[12rem]">
              Monitor
            </h1>
            <h1 className="relative text-[12vw] font-light uppercase leading-[0.78] tracking-tighter md:text-[12rem]">
              <TextReveal text="Change Early" />
              <motion.span
                className="absolute -right-[0.4em] top-1/2 hidden h-4 w-4 rounded-full bg-red-600 blur-[2px] md:block"
                animate={{ scale: [1, 1.7, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mx-auto mt-12 max-w-3xl"
          >
            <p className="text-xl font-light leading-relaxed text-white/45 md:text-2xl">
              <Balancer>
                Sentinel helps teams define an area of interest, pull live environmental context, analyze hazards, and turn satellite signals into operational decisions.
              </Balancer>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-14 flex flex-col items-center justify-center gap-6 md:flex-row"
          >
            <Magnetic strength={0.3}>
              <a
                href="/monitor"
                className="group inline-flex items-center gap-4 rounded-full bg-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-black transition-all duration-700 hover:scale-105"
              >
                Open Monitor
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-4 rounded-full border border-white/10 px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all duration-700 hover:bg-white/5"
              >
                View Dashboard
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-8 py-40">
        <div className="mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-500">Platform Capabilities</p>
            <h2 className="mt-8 text-6xl font-light uppercase tracking-tighter leading-[0.85] md:text-[8rem]">
              Mission <br />
              <span className="text-white/20 italic">Systems</span>
            </h2>
          </div>
          <p className="max-w-xl text-lg font-light leading-relaxed text-white/35">
            The product is built around a single operating model: one AOI, one integrated view, and one place to inspect environmental, hazard, and response signals together.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {capabilityCards.map((card, index) => (
            <PerspectiveCard key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.7 }}
                className="group flex h-full flex-col justify-between rounded-[3rem] border border-white/5 bg-white/[0.01] p-10 transition-all duration-1000 hover:border-red-500/20 hover:bg-white/[0.03]"
              >
                <div>
                  <card.icon className="mb-14 h-10 w-10 text-red-500 transition-transform duration-700 group-hover:scale-110" />
                  <h3 className="text-2xl font-light tracking-tight">{card.title}</h3>
                  <p className="mt-6 text-sm font-light leading-relaxed text-white/40">{card.description}</p>
                </div>
                <div className="mt-16 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 transition-all duration-700 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </motion.div>
            </PerspectiveCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.01] px-8 py-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-500">Workflow</p>
              <h2 className="mt-8 text-6xl font-light uppercase tracking-tighter leading-[0.85] md:text-[8rem]">
                From Signal <br />
                <span className="text-white/20 italic">To Response</span>
              </h2>
            </div>
            <p className="max-w-xl text-lg font-light leading-relaxed text-white/35">
              The interface stays cinematic, but the workflow is practical: select, analyze, compare, and brief without leaving the product.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {workflowCards.map((card, index) => (
              <PerspectiveCard key={card.step}>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.7 }}
                  className="rounded-[3rem] border border-white/5 bg-[#0E0E0E]/80 p-12 backdrop-blur-xl"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-red-500">{card.step}</p>
                  <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/[0.04]">
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-10 text-3xl font-light tracking-tight">{card.title}</h3>
                  <p className="mt-6 text-base font-light leading-relaxed text-white/40">{card.description}</p>
                </motion.div>
              </PerspectiveCard>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 overflow-hidden px-8 py-52">
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/[0.04] blur-[180px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="text-[10vw] font-light uppercase tracking-tighter leading-[0.82] md:text-[8rem]">
            Start the <br />
            <span className="text-white/20 italic">Briefing Loop</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-xl font-light leading-relaxed text-white/35">
            Open the monitor, draw an AOI, and let the system pull together the environmental context that matters.
          </p>
          <div className="mt-14 flex justify-center">
            <Magnetic strength={0.3}>
              <a
                href="/monitor"
                className="group flex items-center gap-10 rounded-full border border-white/10 bg-[#0E0E0E]/60 px-14 py-8 transition-all duration-1000 hover:border-red-600 backdrop-blur-xl"
              >
                <span className="text-2xl font-light uppercase tracking-[0.28em]">Launch Monitor</span>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all duration-700 group-hover:bg-red-600 group-hover:text-white">
                  <ArrowRight className="h-7 w-7 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            </Magnetic>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-[#0E0E0E] px-12 py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-3xl font-bold uppercase tracking-tighter">Sentinel</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/30">
              Environmental intelligence for teams that need to see change early, understand risk quickly, and respond with more confidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
            <a href="/dashboard" className="transition-colors hover:text-white">Dashboard</a>
            <a href="/monitor" className="transition-colors hover:text-white">Monitor</a>
            <a href="/analytics" className="transition-colors hover:text-white">Analytics</a>
            <a href="/alerts" className="transition-colors hover:text-white">Alerts</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
