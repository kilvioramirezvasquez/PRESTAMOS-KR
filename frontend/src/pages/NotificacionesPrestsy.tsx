import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Send, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Target,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notificacion {
  id: string;
  tipo: 'email' | 'sms' | 'whatsapp' | 'sistema';
  titulo: string;
  mensaje: string;
  destinatarios: string[];
  fechaEnvio: Date;
  fechaProgramada?: Date;
  estado: 'pendiente' | 'enviado' | 'fallido' | 'programado';
  categoria: 'recordatorio' | 'vencimiento' | 'promocion' | 'sistema' | 'cobranza';
  template?: string;
  estadisticas?: {
    enviados: number;
    entregados: number;
    abiertos?: number;
    clicks?: number;
  };
}

interface PlantillaNotificacion {
  id: string;
  nombre: string;
  tipo: 'email' | 'sms' | 'whatsapp';
  asunto?: string;
  contenido: string;
  variables: string[];
  activa: boolean;
}

const NotificacionesPrestsy: React.FC = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [plantillas, setPlantillas] = useState<PlantillaNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActiva, setVistaActiva] = useState<'historial' | 'enviar' | 'plantillas' | 'configuracion'>('historial');
  const [filtros, setFiltros] = useState({
    tipo: '',
    estado: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [busqueda, setBusqueda] = useState('');

  // Estados para envío
  const [nuevaNotificacion, setNuevaNotificacion] = useState({
    tipo: 'email' as 'email' | 'sms' | 'whatsapp',
    titulo: '',
    mensaje: '',
    destinatarios: '',
    categoria: 'recordatorio' as 'recordatorio' | 'vencimiento' | 'promocion' | 'sistema' | 'cobranza',
    programar: false,
    fechaProgramada: '',
    plantillaSeleccionada: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Simular datos de notificaciones
      const notificacionesSimuladas: Notificacion[] = [
        {
          id: '1',
          tipo: 'email',
          titulo: 'Recordatorio de Pago - Próximo Vencimiento',
          mensaje: 'Su cuota vence en 3 días. Monto: $150.00',
          destinatarios: ['cliente1@email.com', 'cliente2@email.com'],
          fechaEnvio: new Date(),
          estado: 'enviado',
          categoria: 'recordatorio',
          estadisticas: {
            enviados: 25,
            entregados: 24,
            abiertos: 18,
            clicks: 8
          }
        },
        {
          id: '2',
          tipo: 'sms',
          titulo: 'Cuota Vencida',
          mensaje: 'Su cuota ha vencido. Comuníquese para regularizar.',
          destinatarios: ['+1234567890', '+1234567891'],
          fechaEnvio: new Date(Date.now() - 3600000),
          estado: 'enviado',
          categoria: 'vencimiento',
          estadisticas: {
            enviados: 15,
            entregados: 14
          }
        },
        {
          id: '3',
          tipo: 'whatsapp',
          titulo: 'Promoción Nuevos Préstamos',
          mensaje: '¡Oferta especial! Préstamos con 15% de interés anual.',
          destinatarios: ['+1234567892', '+1234567893'],
          fechaEnvio: new Date(Date.now() - 7200000),
          estado: 'pendiente',
          categoria: 'promocion'
        },
        {
          id: '4',
          tipo: 'email',
          titulo: 'Backup Completado',
          mensaje: 'El respaldo automático se completó exitosamente.',
          destinatarios: ['admin@prestsy.com'],
          fechaEnvio: new Date(Date.now() - 86400000),
          estado: 'enviado',
          categoria: 'sistema',
          estadisticas: {
            enviados: 1,
            entregados: 1,
            abiertos: 1
          }
        }
      ];

      // Simular plantillas
      const plantillasSimuladas: PlantillaNotificacion[] = [
        {
          id: '1',
          nombre: 'Recordatorio de Pago',
          tipo: 'email',
          asunto: 'Recordatorio - Su cuota vence pronto',
          contenido: 'Estimado {NOMBRE_CLIENTE}, le recordamos que su cuota de ${MONTO_CUOTA} vence el {FECHA_VENCIMIENTO}.',
          variables: ['NOMBRE_CLIENTE', 'MONTO_CUOTA', 'FECHA_VENCIMIENTO'],
          activa: true
        },
        {
          id: '2',
          nombre: 'SMS Cuota Vencida',
          tipo: 'sms',
          contenido: '{NOMBRE_CLIENTE}, su cuota de ${MONTO_CUOTA} ha vencido. Comuníquese al {TELEFONO_EMPRESA}.',
          variables: ['NOMBRE_CLIENTE', 'MONTO_CUOTA', 'TELEFONO_EMPRESA'],
          activa: true
        },
        {
          id: '3',
          nombre: 'WhatsApp Bienvenida',
          tipo: 'whatsapp',
          contenido: '¡Bienvenido {NOMBRE_CLIENTE}! Su préstamo por ${MONTO_PRESTAMO} ha sido aprobado.',
          variables: ['NOMBRE_CLIENTE', 'MONTO_PRESTAMO'],
          activa: true
        }
      ];

      setNotificaciones(notificacionesSimuladas);
      setPlantillas(plantillasSimuladas);
    } catch (error) {
      toast.error('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const enviarNotificacion = async () => {
    try {
      if (!nuevaNotificacion.titulo || !nuevaNotificacion.mensaje || !nuevaNotificacion.destinatarios) {
        toast.error('Complete todos los campos obligatorios');
        return;
      }

      setLoading(true);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nuevaNotif: Notificacion = {
        id: Date.now().toString(),
        tipo: nuevaNotificacion.tipo,
        titulo: nuevaNotificacion.titulo,
        mensaje: nuevaNotificacion.mensaje,
        destinatarios: nuevaNotificacion.destinatarios.split(',').map(d => d.trim()),
        fechaEnvio: new Date(),
        estado: nuevaNotificacion.programar ? 'programado' : 'enviado',
        categoria: nuevaNotificacion.categoria,
        fechaProgramada: nuevaNotificacion.programar ? new Date(nuevaNotificacion.fechaProgramada) : undefined
      };

      setNotificaciones(prev => [nuevaNotif, ...prev]);
      
      // Limpiar formulario
      setNuevaNotificacion({
        tipo: 'email',
        titulo: '',
        mensaje: '',
        destinatarios: '',
        categoria: 'recordatorio',
        programar: false,
        fechaProgramada: '',
        plantillaSeleccionada: ''
      });

      toast.success('Notificación enviada exitosamente');
      setVistaActiva('historial');
    } catch (error) {
      toast.error('Error al enviar notificación');
    } finally {
      setLoading(false);
    }
  };

  const aplicarPlantilla = (plantillaId: string) => {
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (plantilla) {
      setNuevaNotificacion(prev => ({
        ...prev,
        tipo: plantilla.tipo,
        titulo: plantilla.asunto || plantilla.nombre,
        mensaje: plantilla.contenido,
        plantillaSeleccionada: plantillaId
      }));
    }
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms': return <Smartphone className="w-5 h-5 text-green-600" />;
      case 'whatsapp': return <MessageSquare className="w-5 h-5 text-green-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'enviado': return 'bg-green-100 text-green-800';
      case 'fallido': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'programado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHistorial = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sistema">Sistema</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="enviado">Enviado</option>
                <option value="pendiente">Pendiente</option>
                <option value="fallido">Fallido</option>
                <option value="programado">Programado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="recordatorio">Recordatorio</option>
                <option value="vencimiento">Vencimiento</option>
                <option value="promocion">Promoción</option>
                <option value="sistema">Sistema</option>
                <option value="cobranza">Cobranza</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificaciones */}
      <div className="space-y-4">
        {notificaciones.map((notif) => (
          <Card key={notif.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getIconoTipo(notif.tipo)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{notif.titulo}</h3>
                      <Badge className={getColorEstado(notif.estado)}>
                        {notif.estado.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {notif.categoria}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{notif.mensaje}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {notif.fechaEnvio.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {notif.destinatarios.length} destinatarios
                      </span>
                      {notif.estadisticas && (
                        <>
                          <span>Enviados: {notif.estadisticas.enviados}</span>
                          <span>Entregados: {notif.estadisticas.entregados}</span>
                          {notif.estadisticas.abiertos && (
                            <span>Abiertos: {notif.estadisticas.abiertos}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEnviarNotificacion = () => (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Nueva Notificación</CardTitle>
        <CardDescription>Crea y envía notificaciones personalizadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Notificación *
            </label>
            <select
              value={nuevaNotificacion.tipo}
              onChange={(e) => setNuevaNotificacion(prev => ({ 
                ...prev, 
                tipo: e.target.value as 'email' | 'sms' | 'whatsapp' 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={nuevaNotificacion.categoria}
              onChange={(e) => setNuevaNotificacion(prev => ({ 
                ...prev, 
                categoria: e.target.value as any 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="recordatorio">Recordatorio</option>
              <option value="vencimiento">Vencimiento</option>
              <option value="promocion">Promoción</option>
              <option value="sistema">Sistema</option>
              <option value="cobranza">Cobranza</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla
            </label>
            <select
              value={nuevaNotificacion.plantillaSeleccionada}
              onChange={(e) => aplicarPlantilla(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Sin plantilla</option>
              {plantillas
                .filter(p => p.tipo === nuevaNotificacion.tipo && p.activa)
                .map(plantilla => (
                <option key={plantilla.id} value={plantilla.id}>
                  {plantilla.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinatarios *
            </label>
            <input
              type="text"
              placeholder="email1@dom.com, email2@dom.com"
              value={nuevaNotificacion.destinatarios}
              onChange={(e) => setNuevaNotificacion(prev => ({ 
                ...prev, 
                destinatarios: e.target.value 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separe múltiples destinatarios con comas
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título/Asunto *
          </label>
          <input
            type="text"
            value={nuevaNotificacion.titulo}
            onChange={(e) => setNuevaNotificacion(prev => ({ 
              ...prev, 
              titulo: e.target.value 
            }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje *
          </label>
          <textarea
            rows={6}
            value={nuevaNotificacion.mensaje}
            onChange={(e) => setNuevaNotificacion(prev => ({ 
              ...prev, 
              mensaje: e.target.value 
            }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={nuevaNotificacion.programar}
              onChange={(e) => setNuevaNotificacion(prev => ({ 
                ...prev, 
                programar: e.target.checked 
              }))}
              className="mr-2"
            />
            Programar envío
          </label>
          
          {nuevaNotificacion.programar && (
            <input
              type="datetime-local"
              value={nuevaNotificacion.fechaProgramada}
              onChange={(e) => setNuevaNotificacion(prev => ({ 
                ...prev, 
                fechaProgramada: e.target.value 
              }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setVistaActiva('historial')}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={enviarNotificacion}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {nuevaNotificacion.programar ? 'Programar' : 'Enviar'}
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            <Bell className="mr-3 h-8 w-8 text-blue-600" />
            Centro de Notificaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona todas las comunicaciones con tus clientes
          </p>
        </div>
        <button
          onClick={() => setVistaActiva('enviar')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Notificación
        </button>
      </div>

      {/* Navegación */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'historial', nombre: 'Historial', icono: Clock },
          { id: 'enviar', nombre: 'Enviar', icono: Send },
          { id: 'plantillas', nombre: 'Plantillas', icono: FileText },
          { id: 'configuracion', nombre: 'Configuración', icono: Settings }
        ].map((vista) => {
          const Icono = vista.icono;
          return (
            <button
              key={vista.id}
              onClick={() => setVistaActiva(vista.id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                vistaActiva === vista.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icono className="w-4 h-4 mr-2" />
              {vista.nombre}
            </button>
          );
        })}
      </div>

      {/* Contenido según vista activa */}
      {vistaActiva === 'historial' && renderHistorial()}
      {vistaActiva === 'enviar' && renderEnviarNotificacion()}
      {vistaActiva === 'plantillas' && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Gestión de plantillas en desarrollo</p>
        </div>
      )}
      {vistaActiva === 'configuracion' && (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Configuración de canales en desarrollo</p>
        </div>
      )}
    </div>
  );
};

export default NotificacionesPrestsy;