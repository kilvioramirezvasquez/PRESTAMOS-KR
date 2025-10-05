import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LoginPrestasy from './components/LoginPrestasy'
import DashboardPrestasySimple from './components/DashboardPrestasySimple'
import DashboardSimple from './components/DashboardSimple'
import Clientes from './pages/Clientes'
import Prestamos from './pages/Prestamos'
import Cobros from './pages/Cobros'
import Cobradores from './pages/Cobradores'
import ClienteForm from './pages/ClienteForm'
import PrestamoForm from './pages/PrestamoForm'
import CobroForm from './pages/CobroForm'
import SistemaViejoAnalisis from './pages/SistemaViejoAnalisis'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return usuario ? <>{children}</> : <Navigate to="/login" />
}

// Componente para rutas solo para usuarios no autenticados
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { usuario, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  return !usuario ? <>{children}</> : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPrestasy onLogin={(_token) => window.location.href = '/dashboard'} />
            </PublicRoute>
          } />
          
          {/* Rutas protegidas */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardSimple />} />
            <Route path="dashboard-simple" element={<DashboardSimple />} />
            <Route path="dashboard-old" element={<DashboardPrestasySimple />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="clientes/nuevo" element={<ClienteForm />} />
            <Route path="clientes/:id/editar" element={<ClienteForm />} />
            <Route path="prestamos" element={<Prestamos />} />
            <Route path="prestamos/nuevo" element={<PrestamoForm />} />
            <Route path="prestamos/:id/editar" element={<PrestamoForm />} />
            <Route path="cobros" element={<Cobros />} />
            <Route path="cobros/nuevo" element={<CobroForm />} />
            <Route path="cobros/editar/:id" element={<CobroForm />} />
            <Route path="cobradores" element={<Cobradores />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="sistema-viejo" element={<SistemaViejoAnalisis />} />
          </Route>
          
          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AuthProvider>
  )
}

export default App