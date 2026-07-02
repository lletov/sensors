import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { format, startOfDay, endOfDay, subDays, isWithinInterval, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useSensorStore, useSettingsStore } from '@/app/store'
import type { SensorReading } from '@/entities/sensor-reading/model/types'

type Preset = 'today' | 'yesterday' | 'range'

export function TemperatureChart() {
  const records = useSensorStore((s) => s.records)
  const { highTempThreshold } = useSettingsStore()

  const [preset, setPreset] = useState<Preset>('today')
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')

  const filtered = useMemo(() => {
    const now = new Date()
    let from: Date
    let to: Date

    if (preset === 'today') {
      from = startOfDay(now)
      to = endOfDay(now)
    } else if (preset === 'yesterday') {
      const yesterday = subDays(now, 1)
      from = startOfDay(yesterday)
      to = endOfDay(yesterday)
    } else {
      if (!rangeFrom || !rangeTo) return []
      from = startOfDay(new Date(rangeFrom))
      to = endOfDay(new Date(rangeTo))
    }

    return records
      .filter((r) => isWithinInterval(parseISO(r.created_at), { start: from, end: to }))
      .slice()
      .reverse()
      .map((r) => ({
        ...r,
        time: format(parseISO(r.created_at), 'HH:mm', { locale: ru }),
      }))
  }, [records, preset, rangeFrom, rangeTo])

  const temps = filtered.map((r) => r.temperature)
  const yMin = temps.length ? Math.floor(Math.min(...temps) - 2) : 0
  const yMax = temps.length ? Math.ceil(Math.max(...temps) + 2) : 40

  const renderDot = (props: { cx?: number; cy?: number; payload?: SensorReading }) => {
    const { cx = 0, cy = 0, payload } = props
    const isHot = (payload?.temperature ?? 0) > highTempThreshold
    return (
      <circle
        key={`dot-${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={3}
        fill={isHot ? '#ef4444' : '#22c55e'}
        stroke="none"
      />
    )
  }

  const PRESETS: { key: Preset; label: string }[] = [
    { key: 'today', label: 'Сегодня' },
    { key: 'yesterday', label: 'Вчера' },
    { key: 'range', label: 'Диапазон' },
  ]

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-white">График температур</h3>
        <div className="flex items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                preset === p.key
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date range inputs */}
      {preset === 'range' && (
        <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-3">
          <input
            type="date"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500/60 transition-colors"
          />
          <span className="text-gray-600 text-xs">—</span>
          <input
            type="date"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500/60 transition-colors"
          />
        </div>
      )}

      {/* Chart */}
      <div className="p-5">
        {filtered.length === 0 ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-gray-600">Нет данных за выбранный период</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={filtered} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[yMin, yMax]}
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}°`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f9fafb',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Температура']}
                labelFormatter={(label: string) => `Время: ${label}`}
              />
              <ReferenceLine
                y={highTempThreshold}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `${highTempThreshold}°C`,
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#22c55e"
                strokeWidth={1.5}
                dot={renderDot}
                activeDot={{ r: 5, fill: '#22c55e' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
