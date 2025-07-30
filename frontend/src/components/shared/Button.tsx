import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'purple' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  animate?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-purple hover:shadow-purple-lg hover:from-purple-500 hover:to-purple-400 border border-purple-500/50',
    secondary: 'glass-button text-text-primary hover:text-white',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-glass-secondary',
    purple: 'glass-button-purple text-purple-400 hover:text-purple-300',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-red-500/25 hover:from-red-500 hover:to-red-400 border border-red-500/50'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  const MotionComponent = animate ? motion.button : 'button'
  const motionProps = animate ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  } : {}

  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  )

  return (
    <MotionComponent
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {/* Shimmer effect for primary and danger variants */}
      {(variant === 'primary' || variant === 'danger') && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={clsx('flex items-center gap-2', loading && 'opacity-0')}>
        {icon && iconPosition === 'left' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </div>
    </MotionComponent>
  )
})

Button.displayName = 'Button'

export { Button }

// Icon Button Component
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'md',
  variant = 'ghost',
  animate = true,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      animate={animate}
      className={clsx(sizeClasses[size], 'p-0', className)}
      {...props}
    >
      {icon}
    </Button>
  )
})

IconButton.displayName = 'IconButton'

// Button Group Component
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function ButtonGroup({ 
  children, 
  className = '', 
  orientation = 'horizontal' 
}: ButtonGroupProps) {
  return (
    <div 
      className={clsx(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {children}
    </div>
  )
}

// Loading Button Component
interface LoadingButtonProps extends ButtonProps {
  loadingText?: string
}

export function LoadingButton({ 
  loading, 
  loadingText, 
  children, 
  ...props 
}: LoadingButtonProps) {
  return (
    <Button loading={loading} {...props}>
      {loading && loadingText ? loadingText : children}
    </Button>
  )
}

// Floating Action Button
interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  icon: React.ReactNode
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export function FloatingActionButton({ 
  icon, 
  position = 'bottom-right', 
  className = '',
  ...props 
}: FABProps) {
  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6'
  }

  return (
    <motion.div
      className={positions[position]}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Button
        variant="primary"
        size="lg"
        className={clsx('w-14 h-14 rounded-full p-0 shadow-purple-lg', className)}
        {...props}
      >
        {icon}
      </Button>
    </motion.div>
  )
}
