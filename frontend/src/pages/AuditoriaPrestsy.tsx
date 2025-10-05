import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Eye, 
  Clock, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LogEntry {
  id: string;
  timestamp: Date;
  usuario: string;
  accion: string;
  modulo: string;
  detalles: string;
  ip: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  resultado: 'exitoso' | 'fallido' | 'pendiente';
  datosAnteriores?: any;
  datosNuevos?: any;
}

interface FiltrosAuditoria {
  fechaInicio: string;
  fechaFin: string;
  usuario: string;
  modulo: string;
  tipo: string;
  accion: string;
}

const AuditoriaPrestsy: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({
    fechaInicio: '',
    fechaFin: '',
    usuario: '',
    modulo: '',
    tipo: '',
    accion: ''
  });
  const [busqueda, setBusqueda] = useState('');
  const [logSeleccionado, setLogSeleccionado] = useState<LogEntry | null>(null);

  useEffect(() => {
    cargarLogs();
  }, [filtros]);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      
      // Simular datos de auditoría
      const logsSimulados: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(),
          usuario: 'admin@prestsy.com',
          accion: 'CREAR_CLIENTE',
          modulo: 'Clientes',
          detalles: 'Creó nuevo cliente: Juan Pérez',
          ip: '192.168.1.100',
          tipo: 'success',
          resultado: 'exitoso',
          datosNuevos: { nombre: 'Juan Pérez', cedula: '12345678' }
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000),
          usuario: 'cobrador1@prestsy.com',
          accion: 'REGISTRAR_COBRO',
          modulo: 'Cobros',
          detalles: 'Registró cobro de $5,000 para préstamo #001',
          ip: '192.168.1.105',
          tipo: 'success',
          resultado: 'exitoso'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 7200000),
          usuario: 'admin@prestsy.com',
          accion: 'INTENTO_LOGIN_FALLIDO',
          modulo: 'Autenticación',
          detalles: 'Intento de login fallido con credenciales incorrectas',
          ip: '192.168.1.150',
          tipo: 'error',
          resultado: 'fallido'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 10800000),
          usuario: 'supervisor@prestsy.com',
          accion: 'MODIFICAR_PRESTAMO',
          modulo: 'Préstamos',
          detalles: 'Modificó tasa de interés del préstamo #025',
          ip: '192.168.1.102',
          tipo: 'warning',
          resultado: 'exitoso',
          datosAnteriores: { tasa: 15 },
          datosNuevos: { tasa: 18 }
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 14400000),
          usuario: 'cobrador2@prestsy.com',
          accion: 'CONSULTAR_REPORTE',
          modulo: 'Reportes',
          detalles: 'Consultó reporte de cobros del día',
          ip: '192.168.1.108',
          tipo: 'info',
          resultado: 'exitoso'
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 18000000),
          usuario: 'admin@prestsy.com',
          accion: 'ELIMINAR_USUARIO',
          modulo: 'Usuarios',
          detalles: 'Eliminó usuario: empleado.inactivo@prestsy.com',
          ip: '192.168.1.100',
          tipo: 'warning',
          resultado: 'exitoso'
        },
        {
          id: '7',
          timestamp: new Date(Date.now() - 21600000),
          usuario: 'sistema',
          accion: 'BACKUP_AUTOMATICO',
          modulo: 'Sistema',
          detalles: 'Respaldo automático de base de datos completado',
          ip: 'localhost',
          tipo: 'success',
          resultado: 'exitoso'
        },
        {
          id: '8',
          timestamp: new Date(Date.now() - 25200000),
          usuario: 'cobrador1@prestsy.com',
          accion: 'ERROR_SISTEMA',
          modulo: 'Cobros',
          detalles: 'Error al procesar cobro: Timeout de conexión',
          ip: '192.168.1.105',
          tipo: 'error',
          resultado: 'fallido'
        }
      ];
      
      setLogs(logsSimulados);
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo: keyof FiltrosAuditoria, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const exportarLogs = () => {
    toast.success('Exportando logs de auditoría...');
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      usuario: '',
      modulo: '',
      tipo: '',
      accion: ''
    });
    setBusqueda('');
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const logsFiltrados = logs.filter(log => {
    const cumpleBusqueda = busqueda === '' || 
      log.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.accion.toLowerCase().includes(busqueda.toLowerCase()) ||
      log.detalles.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleBusqueda;
  });

  const estadisticas = {
    total: logs.length,
    exitosos: logs.filter(l => l.resultado === 'exitoso').length,
    fallidos: logs.filter(l => l.resultado === 'fallido').length,
    warnings: logs.filter(l => l.tipo === 'warning').length
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-600" />
            Auditoría y Logs
          </h1>
          <p className="text-gray-600 mt-1">
            Seguimiento completo de actividades del sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={cargarLogs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          <button 
            onClick={exportarLogs}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticas.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Exitosos</p>
                <p className="text-2xl font-bold text-green-600">
                  {estadisticas.exitosos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fallidos</p>
                <p className="text-2xl font-bold text-red-600">
                  {estadisticas.fallidos}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Advertencias</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {estadisticas.warnings}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <select
                value={filtros.usuario}
                onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="admin@prestsy.com">Admin</option>
                <option value="cobrador1@prestsy.com">Cobrador 1</option>
                <option value="cobrador2@prestsy.com">Cobrador 2</option>
                <option value="supervisor@prestsy.com">Supervisor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Módulo
              </label>
              <select
                value={filtros.modulo}
                onChange={(e) => handleFiltroChange('modulo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="Clientes">Clientes</option>
                <option value="Préstamos">Préstamos</option>
                <option value="Cobros">Cobros</option>
                <option value="Usuarios">Usuarios</option>
                <option value="Reportes">Reportes</option>
                <option value="Sistema">Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="success">Exitoso</option>
                <option value="error">Error</option>
                <option value="warning">Advertencia</option>
                <option value="info">Información</option>
              </select>
            </div>

            <div className="flex items-end">
              <button 
                onClick={limpiarFiltros}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividades</CardTitle>
          <CardDescription>
            Mostrando {logsFiltrados.length} de {logs.length} eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logsFiltrados.map((log) => (
              <div 
                key={log.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setLogSeleccionado(log)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getIconoTipo(log.tipo)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{log.accion}</span>
                        <Badge className={getColorTipo(log.tipo)}>
                          {log.tipo.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{log.modulo}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{log.detalles}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {log.usuario}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {log.timestamp.toLocaleString()}
                        </span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      {logSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detalle del Evento</h3>
              <button 
                onClick={() => setLogSeleccionado(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID del Evento</label>
                  <p className="text-gray-900">{logSeleccionado.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-gray-900">{logSeleccionado.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Usuario</label>
                  <p className="text-gray-900">{logSeleccionado.usuario}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dirección IP</label>
                  <p className="text-gray-900">{logSeleccionado.ip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Acción</label>
                  <p className="text-gray-900">{logSeleccionado.accion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Módulo</label>
                  <p className="text-gray-900">{logSeleccionado.modulo}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detalles</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded">{logSeleccionado.detalles}</p>
              </div>

              {logSeleccionado.datosAnteriores && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datos Anteriores</label>
                  <pre className="text-sm bg-red-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(logSeleccionado.datosAnteriores, null, 2)}
                  </pre>
                </div>
              )}

              {logSeleccionado.datosNuevos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datos Nuevos</label>
                  <pre className="text-sm bg-green-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(logSeleccionado.datosNuevos, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditoriaPrestsy;