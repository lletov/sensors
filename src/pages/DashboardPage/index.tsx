import React, { useEffect, useMemo } from 'react'
import { Header } from '@/widgets/Header'
import { SensorTable } from '@/widgets/SensorTable'
import { TemperatureChart } from '@/widgets/TemperatureChart'
import { StorageIndicator } from '@/widgets/StorageIndicator'
import { SettingsModal } from '@/features/settings/ui/SettingsModal'
import { FeedbackModal } from '@/features/feedback/ui/FeedbackModal'
import { LogoutModal } from '@/features/auth/ui/LogoutModal'
import { getAllReadings } from '@/shared/lib/indexeddb'
import { useSensorStore, useSettingsStore } from '@/app/store'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function StatCard({
  label,
  value,
  isHot,
  icon: Icon,
}: {
  label: string
  value: string
  isHot?: boolean
  icon: React.ElementType
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        <Icon size={14} className={isHot ? 'text-red-400' : 'text-gray-600'} />
      </div>
      <p className={`text-2xl font-bold font-mono-data ${isHot ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}

export function DashboardPage() {
  const { records, setRecords } = useSensorStore()
  const { highTempThreshold } = useSettingsStore()

  // Load local DB on mount
  useEffect(() => {
    getAllReadings()
      .then((data) => {
        if (data.length > 0) setRecords(data)
      })
      .catch(console.error)
  }, [setRecords])

  const stats = useMemo(() => {
    if (!records.length)
      return { latest: '—', max: '—', min: '—', avg: '—', latestHot: false, maxHot: false }
    const temps = records.map((r) => r.temperature)
    const latest = records[0].temperature
    const max = Math.max(...temps)
    const min = Math.min(...temps)
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length
    return {
      latest: `${latest.toFixed(1)}°C`,
      max: `${max.toFixed(1)}°C`,
      min: `${min.toFixed(1)}°C`,
      avg: `${avg.toFixed(1)}°C`,
      latestHot: latest > highTempThreshold,
      maxHot: max > highTempThreshold,
    }
  }, [records, highTempThreshold])

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Последнее" value={stats.latest} isHot={stats.latestHot} icon={Minus} />
          <StatCard label="Максимум" value={stats.max} isHot={stats.maxHot} icon={TrendingUp} />
          <StatCard label="Минимум" value={stats.min} icon={TrendingDown} />
          <StatCard label="Среднее" value={stats.avg} icon={Minus} />
        </div>

        {/* Chart */}
        <TemperatureChart />

        {/* Table */}
        <SensorTable />

        {/* Storage footer */}
        <StorageIndicator />
      </main>

      {/* Modals */}
      <SettingsModal />
      <FeedbackModal />
      <LogoutModal />
    </div>
  )
}
