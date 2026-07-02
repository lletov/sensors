import { openDB } from 'idb'
import type { SensorReading } from '@/entities/sensor-reading/model/types'
import { DB_NAME, DB_VERSION, STORE_NAME } from '@/shared/config/constants'

function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('by-created-at', 'created_at')
      }
    },
  })
}

export async function getAllReadings(): Promise<SensorReading[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return (all as SensorReading[]).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function mergeReadings(incoming: SensorReading[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  for (const r of incoming) {
    await tx.store.put(r)
  }
  await tx.done
}

export async function clearReadings(): Promise<void> {
  const db = await getDB()
  await db.clear(STORE_NAME)
}

export interface StorageInfo {
  usedMB: number
  quotaMB: number
  percent: number
  count: number
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const db = await getDB()
  const count = await db.count(STORE_NAME)

  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return {
      usedMB: +(usage / 1024 / 1024).toFixed(2),
      quotaMB: +(quota / 1024 / 1024).toFixed(0),
      percent: quota > 0 ? +((usage / quota) * 100).toFixed(2) : 0,
      count,
    }
  }
  return { usedMB: 0, quotaMB: 0, percent: 0, count }
}
