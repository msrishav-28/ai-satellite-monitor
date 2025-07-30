import { motion } from 'framer-motion'
import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Search, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'purple' | 'minimal'
  animate?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  variant = 'default',
  animate = true,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const variants = {
    default: 'glass-panel border-glass-border focus:border-glass-border-strong',
    purple: 'glass-panel-purple border-glass-purple-border focus:border-purple-400/50',
    minimal: 'bg-transparent border-b border-glass-border focus:border-purple-400'
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  const MotionWrapper = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <MotionWrapper className="space-y-2" {...motionProps}>
      {label && (
        <motion.label
          className="block text-sm font-medium text-text-primary"
          initial={animate ? { opacity: 0, x: -10 } : false}
          animate={animate ? { opacity: 1, x: 0 } : false}
          transition={animate ? { delay: 0.1 } : undefined}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        <div className={clsx(
          'relative flex items-center transition-all duration-200',
          variants[variant],
          variant !== 'minimal' && 'rounded-xl px-4 py-3',
          variant === 'minimal' && 'px-0 py-2',
          error && 'border-red-500/50',
          isFocused && 'shadow-glass-lg',
          className
        )}>
          {icon && iconPosition === 'left' && (
            <motion.div
              className="mr-3 text-text-secondary"
              animate={isFocused ? { scale: 1.1, color: '#8b5cf6' } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none',
              'transition-colors duration-200'
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {type === 'password' && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-3 text-text-secondary hover:text-text-primary transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
          )}
          
          {icon && iconPosition === 'right' && (
            <motion.div
              className="ml-3 text-text-secondary"
              animate={isFocused ? { scale: 1.1, color: '#8b5cf6' } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </div>
        
        {/* Focus ring effect */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-purple-500/50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {error && (
        <motion.div
          className="flex items-center gap-2 text-sm text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
      
      {hint && !error && (
        <motion.p
          className="text-sm text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {hint}
        </motion.p>
      )}
    </MotionWrapper>
  )
})

Input.displayName = 'Input'

// Search Input Component
interface SearchInputProps extends Omit<InputProps, 'icon' | 'type'> {
  onSearch?: (value: string) => void
  loading?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(({
  onSearch,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value)
    }
  }

  return (
    <Input
      ref={ref}
      icon={
        loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-purple-500/20 border-t-purple-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <Search className="w-4 h-4" />
        )
      }
      onKeyPress={handleKeyPress}
      className={className}
      {...props}
    />
  )
})

SearchInput.displayName = 'SearchInput'

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  variant?: 'default' | 'purple' | 'minimal'
  animate?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  variant = 'default',
  animate = true,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  const variants = {
    default: 'glass-panel border-glass-border focus:border-glass-border-strong',
    purple: 'glass-panel-purple border-glass-purple-border focus:border-purple-400/50',
    minimal: 'bg-transparent border border-glass-border focus:border-purple-400'
  }

  const MotionWrapper = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {}

  return (
    <MotionWrapper className="space-y-2" {...motionProps}>
      {label && (
        <motion.label
          className="block text-sm font-medium text-text-primary"
          initial={animate ? { opacity: 0, x: -10 } : false}
          animate={animate ? { opacity: 1, x: 0 } : false}
          transition={animate ? { delay: 0.1 } : undefined}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          className={clsx(
            'w-full bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none resize-none transition-all duration-200',
            variants[variant],
            'rounded-xl px-4 py-3',
            error && 'border-red-500/50',
            isFocused && 'shadow-glass-lg',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {/* Focus ring effect */}
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-purple-500/50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1 : 0.95
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {error && (
        <motion.div
          className="flex items-center gap-2 text-sm text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}
      
      {hint && !error && (
        <motion.p
          className="text-sm text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {hint}
        </motion.p>
      )}
    </MotionWrapper>
  )
})

Textarea.displayName = 'Textarea'

export { Input }
