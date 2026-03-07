'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AQIChartProps {
  data: Array<{
    name: string
    value: number
    unit: string
  }>
}

export function AQIChart({ data }: AQIChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={60} stroke="#a0aec0" />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#cbd5e0'
          }}
        />
        <Legend />
        <Bar dataKey="value" name="Concentration" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
