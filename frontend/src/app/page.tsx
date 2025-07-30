'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, Shield, Brain, Zap } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-purple-800/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-gentle" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '2s' }} />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <motion.div
            className="flex justify-center mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl flex items-center justify-center shadow-purple-lg animate-glow-pulse">
                <Globe className="w-14 h-14 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-3xl blur-xl animate-glow-pulse" />
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-display font-bold mb-8 text-gradient leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            Environmental Intelligence
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-text-secondary mb-16 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            AI-powered platform for real-time environmental analysis and multi-hazard prediction
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }}
              className="glass-panel p-8 group cursor-pointer"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Hazard Detection</h3>
              <p className="text-text-secondary leading-relaxed">
                Real-time monitoring of wildfires, floods, and natural disasters with advanced AI prediction models
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.0,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }}
              className="glass-panel-purple p-8 group cursor-pointer"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">AI Analytics</h3>
              <p className="text-text-secondary leading-relaxed">
                Advanced machine learning algorithms for predictive environmental insights and pattern recognition
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 1.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
              }}
              className="glass-panel p-8 group cursor-pointer"
            >
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text-primary">Real-time Data</h3>
              <p className="text-text-secondary leading-relaxed">
                Live satellite imagery and ground sensor integration with millisecond-precision updates
              </p>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl text-white font-semibold text-lg shadow-purple-lg hover:shadow-purple transition-all duration-300 flex items-center gap-4 mx-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">Launch Platform</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}