import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Briefcase
} from 'lucide-react'

interface Estadisticas {
  cobros: {
    total: number
    cantidad: number
  }
  prestamos: {
    totalPrestado: number
    totalPendiente: number
    cantidad: number
    activos: number
    pagados: number
    mora: number
  }
  clientes: {
    total: number
  }
}

const DashboardMejorado: React.FC = () => {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    cobros: { total: 0, cantidad: 0 },
    prestamos: { totalPrestado: 0, totalPendiente: 0, cantidad: 0, activos: 0, pagados: 0, mora: 0 },
    clientes: { total: 0 }
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const response = await dashboardAPI.getEstadisticas()
      if (response.success) {
        setEstadisticas(response.data)
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inicio - Dashboard</h1>
        <p className="text-gray-600">Hola, <span className="font-semibold text-blue-600">{usuario?.nombre || 'INVERSIONES MARCOS'}</span></p>
      </div>

      {/* Resumen de Hoy - Tarjetas principales como en el sistema viejo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen de Hoy</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total a Cobrar */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total a Cobrar</p>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(estadisticas.prestamos.totalPendiente)}</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* En Moras */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">En Moras</p>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(0)}</p>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Cobrado */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cobrado</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(estadisticas.cobros.total)}</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas - Botones coloridos como en el sistema viejo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-6 transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <CreditCard className="h-10 w-10" />
          <span className="text-sm font-medium">Cobros</span>
        </button>
        
        <button className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-6 transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <Briefcase className="h-10 w-10" />
          <span className="text-sm font-medium">Nuevo Préstamo</span>
        </button>
        
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl p-6 transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <FileText className="h-10 w-10" />
          <span className="text-sm font-medium">Nueva Solicitud</span>
        </button>
        
        <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-6 transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <XCircle className="h-10 w-10" />
          <span className="text-sm font-medium">Cuotas Vencidas</span>
        </button>
        
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl p-6 transition-all duration-200 flex flex-col items-center space-y-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <AlertTriangle className="h-10 w-10" />
          <span className="text-sm font-medium">Solicitudes</span>
          <span className="bg-white text-yellow-500 rounded-full px-2 py-1 text-xs font-bold">1</span>
        </button>
      </div>

      {/* Información detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resumen Rutas Hoy */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Resumen Rutas Hoy</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Ruta</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Total a Cobrar</th>
                  <th className="text-right py-3 px-2 text-sm font-medium text-gray-600">Cobrado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <div className="font-medium text-gray-800">ruta #1</div>
                        <div className="text-xs text-gray-500">02:00 - 03:00</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right font-semibold text-gray-800">
                    {formatCurrency(estadisticas.prestamos.totalPendiente * 0.7)}
                  </td>
                  <td className="py-4 px-2 text-right font-semibold text-green-600">
                    {formatCurrency(0)}
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <div className="font-medium text-gray-800">ruta #2</div>
                        <div className="text-xs text-gray-500">03:00 - 04:00</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right font-semibold text-gray-800">
                    {formatCurrency(estadisticas.prestamos.totalPendiente * 0.3)}
                  </td>
                  <td className="py-4 px-2 text-right font-semibold text-green-600">
                    {formatCurrency(estadisticas.cobros.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Últimos Préstamos Registrados */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Últimos Préstamos Registrados</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-blue-600 text-sm hover:text-blue-800 cursor-pointer">GEIDY</div>
                <div className="text-xs text-gray-500">2025-09-15</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatCurrency(15000)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-blue-600 text-sm hover:text-blue-800 cursor-pointer">ARMANDO 3 QUINCENAL</div>
                <div className="text-xs text-gray-500">2025-10-15</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatCurrency(30000)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <div className="font-medium text-blue-600 text-sm hover:text-blue-800 cursor-pointer">HIJO DE ARMANDO QUINCENAL</div>
                <div className="text-xs text-gray-500">2025-10-15</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatCurrency(30000)}</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium text-blue-600 text-sm hover:text-blue-800 cursor-pointer">HIJO DE ARMANDO</div>
                <div className="text-xs text-gray-500">2025-10-07</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{formatCurrency(40000)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales en tarjetas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
          <Users className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.clientes.total}</div>
          <div className="text-sm text-gray-600">Total Clientes</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
          <Briefcase className="h-10 w-10 text-purple-600 mx-auto mb-4" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.prestamos.cantidad}</div>
          <div className="text-sm text-gray-600">Total Préstamos</div>
        </div>

        <div className="bg-w
hite rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
          <TrendingUp className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.prestamos.activos}</div>
          <div className="text-sm text-gray-600">Préstamos Activos</div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center hover:shadow-xl transition-shadow">
          <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
          <div className="text-3xl font-bold text-gray-800 mb-1">{estadisticas.prestamos.pagados}</div>
          <div className="text-sm text-gray-600">Préstamos Pagados</div>
        </div>
      </div>
    </div>
  )
}

export default DashboardMejorado