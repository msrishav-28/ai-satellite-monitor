'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel-purple p-8 rounded-2xl max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertTriangle className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Something went wrong!
        </h2>

        <p className="text-text-secondary mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>

        <motion.button
          onClick={reset}
          className="glass-button-purple px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </motion.button>
      </motion.div>
    </div>
  )
}