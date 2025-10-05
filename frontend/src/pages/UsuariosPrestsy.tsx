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

export default function UsuariosPrestsy() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoUsuario, setEditandoUsuario] = useState<Usuario | null>(null);
  const [filtroRol, setFiltroRol] = useState('todos');

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'cobrador' as 'admin' | 'cobrador' | 'gerente',
    telefono: '',
    zona: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await usuariosAPI.obtenerTodos();
      setUsuarios(response.data.usuarios || []);
    } catch (error) {
      toast.error('Error al cargar usuarios');
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

  const abrirModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditandoUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        telefono: usuario.telefono || '',
        zona: usuario.zona || '',
        estado: usuario.estado
      });
    } else {
      setEditandoUsuario(null);
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'cobrador',
        telefono: '',
        zona: '',
        estado: 'activo'
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoUsuario(null);
  };

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editandoUsuario) {
        // Si no se proporciona password, no lo incluir en la actualización
        const datosActualizacion = formData.password ? formData : { ...formData, password: undefined };
        await usuariosAPI.actualizar(editandoUsuario._id, datosActualizacion);
        toast.success('Usuario actualizado correctamente');
      } else {
        await usuariosAPI.crear(formData);
        toast.success('Usuario creado correctamente');
      }
      
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar usuario');
      console.error('Error:', error);
    }
  };

  const eliminarUsuario = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuariosAPI.eliminar(id);
        toast.success('Usuario eliminado correctamente');
        cargarUsuarios();
      } catch (error) {
        toast.error('Error al eliminar usuario');
        console.error('Error:', error);
      }
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    return filtroRol === 'todos' || usuario.rol === filtroRol;
  });

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'admin': return '#f44336';
      case 'gerente': return '#ff9800';
      case 'cobrador': return '#4caf50';
      default: return '#999';
    }
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador';
      case 'gerente': return 'Gerente';
      case 'cobrador': return 'Cobrador';
      default: return rol;
    }
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading clearfix">
          <h3 className="panel-title pull-left">
            <i className="icon-users2"></i> Gestión de Usuarios
          </h3>
          <button 
            className="btn btn-primary pull-right"
            onClick={() => abrirModal()}
          >
            <i className="icon-plus2"></i> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros y estadísticas */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-3">
              <div className="form-group">
                <select
                  className="form-control"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="gerente">Gerentes</option>
                  <option value="cobrador">Cobradores</option>
                </select>
              </div>
            </div>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-3 text-center">
                  <h4 className="text-danger">{usuarios.filter(u => u.rol === 'admin').length}</h4>
                  <p className="text-muted">Administradores</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-warning">{usuarios.filter(u => u.rol === 'gerente').length}</h4>
                  <p className="text-muted">Gerentes</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-success">{usuarios.filter(u => u.rol === 'cobrador').length}</h4>
                  <p className="text-muted">Cobradores</p>
                </div>
                <div className="col-md-3 text-center">
                  <h4 className="text-primary">{usuarios.filter(u => u.estado === 'activo').length}</h4>
                  <p className="text-muted">Activos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="panel">
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Teléfono</th>
                  <th>Zona</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario._id}>
                    <td><strong>{usuario.nombre}</strong></td>
                    <td>{usuario.email}</td>
                    <td>
                      <span 
                        className="label"
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          backgroundColor: getRolColor(usuario.rol),
                          color: 'white'
                        }}
                      >
                        {getRolLabel(usuario.rol)}
                      </span>
                    </td>
                    <td>{usuario.telefono || 'N/A'}</td>
                    <td>{usuario.zona || 'N/A'}</td>
                    <td>
                      <span 
                        className={`label ${usuario.estado === 'activo' ? 'label-success' : 'label-danger'}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          backgroundColor: usuario.estado === 'activo' ? '#4caf50' : '#f44336',
                          color: 'white'
                        }}
                      >
                        {usuario.estado}
                      </span>
                    </td>
                    <td>{formatearFecha(usuario.createdAt)}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => abrirModal(usuario)}
                          title="Editar"
                        >
                          <i className="icon-pencil">✏️</i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarUsuario(usuario._id)}
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

          {usuariosFiltrados.length === 0 && (
            <div className="text-center" style={{ padding: '20px' }}>
              <p className="text-muted">No se encontraron usuarios</p>
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
                  {editandoUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              
              <form onSubmit={guardarUsuario}>
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
                          Contraseña {editandoUsuario ? '(dejar vacío para no cambiar)' : '*'}
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!editandoUsuario}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Rol *</label>
                        <select
                          className="form-control"
                          name="rol"
                          value={formData.rol}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="cobrador">Cobrador</option>
                          <option value="gerente">Gerente</option>
                          <option value="admin">Administrador</option>
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

                <div className="modal-footer" style={{ padding: '15px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                  <button type="button" className="btn btn-default" onClick={cerrarModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editandoUsuario ? 'Actualizar' : 'Crear'} Usuario
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