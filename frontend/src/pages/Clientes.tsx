import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientesAPI } from '../services/api'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Phone,
  Mail,
  MapPin,
  User,
  Filter,
  Download
} from 'lucide-react'

interface Cliente {
  _id: string
  nombre: string
  cedula: string
  telefono: string
  email?: string
  direccion: string
  activo?: boolean
  estado?: string
  createdAt: string
  updatedAt: string
  prestamosActivos?: number
  montoTotal?: number
}

const Clientes: React.FC = () => {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClientes, setTotalClientes] = useState(0)
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  useEffect(() => {
    cargarClientes()
  }, [currentPage, searchTerm, showActiveOnly])

  const cargarClientes = async () => {
    try {
      setLoading(true)
      const response = await clientesAPI.getAll({
        page: currentPage,
        limit: 100,
        search: searchTerm,
        activo: showActiveOnly ? true : undefined
      })
      
      if (response.success) {
        setClientes(response.data || [])
        setTotalPages(response.pagination?.pages || 1)
        setTotalClientes(response.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    cargarClientes()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const confirmarEliminar = async (id: string, nombre: string) => {
    if (window.confirm(`¿Está seguro de eliminar el cliente "${nombre}"?`)) {
      try {
        await clientesAPI.delete(id)
        cargarClientes() // Recargar la lista
        alert('Cliente eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando cliente:', error)
        alert('Error al eliminar el cliente')
      }
    }
  }



  if (loading && clientes.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus clientes</p>
        </div>
        <button 
          onClick={() => navigate('/clientes/nuevo')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </form>

          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo activos</span>
            </label>

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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <User className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total Clientes</p>
              <p className="text-2xl font-semibold text-gray-900">{totalClientes}</p>
              <p className="text-sm text-gray-500">Todos los registros</p>
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
                <User className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Clientes Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{clientes.filter(c => c.activo !== false && c.estado !== 'inactivo').length}</p>
              <p className="text-sm text-gray-500">Con actividad regular</p>
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
                <User className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Clientes Inactivos</p>
              <p className="text-2xl font-semibold text-gray-900">{clientes.filter(c => c.activo === false || c.estado === 'inactivo').length}</p>
              <p className="text-sm text-gray-500">Sin actividad reciente</p>
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
                <User className="h-6 w-6" style={{ color: 'white' }} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Con Préstamos</p>
              <p className="text-2xl font-semibold text-gray-900">{clientes.filter(c => c.prestamosActivos && c.prestamosActivos > 0).length}</p>
              <p className="text-sm text-gray-500">Préstamos activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Clientes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Mostrando {clientes.length} de {totalClientes} clientes total - Página {currentPage} de {totalPages}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Desliza horizontalmente para ver los botones de acciones →
          </p>
        </div>
        
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 sticky right-0 bg-gray-50 border-l border-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cliente.nombre}</div>
                      <div className="text-sm text-gray-500">Cédula: {cliente.cedula}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cliente.telefono && (
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{cliente.telefono}</span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{cliente.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cliente.direccion && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{cliente.direccion}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(cliente.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (cliente.activo !== false && cliente.estado !== 'inactivo')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(cliente.activo !== false && cliente.estado !== 'inactivo') ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-white border-l border-gray-200">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-md border border-blue-200 shadow-sm"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-md border border-green-200 shadow-sm"
                        title="Editar cliente" 
                        onClick={() => navigate(`/clientes/${cliente._id}/editar`)}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-md border border-red-200 shadow-sm"
                        title="Eliminar cliente"
                        onClick={() => confirmarEliminar(cliente._id, cliente.nombre)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado vacío */}
      {!loading && clientes.length === 0 && (
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clientes</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? 'No se encontraron clientes que coincidan con tu búsqueda.' : 'Comienza agregando tu primer cliente.'}
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto">
            <Plus className="h-5 w-5" />
            <span>Agregar Cliente</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Clientes