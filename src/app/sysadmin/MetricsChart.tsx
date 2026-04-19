'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'

type Props = { data: Array<{ month: string; count: number }> }

export default function MetricsChart({ data }: Props) {
  const hasData = data.some((d) => d.count > 0)

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-xk-text-muted">
        Sin datos suficientes para mostrar la gráfica.
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const yMax = Math.ceil(maxCount * 1.2)

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2DFD8" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#A8A49E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          domain={[0, yMax]}
          tick={{ fontSize: 11, fill: '#A8A49E' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E2DFD8',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
          }}
          cursor={{ fill: '#EDE9FE', opacity: 0.5 }}
          formatter={(value) => [value, 'Escuelas']}
        />
        <Bar dataKey="count" fill="#6D4AE8" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
