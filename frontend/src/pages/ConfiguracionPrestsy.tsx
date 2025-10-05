import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ConfiguracionPrestsy() {
  const { usuario, actualizarPerfil } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // Configuración general
  const [configGeneral, setConfigGeneral] = useState({
    nombreEmpresa: 'Prestsy',
    interesPorDefecto: '20',
    plazoPorDefecto: '30',
    monedaDefecto: 'COP',
    zonaHoraria: 'America/Bogota'
  });

  // Configuración de perfil
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: ''
  });

  // Configuración de notificaciones
  const [configNotificaciones, setConfigNotificaciones] = useState({
    emailPrestamos: true,
    emailCobros: true,
    emailVencimientos: true,
    smsRecordatorios: false,
    notificacionesPush: true
  });

  useEffect(() => {
    if (usuario) {
      setPerfilData(prev => ({
        ...prev,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono || ''
      }));
    }
  }, [usuario]);

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfigGeneral(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPerfilData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificacionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setConfigNotificaciones(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const guardarConfigGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Aquí guardarías la configuración general en localStorage o API
      localStorage.setItem('prestsy_config_general', JSON.stringify(configGeneral));
      toast.success('Configuración general guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar configuración general');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPerfilUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (perfilData.passwordNueva && perfilData.passwordNueva !== perfilData.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    
    try {
      // Simular actualización de perfil
      const datosActualizacion = {
        nombre: perfilData.nombre,
        telefono: perfilData.telefono
      };

      // Si hay contraseña nueva, incluirla
      if (perfilData.passwordNueva) {
        // Aquí validarías la contraseña actual y actualizarías
        console.log('Actualizando contraseña...');
      }

      // Usar el método del contexto si está disponible
      if (typeof actualizarPerfil === 'function') {
        actualizarPerfil(datosActualizacion);
      }

      toast.success('Perfil actualizado correctamente');
      
      // Limpiar campos de contraseña
      setPerfilData(prev => ({
        ...prev,
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: ''
      }));
    } catch (error) {
      toast.error('Error al actualizar perfil');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarNotificaciones = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      localStorage.setItem('prestsy_config_notificaciones', JSON.stringify(configNotificaciones));
      toast.success('Configuración de notificaciones guardada');
    } catch (error) {
      toast.error('Error al guardar notificaciones');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarDatos = () => {
    try {
      const datosExportacion = {
        configuracion: configGeneral,
        notificaciones: configNotificaciones,
        fecha: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(datosExportacion, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuracion_prestsy_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Configuración exportada correctamente');
    } catch (error) {
      toast.error('Error al exportar configuración');
      console.error('Error:', error);
    }
  };

  const limpiarDatos = () => {
    if (window.confirm('¿Está seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        const claves = ['prestsy_config_general', 'prestsy_config_notificaciones'];
        claves.forEach(clave => localStorage.removeItem(clave));
        
        // Recargar configuración por defecto
        setConfigGeneral({
          nombreEmpresa: 'Prestsy',
          interesPorDefecto: '20',
          plazoPorDefecto: '30',
          monedaDefecto: 'COP',
          zonaHoraria: 'America/Bogota'
        });
        
        setConfigNotificaciones({
          emailPrestamos: true,
          emailCobros: true,
          emailVencimientos: true,
          smsRecordatorios: false,
          notificacionesPush: true
        });
        
        toast.success('Datos limpiados correctamente');
      } catch (error) {
        toast.error('Error al limpiar datos');
        console.error('Error:', error);
      }
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'perfil', name: 'Mi Perfil', icon: '👤' },
    { id: 'notificaciones', name: 'Notificaciones', icon: '🔔' },
    { id: 'sistema', name: 'Sistema', icon: '🖥️' }
  ];

  return (
    <div>
      {/* Header */}
      <div className="panel">
        <div className="panel-heading">
          <h3 className="panel-title">
            <i className="icon-cog4"></i> Configuración del Sistema
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="panel">
        <div className="panel-body">
          <ul className="nav nav-tabs" style={{ marginBottom: '20px', listStyle: 'none', padding: 0, borderBottom: '1px solid #ddd' }}>
            {tabs.map((tab) => (
              <li 
                key={tab.id}
                style={{ 
                  display: 'inline-block',
                  marginRight: '5px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '10px 15px',
                    border: '1px solid transparent',
                    borderBottom: activeTab === tab.id ? '2px solid #2196f3' : '1px solid #ddd',
                    backgroundColor: activeTab === tab.id ? '#f5f5f5' : 'white',
                    color: activeTab === tab.id ? '#2196f3' : '#555',
                    cursor: 'pointer',
                    borderRadius: '4px 4px 0 0',
                    outline: 'none'
                  }}
                >
                  {tab.icon} {tab.name}
                </button>
              </li>
            ))}
          </ul>

          {/* Contenido de tabs */}
          {activeTab === 'general' && (
            <form onSubmit={guardarConfigGeneral}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Nombre de la Empresa</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombreEmpresa"
                      value={configGeneral.nombreEmpresa}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Moneda por Defecto</label>
                    <select
                      className="form-control"
                      name="monedaDefecto"
                      value={configGeneral.monedaDefecto}
                      onChange={handleGeneralChange}
                    >
                      <option value="COP">Pesos Colombianos (COP)</option>
                      <option value="USD">Dólares (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Interés por Defecto (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="interesPorDefecto"
                      value={configGeneral.interesPorDefecto}
                      onChange={handleGeneralChange}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Plazo por Defecto (días)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="plazoPorDefecto"
                      value={configGeneral.plazoPorDefecto}
                      onChange={handleGeneralChange}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Zona Horaria</label>
                <select
                  className="form-control"
                  name="zonaHoraria"
                  value={configGeneral.zonaHoraria}
                  onChange={handleGeneralChange}
                >
                  <option value="America/Bogota">América/Bogotá (UTC-5)</option>
                  <option value="America/Mexico_City">América/Ciudad de México (UTC-6)</option>
                  <option value="America/New_York">América/Nueva York (UTC-5)</option>
                  <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </form>
          )}

          {activeTab === 'perfil' && (
            <form onSubmit={actualizarPerfilUsuario}>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombre"
                      value={perfilData.nombre}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={perfilData.email}
                      onChange={handlePerfilChange}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  className="form-control"
                  name="telefono"
                  value={perfilData.telefono}
                  onChange={handlePerfilChange}
                />
              </div>

              <hr />
              
              <h5>Cambiar Contraseña</h5>
              
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  className="form-control"
                  name="passwordActual"
                  value={perfilData.passwordActual}
                  onChange={handlePerfilChange}
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      name="passwordNueva"
                      value={perfilData.passwordNueva}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmarPassword"
                      value={perfilData.confirmarPassword}
                      onChange={handlePerfilChange}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
            </form>
          )}

          {activeTab === 'notificaciones' && (
            <form onSubmit={guardarNotificaciones}>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailPrestamos"
                    checked={configNotificaciones.emailPrestamos}
                    onChange={handleNotificacionesChange}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar por email nuevos préstamos
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailCobros"
                    checked={configNotificaciones.emailCobros}
                    onChange={handleNotificacionesChange}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar por email nuevos cobros
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="emailVencimientos"
                    checked={configNotificaciones.emailVencimientos}
                    onChange={handleNotificacionesChange}
                    style={{ marginRight: '8px' }}
                  />
                  Notificar vencimientos por email
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="smsRecordatorios"
                    checked={configNotificaciones.smsRecordatorios}
                    onChange={handleNotificacionesChange}
                    style={{ marginRight: '8px' }}
                  />
                  Enviar recordatorios por SMS
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="notificacionesPush"
                    checked={configNotificaciones.notificacionesPush}
                    onChange={handleNotificacionesChange}
                    style={{ marginRight: '8px' }}
                  />
                  Habilitar notificaciones push
                </label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Notificaciones'}
              </button>
            </form>
          )}

          {activeTab === 'sistema' && (
            <div>
              <h5>Herramientas del Sistema</h5>
              
              <div className="panel panel-default">
                <div className="panel-body">
                  <h6>Exportar Configuración</h6>
                  <p className="text-muted">
                    Exporta toda tu configuración para respaldo o migración.
                  </p>
                  <button className="btn btn-info" onClick={exportarDatos}>
                    <i className="icon-download"></i> Exportar Datos
                  </button>
                </div>
              </div>

              <div className="panel panel-default">
                <div className="panel-body">
                  <h6>Información del Sistema</h6>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td><strong>Versión:</strong></td>
                        <td>Prestsy v1.0.0</td>
                      </tr>
                      <tr>
                        <td><strong>Usuario Actual:</strong></td>
                        <td>{usuario?.nombre} ({usuario?.rol})</td>
                      </tr>
                      <tr>
                        <td><strong>Navegador:</strong></td>
                        <td>{navigator.userAgent.split(' ')[0]}</td>
                      </tr>
                      <tr>
                        <td><strong>Zona Horaria:</strong></td>
                        <td>{Intl.DateTimeFormat().resolvedOptions().timeZone}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel panel-danger">
                <div className="panel-body">
                  <h6 className="text-danger">Zona de Peligro</h6>
                  <p className="text-muted">
                    Las siguientes acciones son irreversibles.
                  </p>
                  <button className="btn btn-danger" onClick={limpiarDatos}>
                    <i className="icon-trash"></i> Limpiar Configuración
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}