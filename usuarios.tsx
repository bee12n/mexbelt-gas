import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from './supabase'

interface User {
  id: string
  nombre: string
  email: string
  rol: 'superusuario' | 'usuario'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('gas_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol, password_hash, activo')
      .eq('email', email.toLowerCase().trim())
      .eq('activo', true)
      .single()

    if (error || !data) return { error: 'Usuario no encontrado' }

    const bcrypt = await import('bcryptjs')
    const valid = await bcrypt.compare(password, data.password_hash)
    if (!valid) return { error: 'Contraseña incorrecta' }

    const userData: User = { id: data.id, nombre: data.nombre, email: data.email, rol: data.rol }
    setUser(userData)
    localStorage.setItem('gas_user', JSON.stringify(userData))
    return {}
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('gas_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
