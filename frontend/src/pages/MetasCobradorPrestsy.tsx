import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface MetaCobrador {
  _id?: string;
  cobradorId: string;
  cobradorNombre: string;
  periodo: string; // YYYY-MM
  metaMonto: number;
  metaCobros: number;
  montoAlcanzado: number;
  cobrosRealizados: number;
  porcentajeMonto: number;
  porcentajeCobros: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
  fechaCreacion: Date;
  fechaVencimiento: Date;
}

interface Cobrador {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  activo: boolean;
}

const MetasCobradorPrestsy: React.FC = () => {
  const [metas, setMetas] = useState<MetaCobrador[]>([]);
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaCobrador | null>(null);
  const [filtros, setFiltros] = useState({
    periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
    cobradorId: '',
    estado: ''
  });

  const [formData, setFormData] = useState({
    cobradorId: '',
    periodo: new Date().toISOString().slice(0, 7),
    metaMonto: 0,
    metaCobros: 0,
    fechaVencimiento: ''
  });

  useEffect(() => {
    loadData();
  }, [filtros]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metasResponse, cobradoresResponse] = await Promise.all([
        api.get('/metas-cobrador', { params: filtros }),
        api.get('/cobradores')
      ]);
      
      setMetas(metasResponse.data.data || []);
      setCobradores(cobradoresResponse.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMeta) {
        await api.put(`/metas-cobrador/${editingMeta._id}`, formData);
      } else {
        await api.post('/metas-cobrador', formData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving meta:', error);
    }
  };

  const handleEdit = (meta: MetaCobrador) => {
    setEditingMeta(meta);
    setFormData({
      cobradorId: meta.cobradorId,
      periodo: meta.periodo,
      metaMonto: meta.metaMonto,
      metaCobros: meta.metaCobros,
      fechaVencimiento: new Date(meta.fechaVencimiento).toISOString().slice(0, 10)
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      try {
        await api.delete(`/metas-cobrador/${id}`);
        await loadData();
      } catch (error) {
        console.error('Error deleting meta:', error);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMeta(null);
    setFormData({
      cobradorId: '',
      periodo: new Date().toISOString().slice(0, 7),
      metaMonto: 0,
      metaCobros: 0,
      fechaVencimiento: ''
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada': return 'bg-green-100 text-green-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (porcentaje: number) => {
    if (porcentaje >= 100) return 'bg-green-500';
    if (porcentaje >= 75) return 'bg-blue-500';
    if (porcentaje >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Metas de Cobradores
            </h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Nueva Meta
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período
              </label>
              <input
                type="month"
                value={filtros.periodo}
                onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cobrador
              </label>
              <select
                value={filtros.cobradorId}
                onChange={(e) => setFiltros({...filtros, cobradorId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los cobradores</option>
                {cobradores.map(cobrador => (
                  <option key={cobrador._id} value={cobrador._id}>
                    {cobrador.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="vencida">Vencida</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumen de Metas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Metas</p>
                <p className="text-2xl font-bold text-gray-900">{metas.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {metas.filter(m => m.estado === 'completada').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metas.filter(m => m.estado === 'en_progreso').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {metas.filter(m => m.estado === 'vencida').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Metas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Metas Activas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cobrador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta Cobros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso Cobros
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metas.map((meta) => (
                  <tr key={meta._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {meta.cobradorNombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meta.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(meta.metaMonto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.porcentajeMonto)}`}
                            style={{ width: `${Math.min(meta.porcentajeMonto, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {meta.porcentajeMonto.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCurrency(meta.montoAlcanzado)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meta.metaCobros}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(meta.porcentajeCobros)}`}
                            style={{ width: `${Math.min(meta.porcentajeCobros, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {meta.porcentajeCobros.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {meta.cobrosRealizados}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(meta.estado)}`}>
                        {meta.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(meta)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(meta._id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingMeta ? 'Editar Meta' : 'Nueva Meta'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cobrador *
                    </label>
                    <select
                      value={formData.cobradorId}
                      onChange={(e) => setFormData({...formData, cobradorId: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar cobrador</option>
                      {cobradores.map(cobrador => (
                        <option key={cobrador._id} value={cobrador._id}>
                          {cobrador.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período *
                    </label>
                    <input
                      type="month"
                      value={formData.periodo}
                      onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta de Monto (RD$) *
                    </label>
                    <input
                      type="number"
                      value={formData.metaMonto}
                      onChange={(e) => setFormData({...formData, metaMonto: Number(e.target.value)})}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta de Cobros *
                    </label>
                    <input
                      type="number"
                      value={formData.metaCobros}
                      onChange={(e) => setFormData({...formData, metaCobros: Number(e.target.value)})}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vencimiento *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaVencimiento}
                      onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingMeta ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetasCobradorPrestsy;