import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Premium color palette for charts
const CHART_COLORS = {
  primary: '#8b5cf6',
  secondary: '#a78bfa',
  tertiary: '#c4b5fd',
  accent: '#7c3aed',
  gradient: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  status: {
    good: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  }
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-3 rounded-xl border border-glass-border-strong"
      >
        <p className="text-sm font-medium text-text-primary mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-text-secondary">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span className="font-medium text-text-primary">{entry.value}</span>
          </p>
        ))}
      </motion.div>
    )
  }
  return null
}

// Temperature Chart Component
interface TemperatureChartProps {
  data?: Array<{ time: string; temperature: number; humidity?: number }>
  className?: string
}

export function TemperatureChart({ data = [], className = '' }: TemperatureChartProps) {
  const mockData = data.length > 0 ? data : [
    { time: '00:00', temperature: 18, humidity: 65 },
    { time: '06:00', temperature: 16, humidity: 70 },
    { time: '12:00', temperature: 24, humidity: 55 },
    { time: '18:00', temperature: 22, humidity: 60 },
    { time: '24:00', temperature: 19, humidity: 68 }
  ]

  return (
    <motion.div
      className={`glass-panel p-4 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h4 className="text-sm font-medium text-text-primary mb-4">24h Temperature Trend</h4>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={mockData}>
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#a1a1aa' }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#temperatureGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// AQI Chart Component
interface AQIChartProps {
  data?: Array<{ name: string; value: number; category: string }>
  className?: string
}

export function AQIChart({ data = [], className = '' }: AQIChartProps) {
  const mockData = data.length > 0 ? data : [
    { name: 'PM2.5', value: 45, category: 'Moderate' },
    { name: 'PM10', value: 78, category: 'Moderate' },
    { name: 'O3', value: 32, category: 'Good' },
    { name: 'NO2', value: 28, category: 'Good' },
    { name: 'SO2', value: 15, category: 'Good' }
  ]

  const getColor = (value: number) => {
    if (value <= 50) return CHART_COLORS.status.good
    if (value <= 100) return CHART_COLORS.status.warning
    return CHART_COLORS.status.danger
  }

  return (
    <motion.div
      className={`glass-panel p-4 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <h4 className="text-sm font-medium text-text-primary mb-4">Air Quality Breakdown</h4>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={mockData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#a1a1aa' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
          >
            {mockData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// Risk Gauge Component
interface RiskGaugeProps {
  value: number
  size?: number
  className?: string
}

export function RiskGauge({ value, size = 80, className = '' }: RiskGaugeProps) {
  const getColor = (val: number) => {
    if (val <= 30) return CHART_COLORS.status.good
    if (val <= 60) return CHART_COLORS.status.warning
    return CHART_COLORS.status.danger
  }

  const circumference = 2 * Math.PI * 30
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={30}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={30}
          stroke={getColor(value)}
          strokeWidth="6"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-lg font-bold text-text-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}%
        </motion.span>
      </div>
    </motion.div>
  )
}

// Hazard Distribution Chart
interface HazardDistributionProps {
  data?: Array<{ name: string; value: number; color: string }>
  className?: string
}

export function HazardDistribution({ data = [], className = '' }: HazardDistributionProps) {
  const mockData = data.length > 0 ? data : [
    { name: 'Wildfire', value: 35, color: CHART_COLORS.status.danger },
    { name: 'Flood', value: 25, color: CHART_COLORS.status.info },
    { name: 'Landslide', value: 20, color: CHART_COLORS.status.warning },
    { name: 'Cyclone', value: 20, color: CHART_COLORS.primary }
  ]

  return (
    <motion.div
      className={`glass-panel p-4 rounded-xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h4 className="text-sm font-medium text-text-primary mb-4">Risk Distribution</h4>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={mockData}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {mockData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {mockData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-text-secondary">{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
