import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';

interface DashboardStats {
  totalClientes: number;
  totalPrestamos: number;
  montoTotal: number;
  cobrosHoy: number;
  clientesActivos: number;
  prestamosActivos: number;
  morosidad: number;
  ingresosMes: number;
}

const DashboardSimple: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClientes: 0,
    totalPrestamos: 0,
    montoTotal: 0,
    cobrosHoy: 0,
    clientesActivos: 0,
    prestamosActivos: 0,
    morosidad: 0,
    ingresosMes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('=== FRONTEND DEBUG ===');
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', !!token);
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      console.log('Haciendo petición a dashboard API...');
      const response = await dashboardAPI.getStats();

      console.log('Respuesta recibida:', response);
      setStats(response.data || response);
      setError(null);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      setError(error.response?.data?.message || error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button 
            onClick={loadDashboardData}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Dashboard <span className="text-blue-600">Prestasy-KR</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Sistema de Gestión de Préstamos - Panel de Control
        </p>
        <button 
          onClick={loadDashboardData}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Actualizar datos
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Clientes */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">TOTAL CLIENTES</h3>
              <div className="text-3xl font-bold">{stats.totalClientes}</div>
              <div className="text-blue-200">Activos: {stats.clientesActivos}</div>
            </div>
          </div>
        </div>

        {/* Total Préstamos */}
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">PRÉSTAMOS</h3>
              <div className="text-3xl font-bold">{stats.totalPrestamos}</div>
              <div className="text-green-200">Activos: {stats.prestamosActivos}</div>
            </div>
          </div>
        </div>

        {/* Monto Total */}
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">MONTO TOTAL</h3>
              <div className="text-2xl font-bold">{formatCurrency(stats.montoTotal)}</div>
              <div className="text-purple-200">En circulación</div>
            </div>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-orange-500 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">INGRESOS MES</h3>
              <div className="text-2xl font-bold">{formatCurrency(stats.ingresosMes)}</div>
              <div className="text-orange-200">Cobros realizados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Datos de debug */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Datos de Debug</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(stats, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DashboardSimple;