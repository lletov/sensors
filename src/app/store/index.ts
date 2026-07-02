import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'
import type { SensorReading } from '@/entities/sensor-reading/model/types'
import { DEFAULT_HIGH_TEMP_THRESHOLD, PAGE_SIZE } from '@/shared/config/constants'

// ─── Auth ──────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// ─── Sensor data (in-memory; source of truth = IndexedDB) ─────────────────

interface SensorState {
  records: SensorReading[]
  displayCount: number
  lastUpdated: Date | null
  isLoading: boolean
  setRecords: (records: SensorReading[]) => void
  loadMore: () => void
  setLoading: (v: boolean) => void
  setLastUpdated: (d: Date) => void
  resetDisplay: () => void
}

export const useSensorStore = create<SensorState>()((set) => ({
  records: [],
  displayCount: PAGE_SIZE,
  lastUpdated: null,
  isLoading: false,
  setRecords: (records) => set({ records }),
  loadMore: () => set((s) => ({ displayCount: s.displayCount + PAGE_SIZE })),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  resetDisplay: () => set({ displayCount: PAGE_SIZE }),
}))

// ─── Settings (persisted to localStorage) ─────────────────────────────────

interface SettingsState {
  theme: 'light' | 'dark'
  highTempThreshold: number
  toggleTheme: () => void
  setHighTempThreshold: (v: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark' as 'light' | 'dark',
      highTempThreshold: DEFAULT_HIGH_TEMP_THRESHOLD,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setHighTempThreshold: (highTempThreshold) => set({ highTempThreshold }),
    }),
    { name: 'sensor-settings' }
  )
)

// ─── UI (modals) ──────────────────────────────────────────────────────────

export type ModalKey =
  | 'logout'
  | 'settings'
  | 'feedback'
  | 'clearStorage'
  | 'changePassword'

interface UIState {
  modals: Record<ModalKey, boolean>
  openModal: (key: ModalKey) => void
  closeModal: (key: ModalKey) => void
}

const defaultModals: Record<ModalKey, boolean> = {
  logout: false,
  settings: false,
  feedback: false,
  clearStorage: false,
  changePassword: false,
}

export const useUIStore = create<UIState>()((set) => ({
  modals: { ...defaultModals },
  openModal: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: true } })),
  closeModal: (key) =>
    set((s) => ({ modals: { ...s.modals, [key]: false } })),
}))
