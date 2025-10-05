// Sistema Prestsy - Implementación completa de todos los módulos
// Basado en el análisis del sistema original en invmarcos.ddns.net

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes principales
import LoginPrestsy from './pages/LoginPrestsy';
import DashboardPrestsy from './pages/DashboardPrestsy';
import ClientesPrestsy from './pages/ClientesPrestsy';
import PrestamosPrestsy from './pages/PrestamosPrestsy';
import CobrosPrestsy from './pages/CobrosPrestsy';
import CobradoresPrestsy from './pages/CobradoresPrestsy';
import ReportesPrestsy from './pages/ReportesPrestsy';
import UsuariosPrestsy from './pages/UsuariosPrestsy';
import ConfiguracionPrestsy from './pages/ConfiguracionPrestsy';

// Módulos avanzados profesionales
import RutasCobroPrestsy from './pages/RutasCobroPrestsy';
import MetasCobradorPrestsy from './pages/MetasCobradorPrestsy';
import FlujoCajaPrestsy from './pages/FlujoCajaPrestsy';
import AuditoriaPrestsy from './pages/AuditoriaPrestsy';
import NotificacionesPrestsy from './pages/NotificacionesPrestsy';

// Layout principal del sistema
import LayoutPrestsy from './components/LayoutPrestsy';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<LoginPrestsy />} />
            <Route path="/panel" element={<ProtectedRoute><LayoutPrestsy><DashboardPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><LayoutPrestsy><ClientesPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/prestamos" element={<ProtectedRoute><LayoutPrestsy><PrestamosPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/cobros" element={<ProtectedRoute><LayoutPrestsy><CobrosPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/cobradores" element={<ProtectedRoute><LayoutPrestsy><CobradoresPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/reportes" element={<ProtectedRoute><LayoutPrestsy><ReportesPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><LayoutPrestsy><UsuariosPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/configuracion" element={<ProtectedRoute><LayoutPrestsy><ConfiguracionPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            
            {/* Módulos Avanzados Profesionales */}
            <Route path="/rutas-cobro" element={<ProtectedRoute><LayoutPrestsy><RutasCobroPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/metas-cobradores" element={<ProtectedRoute><LayoutPrestsy><MetasCobradorPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/flujo-caja" element={<ProtectedRoute><LayoutPrestsy><FlujoCajaPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/auditoria" element={<ProtectedRoute><LayoutPrestsy><AuditoriaPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/notificaciones" element={<ProtectedRoute><LayoutPrestsy><NotificacionesPrestsy /></LayoutPrestsy></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default App;