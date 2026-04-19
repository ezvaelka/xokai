'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = {
  month:       string
  base:        number
  base_pickup: number
}

const TOOLTIP_STYLE = {
  background: '#fff', border: '1px solid #ECEAE3',
  borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export default function MrrChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#059669" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="gradPickup" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6D4AE8" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6D4AE8" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: '#A8A49E' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={v => `$${v}`}
          tick={{ fontSize: 11, fill: '#A8A49E' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          formatter={(value, name) => [
            fmtUsd(Number(value ?? 0)),
            name === 'base' ? 'Base' : 'Base+Pickup',
          ]}
        />
        <Area
          type="monotone"
          dataKey="base"
          stackId="1"
          stroke="#059669"
          strokeWidth={2}
          fill="url(#gradBase)"
          name="base"
        />
        <Area
          type="monotone"
          dataKey="base_pickup"
          stackId="1"
          stroke="#6D4AE8"
          strokeWidth={2}
          fill="url(#gradPickup)"
          name="base_pickup"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
