import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Database, 
  Users, 
  CreditCard, 
  DollarSign, 
  UserCheck, 
  FileText, 
  Settings, 
  Globe,
  Server,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  LayoutDashboard
} from 'lucide-react'

interface ModuloSistema {
  nombre: string
  descripcion: string
  estado: 'activo' | 'inactivo' | 'error'
  url?: string
  icono: React.ReactNode
  funcionalidades?: string[]
}

interface AnalisisSistema {
  informacionGeneral: {
    empresa: string
    codigo: string
    usuario: string
    sitioWeb: string
    servidorAPI: string
  }
  baseDatos: {
    principal: {
      nombre: string
      host: string
      puerto: number
      usuario: string
    }
    local: {
      nombre: string
      host: string
      puerto: number
      usuario: string
    }
  }
  modulos: ModuloSistema[]
  paginasEncontradas: Array<{
    url: string
    status: number
    titulo: string
    contentType?: string
  }>
  paginasNoEncontradas: Array<{
    url: string
    status?: number
    error: string
  }>
}

const SistemaViejoAnalisis: React.FC = () => {
  const [analisis, setAnalisis] = useState<AnalisisSistema | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')

  useEffect(() => {
    // Cargar datos del análisis del sistema viejo desde el archivo JSON
    const cargarAnalisis = async () => {
      try {
        // Cargar datos desde el archivo JSON estático
        const response = await fetch('/sistema-viejo-analisis.json')
        if (!response.ok) {
          throw new Error('No se pudo cargar el análisis del sistema')
        }
        
        const data = await response.json()
        
        // Función para obtener el icono correcto basado en el nombre
        const getIconoModulo = (nombreIcono: string) => {
          switch (nombreIcono) {
            case 'CreditCard': return <CreditCard className="h-6 w-6" />
            case 'Users': return <Users className="h-6 w-6" />
            case 'UserCheck': return <UserCheck className="h-6 w-6" />
            case 'DollarSign': return <DollarSign className="h-6 w-6" />
            case 'AlertCircle': return <AlertCircle className="h-6 w-6" />
            case 'Globe': return <Globe className="h-6 w-6" />
            case 'FileText': return <FileText className="h-6 w-6" />
            case 'Server': return <Server className="h-6 w-6" />
            case 'Settings': return <Settings className="h-6 w-6" />
            case 'LayoutDashboard': return <LayoutDashboard className="h-6 w-6" />
            default: return <FileText className="h-6 w-6" />
          }
        }
        
        const datosAnalisis: AnalisisSistema = {
          informacionGeneral: data.informacionGeneral || {
            empresa: 'Inversiones Marcos',
            codigo: 'invmarcos / invmarcos_local',
            usuario: 'marcos',
            sitioWeb: 'invmarcos.ddns.net',
            servidorAPI: 'prestamov2.ddns.net:8000'
          },
          baseDatos: data.baseDatos || {
            principal: {
              nombre: 'prestamos_invmarcos',
              host: 'prestamov2.ddns.net',
              puerto: 3306,
              usuario: 'p_invmarcos'
            },
            local: {
              nombre: 'prestamos_invmarcos',
              host: 'localhost',
              puerto: 3306,
              usuario: 'p_invmarcos_app'
            }
          },
          modulos: (data.modulos || []).map((modulo: any) => ({
            ...modulo,
            icono: getIconoModulo(modulo.icono)
          })),
          paginasEncontradas: data.paginasEncontradas || [],
          paginasNoEncontradas: data.paginasNoEncontradas || []
        }

        setTimeout(() => {
          setAnalisis(datosAnalisis)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error cargando análisis:', error)
        setLoading(false)
      }
    }

    cargarAnalisis()
  }, [])

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactivo':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge variant="default" className="bg-green-100 text-green-800">Activo</Badge>
      case 'inactivo':
        return <Badge variant="secondary">Inactivo</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analizando sistema original...</p>
        </div>
      </div>
    )
  }

  if (!analisis) {
    return (
      <div className="text-center p-8">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar análisis</h2>
        <p className="text-gray-600">No se pudo cargar la información del sistema original.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Eye className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análisis del Sistema Original</h1>
          <p className="text-gray-600">Información detallada del sistema Prestsy original</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="paginas">Páginas</TabsTrigger>
          <TabsTrigger value="basedatos">Base de Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Información General</span>
              </CardTitle>
              <CardDescription>
                Datos básicos del sistema original Prestsy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Empresa:</label>
                  <p className="text-gray-900">{analisis.informacionGeneral.empresa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Código del Sistema:</label>
                  <p className="text-gray-900">{analisis.informacionGeneral.codigo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Usuario Principal:</label>
                  <p className="text-gray-900">{analisis.informacionGeneral.usuario}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Sitio Web:</label>
                  <p className="text-gray-900">{analisis.informacionGeneral.sitioWeb}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Servidor API:</label>
                  <p className="text-gray-900">{analisis.informacionGeneral.servidorAPI}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Módulos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {analisis.modulos.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Módulos Activos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {analisis.modulos.filter(m => m.estado === 'activo').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Páginas Encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {analisis.paginasEncontradas.length}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modulos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analisis.modulos.map((modulo, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {modulo.icono}
                      <span>{modulo.nombre}</span>
                    </div>
                    {getEstadoIcon(modulo.estado)}
                  </CardTitle>
                  <CardDescription>{modulo.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    {getEstadoBadge(modulo.estado)}
                  </div>
                  {modulo.url && (
                    <div>
                      <span className="text-sm text-gray-600">URL:</span>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{modulo.url}</p>
                    </div>
                  )}
                  {modulo.funcionalidades && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Funcionalidades:</span>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {modulo.funcionalidades.map((func, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                            <span>{func}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="paginas" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Páginas Encontradas</span>
                </CardTitle>
                <CardDescription>
                  Páginas que respondieron correctamente ({analisis.paginasEncontradas.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisis.paginasEncontradas.map((pagina, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">{pagina.url}</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {pagina.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700">{pagina.titulo}</p>
                      {pagina.contentType && (
                        <p className="text-xs text-green-600 mt-1">{pagina.contentType}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  <span>Páginas No Encontradas</span>
                </CardTitle>
                <CardDescription>
                  Páginas que no se pudieron acceder ({analisis.paginasNoEncontradas.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisis.paginasNoEncontradas.map((pagina, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-red-800">{pagina.url}</span>
                        {pagina.status && (
                          <Badge variant="destructive">
                            {pagina.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-red-700">{pagina.error}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="basedatos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Configuración Principal</span>
                </CardTitle>
                <CardDescription>
                  Base de datos en servidor remoto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Base de Datos:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.principal.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Host:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.principal.host}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Puerto:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.principal.puerto}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Usuario:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.principal.usuario}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Configuración Local</span>
                </CardTitle>
                <CardDescription>
                  Base de datos en servidor local
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Base de Datos:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.local.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Host:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.local.host}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Puerto:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.local.puerto}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Usuario:</label>
                  <p className="text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {analisis.baseDatos.local.usuario}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SistemaViejoAnalisis