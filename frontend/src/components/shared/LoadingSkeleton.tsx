import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'chart'
  lines?: number
  animate?: boolean
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'text',
  lines = 1,
  animate = true 
}: LoadingSkeletonProps) {
  const variants = {
    text: 'h-4 w-full',
    card: 'h-32 w-full',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-xl',
    chart: 'h-48 w-full'
  }

  const MotionComponent = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 }
  } : {}

  if (variant === 'text' && lines > 1) {
    return (
      <MotionComponent className={`space-y-3 ${className}`} {...motionProps}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`loading-skeleton ${variants.text} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
      </MotionComponent>
    )
  }

  return (
    <MotionComponent className={className} {...motionProps}>
      <div className={`loading-skeleton ${variants[variant]}`} />
    </MotionComponent>
  )
}

interface LoadingCardProps {
  className?: string
  showAvatar?: boolean
  showButton?: boolean
}

export function LoadingCard({ 
  className = '', 
  showAvatar = false, 
  showButton = false 
}: LoadingCardProps) {
  return (
    <motion.div
      className={`glass-panel p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <LoadingSkeleton variant="avatar" />
            <div className="space-y-2 flex-1">
              <LoadingSkeleton variant="text" className="w-1/3" />
              <LoadingSkeleton variant="text" className="w-1/2" />
            </div>
          </div>
        )}
        
        <LoadingSkeleton variant="text" lines={3} />
        
        {showButton && (
          <div className="flex justify-end">
            <LoadingSkeleton variant="button" />
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface LoadingChartProps {
  className?: string
  title?: string
}

export function LoadingChart({ className = '', title }: LoadingChartProps) {
  return (
    <motion.div
      className={`glass-panel p-6 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-4">
        {title && (
          <LoadingSkeleton variant="text" className="w-1/3 h-6" />
        )}
        <LoadingSkeleton variant="chart" />
        <div className="flex justify-between">
          <LoadingSkeleton variant="text" className="w-16 h-3" />
          <LoadingSkeleton variant="text" className="w-16 h-3" />
          <LoadingSkeleton variant="text" className="w-16 h-3" />
        </div>
      </div>
    </motion.div>
  )
}

interface LoadingGridProps {
  items?: number
  className?: string
  itemClassName?: string
}

export function LoadingGrid({ 
  items = 6, 
  className = '', 
  itemClassName = '' 
}: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          <LoadingCard className={itemClassName} showAvatar />
        </motion.div>
      ))}
    </div>
  )
}

// Pulse animation for loading states
export function LoadingPulse({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect for loading states
export function LoadingShimmer({ 
  className = '',
  height = 'h-4'
}: { 
  className?: string
  height?: string
}) {
  return (
    <div className={`${height} bg-glass-primary rounded shimmer ${className}`}>
      <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  )
}
