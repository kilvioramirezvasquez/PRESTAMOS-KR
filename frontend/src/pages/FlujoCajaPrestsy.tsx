import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

interface FlujoCaja {
  fecha: Date;
  ingresos: {
    cobros: number;
    nuevosPrestamos: number;
    otros: number;
    total: number;
  };
  egresos: {
    gastos: number;
    comisiones: number;
    otros: number;
    total: number;
  };
  flujoNeto: number;
  saldoAcumulado: number;
}

interface ProyeccionItem {
  concepto: string;
  tipo: 'ingreso' | 'egreso';
  monto: number;
  fecha: Date;
  recurrente: boolean;
  frecuencia?: 'diaria' | 'semanal' | 'mensual';
}

const FlujoCajaPrestsy: React.FC = () => {
  const [flujos, setFlujos] = useState<FlujoCaja[]>([]);
  const [proyecciones, setProyecciones] = useState<ProyeccionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mensual');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [periodo, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Simular datos de flujo de caja
      const flujosSimulados: FlujoCaja[] = [];
      const hoy = new Date();
      
      for (let i = 0; i < 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        
        const cobros = Math.random() * 15000 + 5000;
        const nuevosPrestamos = Math.random() * 25000 + 10000;
        const otrosIngresos = Math.random() * 2000;
        
        const gastos = Math.random() * 3000 + 1000;
        const comisiones = (cobros + nuevosPrestamos) * 0.05;
        const otrosEgresos = Math.random() * 1000;
        
        const ingresos = {
          cobros,
          nuevosPrestamos,
          otros: otrosIngresos,
          total: cobros + nuevosPrestamos + otrosIngresos
        };
        
        const egresos = {
          gastos,
          comisiones,
          otros: otrosEgresos,
          total: gastos + comisiones + otrosEgresos
        };
        
        flujosSimulados.push({
          fecha,
          ingresos,
          egresos,
          flujoNeto: ingresos.total - egresos.total,
          saldoAcumulado: 0 // Se calculará después
        });
      }
      
      // Calcular saldo acumulado
      let acumulado = 50000; // Saldo inicial
      flujosSimulados.reverse().forEach(flujo => {
        acumulado += flujo.flujoNeto;
        flujo.saldoAcumulado = acumulado;
      });
      
      setFlujos(flujosSimulados.reverse());
      
      // Proyecciones simuladas
      setProyecciones([
        {
          concepto: 'Cobros proyectados',
          tipo: 'ingreso',
          monto: 120000,
          fecha: new Date(2025, 10, 1),
          recurrente: true,
          frecuencia: 'mensual'
        },
        {
          concepto: 'Nuevos préstamos estimados',
          tipo: 'ingreso',
          monto: 200000,
          fecha: new Date(2025, 10, 1),
          recurrente: true,
          frecuencia: 'mensual'
        },
        {
          concepto: 'Gastos operativos',
          tipo: 'egreso',
          monto: 25000,
          fecha: new Date(2025, 10, 1),
          recurrente: true,
          frecuencia: 'mensual'
        },
        {
          concepto: 'Comisiones cobradores',
          tipo: 'egreso',
          monto: 16000,
          fecha: new Date(2025, 10, 1),
          recurrente: true,
          frecuencia: 'mensual'
        }
      ]);
      
    } catch (error) {
      toast.error('Error al cargar datos del flujo de caja');
    } finally {
      setLoading(false);
    }
  };

  const calcularResumen = () => {
    const totalIngresos = flujos.reduce((sum, f) => sum + f.ingresos.total, 0);
    const totalEgresos = flujos.reduce((sum, f) => sum + f.egresos.total, 0);
    const flujoNeto = totalIngresos - totalEgresos;
    const saldoActual = flujos.length > 0 ? flujos[0].saldoAcumulado : 0;
    
    return { totalIngresos, totalEgresos, flujoNeto, saldoActual };
  };

  const resumen = calcularResumen();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 h-8 w-8 text-green-600" />
            Flujo de Caja
          </h1>
          <p className="text-gray-600 mt-1">
            Control y proyección de ingresos y egresos
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ingresos</p>
                <p className="text-2xl font-bold text-green-600">
                  ${resumen.totalIngresos.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowDownRight className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Egresos</p>
                <p className="text-2xl font-bold text-red-600">
                  ${resumen.totalEgresos.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${resumen.flujoNeto >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <TrendingUp className={`w-6 h-6 ${resumen.flujoNeto >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flujo Neto</p>
                <p className={`text-2xl font-bold ${resumen.flujoNeto >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ${resumen.flujoNeto.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Actual</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${resumen.saldoActual.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Flujo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flujo de Caja Diario</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico de flujo de caja</p>
                <p className="text-sm text-gray-400">Integración con Chart.js pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composición de Ingresos</CardTitle>
            <CardDescription>Distribución por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico circular</p>
                <p className="text-sm text-gray-400">Cobros vs Nuevos Préstamos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Proyecciones */}
      <Card>
        <CardHeader>
          <CardTitle>Proyecciones Futuras</CardTitle>
          <CardDescription>Estimaciones para los próximos períodos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Concepto</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-right py-3 px-4">Monto</th>
                  <th className="text-left py-3 px-4">Frecuencia</th>
                  <th className="text-center py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {proyecciones.map((proyeccion, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{proyeccion.concepto}</td>
                    <td className="py-3 px-4">
                      <Badge className={proyeccion.tipo === 'ingreso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {proyeccion.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${proyeccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      ${proyeccion.monto.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 capitalize">{proyeccion.frecuencia}</td>
                    <td className="py-3 px-4 text-center">
                      {proyeccion.recurrente && (
                        <Badge className="bg-blue-100 text-blue-800">
                          Recurrente
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Flujos */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Movimientos</CardTitle>
          <CardDescription>Registro detallado de ingresos y egresos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-right py-3 px-4">Ingresos</th>
                  <th className="text-right py-3 px-4">Egresos</th>
                  <th className="text-right py-3 px-4">Flujo Neto</th>
                  <th className="text-right py-3 px-4">Saldo Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {flujos.slice(0, 10).map((flujo, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {flujo.fecha.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      ${flujo.ingresos.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      ${flujo.egresos.total.toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-right font-bold ${flujo.flujoNeto >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      ${flujo.flujoNeto.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-purple-600">
                      ${flujo.saldoAcumulado.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlujoCajaPrestsy;