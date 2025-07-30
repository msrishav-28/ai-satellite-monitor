import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Notification context
interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification Provider
interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container
function NotificationContainer() {
  const { notifications } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual Notification Item
interface NotificationItemProps {
  notification: Notification
}

function NotificationItem({ notification }: NotificationItemProps) {
  const { removeNotification } = useNotifications()

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colors = {
    success: {
      bg: 'from-green-500/20 to-green-600/10',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      text: 'text-green-100'
    },
    error: {
      bg: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      text: 'text-red-100'
    },
    warning: {
      bg: 'from-orange-500/20 to-orange-600/10',
      border: 'border-orange-500/30',
      icon: 'text-orange-400',
      text: 'text-orange-100'
    },
    info: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      text: 'text-blue-100'
    }
  }

  const Icon = icons[notification.type]
  const colorScheme = colors[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ 
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`glass-panel p-4 rounded-xl border ${colorScheme.border} bg-gradient-to-br ${colorScheme.bg} backdrop-blur-xl shadow-lg max-w-sm`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Icon className={`w-5 h-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <motion.h4
            className="text-sm font-semibold text-text-primary mb-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {notification.title}
          </motion.h4>
          
          {notification.message && (
            <motion.p
              className="text-sm text-text-secondary leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {notification.message}
            </motion.p>
          )}
          
          {notification.action && (
            <motion.button
              className={`mt-3 text-sm font-medium ${colorScheme.text} hover:underline`}
              onClick={notification.action.onClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {notification.action.label}
            </motion.button>
          )}
        </div>
        
        <motion.button
          onClick={() => removeNotification(notification.id)}
          className="text-text-tertiary hover:text-text-primary transition-colors duration-200 p-1 hover:bg-white/10 rounded-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// Convenience hooks for different notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotifications()

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, duration: 0, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options })
  }
}

// Toast notification component for quick use
interface ToastProps {
  type: NotificationType
  title: string
  message?: string
  onClose?: () => void
}

export function Toast({ type, title, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="glass-panel-purple p-4 rounded-xl shadow-purple-lg"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-purple-400" />
        <div>
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
          {message && (
            <p className="text-sm text-text-secondary mt-1">{message}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
