import { useState, useEffect } from 'react';
import { usuariosAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Usuario {
  _id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'cobrador' | 'gerente';
  zona?: string;
  telefono?: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
}

export default function CobradoresPrestsy() {
  const [cobradores, setCobradores] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoCobrador, setEditandoCobrador] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    zona: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  useEffect(() => {
    cargarCobradores();
  }, []);

  const cargarCobradores = async () => {
    try {
      setLoading(true);
      const response = await usuariosAPI.obtenerTodos();
      const todosUsuarios = response.data.usuarios || [];
      // Filtrar solo cobradores
      setCobradores(todosUsuarios.filter((u: Usuario) => u.rol === 'cobrador'));
    } catch (error) {
      toast.error('Error al cargar cobradores');
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

  const abrirModal = (cobrador?: Usuario) => {
    if (cobrador) {
      setEditandoCobrador(cobrador);
      setFormData({
        nombre: cobrador.nombre,
        email: cobrador.email,
        password: '',
        telefono: cobrador.telefono || '',
        zona: cobrador.zona || '',
        estado: cobrador.estado
      });
    } else {
      setEditandoCobrador(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        telefono: '',
        zona: '',
        estado: 'activo'
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoCobrador(null);
  };

  const guardarCobrador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const datos = {
        ...formData,
        rol: 'cobrador' as const
      };

      if (editandoCobrador) {
        // Si no se proporciona password, no lo incluir en la actualización
        const datosActualizacion = formData.password ? datos : { ...datos, password: undefined };
        await usuariosAPI.actualizar(editandoCobrador._id, datosActualizacion);
        toast.success('Cobrador actualizado correctamente');
      } else {
        await usuariosAPI.crear(datos);
        toast.success('Cobrador creado correctamente');
      }
      
      cargarCobradores();
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar cobrador');
      console.error('Error:', error);
    }
  };

  const eliminarCobrador = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cobrador?')) {
      try {
        await usuariosAPI.eliminar(id);
        toast.success('Cobrador eliminado correctamente');
        cargarCobradores();
      } catch (error) {
        toast.error('Error al eliminar cobrador');
        console.error('Error:', error);
      }
    }
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
        <p>Cargando cobradores...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading clearfix">
          <h3 className="panel-title pull-left">
            <i className="icon-user-tie"></i> Gestión de Cobradores
          </h3>
          <button 
            className="btn btn-primary pull-right"
            onClick={() => abrirModal()}
          >
            <i className="icon-plus2"></i> Nuevo Cobrador
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-primary">{cobradores.length}</h4>
                <p className="text-muted">Total Cobradores</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-success">{cobradores.filter(c => c.estado === 'activo').length}</h4>
                <p className="text-muted">Activos</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-danger">{cobradores.filter(c => c.estado === 'inactivo').length}</h4>
                <p className="text-muted">Inactivos</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="text-center">
                <h4 className="text-info">{new Set(cobradores.map(c => c.zona).filter(Boolean)).size}</h4>
                <p className="text-muted">Zonas Cubiertas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de cobradores */}
      <div className="panel">
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Zona</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cobradores.map((cobrador) => (
                  <tr key={cobrador._id}>
                    <td><strong>{cobrador.nombre}</strong></td>
                    <td>{cobrador.email}</td>
                    <td>{cobrador.telefono || 'N/A'}</td>
                    <td>{cobrador.zona || 'N/A'}</td>
                    <td>
                      <span 
                        className={`label ${cobrador.estado === 'activo' ? 'label-success' : 'label-danger'}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          backgroundColor: cobrador.estado === 'activo' ? '#4caf50' : '#f44336',
                          color: 'white'
                        }}
                      >
                        {cobrador.estado}
                      </span>
                    </td>
                    <td>{formatearFecha(cobrador.createdAt)}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => abrirModal(cobrador)}
                          title="Editar"
                        >
                          <i className="icon-pencil">✏️</i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarCobrador(cobrador._id)}
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

          {cobradores.length === 0 && (
            <div className="text-center" style={{ padding: '20px' }}>
              <p className="text-muted">No hay cobradores registrados</p>
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
                  {editandoCobrador ? 'Editar Cobrador' : 'Nuevo Cobrador'}
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
              
              <form onSubmit={guardarCobrador}>
                <div className="modal-body" style={{ padding: '15px' }}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Nombre *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>
                          Contraseña {editandoCobrador ? '(dejar vacío para no cambiar)' : '*'}
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editandoCobrador}
                        />
                      </div>
                    </div>
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
                          <option value="inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono</label>
                        <input
                          type="text"
                          className="form-control"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Zona</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zona"
                          value={formData.zona}
                          onChange={handleInputChange}
                          placeholder="Ej: Norte, Sur, Centro..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: '15px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                  <button type="button" className="btn btn-default" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editandoCobrador ? 'Actualizar' : 'Crear'} Cobrador
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