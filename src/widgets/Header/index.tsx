import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  RefreshCw,
  Settings,
  MessageSquare,
  LogOut,
  Thermometer,
} from 'lucide-react'
import { useSensorStore, useUIStore } from '@/app/store'
import { fetchLatestFromSupabase } from '@/features/sensor-data/api/fetchSensorData'
import { mergeReadings, getAllReadings } from '@/shared/lib/indexeddb'
import { mergeRecords } from '@/features/sensor-data/lib/mergeRecords'
import { formatLastUpdated } from '@/shared/helpers'

export function Header() {
  const { isLoading, lastUpdated, setLoading, setLastUpdated, setRecords, resetDisplay } =
    useSensorStore()
  const { openModal } = useUIStore()

  const handleRefresh = async () => {
    if (isLoading) return
    setLoading(true)
    try {
      const incoming = await fetchLatestFromSupabase()
      const existing = await getAllReadings()
      const merged = mergeRecords(existing, incoming)
      await mergeReadings(incoming)
      setRecords(merged)

      setLastUpdated(new Date().toISOString())

      resetDisplay()
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-3 h-14">
        {/* Brand */}
        <div className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 bg-green-500/15 border border-green-500/30 rounded-lg flex items-center justify-center">
            <Thermometer size={14} className="text-green-400" />
          </div>
          <span className="font-semibold text-sm text-white hidden sm:block">Sensor Dashboard</span>
        </div>

        {/* Last updated */}
        <div className="text-[10px] sm:text-xs text-gray-500 font-mono-data shrink-0 text-right leading-tight">
          {lastUpdated ? (
            <>
              Обновлено <br className="sm:hidden" />
              {formatLastUpdated(lastUpdated)}
            </>
          ) : (
            'Нет данных'
          )}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          title="Обновить данные"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Обновить</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => openModal('settings')}
          title="Настройки"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Settings size={16} />
        </button>

        {/* Feedback */}
        <button
          onClick={() => openModal('feedback')}
          title="Обратная связь"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <MessageSquare size={16} />
        </button>

        {/* Logout */}
        <button
          onClick={() => openModal('logout')}
          title="Выйти"
          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
