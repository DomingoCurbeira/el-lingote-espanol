import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co' &&
  supabaseUrl.trim() !== ''
)

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase no está configurado en .env. Se usará el almacenamiento local (LocalStorage) de respaldo para pruebas.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
