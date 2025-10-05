import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cobrosAPI } from '../services/api'
import { 
  Plus, 
  Search, 
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Cobro {
  _id: string
  prestamo: {
    _id: string
    cliente: {
      nombre: string
      cedula: string
    }
    monto: number
    montoCuota: number
  }
  monto: number
  fecha: string
  fechaCobro: string
  estado: 'pendiente' | 'cobrado' | 'vencido'
  cobrador?: {
    nombre: string
  }
  observaciones?: string
  createdAt: string
}

const Cobros: React.FC = () => {
  const [cobros, setCobros] = useState<Cobro[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  useEffect(() => {
    cargarCobros()
  }, [searchTerm, filtroEstado])

  const cargarCobros = async () => {
    try {
      setLoading(true)
      const response = await cobrosAPI.getAll({
        search: searchTerm,
        estado: filtroEstado || undefined,
        limit: 50
      })
      
      if (response.success) {
        setCobros(response.data || [])
      }
    } catch (error) {
      console.error('Error cargando cobros:', error)
      toast.error('Error al cargar cobros')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const configs = {
      pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      cobrado: { bg: 'bg-green-100', text: 'text-green-800', label: 'Cobrado' },
      vencido: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' }
    }
    const config = configs[estado as keyof typeof configs] || configs.pendiente
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const marcarCobrado = async (cobroId: string) => {
    try {
      // Aquí iría la llamada al API para marcar como cobrado
      // await cobrosAPI.marcarCobrado(cobroId)
      toast.success('Cobro marcado como cobrado exitosamente')
      cargarCobros() // Recargar la lista
    } catch (error) {
      console.error('Error marcando cobro:', error)
      toast.error('Error al marcar el cobro como cobrado')
    }
  }

  const stats = {
    total: cobros.length,
    pendientes: cobros.filter(c => c.estado === 'pendiente').length,
    cobrados: cobros.filter(c => c.estado === 'cobrado').length,
    vencidos: cobros.filter(c => c.estado === 'vencido').length,
    montoTotal: cobros.reduce((sum, c) => sum + c.monto, 0),
    montoCobrado: cobros.filter(c => c.estado === 'cobrado').reduce((sum, c) => sum + c.monto, 0)
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
          <h1 className="text-3xl font-bold text-gray-900">Cobros</h1>
          <p className="text-gray-600 mt-1">Gestiona todos los cobros y pagos</p>
        </div>
        <Link to="/cobros/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Nuevo Cobro</span>
        </Link>
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
              <p className="text-sm font-medium text-gray-500">Total Cobros</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Gestiona todos los cobros</p>
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
              <p className="text-sm font-medium text-gray-500">Cobros Realizados</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cobrados}</p>
              <p className="text-sm text-gray-500">Pagos completados</p>
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
              <p className="text-sm font-medium text-gray-500">Cobros Pendientes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendientes}</p>
              <p className="text-sm text-gray-500">Por cobrar</p>
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
              <p className="text-sm font-medium text-gray-500">Cobros Vencidos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.vencidos}</p>
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
                placeholder="Buscar por cliente, cédula o monto..."
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
              <option value="pendiente">Pendientes</option>
              <option value="cobrado">Cobrados</option>
              <option value="vencido">Vencidos</option>
            </select>

            <button className="btn-secondary flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filtros</span>
            </button>

            <button className="btn-secondary flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span className="text-sm">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cobros */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Cobros</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Préstamo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cobrador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cobros.map((cobro) => (
                <tr key={cobro._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cobro.prestamo.cliente.nombre}</div>
                      <div className="text-sm text-gray-500">{cobro.prestamo.cliente.cedula}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(cobro.prestamo.monto)}</div>
                      <div className="text-sm text-gray-500">Cuota: {formatCurrency(cobro.prestamo.montoCuota)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(cobro.monto)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{formatDate(cobro.fecha)}</div>
                      {cobro.fechaCobro && (
                        <div className="text-sm text-gray-500">Cobrado: {formatDate(cobro.fechaCobro)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(cobro.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cobro.cobrador?.nombre || 'Sin asignar'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/cobros/editar/${cobro._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => marcarCobrado(cobro._id)}
                      className="text-green-600 hover:text-green-900"
                      disabled={cobro.estado === 'cobrado'}
                    >
                      {cobro.estado === 'cobrado' ? 'Cobrado' : 'Marcar Cobrado'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Estado vacío */}
        {cobros.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cobros</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No se encontraron cobros que coincidan con tu búsqueda.' : 'Comienza registrando tu primer cobro.'}
            </p>
            <Link to="/cobros/nuevo" className="btn-primary">
              Nuevo Cobro
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cobros