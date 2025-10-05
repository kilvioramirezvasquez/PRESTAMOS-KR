import { useState, useEffect } from 'react';
import { clientesAPI, prestamosAPI, cobradoresAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  zona: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

interface PrestamoVencido {
  _id: string;
  cliente: Cliente;
  monto: number;
  saldoPendiente: number;
  fechaVencimiento: string;
  diasVencido: number;
}

interface RutaCobro {
  cobrador: string;
  zona: string;
  clientes: Cliente[];
  prestamosVencidos: PrestamoVencido[];
  distanciaTotal: number;
  tiempoEstimado: number;
}

export default function RutasCobroPrestsy() {
  const [loading, setLoading] = useState(false);
  const [cobradores, setCobradores] = useState<any[]>([]);
  const [rutas, setRutas] = useState<RutaCobro[]>([]);
  const [cobradorSeleccionado, setCobradorSeleccionado] = useState('');
  const [fechaRuta, setFechaRuta] = useState(new Date().toISOString().split('T')[0]);
  const [tipoRuta, setTipoRuta] = useState('vencidos'); // vencidos, todos, zona

  useEffect(() => {
    cargarCobradores();
  }, []);

  const cargarCobradores = async () => {
    try {
      const res = await cobradoresAPI.obtenerTodos();
      setCobradores(res.data.cobradores || []);
    } catch (error) {
      console.error('Error cargando cobradores:', error);
      toast.error('Error cargando cobradores');
    }
  };

  const generarRutasOptimizadas = async () => {
    try {
      setLoading(true);
      
      const [clientesRes, prestamosRes] = await Promise.all([
        clientesAPI.obtenerTodos(),
        prestamosAPI.obtenerTodos()
      ]);

      const clientes = clientesRes.data.clientes || [];
      const prestamos = prestamosRes.data.prestamos || [];

      // Filtrar préstamos vencidos o por vencer
      const hoy = new Date();
      const prestamosParaCobro = prestamos.filter((p: any) => {
        if (tipoRuta === 'vencidos') {
          return p.estado === 'mora' || p.estado === 'vencido';
        } else if (tipoRuta === 'todos') {
          return p.estado === 'activo' || p.estado === 'mora';
        }
        return true;
      });

      // Agrupar por cobrador
      const rutasPorCobrador: { [key: string]: RutaCobro } = {};

      cobradores.forEach(cobrador => {
        rutasPorCobrador[cobrador._id] = {
          cobrador: cobrador.nombre,
          zona: cobrador.zona || 'Sin asignar',
          clientes: [],
          prestamosVencidos: [],
          distanciaTotal: 0,
          tiempoEstimado: 0
        };
      });

      // Asignar clientes y préstamos a cobradores
      prestamosParaCobro.forEach((prestamo: any) => {
        const cliente = prestamo.cliente;
        const cobradorId = cliente.cobrador || prestamo.cobrador;
        
        if (cobradorId && rutasPorCobrador[cobradorId]) {
          // Verificar si el cliente ya está en la ruta
          const clienteExiste = rutasPorCobrador[cobradorId].clientes.find(c => c._id === cliente._id);
          
          if (!clienteExiste) {
            rutasPorCobrador[cobradorId].clientes.push(cliente);
          }

          // Calcular días vencidos
          const fechaVencimiento = new Date(prestamo.fechaVencimiento || prestamo.fecha);
          const diasVencido = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));

          rutasPorCobrador[cobradorId].prestamosVencidos.push({
            _id: prestamo._id,
            cliente: cliente,
            monto: prestamo.monto,
            saldoPendiente: prestamo.saldoPendiente || prestamo.monto,
            fechaVencimiento: prestamo.fechaVencimiento || prestamo.fecha,
            diasVencido: diasVencido
          });
        }
      });

      // Calcular estadísticas de ruta para cada cobrador
      Object.keys(rutasPorCobrador).forEach(cobradorId => {
        const ruta = rutasPorCobrador[cobradorId];
        ruta.distanciaTotal = ruta.clientes.length * 2.5; // Estimado: 2.5km por cliente
        ruta.tiempoEstimado = ruta.clientes.length * 30; // Estimado: 30 min por cliente
      });

      // Filtrar solo cobradores con rutas
      const rutasConClientes = Object.values(rutasPorCobrador).filter(ruta => ruta.clientes.length > 0);
      
      setRutas(rutasConClientes);
      toast.success(`${rutasConClientes.length} rutas generadas exitosamente`);

    } catch (error) {
      console.error('Error generando rutas:', error);
      toast.error('Error generando rutas de cobro');
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  };

  const exportarRuta = (ruta: RutaCobro) => {
    let contenido = `RUTA DE COBRO - ${ruta.cobrador}\n`;
    contenido += `Fecha: ${new Date().toLocaleDateString('es-CO')}\n`;
    contenido += `Zona: ${ruta.zona}\n`;
    contenido += `Total Clientes: ${ruta.clientes.length}\n`;
    contenido += `Distancia Estimada: ${ruta.distanciaTotal.toFixed(1)} km\n`;
    contenido += `Tiempo Estimado: ${formatearTiempo(ruta.tiempoEstimado)}\n\n`;
    
    contenido += 'CLIENTES A VISITAR:\n';
    contenido += '='.repeat(50) + '\n';
    
    ruta.prestamosVencidos.forEach((prestamo, index) => {
      contenido += `${index + 1}. ${prestamo.cliente.nombre}\n`;
      contenido += `   Cédula: ${prestamo.cliente.cedula}\n`;
      contenido += `   Teléfono: ${prestamo.cliente.telefono}\n`;
      contenido += `   Dirección: ${prestamo.cliente.direccion}\n`;
      contenido += `   Saldo Pendiente: ${formatearMoneda(prestamo.saldoPendiente)}\n`;
      contenido += `   Días Vencido: ${prestamo.diasVencido} días\n`;
      contenido += `   ${'─'.repeat(30)}\n`;
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruta_${ruta.cobrador.replace(/\s+/g, '_')}_${fechaRuta}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading">
          <h3 className="panel-title">
            <i className="icon-location2"></i> Rutas de Cobro Optimizadas
          </h3>
        </div>
      </div>

      {/* Controles */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label>Fecha de Ruta</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaRuta}
                  onChange={(e) => setFechaRuta(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Tipo de Ruta</label>
                <select
                  className="form-control"
                  value={tipoRuta}
                  onChange={(e) => setTipoRuta(e.target.value)}
                >
                  <option value="vencidos">Solo Vencidos</option>
                  <option value="todos">Todos Activos</option>
                  <option value="zona">Por Zona</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Cobrador Específico (Opcional)</label>
                <select
                  className="form-control"
                  value={cobradorSeleccionado}
                  onChange={(e) => setCobradorSeleccionado(e.target.value)}
                >
                  <option value="">Todos los Cobradores</option>
                  {cobradores.map(cobrador => (
                    <option key={cobrador._id} value={cobrador._id}>
                      {cobrador.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>&nbsp;</label>
                <button
                  className="btn btn-primary btn-block"
                  onClick={generarRutasOptimizadas}
                  disabled={loading}
                >
                  {loading ? (
                    <i className="icon-spinner2 spinner"></i>
                  ) : (
                    <i className="icon-location2"></i>
                  )}
                  {loading ? ' Generando...' : ' Generar Rutas'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rutas Generadas */}
      {rutas.length > 0 && (
        <div className="row">
          {rutas.map((ruta, index) => (
            <div key={index} className="col-md-6" style={{ marginBottom: '20px' }}>
              <div className="panel">
                <div className="panel-heading clearfix">
                  <h4 className="panel-title pull-left">
                    <i className="icon-user-tie"></i> {ruta.cobrador}
                  </h4>
                  <button
                    className="btn btn-sm btn-success pull-right"
                    onClick={() => exportarRuta(ruta)}
                  >
                    <i className="icon-download"></i> Exportar
                  </button>
                </div>
                <div className="panel-body">
                  {/* Estadísticas de la ruta */}
                  <div className="row" style={{ marginBottom: '15px' }}>
                    <div className="col-xs-6">
                      <div className="text-center">
                        <h5 className="text-primary">{ruta.clientes.length}</h5>
                        <small className="text-muted">Clientes</small>
                      </div>
                    </div>
                    <div className="col-xs-6">
                      <div className="text-center">
                        <h5 className="text-success">
                          {formatearMoneda(
                            ruta.prestamosVencidos.reduce((sum, p) => sum + p.saldoPendiente, 0)
                          )}
                        </h5>
                        <small className="text-muted">A Cobrar</small>
                      </div>
                    </div>
                  </div>

                  <div className="row" style={{ marginBottom: '15px' }}>
                    <div className="col-xs-6">
                      <small className="text-muted">
                        <i className="icon-location2"></i> {ruta.distanciaTotal.toFixed(1)} km
                      </small>
                    </div>
                    <div className="col-xs-6">
                      <small className="text-muted">
                        <i className="icon-clock"></i> {formatearTiempo(ruta.tiempoEstimado)}
                      </small>
                    </div>
                  </div>

                  {/* Lista de clientes */}
                  <div className="table-responsive">
                    <table className="table table-striped table-condensed">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Cliente</th>
                          <th>Teléfono</th>
                          <th>Días Venc.</th>
                          <th>A Cobrar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ruta.prestamosVencidos
                          .sort((a, b) => b.diasVencido - a.diasVencido)
                          .slice(0, 5)
                          .map((prestamo, idx) => (
                          <tr key={prestamo._id}>
                            <td>{idx + 1}</td>
                            <td>
                              <small>{prestamo.cliente.nombre}</small>
                            </td>
                            <td>
                              <small>{prestamo.cliente.telefono}</small>
                            </td>
                            <td>
                              <span className={`label ${
                                prestamo.diasVencido > 30 ? 'label-danger' :
                                prestamo.diasVencido > 15 ? 'label-warning' : 'label-info'
                              }`}>
                                {prestamo.diasVencido}d
                              </span>
                            </td>
                            <td>
                              <small>{formatearMoneda(prestamo.saldoPendiente)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {ruta.prestamosVencidos.length > 5 && (
                      <p className="text-center text-muted">
                        <small>Y {ruta.prestamosVencidos.length - 5} clientes más...</small>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado inicial */}
      {rutas.length === 0 && !loading && (
        <div className="panel">
          <div className="panel-body text-center" style={{ padding: '50px' }}>
            <i className="icon-location2" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
            <h4 className="text-muted">No hay rutas generadas</h4>
            <p className="text-muted">
              Configura los filtros y haz clic en "Generar Rutas" para optimizar las rutas de cobro.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}