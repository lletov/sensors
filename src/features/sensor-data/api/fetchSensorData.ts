import { supabase } from '@/shared/lib/supabase'
import type { SensorReading } from '@/entities/sensor-reading/model/types'
import { SUPABASE_FETCH_LIMIT } from '@/shared/config/constants'

export async function fetchLatestFromSupabase(
  limit = SUPABASE_FETCH_LIMIT
): Promise<SensorReading[]> {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('id, created_at, temperature')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as SensorReading[]
}
