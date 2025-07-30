import { motion } from 'framer-motion'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'purple' | 'elevated'
  animate?: boolean
}

export function GlassPanel({
  children,
  className = '',
  variant = 'default',
  animate = true
}: GlassPanelProps) {
  const baseClasses = {
    default: 'glass-panel',
    purple: 'glass-panel-purple',
    elevated: 'glass-panel shadow-glass-lg border-glass-border-strong'
  }

  const MotionComponent = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1]
    }
  } : {}

  return (
    <MotionComponent
      className={`${baseClasses[variant]} ${className}`}
      {...motionProps}
    >
      {children}
    </MotionComponent>
  )
}
