import { useState, useEffect } from 'react';
import { clientesAPI, prestamosAPI, cobrosAPI } from '../services/api';

interface DashboardStats {
  totalClientes: number;
  totalPrestamos: number;
  totalCobros: number;
  montoTotalPrestado: number;
  montoTotalCobrado: number;
  prestamosPendientes: number;
  clientesActivos: number;
  cobrosPendientes: number;
}

interface PrestamoReciente {
  id: string;
  cliente: string;
  monto: number;
  fecha: string;
  estado: string;
}

interface CobroReciente {
  id: string;
  cliente: string;
  monto: number;
  fecha: string;
  cobrador: string;
}

export default function DashboardPrestsy() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalPrestamos: 0,
    totalCobros: 0,
    montoTotalPrestado: 0,
    montoTotalCobrado: 0,
    prestamosPendientes: 0,
    clientesActivos: 0,
    cobrosPendientes: 0
  });
  
  const [prestamosRecientes, setPrestamosRecientes] = useState<PrestamoReciente[]>([]);
  const [cobrosRecientes, setCobrosRecientes] = useState<CobroReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const [clientesRes, prestamosRes, cobrosRes] = await Promise.all([
        clientesAPI.obtenerTodos(),
        prestamosAPI.obtenerTodos(),
        cobrosAPI.obtenerTodos()
      ]);

      const clientes = clientesRes.data.clientes || [];
      const prestamos = prestamosRes.data.prestamos || [];
      const cobros = cobrosRes.data.cobros || [];

      // Calcular estadísticas
      const montoTotalPrestado = prestamos.reduce((sum: number, p: any) => sum + p.monto, 0);
      const montoTotalCobrado = cobros.reduce((sum: number, c: any) => sum + c.monto, 0);
      const prestamosPendientes = prestamos.filter((p: any) => p.estado === 'activo').length;
      const clientesActivos = clientes.filter((c: any) => c.estado === 'activo').length;

      setStats({
        totalClientes: clientes.length,
        totalPrestamos: prestamos.length,
        totalCobros: cobros.length,
        montoTotalPrestado,
        montoTotalCobrado,
        prestamosPendientes,
        clientesActivos,
        cobrosPendientes: prestamos.length - cobros.length
      });

      // Últimos préstamos
      const ultimosPrestamos = prestamos
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5)
        .map((p: any) => ({
          id: p._id,
          cliente: p.cliente.nombre,
          monto: p.monto,
          fecha: p.fecha,
          estado: p.estado
        }));

      // Últimos cobros
      const ultimosCobros = cobros
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          id: c._id,
          cliente: c.prestamo?.cliente?.nombre || 'N/A',
          monto: c.monto,
          fecha: c.fecha,
          cobrador: c.cobrador?.nombre || 'Sistema'
        }));

      setPrestamosRecientes(ultimosPrestamos);
      setCobrosRecientes(ultimosCobros);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
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

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="panel">
        <div className="panel-heading">
          <h3 className="panel-title">
            <i className="icon-home4"></i> Dashboard Principal
          </h3>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -10px' }}>
        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#2196f3', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalClientes}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Clientes</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#4caf50', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalPrestamos}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Préstamos</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#ff9800', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {formatearMoneda(stats.montoTotalPrestado)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Monto Prestado</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#9c27b0', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {formatearMoneda(stats.montoTotalCobrado)}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Monto Cobrado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -10px' }}>
        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#f44336', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.prestamosPendientes}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Préstamos Activos</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#607d8b', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.clientesActivos}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Clientes Activos</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#795548', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.totalCobros}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Cobros</div>
            </div>
          </div>
        </div>

        <div className="col-md-3" style={{ padding: '0 10px', marginBottom: '20px', flex: '0 0 25%' }}>
          <div className="panel" style={{ backgroundColor: '#009688', color: 'white', textAlign: 'center' }}>
            <div className="panel-body">
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {((stats.montoTotalCobrado / stats.montoTotalPrestado) * 100 || 0).toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>% Recuperación</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablas de actividad reciente */}
      <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -10px' }}>
        <div className="col-md-6" style={{ padding: '0 10px', flex: '0 0 50%' }}>
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="icon-cash3"></i> Últimos Préstamos
              </h3>
            </div>
            <div className="panel-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prestamosRecientes.map((prestamo) => (
                      <tr key={prestamo.id}>
                        <td>{prestamo.cliente}</td>
                        <td>{formatearMoneda(prestamo.monto)}</td>
                        <td>{formatearFecha(prestamo.fecha)}</td>
                        <td>
                          <span 
                            className={`label ${prestamo.estado === 'activo' ? 'label-success' : 'label-warning'}`}
                            style={{
                              padding: '2px 8px',
                              fontSize: '11px',
                              borderRadius: '3px',
                              backgroundColor: prestamo.estado === 'activo' ? '#4caf50' : '#ff9800',
                              color: 'white'
                            }}
                          >
                            {prestamo.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6" style={{ padding: '0 10px', flex: '0 0 50%' }}>
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">
                <i className="icon-coins"></i> Últimos Cobros
              </h3>
            </div>
            <div className="panel-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Monto</th>
                      <th>Fecha</th>
                      <th>Cobrador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobrosRecientes.map((cobro) => (
                      <tr key={cobro.id}>
                        <td>{cobro.cliente}</td>
                        <td>{formatearMoneda(cobro.monto)}</td>
                        <td>{formatearFecha(cobro.fecha)}</td>
                        <td>{cobro.cobrador}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}