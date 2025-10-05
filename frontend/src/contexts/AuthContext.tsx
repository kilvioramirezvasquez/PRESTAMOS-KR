import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: 'admin' | 'cobrador' | 'gerente'
  zona?: string
  telefono?: string
}

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  actualizarPerfil: (datos: Partial<Usuario>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('usuario')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUsuario(JSON.parse(storedUser))
        authAPI.setToken(storedToken)
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)
      
      if (response.success) {
        const { token: newToken, usuario: newUsuario } = response
        
        setToken(newToken)
        setUsuario(newUsuario)
        
        localStorage.setItem('token', newToken)
        localStorage.setItem('usuario', JSON.stringify(newUsuario))
        
        authAPI.setToken(newToken)
        
        toast.success(`¡Bienvenido, ${newUsuario.nombre}!`)
        return true
      }
      
      toast.error(response.message || 'Error al iniciar sesión')
      return false
    } catch (error: any) {
      console.error('Error en login:', error)
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUsuario(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    authAPI.setToken(null)
    toast.success('Sesión cerrada correctamente')
  }

  const actualizarPerfil = (datos: Partial<Usuario>) => {
    if (usuario) {
      const usuarioActualizado = { ...usuario, ...datos }
      setUsuario(usuarioActualizado)
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))
    }
  }

  const value = {
    usuario,
    token,
    loading,
    isAuthenticated: !!usuario && !!token,
    login,
    logout,
    actualizarPerfil
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}