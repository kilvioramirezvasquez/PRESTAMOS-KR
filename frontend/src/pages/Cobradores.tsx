import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cobradoresAPI } from '../services/api'
import { 
  Plus, 
  Search, 
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Cobrador {
  _id: string
  nombre: string
  cedula: string
  telefono: string
  email?: string
  direccion?: string
  activo: boolean
  fechaIngreso: string
  comisionPorcentaje: number
  zonasAsignadas: string[]
  estadisticas?: {
    prestamosAsignados: number
    cobrosRealizados: number
    montoTotalCobrado: number
    eficienciaPromedio: number
  }
  createdAt: string
}

const Cobradores: React.FC = () => {
  const [cobradores, setCobradores] = useState<Cobrador[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<string>('')

  useEffect(() => {
    cargarCobradores()
  }, [searchTerm, filtroActivo])

  const cargarCobradores = async () => {
    try {
      setLoading(true)
      const response = await cobradoresAPI.obtenerTodos({
        search: searchTerm,
        activo: filtroActivo ? filtroActivo === 'true' : undefined,
        includeStats: true
      })
      
      if (response.success) {
        setCobradores(response.data || [])
      }
    } catch (error) {
      console.error('Error cargando cobradores:', error)
      toast.error('Error al cargar cobradores')
    } finally {
      setLoading(false)
    }
  }

  const toggleActivo = async (cobradorId: string, activo: boolean) => {
    try {
      const response = await cobradoresAPI.actualizar(cobradorId, { activo: !activo })
      if (response.success) {
        toast.success(`Cobrador ${!activo ? 'activado' : 'desactivado'} correctamente`)
        cargarCobradores()
      }
    } catch (error) {
      toast.error('Error al cambiar estado del cobrador')
    }
  }

  const eliminarCobrador = async (cobradorId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cobrador?')) return
    
    try {
      const response = await cobradoresAPI.eliminar(cobradorId)
      if (response.success) {
        toast.success('Cobrador eliminado correctamente')
        cargarCobradores()
      }
    } catch (error) {
      toast.error('Error al eliminar cobrador')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const stats = {
    total: cobradores.length,
    activos: cobradores.filter(c => c.activo).length,
    inactivos: cobradores.filter(c => !c.activo).length,
    totalCobrosRealizados: cobradores.reduce((sum, c) => sum + (c.estadisticas?.cobrosRealizados || 0), 0),
    montoTotalCobrado: cobradores.reduce((sum, c) => sum + (c.estadisticas?.montoTotalCobrado || 0), 0)
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
          <h1 className="text-3xl font-bold text-gray-900">Cobradores</h1>
          <p className="text-gray-600 mt-1">Gestiona el equipo de cobradores</p>
        </div>
        <Link to="/cobradores/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Nuevo Cobrador</span>
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
                <Users className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Cobradores</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Equipo de cobranza</p>
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
                <Target className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Cobradores Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activos}</p>
              <p className="text-sm text-gray-500">En servicio activo</p>
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
                <TrendingUp className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Cobros Realizados</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCobrosRealizados}</p>
              <p className="text-sm text-gray-500">Este mes</p>
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
                backgroundColor: '#8b5cf6', 
                background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)' 
              }}>
                <DollarSign className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Cobrado</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.montoTotalCobrado)}</p>
              <p className="text-sm text-gray-500">Acumulado</p>
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
                placeholder="Buscar por nombre, cédula o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
              className="input-field"
            >
              <option value="">Todos</option>
              <option value="true">Solo Activos</option>
              <option value="false">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de cobradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cobradores.map((cobrador) => (
          <div key={cobrador._id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header del cobrador */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    cobrador.activo ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    {cobrador.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cobrador.nombre}</h3>
                    <p className="text-sm text-gray-500">{cobrador.cedula}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    cobrador.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cobrador.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  <div className="relative">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-2 mb-4">
                {cobrador.telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {cobrador.telefono}
                  </div>
                )}
                {cobrador.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {cobrador.email}
                  </div>
                )}
                {cobrador.direccion && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {cobrador.direccion}
                  </div>
                )}
              </div>

              {/* Estadísticas */}
              {cobrador.estadisticas && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {cobrador.estadisticas.prestamosAsignados}
                      </p>
                      <p className="text-xs text-gray-500">Préstamos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {cobrador.estadisticas.cobrosRealizados}
                      </p>
                      <p className="text-xs text-gray-500">Cobros</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(cobrador.estadisticas.montoTotalCobrado)}
                    </p>
                    <p className="text-xs text-gray-500">Total cobrado</p>
                  </div>
                  
                  {cobrador.estadisticas.eficienciaPromedio && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Eficiencia</span>
                        <span className="font-medium">{cobrador.estadisticas.eficienciaPromedio}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${cobrador.estadisticas.eficienciaPromedio}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Link 
                  to={`/cobradores/${cobrador._id}/editar`}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Editar
                </Link>
                
                <button
                  onClick={() => toggleActivo(cobrador._id, cobrador.activo)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    cobrador.activo
                      ? 'bg-red-50 hover:bg-red-100 text-red-700'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
                  }`}
                >
                  {cobrador.activo ? 'Desactivar' : 'Activar'}
                </button>
                
                <button
                  onClick={() => eliminarCobrador(cobrador._id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {cobradores.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cobradores</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron cobradores que coincidan con tu búsqueda.' : 'Comienza agregando tu primer cobrador.'}
          </p>
          <Link to="/cobradores/nuevo" className="btn-primary">
            Nuevo Cobrador
          </Link>
        </div>
      )}
    </div>
  )
}

export default Cobradores