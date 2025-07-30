'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, ArrowRight, Shield, Brain, Zap } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dark-primary flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-accent-blue to-accent-green rounded-2xl flex items-center justify-center animate-glow">
              <Globe className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Environmental Intelligence
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
            AI-powered platform for real-time environmental analysis and multi-hazard prediction
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6"
            >
              <Shield className="w-10 h-10 text-accent-red mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Hazard Detection</h3>
              <p className="text-sm text-text-secondary">
                Real-time monitoring of wildfires, floods, and natural disasters
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-6"
            >
              <Brain className="w-10 h-10 text-accent-purple mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">AI Analytics</h3>
              <p className="text-sm text-text-secondary">
                Advanced machine learning for predictive environmental insights
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-6"
            >
              <Zap className="w-10 h-10 text-accent-orange mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Real-time Data</h3>
              <p className="text-sm text-text-secondary">
                Live satellite imagery and ground sensor integration
              </p>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push('/dashboard')}
            className="group px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-green rounded-full text-white font-semibold text-lg hover:shadow-2xl hover:shadow-accent-blue/25 transition-all duration-300 flex items-center gap-3 mx-auto"
          >
            Launch Platform
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}