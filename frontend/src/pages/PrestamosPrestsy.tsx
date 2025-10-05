import { useState, useEffect } from 'react';
import { prestamosAPI, clientesAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Prestamo {
  _id: string;
  cliente: {
    _id: string;
    nombre: string;
    cedula: string;
  };
  monto: number;
  interes: number;
  plazo: number;
  fecha: string;
  estado: 'activo' | 'pagado' | 'vencido';
  montoTotal: number;
  cuotaDiaria: number;
  createdAt: string;
}

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  estado: string;
}

export default function PrestamosPrestsy() {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoPrestamo, setEditandoPrestamo] = useState<Prestamo | null>(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const prestamosPorPagina = 10;

  const [formData, setFormData] = useState({
    cliente: '',
    monto: '',
    interes: '20',
    plazo: '30',
    fecha: new Date().toISOString().split('T')[0],
    estado: 'activo' as 'activo' | 'pagado' | 'vencido'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prestamosRes, clientesRes] = await Promise.all([
        prestamosAPI.obtenerTodos(),
        clientesAPI.obtenerTodos()
      ]);
      
      setPrestamos(prestamosRes.data.prestamos || []);
      setClientes(clientesRes.data.clientes?.filter((c: Cliente) => c.estado === 'activo') || []);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calcularMontoTotal = () => {
    const monto = parseFloat(formData.monto) || 0;
    const interes = parseFloat(formData.interes) || 0;
    return monto + (monto * interes / 100);
  };

  const calcularCuotaDiaria = () => {
    const montoTotal = calcularMontoTotal();
    const plazo = parseInt(formData.plazo) || 1;
    return montoTotal / plazo;
  };

  const abrirModal = (prestamo?: Prestamo) => {
    if (prestamo) {
      setEditandoPrestamo(prestamo);
      setFormData({
        cliente: prestamo.cliente._id,
        monto: prestamo.monto.toString(),
        interes: prestamo.interes.toString(),
        plazo: prestamo.plazo.toString(),
        fecha: prestamo.fecha.split('T')[0],
        estado: prestamo.estado
      });
    } else {
      setEditandoPrestamo(null);
      setFormData({
        cliente: '',
        monto: '',
        interes: '20',
        plazo: '30',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'activo'
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoPrestamo(null);
  };

  const guardarPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const datos = {
        ...formData,
        monto: parseFloat(formData.monto),
        interes: parseFloat(formData.interes),
        plazo: parseInt(formData.plazo)
      };

      if (editandoPrestamo) {
        await prestamosAPI.actualizar(editandoPrestamo._id, datos);
        toast.success('Préstamo actualizado correctamente');
      } else {
        await prestamosAPI.crear(datos);
        toast.success('Préstamo creado correctamente');
      }
      
      cargarDatos();
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar préstamo');
      console.error('Error:', error);
    }
  };

  const eliminarPrestamo = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este préstamo?')) {
      try {
        await prestamosAPI.eliminar(id);
        toast.success('Préstamo eliminado correctamente');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar préstamo');
        console.error('Error:', error);
      }
    }
  };

  // Filtrar préstamos
  const prestamosFiltrados = prestamos.filter(prestamo => {
    const matchFiltro = prestamo.cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
                       prestamo.cliente.cedula.includes(filtro) ||
                       prestamo.monto.toString().includes(filtro);
    
    const matchEstado = filtroEstado === 'todos' || prestamo.estado === filtroEstado;
    
    return matchFiltro && matchEstado;
  });

  // Paginación
  const indiceInicio = (paginaActual - 1) * prestamosPorPagina;
  const indiceFin = indiceInicio + prestamosPorPagina;
  const prestamosPaginados = prestamosFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(prestamosFiltrados.length / prestamosPorPagina);

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return '#4caf50';
      case 'pagado': return '#2196f3';
      case 'vencido': return '#f44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p>Cargando préstamos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading clearfix">
          <h3 className="panel-title pull-left">
            <i className="icon-cash3"></i> Gestión de Préstamos
          </h3>
          <button 
            className="btn btn-primary pull-right"
            onClick={() => abrirModal()}
          >
            <i className="icon-plus2"></i> Nuevo Préstamo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por cliente, cédula o monto..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-group">
                <select
                  className="form-control"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="pagado">Pagados</option>
                  <option value="vencido">Vencidos</option>
                </select>
              </div>
            </div>
            <div className="col-md-5">
              <div className="form-group">
                <span className="text-muted">
                  Total: {prestamosFiltrados.length} préstamos | 
                  Monto total: {formatearMoneda(prestamosFiltrados.reduce((sum, p) => sum + p.monto, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de préstamos */}
      <div className="panel">
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Interés</th>
                  <th>Plazo</th>
                  <th>Monto Total</th>
                  <th>Cuota Diaria</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prestamosPaginados.map((prestamo) => (
                  <tr key={prestamo._id}>
                    <td>
                      <strong>{prestamo.cliente.nombre}</strong><br/>
                      <small className="text-muted">{prestamo.cliente.cedula}</small>
                    </td>
                    <td>{formatearMoneda(prestamo.monto)}</td>
                    <td>{prestamo.interes}%</td>
                    <td>{prestamo.plazo} días</td>
                    <td>{formatearMoneda(prestamo.montoTotal)}</td>
                    <td>{formatearMoneda(prestamo.cuotaDiaria)}</td>
                    <td>{formatearFecha(prestamo.fecha)}</td>
                    <td>
                      <span 
                        className="label"
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          backgroundColor: getEstadoColor(prestamo.estado),
                          color: 'white'
                        }}
                      >
                        {prestamo.estado}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => abrirModal(prestamo)}
                          title="Editar"
                        >
                          <i className="icon-pencil">✏️</i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarPrestamo(prestamo._id)}
                          title="Eliminar"
                        >
                          <i className="icon-trash">🗑️</i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {prestamosPaginados.length === 0 && (
            <div className="text-center" style={{ padding: '20px' }}>
              <p className="text-muted">No se encontraron préstamos</p>
            </div>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="text-center">
              <div className="btn-group">
                <button
                  className="btn btn-default"
                  onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </button>
                <span className="btn btn-default disabled">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  className="btn btn-default"
                  onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="modal" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div 
            className="modal-dialog" 
            style={{ 
              position: 'relative',
              width: '600px',
              margin: '50px auto',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 3px 9px rgba(0,0,0,.5)'
            }}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
                <h4 className="modal-title">
                  {editandoPrestamo ? 'Editar Préstamo' : 'Nuevo Préstamo'}
                </h4>
                <button 
                  type="button" 
                  className="close pull-right" 
                  onClick={cerrarModal}
                  style={{ fontSize: '21px', fontWeight: 'bold', background: 'none', border: 'none' }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={guardarPrestamo}>
                <div className="modal-body" style={{ padding: '15px' }}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Cliente *</label>
                        <select
                          className="form-control"
                          name="cliente"
                          value={formData.cliente}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleccionar cliente</option>
                          {clientes.map((cliente) => (
                            <option key={cliente._id} value={cliente._id}>
                              {cliente.nombre} - {cliente.cedula}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Fecha *</label>
                        <input
                          type="date"
                          className="form-control"
                          name="fecha"
                          value={formData.fecha}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Monto *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="monto"
                          value={formData.monto}
                          onChange={handleInputChange}
                          min="1"
                          step="1000"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Interés (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="interes"
                          value={formData.interes}
                          onChange={handleInputChange}
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label>Plazo (días)</label>
                        <input
                          type="number"
                          className="form-control"
                          name="plazo"
                          value={formData.plazo}
                          onChange={handleInputChange}
                          min="1"
                          max="365"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Estado</label>
                        <select
                          className="form-control"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                        >
                          <option value="activo">Activo</option>
                          <option value="pagado">Pagado</option>
                          <option value="vencido">Vencido</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Cuota Diaria Calculada</label>
                        <div className="form-control" style={{ backgroundColor: '#f5f5f5' }}>
                          {formatearMoneda(calcularCuotaDiaria())}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <strong>Resumen:</strong><br/>
                    Monto: {formatearMoneda(parseFloat(formData.monto) || 0)}<br/>
                    Interés: {formData.interes}%<br/>
                    Monto Total: {formatearMoneda(calcularMontoTotal())}<br/>
                    Cuota Diaria: {formatearMoneda(calcularCuotaDiaria())}
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '15px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                  <button type="button" className="btn btn-default" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editandoPrestamo ? 'Actualizar' : 'Crear'} Préstamo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}