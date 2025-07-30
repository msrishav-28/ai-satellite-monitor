import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: 'default' | 'minimal' | 'detailed';
}

export default function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  variant = 'default'
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
        >
          {variant === 'minimal' ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel-purple p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="text-lg font-medium text-text-primary">{message}</span>
              </div>
            </motion.div>
          ) : variant === 'detailed' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel-purple p-8 rounded-2xl max-w-md mx-4 text-center"
            >
              <motion.div
                className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <h3 className="text-xl font-semibold text-text-primary mb-2">{message}</h3>
              <p className="text-text-secondary">Please wait while we process your request</p>

              {/* Progress dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel-purple p-8 rounded-2xl flex flex-col items-center"
            >
              <motion.div
                className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-lg font-medium text-text-primary">{message}</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Legacy export for backward compatibility
export { LoadingOverlay as LoadingOverlayComponent };
