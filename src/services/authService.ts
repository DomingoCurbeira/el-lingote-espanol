import { supabase, isSupabaseConfigured } from '../lib/supabase'

export type AuthUser = {
  id: string
  email: string
}

const LOCAL_ADMIN_SESSION_KEY = 'el_lingote_admin_session'

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  if (!isSupabaseConfigured) {
    // Modo Fallback Local: permite contraseña simple de demostración 'lingote2026'
    if (password === 'lingote2026' || password === 'admin') {
      const mockUser: AuthUser = { id: 'local-admin-id', email: email || 'admin@ellingoteespanol.com' }
      localStorage.setItem(LOCAL_ADMIN_SESSION_KEY, JSON.stringify(mockUser))
      return { success: true, user: mockUser }
    } else {
      return { success: false, error: 'Contraseña incorrecta (En modo demo usa: lingote2026)' }
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message }
    }

    if (data.user && data.user.email) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }
    }

    return { success: false, error: 'No se pudo iniciar sesión.' }
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al iniciar sesión' }
  }
}

export async function logoutAdmin(): Promise<void> {
  if (!isSupabaseConfigured) {
    localStorage.removeItem(LOCAL_ADMIN_SESSION_KEY)
    return
  }

  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.error('Error al cerrar sesión', e)
  }
}

export async function getAdminSession(): Promise<AuthUser | null> {
  if (!isSupabaseConfigured) {
    const session = localStorage.getItem(LOCAL_ADMIN_SESSION_KEY)
    return session ? JSON.parse(session) : null
  }

  try {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user?.email) {
      return {
        id: data.session.user.id,
        email: data.session.user.email,
      }
    }
    return null
  } catch (e) {
    return null
  }
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void) {
  if (!isSupabaseConfigured) {
    return { unsubscribe: () => {} }
  }

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.email) {
      callback({ id: session.user.id, email: session.user.email })
    } else {
      callback(null)
    }
  })

  return { unsubscribe: () => authListener.subscription.unsubscribe() }
}
