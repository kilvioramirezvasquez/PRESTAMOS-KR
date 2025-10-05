import { useState, useEffect } from 'react';
import { cobrosAPI, prestamosAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Cobro {
  _id: string;
  prestamo: {
    _id: string;
    cliente: {
      nombre: string;
      cedula: string;
    };
    monto: number;
    cuotaDiaria: number;
  };
  monto: number;
  fecha: string;
  cobrador: {
    nombre: string;
  };
  observaciones: string;
  createdAt: string;
}

interface Prestamo {
  _id: string;
  cliente: {
    _id: string;
    nombre: string;
    cedula: string;
  };
  monto: number;
  cuotaDiaria: number;
  estado: string;
}

export default function CobrosPrestsy() {
  const [cobros, setCobros] = useState<Cobro[]>([]);
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const cobrosPorPagina = 10;

  const [formData, setFormData] = useState({
    prestamo: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    observaciones: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cobrosRes, prestamosRes] = await Promise.all([
        cobrosAPI.getAll(),
        prestamosAPI.getAll()
      ]);
      
      setCobros(cobrosRes.data || []);
      setPrestamos(prestamosRes.data?.filter((p: Prestamo) => p.estado === 'activo') || []);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si se selecciona un préstamo, establecer la cuota diaria como monto sugerido
    if (name === 'prestamo' && value) {
      const prestamoSeleccionado = prestamos.find(p => p._id === value);
      if (prestamoSeleccionado) {
        setFormData(prev => ({
          ...prev,
          monto: prestamoSeleccionado.cuotaDiaria.toString()
        }));
      }
    }
  };

  const abrirModal = () => {
    setFormData({
      prestamo: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      observaciones: ''
    });
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
  };

  const guardarCobro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const datos = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      await cobrosAPI.create(datos);
      toast.success('Cobro registrado correctamente');
      
      cargarDatos();
      cerrarModal();
    } catch (error) {
      toast.error('Error al registrar cobro');
      console.error('Error:', error);
    }
  };

  const eliminarCobro = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cobro?')) {
      try {
        await cobrosAPI.delete(id);
        toast.success('Cobro eliminado correctamente');
        cargarDatos();
      } catch (error) {
        toast.error('Error al eliminar cobro');
        console.error('Error:', error);
      }
    }
  };

  // Filtrar cobros
  const cobrosFiltrados = cobros.filter(cobro =>
    cobro.prestamo?.cliente?.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cobro.prestamo?.cliente?.cedula.includes(filtro) ||
    cobro.monto.toString().includes(filtro)
  );

  // Paginación
  const indiceInicio = (paginaActual - 1) * cobrosPorPagina;
  const indiceFin = indiceInicio + cobrosPorPagina;
  const cobrosPaginados = cobrosFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(cobrosFiltrados.length / cobrosPorPagina);

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
        <p>Cargando cobros...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading clearfix">
          <h3 className="panel-title pull-left">
            <i className="icon-coins"></i> Gestión de Cobros
          </h3>
          <button 
            className="btn btn-success pull-right"
            onClick={() => abrirModal()}
          >
            <i className="icon-plus2"></i> Registrar Cobro
          </button>
        </div>
      </div>

      {/* Filtros y estadísticas */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
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
            <div className="col-md-6">
              <div className="form-group">
                <span className="text-muted">
                  Total cobros: {cobrosFiltrados.length} | 
                  Monto total: {formatearMoneda(cobrosFiltrados.reduce((sum, c) => sum + c.monto, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de cobros */}
      <div className="panel">
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Préstamo</th>
                  <th>Monto Cobrado</th>
                  <th>Fecha</th>
                  <th>Cobrador</th>
                  <th>Observaciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cobrosPaginados.map((cobro) => (
                  <tr key={cobro._id}>
                    <td>
                      <strong>{cobro.prestamo?.cliente?.nombre || 'N/A'}</strong><br/>
                      <small className="text-muted">{cobro.prestamo?.cliente?.cedula || 'N/A'}</small>
                    </td>
                    <td>
                      Préstamo: {formatearMoneda(cobro.prestamo?.monto || 0)}<br/>
                      <small className="text-muted">
                        Cuota diaria: {formatearMoneda(cobro.prestamo?.cuotaDiaria || 0)}
                      </small>
                    </td>
                    <td>
                      <strong className="text-success">
                        {formatearMoneda(cobro.monto)}
                      </strong>
                    </td>
                    <td>{formatearFecha(cobro.fecha)}</td>
                    <td>{cobro.cobrador?.nombre || 'Sistema'}</td>
                    <td>
                      {cobro.observaciones && (
                        <small className="text-muted">{cobro.observaciones}</small>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => eliminarCobro(cobro._id)}
                        title="Eliminar"
                      >
                        <i className="icon-trash">🗑️</i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {cobrosPaginados.length === 0 && (
            <div className="text-center" style={{ padding: '20px' }}>
              <p className="text-muted">No se encontraron cobros</p>
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
              width: '500px',
              margin: '50px auto',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 3px 9px rgba(0,0,0,.5)'
            }}
          >
            <div className="modal-content">
              <div className="modal-header" style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
                <h4 className="modal-title">Registrar Cobro</h4>
                <button 
                  type="button" 
                  className="close pull-right" 
                  onClick={cerrarModal}
                  style={{ fontSize: '21px', fontWeight: 'bold', background: 'none', border: 'none' }}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={guardarCobro}>
                <div className="modal-body" style={{ padding: '15px' }}>
                  <div className="form-group">
                    <label>Préstamo *</label>
                    <select
                      className="form-control"
                      name="prestamo"
                      value={formData.prestamo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar préstamo</option>
                      {prestamos.map((prestamo) => (
                        <option key={prestamo._id} value={prestamo._id}>
                          {prestamo.cliente.nombre} - {formatearMoneda(prestamo.monto)} 
                          (Cuota: {formatearMoneda(prestamo.cuotaDiaria)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
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

                  <div className="form-group">
                    <label>Observaciones</label>
                    <textarea
                      className="form-control"
                      name="observaciones"
                      rows={3}
                      value={formData.observaciones}
                      onChange={handleInputChange}
                      placeholder="Notas adicionales sobre el cobro..."
                    />
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '15px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                  <button type="button" className="btn btn-default" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Registrar Cobro
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