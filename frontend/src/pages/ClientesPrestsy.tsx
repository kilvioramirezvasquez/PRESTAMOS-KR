import { useState, useEffect } from 'react';
import { clientesAPI } from '../services/api';
import toast from 'react-hot-toast';
import ClienteFormAvanzado from '../components/ClienteFormAvanzado';

interface Cliente {
  _id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  direccion: string;
  barrio: string;
  referencia: string;
  telefono_referencia: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
}

export default function ClientesPrestsy() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [filtro, setFiltro] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 10;

  const [guardandoCliente, setGuardandoCliente] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      setLoading(true);
            const response = await clientesAPI.getAll();
      setClientes(response.data || []);
    } catch (error) {
      toast.error('Error al cargar clientes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (cliente?: Cliente) => {
    setEditandoCliente(cliente || null);
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditandoCliente(null);
  };

  const guardarCliente = async (clienteData: any) => {
    setGuardandoCliente(true);
    
    try {
      if (editandoCliente) {
        await clientesAPI.update(editandoCliente._id, clienteData);
        toast.success('Cliente actualizado correctamente');
      } else {
        await clientesAPI.create(clienteData);
        toast.success('Cliente creado correctamente');
      }
      
      cargarClientes();
      cerrarModal();
    } catch (error) {
      toast.error('Error al guardar cliente');
      console.error('Error:', error);
    } finally {
      setGuardandoCliente(false);
    }
  };

  const eliminarCliente = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await clientesAPI.delete(id);
        toast.success('Cliente eliminado correctamente');
        cargarClientes();
      } catch (error) {
        toast.error('Error al eliminar cliente');
        console.error('Error:', error);
      }
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    cliente.cedula.includes(filtro) ||
    cliente.telefono.includes(filtro)
  );

  // Paginación
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const indiceFin = indiceInicio + clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  if (loading) {
    return (
      <div className="text-center" style={{ padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading clearfix">
          <h3 className="panel-title pull-left">
            <i className="icon-users4"></i> Gestión de Clientes
          </h3>
          <button 
            className="btn btn-primary pull-right"
            onClick={() => abrirModal()}
          >
            <i className="icon-plus2"></i> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel">
        <div className="panel-body">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, cédula o teléfono..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <span className="text-muted">
                  Total: {clientesFiltrados.length} clientes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="panel">
        <div className="panel-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Barrio</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginados.map((cliente) => (
                  <tr key={cliente._id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.cedula}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.barrio}</td>
                    <td>
                      <span 
                        className={`label ${cliente.estado === 'activo' ? 'label-success' : 'label-danger'}`}
                        style={{
                          padding: '3px 8px',
                          fontSize: '11px',
                          borderRadius: '3px',
                          backgroundColor: cliente.estado === 'activo' ? '#4caf50' : '#f44336',
                          color: 'white'
                        }}
                      >
                        {cliente.estado}
                      </span>
                    </td>
                    <td>{formatearFecha(cliente.createdAt)}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => abrirModal(cliente)}
                          title="Editar"
                        >
                          <i className="icon-pencil">✏️</i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => eliminarCliente(cliente._id)}
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

          {clientesPaginados.length === 0 && (
            <div className="text-center" style={{ padding: '20px' }}>
              <p className="text-muted">No se encontraron clientes</p>
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
                  {editandoCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
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
              
              <form onSubmit={guardarCliente}>
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
                        <label>Cédula *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          required
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

                  <div className="form-group">
                    <label>Dirección *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Barrio</label>
                    <input
                      type="text"
                      className="form-control"
                      name="barrio"
                      value={formData.barrio}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Referencia</label>
                        <input
                          type="text"
                          className="form-control"
                          name="referencia"
                          value={formData.referencia}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label>Teléfono Referencia</label>
                        <input
                          type="text"
                          className="form-control"
                          name="telefono_referencia"
                          value={formData.telefono_referencia}
                          onChange={handleInputChange}
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
                    {editandoCliente ? 'Actualizar' : 'Crear'} Cliente
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