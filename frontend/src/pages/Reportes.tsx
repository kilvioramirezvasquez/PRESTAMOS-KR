import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { reportesAPI } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Users,
  CreditCard,
  Download,
  Filter
} from 'lucide-react';

const Reportes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-gray-600">Análisis completo del sistema de préstamos</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="cobradores">Cobradores</TabsTrigger>
          <TabsTrigger value="mora">Mora</TabsTrigger>
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '12px', 
                    backgroundColor: '#3b82f6', 
                    background: 'linear-gradient(45deg, #3b82f6, #60a5fa)' 
                  }}>
                    <Users className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Clientes</p>
                  <p className="text-2xl font-semibold text-gray-900">150</p>
                  <p className="text-sm text-gray-500">25 nuevos este período</p>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '12px', 
                    backgroundColor: '#10b981', 
                    background: 'linear-gradient(45deg, #10b981, #34d399)' 
                  }}>
                    <CreditCard className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Préstamos Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">85</p>
                  <p className="text-sm text-gray-500">35 nuevos este período</p>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '12px', 
                    backgroundColor: '#f59e0b', 
                    background: 'linear-gradient(45deg, #f59e0b, #fbbf24)' 
                  }}>
                    <DollarSign className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Monto Cobrado</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(3000000)}</p>
                  <p className="text-sm text-gray-500">150 cobros este período</p>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #e5e7eb' 
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div style={{ 
                    padding: '12px', 
                    borderRadius: '12px', 
                    backgroundColor: '#8b5cf6', 
                    background: 'linear-gradient(45deg, #8b5cf6, #a78bfa)' 
                  }}>
                    <TrendingUp className="h-6 w-6" style={{ color: 'white' }} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Tasa de Cobranza</p>
                  <p className="text-2xl font-semibold text-gray-900">85.5%</p>
                  <p className="text-sm text-gray-500">Eficiencia del sistema</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              color: 'white' 
            }}>
              <h3 className="text-xl font-semibold mb-4">Resumen de Préstamos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Total prestado:</span>
                  <span className="font-bold text-white">{formatCurrency(5000000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Saldo pendiente:</span>
                  <span className="font-bold text-yellow-200">{formatCurrency(2000000)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Préstamos pagados:</span>
                  <span className="font-bold text-green-200">100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Préstamos en mora:</span>
                  <span className="font-bold text-red-200">15</span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
              borderRadius: '12px', 
              padding: '24px', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
              color: 'white' 
            }}>
              <h3 className="text-xl font-semibold mb-4">Estado de Clientes</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Clientes activos:</span>
                  <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    120
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Clientes inactivos:</span>
                  <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    30
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/90">Usuarios del sistema:</span>
                  <div style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '14px', 
                    fontWeight: 'bold' 
                  }}>
                    8
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="datos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cuotas Vencidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-red-600" />
                  Cuotas Vencidas
                </CardTitle>
                <CardDescription>
                  Listado de cuotas que han vencido su fecha de pago
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">María González</p>
                      <p className="text-sm text-red-600">Vencido: 5 días</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-900">{formatCurrency(150000)}</p>
                      <Badge variant="destructive">Mora</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-900">Carlos Rodríguez</p>
                      <p className="text-sm text-red-600">Vencido: 12 días</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-900">{formatCurrency(220000)}</p>
                      <Badge variant="destructive">Mora</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-900">Ana López</p>
                      <p className="text-sm text-yellow-600">Vencido: 2 días</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-900">{formatCurrency(180000)}</p>
                      <Badge variant="secondary">Reciente</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cobros del Día */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Cobros del Día
                </CardTitle>
                <CardDescription>
                  Cobros realizados en el día actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Pedro Martín</p>
                      <p className="text-sm text-green-600">10:30 AM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-900">{formatCurrency(200000)}</p>
                      <Badge variant="secondary">Completado</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Laura Sánchez</p>
                      <p className="text-sm text-green-600">02:15 PM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-900">{formatCurrency(175000)}</p>
                      <Badge variant="secondary">Completado</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">José García</p>
                      <p className="text-sm text-blue-600">04:45 PM</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900">{formatCurrency(300000)}</p>
                      <Badge>Parcial</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Préstamos Activos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Préstamos Activos
                </CardTitle>
                <CardDescription>
                  Estado actual de los préstamos en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Activos</span>
                    <span className="text-lg font-bold text-blue-600">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">En Mora</span>
                    <span className="text-lg font-bold text-red-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Al Día</span>
                    <span className="text-lg font-bold text-green-600">37</span>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Capital Total</span>
                      <span className="text-lg font-bold">{formatCurrency(25000000)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen Mensual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Resumen Mensual
                </CardTitle>
                <CardDescription>
                  Estadísticas del mes actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Nuevos Préstamos</p>
                      <p className="text-xl font-bold text-blue-600">12</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Préstamos Pagados</p>
                      <p className="text-xl font-bold text-green-600">8</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Cobrado</p>
                      <p className="text-lg font-bold text-yellow-600">{formatCurrency(5200000)}</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">En Mora</p>
                      <p className="text-lg font-bold text-red-600">{formatCurrency(980000)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cobradores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Cobrador</CardTitle>
              <CardDescription>
                Estadísticas de desempeño de cada cobrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">Juan Pérez</h4>
                      <p className="text-gray-600">juan@test.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cobros realizados</p>
                      <p className="text-xl font-bold">45</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monto cobrado</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(850000)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Eficiencia</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-sm font-medium">88.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mora" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préstamos en Mora</CardTitle>
              <CardDescription>
                Total: 25 préstamos - Monto: {formatCurrency(800000)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">Módulo de mora en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financiero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Financiero</CardTitle>
              <CardDescription>
                Indicadores financieros del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">ROI</p>
                  <p className="text-xl font-bold text-blue-600">15.0%</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Rentabilidad</p>
                  <p className="text-xl font-bold text-green-600">12.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reportes;
