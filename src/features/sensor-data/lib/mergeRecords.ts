import type { SensorReading } from '@/entities/sensor-reading/model/types'

/** Merges two arrays, deduplicates by id, returns sorted by created_at desc */
export function mergeRecords(
  existing: SensorReading[],
  incoming: SensorReading[]
): SensorReading[] {
  const map = new Map<string, SensorReading>()
  for (const r of existing) map.set(r.id, r)
  for (const r of incoming) map.set(r.id, r)
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
