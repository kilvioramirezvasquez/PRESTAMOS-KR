import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutPrestsyProps {
  children: ReactNode;
}

export default function LayoutPrestsy({ children }: LayoutPrestsyProps) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navegación principal basada en el sistema original
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/panel',
      icon: 'icon-home4'
    },
    {
      name: 'Clientes',
      path: '/clientes',
      icon: 'icon-users4'
    },
    {
      name: 'Préstamos',
      path: '/prestamos',
      icon: 'icon-cash3'
    },
    {
      name: 'Cobros',
      path: '/cobros',
      icon: 'icon-coins'
    },
    {
      name: 'Cobradores',
      path: '/cobradores',
      icon: 'icon-user-tie'
    },
    {
      name: 'Reportes',
      path: '/reportes',
      icon: 'icon-stats-bars'
    },
    {
      name: 'Usuarios',
      path: '/usuarios',
      icon: 'icon-users2'
    }
  ];

  // Módulos profesionales avanzados
  const menuProfesional = [
    {
      name: 'Rutas de Cobro',
      path: '/rutas-cobro',
      icon: 'icon-map4'
    },
    {
      name: 'Metas Cobradores',
      path: '/metas-cobradores',
      icon: 'icon-target2'
    },
    {
      name: 'Flujo de Caja',
      path: '/flujo-caja',
      icon: 'icon-stats-growth'
    },
    {
      name: 'Auditoría',
      path: '/auditoria',
      icon: 'icon-shield-check'
    },
    {
      name: 'Notificaciones',
      path: '/notificaciones',
      icon: 'icon-bell4'
    },
    {
      name: 'Configuración',
      path: '/configuracion',
      icon: 'icon-cog4'
    }
  ];

  return (
    <>
      {/* Styles del sistema original */}
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900" rel="stylesheet" type="text/css" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/icomoon/7.0.0/fonts/icomoon.woff" rel="stylesheet" type="text/css" />
      
      <style>{`
        /* Estilos base del sistema original Prestsy */
        body {
          font-family: 'Roboto', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
        }
        
        .navbar-inverse {
          background-color: #263238;
          border-color: #1c2529;
          margin-bottom: 0;
        }
        
        .navbar-brand img {
          height: 28px;
        }
        
        .sidebar {
          position: fixed;
          top: 50px;
          left: 0;
          width: 240px;
          height: calc(100vh - 50px);
          background-color: #37474f;
          overflow-y: auto;
          z-index: 1000;
        }
        
        .sidebar-category {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .sidebar-category > li > a {
          display: block;
          padding: 12px 20px;
          color: #b0bec5;
          text-decoration: none;
          border-bottom: 1px solid #2c3940;
          transition: all 0.15s ease-in-out;
        }
        
        .sidebar-category > li > a:hover,
        .sidebar-category > li.active > a {
          background-color: #455a64;
          color: #fff;
        }
        
        .sidebar-category > li > a i {
          margin-right: 10px;
          width: 20px;
          text-align: center;
        }
        
        .page-container {
          margin-left: 240px;
          padding: 20px;
          min-height: calc(100vh - 50px);
        }
        
        .panel {
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 1px 1px rgba(0,0,0,.05);
          margin-bottom: 20px;
        }
        
        .panel-heading {
          padding: 10px 15px;
          border-bottom: 1px solid #ddd;
          background-color: #f5f5f5;
          border-radius: 3px 3px 0 0;
        }
        
        .panel-body {
          padding: 15px;
        }
        
        .btn-primary {
          background-color: #2196f3;
          border-color: #2196f3;
          color: #fff;
        }
        
        .btn-success {
          background-color: #4caf50;
          border-color: #4caf50;
          color: #fff;
        }
        
        .btn-warning {
          background-color: #ff9800;
          border-color: #ff9800;
          color: #fff;
        }
        
        .btn-danger {
          background-color: #f44336;
          border-color: #f44336;
          color: #fff;
        }
        
        .table {
          width: 100%;
          margin-bottom: 20px;
          background-color: transparent;
          border-collapse: collapse;
        }
        
        .table th,
        .table td {
          padding: 8px;
          border-top: 1px solid #ddd;
          vertical-align: top;
        }
        
        .table thead th {
          border-bottom: 2px solid #ddd;
          background-color: #f5f5f5;
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
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .pull-right {
          float: right;
        }
        
        .clearfix::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>

      <div className="navbar navbar-inverse navbar-fixed-top">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/panel" style={{ paddingTop: '8px' }}>
            <img src="/images/logow.png" style={{ height: '28px' }} alt="Prestsy" />
          </Link>
          
          <div className="pull-right" style={{ padding: '15px' }}>
            <span style={{ color: '#b0bec5', marginRight: '15px' }}>
              Bienvenido, {usuario?.nombre}
            </span>
            <button 
              onClick={handleLogout}
              className="btn btn-sm btn-danger"
              style={{ fontSize: '12px' }}
            >
              <i className="icon-exit"></i> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar">
        {/* Menú Principal */}
        <ul className="sidebar-category">
          <li className="category-title" style={{ 
            padding: '12px 20px', 
            color: '#90a4ae', 
            fontSize: '11px', 
            textTransform: 'uppercase',
            borderBottom: '1px solid #455a64',
            marginBottom: '5px'
          }}>
            Sistema Principal
          </li>
          {menuItems.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path}>
                <i className={item.icon}></i>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Módulos Profesionales */}
        <ul className="sidebar-category" style={{ marginTop: '10px' }}>
          <li className="category-title" style={{ 
            padding: '12px 20px', 
            color: '#90a4ae', 
            fontSize: '11px', 
            textTransform: 'uppercase',
            borderBottom: '1px solid #455a64',
            marginBottom: '5px'
          }}>
            Módulos Avanzados
          </li>
          {menuProfesional.map((item) => (
            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path}>
                <i className={item.icon}></i>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="page-container">
        <div className="page-content">
          <div className="content-wrapper">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}