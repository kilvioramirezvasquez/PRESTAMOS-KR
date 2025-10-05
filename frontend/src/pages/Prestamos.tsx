import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { prestamosAPI } from '../services/api'
import { 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react'

interface Prestamo {
  _id: string
  cliente: {
    _id: string
    nombre: string
    cedula: string
  }
  monto: number
  interes: number
  cuotas: number
  montoCuota: number
  saldoPendiente?: number
  fechaInicio: string
  fechaVencimiento: string
  estado: 'activo' | 'pagado' | 'mora'
  createdAt: string
}

const Prestamos: React.FC = () => {
  const navigate = useNavigate()
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  useEffect(() => {
    cargarPrestamos()
  }, [searchTerm, filtroEstado])

  const cargarPrestamos = async () => {
    try {
      setLoading(true)
      const response = await prestamosAPI.getAll({
        search: searchTerm,
        estado: filtroEstado || undefined,
        limit: 50
      })
      
      if (response.success) {
        setPrestamos(response.data || [])
      }
    } catch (error) {
      console.error('Error cargando préstamos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      activo: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Activo' },
      pagado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pagado' },
      mora: { bg: 'bg-red-100', text: 'text-red-800', label: 'En Mora' }
    }
    const config = configs[estado as keyof typeof configs] || configs.activo
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const stats = {
    total: prestamos.length,
    activos: prestamos.filter(p => p.estado === 'activo').length,
    pagados: prestamos.filter(p => p.estado === 'pagado').length,
    mora: prestamos.filter(p => p.estado === 'mora').length,
    montoTotal: prestamos.reduce((sum, p) => sum + p.monto, 0),
    montoPendiente: prestamos.filter(p => p.estado === 'activo').reduce((sum, p) => sum + (p.saldoPendiente || p.monto), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos los préstamos</p>
        </div>
        <button 
          onClick={() => navigate('/prestamos/nuevo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Préstamo</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb' 
        }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: '#3b82f6', 
                background: 'linear-gradient(45deg, #3b82f6, #60a5fa)' 
              }}>
                <DollarSign className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Préstamos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Gestiona todos los préstamos</p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb' 
        }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: '#10b981', 
                background: 'linear-gradient(45deg, #10b981, #34d399)' 
              }}>
                <CheckCircle className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Préstamos Pagados</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pagados}</p>
              <p className="text-sm text-gray-500">Préstamos completados</p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb' 
        }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: '#f59e0b', 
                background: 'linear-gradient(45deg, #f59e0b, #fbbf24)' 
              }}>
                <Clock className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Préstamos Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activos}</p>
              <p className="text-sm text-gray-500">En proceso de pago</p>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb' 
        }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                backgroundColor: '#ef4444', 
                background: 'linear-gradient(45deg, #ef4444, #f87171)' 
              }}>
                <AlertTriangle className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">En Mora</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.mora}</p>
              <p className="text-sm text-gray-500">Requieren atención</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="input-field"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="pagado">Pagados</option>
              <option value="mora">En Mora</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de préstamos */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Préstamos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuotas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prestamos.map((prestamo) => (
                <tr key={prestamo._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{prestamo.cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{prestamo.cliente.cedula}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(prestamo.monto)}</div>
                      <div className="text-sm text-gray-500">{prestamo.interes}% interés</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{prestamo.cuotas} cuotas</div>
                      <div className="text-sm text-gray-500">{formatCurrency(prestamo.montoCuota)}/cuota</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(prestamo.fechaInicio)}</div>
                      <div className="text-sm text-gray-500">Vence: {formatDate(prestamo.fechaVencimiento)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(prestamo.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prestamo.estado === 'pagado' ? 
                        <span className="text-green-600">Pagado</span> : 
                        formatCurrency(prestamo.saldoPendiente || prestamo.monto)
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {prestamos.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay préstamos</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No se encontraron préstamos que coincidan con tu búsqueda.' : 'Comienza creando tu primer préstamo.'}
            </p>
          </div>
        )}
      </div>

      {/* Resumen financiero */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Monto Total Prestado</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.montoTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.montoPendiente)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prestamos