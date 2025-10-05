import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Crear instancia base de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para incluir token en las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Tipos para las respuestas de la API
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: any[]
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

// Servicios de autenticación
export const authAPI = {
  setToken: (token: string | null) => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete apiClient.defaults.headers.common['Authorization']
    }
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password })
    return response.data
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  }
}

// Servicios de clientes
export const clientesAPI = {
  getAll: async (params: any = {}): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/clientes', { params })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/clientes/${id}`)
    return response.data
  },

  getByCedula: async (cedula: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/clientes/cedula/${cedula}`)
    return response.data
  },

  create: async (clienteData: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/clientes', clienteData)
    return response.data
  },

  update: async (id: string, clienteData: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/clientes/${id}`, clienteData)
    return response.data
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/clientes/${id}`)
    return response.data
  }
}

// Servicios de préstamos
export const prestamosAPI = {
  getAll: async (params: any = {}): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/prestamos', { params })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/prestamos/${id}`)
    return response.data
  },

  create: async (prestamoData: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/prestamos', prestamoData)
    return response.data
  },

  updateEstado: async (id: string, estado: string): Promise<ApiResponse> => {
    const response = await apiClient.patch(`/prestamos/${id}/estado`, { estado })
    return response.data
  }
}

// Servicios de cobros
export const cobrosAPI = {
  getAll: async (params: any = {}): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/cobros', { params })
    return response.data
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/cobros/${id}`)
    return response.data
  },

  getByPrestamo: async (prestamoId: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/cobros/prestamo/${prestamoId}`)
    return response.data
  },

  create: async (cobroData: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/cobros', cobroData)
    return response.data
  },

  update: async (id: string, cobroData: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/cobros/${id}`, cobroData)
    return response.data
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/cobros/${id}`)
    return response.data
  }
}

// Servicios de cobradores
export const cobradoresAPI = {
  obtenerTodos: async (params: any = {}): Promise<ApiResponse> => {
    const response = await apiClient.get('/cobradores', { params })
    return response.data
  },

  obtenerPorId: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/cobradores/${id}`)
    return response.data
  },

  crear: async (cobradorData: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/cobradores', cobradorData)
    return response.data
  },

  actualizar: async (id: string, cobradorData: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/cobradores/${id}`, cobradorData)
    return response.data
  },

  eliminar: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/cobradores/${id}`)
    return response.data
  },

  // Alias para compatibilidad
  getAll: async (params: any = {}): Promise<ApiResponse> => {
    return cobradoresAPI.obtenerTodos(params)
  },

  getById: async (id: string): Promise<ApiResponse> => {
    return cobradoresAPI.obtenerPorId(id)
  },

  create: async (cobradorData: any): Promise<ApiResponse> => {
    return cobradoresAPI.crear(cobradorData)
  },

  update: async (id: string, cobradorData: any): Promise<ApiResponse> => {
    return cobradoresAPI.actualizar(id, cobradorData)
  }
}

// Servicios del dashboard
export const dashboardAPI = {
  getStats: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/dashboard/stats')
    return response.data
  },

  getEstadisticas: async (params: any = {}): Promise<ApiResponse> => {
    const response = await apiClient.get('/dashboard/estadisticas', { params })
    return response.data
  },

  getCobradores: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/dashboard/cobradores')
    return response.data
  },

  getResumen: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/dashboard/resumen')
    return response.data
  }
}

// Servicios de usuarios
export const usuariosAPI = {
  obtenerTodos: async (params: any = {}): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get('/usuarios', { params })
    return response.data
  },

  obtenerPorId: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.get(`/usuarios/${id}`)
    return response.data
  },

  crear: async (usuario: any): Promise<ApiResponse> => {
    const response = await apiClient.post('/usuarios', usuario)
    return response.data
  },

  actualizar: async (id: string, usuario: any): Promise<ApiResponse> => {
    const response = await apiClient.put(`/usuarios/${id}`, usuario)
    return response.data
  },

  cambiarPassword: async (id: string, password: string): Promise<ApiResponse> => {
    const response = await apiClient.put(`/usuarios/${id}/password`, { password })
    return response.data
  },

  eliminar: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/usuarios/${id}`)
    return response.data
  },

  obtenerEstadisticas: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/usuarios/stats/resumen')
    return response.data
  }
}

// Servicios de reportes
export const reportesAPI = {
  obtenerReporteGeneral: async (params: any = {}): Promise<ApiResponse> => {
    const response = await apiClient.get('/reportes/general', { params })
    return response.data
  },

  obtenerReporteCobradores: async (params: any = {}): Promise<ApiResponse> => {
    const response = await apiClient.get('/reportes/cobradores', { params })
    return response.data
  },

  obtenerReporteMora: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/reportes/mora')
    return response.data
  },

  obtenerReporteFinanciero: async (params: any = {}): Promise<ApiResponse> => {
    const response = await apiClient.get('/reportes/financiero', { params })
    return response.data
  }
}

// Exportar también como 'api' para compatibilidad
export const api = apiClient

export default apiClient