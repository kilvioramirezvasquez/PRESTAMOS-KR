import { useState, useEffect } from 'react';
import { clientesAPI, prestamosAPI, cobrosAPI } from '../services/api';

export default function ReportesPrestsy() {
  const [loading, setLoading] = useState(false);
  const [tipoReporte, setTipoReporte] = useState('general');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [datosReporte, setDatosReporte] = useState<any>(null);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(hace30Dias.toISOString().split('T')[0]);
  }, []);

  const generarReporte = async () => {
    try {
      setLoading(true);
      
      const [clientesRes, prestamosRes, cobrosRes] = await Promise.all([
        clientesAPI.obtenerTodos(),
        prestamosAPI.obtenerTodos(),
        cobrosAPI.obtenerTodos()
      ]);

      const clientes = clientesRes.data.clientes || [];
      const prestamos = prestamosRes.data.prestamos || [];
      const cobros = cobrosRes.data.cobros || [];

      // Filtrar por fechas si están definidas
      const prestamosFiltrados = prestamos.filter((p: any) => {
        if (!fechaInicio || !fechaFin) return true;
        const fechaPrestamo = new Date(p.fecha);
        return fechaPrestamo >= new Date(fechaInicio) && fechaPrestamo <= new Date(fechaFin);
      });

      const cobrosFiltrados = cobros.filter((c: any) => {
        if (!fechaInicio || !fechaFin) return true;
        const fechaCobro = new Date(c.fecha);
        return fechaCobro >= new Date(fechaInicio) && fechaCobro <= new Date(fechaFin);
      });

      // Generar datos del reporte
      const reporte = {
        resumen: {
          totalClientes: clientes.length,
          clientesActivos: clientes.filter((c: any) => c.estado === 'activo').length,
          totalPrestamos: prestamosFiltrados.length,
          prestamosActivos: prestamosFiltrados.filter((p: any) => p.estado === 'activo').length,
          prestamosPagados: prestamosFiltrados.filter((p: any) => p.estado === 'pagado').length,
          prestamosVencidos: prestamosFiltrados.filter((p: any) => p.estado === 'vencido').length,
          totalCobros: cobrosFiltrados.length,
          montoTotalPrestado: prestamosFiltrados.reduce((sum: number, p: any) => sum + p.monto, 0),
          montoTotalCobrado: cobrosFiltrados.reduce((sum: number, c: any) => sum + c.monto, 0)
        },
        prestamos: prestamosFiltrados.map((p: any) => ({
          id: p._id,
          cliente: p.cliente?.nombre || 'N/A',
          monto: p.monto,
          fecha: p.fecha,
          estado: p.estado,
          interes: p.interes,
          plazo: p.plazo
        })),
        cobros: cobrosFiltrados.map((c: any) => ({
          id: c._id,
          cliente: c.prestamo?.cliente?.nombre || 'N/A',
          monto: c.monto,
          fecha: c.fecha,
          cobrador: c.cobrador?.nombre || 'Sistema'
        })),
        clientesMorosos: clientes.filter((c: any) => {
          // Lógica simple para identificar morosos
          const prestamosCliente = prestamos.filter((p: any) => p.cliente?._id === c._id && p.estado === 'vencido');
          return prestamosCliente.length > 0;
        }).map((c: any) => ({
          nombre: c.nombre,
          cedula: c.cedula,
          telefono: c.telefono,
          prestamosVencidos: prestamos.filter((p: any) => p.cliente?._id === c._id && p.estado === 'vencido').length
        }))
      };

      setDatosReporte(reporte);
    } catch (error) {
      console.error('Error generando reporte:', error);
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

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const exportarReporte = () => {
    if (!datosReporte) return;
    
    // Generar CSV simple
    let csv = 'Reporte de Préstamos\n\n';
    csv += 'RESUMEN GENERAL\n';
    csv += `Total Clientes,${datosReporte.resumen.totalClientes}\n`;
    csv += `Clientes Activos,${datosReporte.resumen.clientesActivos}\n`;
    csv += `Total Préstamos,${datosReporte.resumen.totalPrestamos}\n`;
    csv += `Monto Total Prestado,${datosReporte.resumen.montoTotalPrestado}\n`;
    csv += `Monto Total Cobrado,${datosReporte.resumen.montoTotalCobrado}\n\n`;
    
    csv += 'PRÉSTAMOS\n';
    csv += 'Cliente,Monto,Fecha,Estado\n';
    datosReporte.prestamos.forEach((p: any) => {
      csv += `${p.cliente},${p.monto},${formatearFecha(p.fecha)},${p.estado}\n`;
    });

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_prestamos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading">
          <h3 className="panel-title">
            <i className="icon-stats-bars"></i> Reportes y Estadísticas
          </h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <label>Tipo de Reporte</label>
                <select
                  className="form-control"
                  value={tipoReporte}
                  onChange={(e) => setTipoReporte(e.target.value)}
                >
                  <option value="general">Reporte General</option>
                  <option value="prestamos">Solo Préstamos</option>
                  <option value="cobros">Solo Cobros</option>
                  <option value="morosos">Clientes Morosos</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>Fecha Fin</label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <label>&nbsp;</label>
                <div>
                  <button
                    className="btn btn-primary"
                    onClick={generarReporte}
                    disabled={loading}
                  >
                    {loading ? 'Generando...' : 'Generar Reporte'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {datosReporte && (
        <>
          {/* Resumen */}
          <div className="panel">
            <div className="panel-heading clearfix">
              <h4 className="panel-title pull-left">Resumen Ejecutivo</h4>
              <button
                className="btn btn-success btn-sm pull-right"
                onClick={exportarReporte}
              >
                <i className="icon-download"></i> Exportar CSV
              </button>
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-md-3 text-center">
                  <h3 className="text-primary">{datosReporte.resumen.totalClientes}</h3>
                  <p>Total Clientes</p>
                </div>
                <div className="col-md-3 text-center">
                  <h3 className="text-success">{datosReporte.resumen.totalPrestamos}</h3>
                  <p>Total Préstamos</p>
                </div>
                <div className="col-md-3 text-center">
                  <h3 className="text-info">{formatearMoneda(datosReporte.resumen.montoTotalPrestado)}</h3>
                  <p>Monto Prestado</p>
                </div>
                <div className="col-md-3 text-center">
                  <h3 className="text-warning">{formatearMoneda(datosReporte.resumen.montoTotalCobrado)}</h3>
                  <p>Monto Cobrado</p>
                </div>
              </div>
              
              <div className="row" style={{ marginTop: '20px' }}>
                <div className="col-md-3 text-center">
                  <h4 className="text-success">{datosReporte.resumen.prestamosActivos}</h4>
                  <p>Préstamos Activos</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-primary">{datosReporte.resumen.prestamosPagados}</h4>
                  <p>Préstamos Pagados</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-danger">{datosReporte.resumen.prestamosVencidos}</h4>
                  <p>Préstamos Vencidos</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-info">
                    {((datosReporte.resumen.montoTotalCobrado / datosReporte.resumen.montoTotalPrestado) * 100 || 0).toFixed(1)}%
                  </h4>
                  <p>% Recuperación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Préstamos */}
          {(tipoReporte === 'general' || tipoReporte === 'prestamos') && (
            <div className="panel">
              <div className="panel-heading">
                <h4 className="panel-title">Préstamos del Período</h4>
              </div>
              <div className="panel-body">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Interés</th>
                        <th>Plazo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosReporte.prestamos.slice(0, 20).map((prestamo: any) => (
                        <tr key={prestamo.id}>
                          <td>{prestamo.cliente}</td>
                          <td>{formatearMoneda(prestamo.monto)}</td>
                          <td>{prestamo.interes}%</td>
                          <td>{prestamo.plazo} días</td>
                          <td>{formatearFecha(prestamo.fecha)}</td>
                          <td>
                            <span className={`label ${
                              prestamo.estado === 'activo' ? 'label-success' :
                              prestamo.estado === 'pagado' ? 'label-primary' : 'label-danger'
                            }`} style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              borderRadius: '3px',
                              color: 'white'
                            }}>
                              {prestamo.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {datosReporte.prestamos.length > 20 && (
                  <p className="text-muted text-center">
                    Mostrando 20 de {datosReporte.prestamos.length} préstamos. Exportar para ver todos.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Clientes Morosos */}
          {(tipoReporte === 'general' || tipoReporte === 'morosos') && datosReporte.clientesMorosos.length > 0 && (
            <div className="panel">
              <div className="panel-heading">
                <h4 className="panel-title text-danger">Clientes Morosos</h4>
              </div>
              <div className="panel-body">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Cédula</th>
                        <th>Teléfono</th>
                        <th>Préstamos Vencidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosReporte.clientesMorosos.map((cliente: any, index: number) => (
                        <tr key={index}>
                          <td><strong>{cliente.nombre}</strong></td>
                          <td>{cliente.cedula}</td>
                          <td>{cliente.telefono}</td>
                          <td>
                            <span className="label label-danger" style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              borderRadius: '3px',
                              backgroundColor: '#f44336',
                              color: 'white'
                            }}>
                              {cliente.prestamosVencidos}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cobros */}
          {(tipoReporte === 'general' || tipoReporte === 'cobros') && (
            <div className="panel">
              <div className="panel-heading">
                <h4 className="panel-title">Cobros del Período</h4>
              </div>
              <div className="panel-body">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Cobrador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosReporte.cobros.slice(0, 20).map((cobro: any) => (
                        <tr key={cobro.id}>
                          <td>{formatearFecha(cobro.fecha)}</td>
                          <td>{cobro.cliente}</td>
                          <td className="text-success"><strong>{formatearMoneda(cobro.monto)}</strong></td>
                          <td>{cobro.cobrador}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {datosReporte.cobros.length > 20 && (
                  <p className="text-muted text-center">
                    Mostrando 20 de {datosReporte.cobros.length} cobros. Exportar para ver todos.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="text-center" style={{ padding: '50px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Generando reporte...</span>
          </div>
          <p>Generando reporte...</p>
        </div>
      )}
    </div>
  );
}