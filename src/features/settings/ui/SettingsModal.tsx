import React, { useState } from 'react'
import { useUIStore, useSettingsStore } from '@/app/store'
import { Modal } from '@/shared/ui/Modal'
import { clearReadings } from '@/shared/lib/indexeddb'
import { useSensorStore } from '@/app/store'
import { supabase } from '@/shared/lib/supabase'
import { Sun, Moon, Trash2, AlertTriangle, KeyRound, Check } from 'lucide-react'

export function SettingsModal() {
  const { modals, closeModal, openModal } = useUIStore()
  const { theme, toggleTheme, highTempThreshold, setHighTempThreshold } = useSettingsStore()
  const setRecords = useSensorStore((s) => s.setRecords)

  const [thresholdInput, setThresholdInput] = useState(String(highTempThreshold))
  const [confirmClear, setConfirmClear] = useState(false)

  // Change password sub-modal state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleThresholdSave = () => {
    const val = parseFloat(thresholdInput)
    if (!isNaN(val)) setHighTempThreshold(val)
  }

  const handleClearStorage = async () => {
    await clearReadings()
    setRecords([])
    setConfirmClear(false)
    closeModal('settings')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwError('Пароли не совпадают')
      return
    }
    if (newPassword.length < 6) {
      setPwError('Пароль должен быть не менее 6 символов')
      return
    }
    setPwLoading(true)
    setPwError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwLoading(false)
    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPwSuccess(false), 3000)
    }
  }

  const isChangePasswordOpen = modals.changePassword

  if (isChangePasswordOpen) {
    return (
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => closeModal('changePassword')}
        title="Смена пароля"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Новый пароль
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Повторите пароль
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 transition-colors"
            />
          </div>
          {pwError && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Check size={14} /> Пароль успешно изменён
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => closeModal('changePassword')}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              Назад
            </button>
            <button
              type="submit"
              disabled={pwLoading}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 rounded-xl transition-colors"
            >
              {pwLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </Modal>
    )
  }

  return (
    <Modal isOpen={modals.settings} onClose={() => closeModal('settings')} title="Настройки">
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Тема</p>
          <div className="flex gap-2">
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                theme === 'dark'
                  ? 'bg-green-500/15 border-green-500/40 text-green-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <Moon size={15} /> Тёмная
            </button>
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                theme === 'light'
                  ? 'bg-green-500/15 border-green-500/40 text-green-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <Sun size={15} /> Светлая
            </button>
          </div>
        </div>

        {/* High temp threshold */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Порог высокой температуры
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              step="0.5"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 transition-colors"
            />
            <span className="flex items-center px-3 text-gray-400 text-sm">°C</span>
            <button
              onClick={handleThresholdSave}
              className="px-4 py-2.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium transition-colors"
            >
              Сохранить
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Записи выше этого порога будут выделены красным
          </p>
        </div>

        {/* Change password */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Безопасность
          </p>
          <button
            onClick={() => openModal('changePassword')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl text-sm text-gray-300 hover:text-white transition-colors"
          >
            <KeyRound size={15} className="text-gray-500" />
            Сменить пароль
          </button>
        </div>

        {/* Clear storage */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Опасная зона
          </p>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl text-sm text-red-400 transition-colors"
            >
              <Trash2 size={15} />
              Очистить локальное хранилище
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">
                  Все локально сохранённые данные будут удалены. Это действие необратимо.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearStorage}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Удалить всё
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
