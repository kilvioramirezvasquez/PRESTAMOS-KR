import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { cobrosAPI, prestamosAPI } from '../services/api'
import { ArrowLeft, DollarSign, Calendar, FileText, AlertCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Prestamo {
  _id: string
  cliente: {
    _id: string
    nombre: string
    cedula: string
    telefono: string
  }
  monto: number
  montoTotal: number
  cuotas: number
  cuotasPendientes: number
  montoCuota: number
  fechaInicio: string
  estado: string
  cobrador: {
    _id: string
    nombre: string
  }
}

interface FormCobro {
  prestamo: string
  monto: number
  fecha: string
  observaciones: string
  tipo: 'cuota' | 'abono' | 'completo'
}

const CobroForm: React.FC = () => {
  const navigate = useNavigate()
  const { id, prestamoId } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [prestamos, setPrestamos] = useState<Prestamo[]>([])
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState<Prestamo | null>(null)
  const [formData, setFormData] = useState<FormCobro>({
    prestamo: prestamoId || '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    observaciones: '',
    tipo: 'cuota'
  })

  useEffect(() => {
    cargarPrestamos()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      cargarCobro()
    }
  }, [id, isEditing])

  useEffect(() => {
    if (formData.prestamo) {
      const prestamo = prestamos.find(p => p._id === formData.prestamo)
      setPrestamoSeleccionado(prestamo || null)
      if (prestamo && formData.tipo === 'cuota') {
        setFormData(prev => ({ ...prev, monto: prestamo.montoCuota }))
      }
    }
  }, [formData.prestamo, prestamos, formData.tipo])

  const cargarPrestamos = async () => {
    try {
      const response = await prestamosAPI.getAll({ 
        limit: 100, 
        estado: 'activo',
        conSaldo: true 
      })
      if (response.success) {
        setPrestamos(response.data)
      }
    } catch (error) {
      console.error('Error cargando préstamos:', error)
      toast.error('Error al cargar préstamos')
    }
  }

  const cargarCobro = async () => {
    try {
      setLoading(true)
      const response = await cobrosAPI.getById(id!)
      if (response.success && response.data) {
        const cobro = response.data
        setFormData({
          prestamo: cobro.prestamo._id,
          monto: cobro.monto,
          fecha: cobro.fecha.split('T')[0],
          observaciones: cobro.observaciones || '',
          tipo: cobro.tipo || 'cuota'
        })
      }
    } catch (error) {
      console.error('Error cargando cobro:', error)
      toast.error('Error al cargar el cobro')
    } finally {
      setLoading(false)
    }
  }

  const handleTipoChange = (tipo: 'cuota' | 'abono' | 'completo') => {
    setFormData(prev => {
      let nuevoMonto = prev.monto
      if (prestamoSeleccionado) {
        switch (tipo) {
          case 'cuota':
            nuevoMonto = prestamoSeleccionado.montoCuota
            break
          case 'completo':
            nuevoMonto = prestamoSeleccionado.montoTotal - (prestamoSeleccionado.montoCuota * (prestamoSeleccionado.cuotas - prestamoSeleccionado.cuotasPendientes))
            break
          case 'abono':
            nuevoMonto = 0
            break
        }
      }
      return { ...prev, tipo, monto: nuevoMonto }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.prestamo || !formData.monto) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    if (prestamoSeleccionado && formData.monto > prestamoSeleccionado.montoTotal) {
      toast.error('El monto no puede ser mayor al saldo pendiente')
      return
    }

    try {
      setLoading(true)
      let response
      
      if (isEditing) {
        response = await cobrosAPI.update(id!, formData)
      } else {
        response = await cobrosAPI.create(formData)
      }

      if (response.success) {
        toast.success(isEditing ? 'Cobro actualizado exitosamente' : 'Cobro registrado exitosamente')
        navigate('/cobros')
      }
    } catch (error: any) {
      console.error('Error guardando cobro:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el cobro')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'activo': return 'default'
      case 'pagado': return 'success'
      case 'vencido': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/cobros')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Cobro' : 'Registrar Cobro'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualiza la información del cobro' : 'Registra un nuevo pago de préstamo'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Información del Cobro</span>
              </CardTitle>
              <CardDescription>
                Completa los datos del pago recibido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selección de préstamo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Préstamo *
                  </label>
                  <select
                    required
                    value={formData.prestamo}
                    onChange={(e) => setFormData({ ...formData, prestamo: e.target.value })}
                    className="input-field"
                    disabled={!!prestamoId}
                  >
                    <option value="">Seleccionar préstamo...</option>
                    {prestamos.map((prestamo) => (
                      <option key={prestamo._id} value={prestamo._id}>
                        {prestamo.cliente.nombre} - {formatCurrency(prestamo.montoCuota)} 
                        ({prestamo.cuotasPendientes} cuotas pendientes)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de cobro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de pago *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTipoChange('cuota')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.tipo === 'cuota'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Cuota</div>
                      <div className="text-xs text-gray-500">Pago regular</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipoChange('abono')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.tipo === 'abono'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Abono</div>
                      <div className="text-xs text-gray-500">Pago parcial</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTipoChange('completo')}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        formData.tipo === 'completo'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Completo</div>
                      <div className="text-xs text-gray-500">Pago total</div>
                    </button>
                  </div>
                </div>

                {/* Monto y fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto recibido *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="100"
                      value={formData.monto || ''}
                      onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                      className="input-field"
                      placeholder="0"
                    />
                    {prestamoSeleccionado && formData.tipo === 'cuota' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cuota sugerida: {formatCurrency(prestamoSeleccionado.montoCuota)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha del cobro *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="input-field"
                    placeholder="Notas adicionales sobre el pago..."
                  />
                </div>

                {/* Validaciones y advertencias */}
                {prestamoSeleccionado && formData.monto > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-yellow-800">Información del pago</h4>
                        <div className="text-sm text-yellow-700 mt-1 space-y-1">
                          {formData.tipo === 'cuota' && formData.monto === prestamoSeleccionado.montoCuota && (
                            <p>✓ Pago de cuota completa</p>
                          )}
                          {formData.tipo === 'cuota' && formData.monto !== prestamoSeleccionado.montoCuota && (
                            <p>⚠️ El monto difiere de la cuota regular ({formatCurrency(prestamoSeleccionado.montoCuota)})</p>
                          )}
                          {formData.tipo === 'completo' && (
                            <p>✓ Este pago liquidará completamente el préstamo</p>
                          )}
                          {formData.monto > prestamoSeleccionado.montoTotal && (
                            <p className="text-red-600">❌ El monto supera el saldo pendiente</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/cobros')}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (prestamoSeleccionado && formData.monto > prestamoSeleccionado.montoTotal)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{isEditing ? 'Actualizar' : 'Registrar'} Cobro</span>
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Información del préstamo */}
        {prestamoSeleccionado && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Préstamo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{prestamoSeleccionado.cliente.nombre}</h4>
                  <p className="text-sm text-gray-600">
                    Cédula: {prestamoSeleccionado.cliente.cedula}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tel: {prestamoSeleccionado.cliente.telefono}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge variant={getBadgeVariant(prestamoSeleccionado.estado)}>
                      {prestamoSeleccionado.estado}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monto original:</span>
                    <span className="font-semibold">{formatCurrency(prestamoSeleccionado.monto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total a pagar:</span>
                    <span className="font-semibold">{formatCurrency(prestamoSeleccionado.montoTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cuota:</span>
                    <span className="font-semibold text-blue-600">
                      {formatCurrency(prestamoSeleccionado.montoCuota)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cuotas pendientes:</span>
                    <span className="font-semibold text-orange-600">
                      {prestamoSeleccionado.cuotasPendientes} de {prestamoSeleccionado.cuotas}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Saldo pendiente:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency(prestamoSeleccionado.montoCuota * prestamoSeleccionado.cuotasPendientes)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CobroForm