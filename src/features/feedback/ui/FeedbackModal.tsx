import React, { useState } from 'react'
import { useUIStore, useAuthStore } from '@/app/store'
import { Modal } from '@/shared/ui/Modal'
import { supabase } from '@/shared/lib/supabase'
import { MessageSquare, Check } from 'lucide-react'

type FeedbackType = 'bug' | 'question' | 'suggestion'

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: '🐛 Баг' },
  { value: 'question', label: '❓ Вопрос' },
  { value: 'suggestion', label: '💡 Предложение' },
]

export function FeedbackModal() {
  const { modals, closeModal } = useUIStore()
  const user = useAuthStore((s) => s.user)

  const [type, setType] = useState<FeedbackType>('bug')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleClose = () => {
    closeModal('feedback')
    setTimeout(() => {
      setSent(false)
      setMessage('')
      setError(null)
    }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.from('feedback').insert({
      type,
      message: message.trim(),
      user_email: user?.email ?? 'anonymous',
    })

    setLoading(false)

    if (error) {
      if (error.code === '42P01') {
        setError('Таблица feedback не существует. Создайте её в Supabase (см. README).')
      } else {
        setError(error.message)
      }
    } else {
      setSent(true)
    }
  }

  return (
    <Modal isOpen={modals.feedback} onClose={handleClose} title="Обратная связь">
      {sent ? (
        <div className="py-6 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 border border-green-500/30 rounded-2xl mx-auto">
            <Check className="text-green-400" size={22} />
          </div>
          <p className="text-white font-medium">Отправлено!</p>
          <p className="text-sm text-gray-400">Спасибо за обратную связь.</p>
          <button
            onClick={handleClose}
            className="mt-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  type === t.value
                    ? 'bg-green-500/15 border-green-500/40 text-green-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Сообщение
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Опишите проблему или предложение..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-green-500/60 focus:ring-1 focus:ring-green-500/30 transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-950 rounded-xl transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-950/30 border-t-gray-950 rounded-full animate-spin" />
              ) : (
                <MessageSquare size={14} />
              )}
              Отправить
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
