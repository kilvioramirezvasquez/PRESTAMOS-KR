import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPrestsy() {
  const [credentials, setCredentials] = useState({
    user: '',
    pass: ''
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();

  // Si ya está autenticado, redirigir al panel
  if (isAuthenticated) {
    return <Navigate to="/panel" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const logear = async () => {
    // Validaciones
    if (!credentials.user) {
      toast.error('Por favor ingrese el usuario');
      return;
    }
    if (!credentials.pass) {
      toast.error('Por favor ingrese la contraseña');
      return;
    }

    setLoading(true);
    
    try {
      // Mapear usuario a email para el backend
      const email = credentials.user === 'admin' ? 'admin' : credentials.user;
      const success = await login(email, credentials.pass);
      
      if (success) {
        toast.success('Inicio de sesión exitoso');
      } else {
        toast.error('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión. Intente nuevamente');
      console.error('Error de login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      logear();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logear();
  };

  return (
    <>
      {/* Estilos del sistema original */}
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900" rel="stylesheet" type="text/css" />
      
      <style>{`
        /* Estilos exactos del sistema original Prestsy */
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
        }
        
        .login-container {
          background-color: #f5f5f5;
          min-height: 100vh;
        }
        
        .navbar-inverse {
          background-color: #263238;
          border-color: #1c2529;
          margin-bottom: 0;
          border-radius: 0;
        }
        
        .navbar-header {
          padding: 0 15px;
        }
        
        .navbar-brand {
          padding: 8px 15px;
          height: auto;
        }
        
        .page-container {
          padding-top: 50px;
        }
        
        .page-content {
          padding: 40px 0;
        }
        
        .content-wrapper {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .login-form {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 1px 1px rgba(0,0,0,.05);
          padding: 30px;
        }
        
        .icon-object {
          display: inline-block;
          width: 60px;
          height: 60px;
          line-height: 60px;
          text-align: center;
          border: 2px solid #e0e0e0;
          border-radius: 50%;
          margin-bottom: 20px;
          font-size: 24px;
          color: #999;
        }
        
        .content-group {
          margin-bottom: 25px;
        }
        
        .content-group h5 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 500;
          color: #333;
        }
        
        .display-block {
          display: block;
          font-size: 13px;
          color: #999;
          font-weight: 400;
        }
        
        .form-group {
          margin-bottom: 15px;
          position: relative;
        }
        
        .has-feedback {
          position: relative;
        }
        
        .has-feedback-left .form-control {
          padding-left: 35px;
        }
        
        .form-control-feedback {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
          display: block;
          width: 34px;
          height: 34px;
          line-height: 34px;
          text-align: center;
          pointer-events: none;
        }
        
        .form-control {
          display: block;
          width: 100%;
          padding: 6px 12px;
          font-size: 14px;
          line-height: 1.428571429;
          color: #555;
          background-color: #fff;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
          transition: border-color ease-in-out .15s,box-shadow ease-in-out .15s;
        }
        
        .form-control:focus {
          border-color: #66afe9;
          outline: 0;
          box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);
        }
        
        .btn {
          display: inline-block;
          margin-bottom: 0;
          font-weight: normal;
          text-align: center;
          vertical-align: middle;
          cursor: pointer;
          background-image: none;
          border: 1px solid transparent;
          white-space: nowrap;
          padding: 6px 12px;
          font-size: 14px;
          line-height: 1.428571429;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.15s ease-in-out;
        }
        
        .btn-primary {
          color: #fff;
          background-color: #2196f3;
          border-color: #2196f3;
        }
        
        .btn-primary:hover {
          background-color: #1976d2;
          border-color: #1976d2;
        }
        
        .btn-block {
          display: block;
          width: 100%;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-danger {
          color: #f44336;
        }
        
        .no-margin-bottom {
          margin-bottom: 0;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        .hide {
          display: none;
        }
        
        .position-right {
          margin-left: 5px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 15px;
          text-align: center;
          color: #999;
          font-size: 12px;
        }
        
        .footer a {
          color: #2196f3;
          text-decoration: none;
        }
      `}</style>

      <div className="login-container">
        <div className="navbar navbar-inverse">
          <div className="navbar-header">
            <a className="navbar-brand" href="/panel">
              <img src="/images/logow.png" style={{ height: '28px' }} alt="Prestsy" />
            </a>
          </div>
        </div>

        <div className="page-container">
          <div className="page-content">
            <div className="content-wrapper">
              <form onSubmit={handleSubmit}>
                <div className="login-form">
                  <div className="text-center">
                    <div className="icon-object border-slate-300 text-slate-300">
                      <i className="icon-reading">👤</i>
                    </div>
                    <h5 className="content-group">
                      Iniciar Sesión 
                      <small className="display-block">Digita tus datos de acceso</small>
                    </h5>
                  </div>

                  <div className="form-group has-feedback has-feedback-left">
                    <input 
                      type="text" 
                      id="user" 
                      className="form-control" 
                      placeholder="Usuario"
                      value={credentials.user}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <div className="form-control-feedback">
                      <i className="icon-user text-muted">👤</i>
                    </div>
                  </div>

                  <div className="form-group has-feedback has-feedback-left">
                    <input 
                      id="pass" 
                      type="password" 
                      className="form-control" 
                      placeholder="Contraseña"
                      value={credentials.pass}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                    />
                    <div className="form-control-feedback">
                      <i className="icon-lock2 text-muted">🔒</i>
                    </div>
                  </div>

                  <div className="form-group no-margin-bottom">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-block"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          Entrando... <i className="spinicon spinner">⟳</i>
                        </>
                      ) : (
                        <>
                          Entrar <i className="goicon position-right">→</i>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="footer text-muted text-center">
          © 2025. <a href="#">Prestsy</a> Desarrollado Por <a href="http://softcoder.net" target="_blank" rel="noopener noreferrer">Softcoder</a>
        </div>
      </div>
    </>
  );
}