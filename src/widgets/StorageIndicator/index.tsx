import { useEffect, useState } from 'react'
import { getStorageInfo, type StorageInfo } from '@/shared/lib/indexeddb'
import { useSensorStore } from '@/app/store'
import { Database } from 'lucide-react'

export function StorageIndicator() {
  const [info, setInfo] = useState<StorageInfo | null>(null)
  const records = useSensorStore((s) => s.records)

  useEffect(() => {
    getStorageInfo().then(setInfo).catch(console.error)
  }, [records])

  if (!info) return null

  const barColor =
    info.percent > 80 ? 'bg-red-500' : info.percent > 50 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-900 border border-gray-800">
      <Database size={14} className="text-gray-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Локальное хранилище</span>
          <span className="text-xs text-gray-500 font-mono-data">
            {info.usedMB} MB / {info.quotaMB} MB ({info.percent.toFixed(1)}%)
          </span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(info.percent, 100)}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-gray-600 shrink-0 font-mono-data">{info.count} записей</span>
    </div>
  )
}
