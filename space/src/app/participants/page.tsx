'use client'

/*
  Supporting route for the public site.
  Rewritten in Phase 4 to describe the platform's operational network instead
  of the previous off-domain astronaut roster.
*/

import { motion, useScroll, useSpring } from 'framer-motion'
import { Brain, Globe, RadioTower, Shield, ArrowUpRight } from 'lucide-react'
import Balancer from 'react-wrap-balancer'
import { Nav } from '@/components/Nav'
import { Space3D } from '@/components/Space3D'
import { TextReveal } from '@/components/ui/TextReveal'
import { Magnetic } from '@/components/ui/Magnetic'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'

const networkRoles = [
  {
    title: 'Environmental Analysts',
    description: 'Interpret satellite, weather, and air-quality signals to understand what is changing inside a selected AOI.',
    icon: Brain,
  },
  {
    title: 'Response Operations',
    description: 'Use hazard scores, alert queues, and timelapse context to prioritize action when conditions worsen.',
    icon: Shield,
  },
  {
    title: 'Regional Monitoring Teams',
    description: 'Track vulnerable geographies over time and keep a consistent operational record across hazard seasons.',
    icon: Globe,
  },
  {
    title: 'Realtime Coordination',
    description: 'Stay connected through shared dashboards, websocket feeds, and a single view of platform readiness.',
    icon: RadioTower,
  },
]

export default function ParticipantsPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0E0E0E] text-white selection:bg-red-600/30">
      <motion.div className="fixed top-0 left-0 right-0 z-[110] h-1 origin-left bg-red-600" style={{ scaleX }} />
      <Space3D />
      <Nav />

      <section className="relative z-10 px-8 pt-64 pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-red-500"
            >
              <span className="h-px w-12 bg-red-500" />
              Operational Network
            </motion.div>

            <h1 className="text-[12vw] font-light uppercase leading-[0.8] tracking-tighter md:text-[9rem]">
              <TextReveal text="Teams Behind" className="inline-block" /> <br />
              <span className="text-white/20 italic font-thin">The Monitoring</span> <br />
              <TextReveal text="Loop" className="inline-block" />
            </h1>

            <div className="grid grid-cols-1 items-end gap-20 lg:grid-cols-2">
              <p className="max-w-2xl text-xl font-light leading-relaxed text-white/45 md:text-3xl">
                <Balancer>
                  Sentinel is built for analysts, operators, and regional monitoring teams who need a shared view of environmental risk without losing speed or clarity.
                </Balancer>
              </p>
              <div className="border-t border-white/5 pt-10 text-[10px] uppercase tracking-[0.3em] text-white/30">
                One operational picture across satellite analysis, hazard scoring, and response coordination.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-8 py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          {networkRoles.map((role, index) => (
            <PerspectiveCard key={role.title} className="h-full">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.7 }}
                className="flex h-full flex-col justify-between rounded-[3rem] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-xl transition-all duration-1000 hover:border-red-500/20 hover:bg-white/[0.03]"
              >
                <div>
                  <role.icon className="mb-12 h-10 w-10 text-red-500" />
                  <h3 className="text-3xl font-light tracking-tight">{role.title}</h3>
                  <p className="mt-6 text-base font-light leading-relaxed text-white/40">{role.description}</p>
                </div>
                <div className="mt-16 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 transition-all duration-700 hover:bg-white hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </motion.div>
            </PerspectiveCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-8 py-40 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[10vw] font-light uppercase tracking-tighter leading-[0.82] md:text-[7rem]">
            Built for <br />
            <span className="text-white/20 italic">Shared Response</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-xl font-light leading-relaxed text-white/35">
            Open the dashboard to review platform status, then step into the monitor when a specific area needs investigation.
          </p>
          <div className="mt-14 flex justify-center">
            <Magnetic strength={0.3}>
              <a
                href="/dashboard"
                className="group flex items-center gap-10 rounded-full border border-white/10 bg-[#0E0E0E]/60 px-14 py-8 transition-all duration-1000 hover:border-red-600 backdrop-blur-xl"
              >
                <span className="text-2xl font-light uppercase tracking-[0.28em]">Open Dashboard</span>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all duration-700 group-hover:bg-red-600 group-hover:text-white">
                  <ArrowUpRight className="h-7 w-7 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </div>
  )
}
