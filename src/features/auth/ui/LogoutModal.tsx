import { supabase } from '@/shared/lib/supabase'
import { useUIStore } from '@/app/store'
import { Modal } from '@/shared/ui/Modal'
import { LogOut } from 'lucide-react'

export function LogoutModal() {
  const { modals, closeModal } = useUIStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    closeModal('logout')
  }

  return (
    <Modal isOpen={modals.logout} onClose={() => closeModal('logout')} title="Выход из аккаунта">
      <div className="space-y-5">
        <p className="text-sm text-gray-400">
          Вы уверены, что хотите выйти? Локальные данные сохранятся.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('logout')}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl transition-colors"
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      </div>
    </Modal>
  )
}
