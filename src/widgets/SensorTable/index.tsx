import { useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Copy, Check, ChevronDown, Thermometer } from 'lucide-react'
import { useSensorStore, useSettingsStore } from '@/app/store'

function CopyButton({ value }: { value: number }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = String(value)
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Копировать"
      className={`p-1.5 rounded-md transition-all ${
        copied
          ? 'text-green-400 bg-green-500/10'
          : 'text-gray-600 hover:text-gray-300 hover:bg-gray-800'
      }`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

export function SensorTable() {
  const { records, displayCount, isLoading, loadMore } = useSensorStore()
  const { highTempThreshold } = useSettingsStore()

  const displayed = records.slice(0, displayCount)
  const hasMore = records.length > displayCount

  if (!isLoading && records.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-900 border border-gray-800 p-12 text-center">
        <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Thermometer size={20} className="text-gray-600" />
        </div>
        <p className="text-gray-400 font-medium">Нет данных</p>
        <p className="text-sm text-gray-600 mt-1">Нажмите «Обновить» чтобы загрузить данные</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">История замеров</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {displayed.length} из {records.length} записей
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                #
              </th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата и время
              </th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Температура
              </th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => {
              const isHot = row.temperature > highTempThreshold
              return (
                <tr
                  key={row.id}
                  className={`border-b border-gray-800/30 transition-colors ${
                    isHot ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-gray-800/30'
                  }`}
                >
                  <td className="px-5 py-3 text-xs text-gray-600 font-mono-data">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="text-sm text-gray-300 font-mono-data">
                      {format(new Date(row.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-semibold font-mono-data ${
                        isHot ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {row.temperature.toFixed(1)}°C
                      {isHot && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-md font-medium">
                          HIGH
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <CopyButton value={row.temperature} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="px-5 py-3 border-t border-gray-800/50">
          <button
            onClick={loadMore}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronDown size={15} />
            Загрузить ещё 50
          </button>
        </div>
      )}
    </div>
  )
}
