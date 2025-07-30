'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TemperatureChartProps {
  data: Array<{
    day: string
    temp: number
  }>
}

export function TemperatureChart({ data }: TemperatureChartProps) {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="day" stroke="#a0aec0" />
        <YAxis stroke="#a0aec0" />
        <Tooltip
          contentStyle={{
            background: 'rgba(30, 41, 59, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: '#cbd5e0'
          }}
        />
        <Line type="monotone" dataKey="temp" name="Temp" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
