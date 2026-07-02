import { useAuthStore } from '@/app/store'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'

export function App() {
  const user = useAuthStore((s) => s.user)
  return user ? <DashboardPage /> : <LoginPage />
}
