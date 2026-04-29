'use client'

/*
  Supporting public route for the platform.
  Rewritten in Phase 4 to showcase monitoring campaigns and use cases instead
  of the previous off-domain space travel content.
*/

import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight, Flame, Droplets, Trees, Wind } from 'lucide-react'
import Balancer from 'react-wrap-balancer'
import { Nav } from '@/components/Nav'
import { Space3D } from '@/components/Space3D'
import { TextReveal } from '@/components/ui/TextReveal'
import { Magnetic } from '@/components/ui/Magnetic'
import { PerspectiveCard } from '@/components/ui/PerspectiveCard'

const campaigns = [
  {
    title: 'Wildfire Escalation Watch',
    icon: Flame,
    description: 'Track heat, wind, vegetation stress, and topography together when ignition risk starts to rise.',
  },
  {
    title: 'Flood Exposure Review',
    icon: Droplets,
    description: 'Compare precipitation, drainage, and surface change to understand where flood pressure is building first.',
  },
  {
    title: 'Forest Change Monitoring',
    icon: Trees,
    description: 'Inspect vegetation trends, land-cover shifts, and impact signals for ecosystem protection workflows.',
  },
  {
    title: 'Air and Weather Operations',
    icon: Wind,
    description: 'Keep atmospheric context visible when smoke, dust, or storm systems affect visibility and health conditions.',
  },
]

export default function TripsPage() {
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-red-500"
          >
            <span className="h-px w-12 bg-red-500" />
            Monitoring Campaigns
          </motion.div>

          <h1 className="mt-10 text-[12vw] font-light uppercase leading-[0.8] tracking-tighter md:text-[9rem]">
            <TextReveal text="Operational" className="inline-block" /> <br />
            <span className="text-white/20 italic font-thin">Use Cases</span> <br />
            <TextReveal text="In Motion" className="inline-block" />
          </h1>

          <div className="mt-14 grid grid-cols-1 items-end gap-20 lg:grid-cols-2">
            <p className="max-w-2xl text-xl font-light leading-relaxed text-white/45 md:text-3xl">
              <Balancer>
                Each monitoring campaign begins the same way: define the AOI, fuse the signals, then review hazards, alerts, and impacts through a single operational interface.
              </Balancer>
            </p>
            <div className="border-t border-white/5 pt-10 text-[10px] uppercase tracking-[0.3em] text-white/30">
              Workflows built for risk review, trend comparison, and response prioritization.
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-8 py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
          {campaigns.map((campaign, index) => (
            <PerspectiveCard key={campaign.title}>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.7 }}
                className="flex h-full flex-col justify-between rounded-[3rem] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-xl transition-all duration-1000 hover:border-red-500/20 hover:bg-white/[0.03]"
              >
                <div>
                  <campaign.icon className="mb-12 h-10 w-10 text-red-500" />
                  <h3 className="text-3xl font-light tracking-tight">{campaign.title}</h3>
                  <p className="mt-6 text-base font-light leading-relaxed text-white/40">{campaign.description}</p>
                </div>
                <div className="mt-16 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 transition-all duration-700 hover:bg-white hover:text-black">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </motion.div>
            </PerspectiveCard>
          ))}
        </div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.01] px-8 py-40">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-[10vw] font-light uppercase tracking-tighter leading-[0.82] md:text-[7rem]">
            Move from <br />
            <span className="text-white/20 italic">Observation to Action</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-xl font-light leading-relaxed text-white/35">
            The monitor is where campaigns become decisions. Draw the AOI, compare layers, and brief the current environmental picture.
          </p>
          <div className="mt-14 flex justify-center">
            <Magnetic strength={0.3}>
              <a
                href="/monitor"
                className="group flex items-center gap-10 rounded-full border border-white/10 bg-[#0E0E0E]/60 px-14 py-8 transition-all duration-1000 hover:border-red-600 backdrop-blur-xl"
              >
                <span className="text-2xl font-light uppercase tracking-[0.28em]">Open Monitor</span>
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
