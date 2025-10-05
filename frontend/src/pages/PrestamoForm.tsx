import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { prestamosAPI, clientesAPI, cobradoresAPI } from '../services/api'
import { ArrowLeft, Calculator, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

interface Cliente {
  _id: string
  nombre: string
  cedula: string
  telefono: string
  email: string
}

interface Cobrador {
  _id: string
  nombre: string
  email: string
  zona: string
}

interface FormPrestamo {
  cliente: string
  monto: number
  interes: number
  cuotas: number
  fechaInicio: string
  diasPago: number
  frecuenciaPago: string
  pagoSoloInteres: boolean
  cobrador: string
  observaciones: string
  tipoPrestamo: string
}

const PrestamoForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cobradores, setCobradores] = useState<Cobrador[]>([])
  const [formData, setFormData] = useState<FormPrestamo>({
    cliente: '',
    monto: 0,
    interes: 3,
    cuotas: 10,
    fechaInicio: new Date().toISOString().split('T')[0],
    diasPago: 7,
    frecuenciaPago: 'semanal',
    pagoSoloInteres: false,
    cobrador: '',
    observaciones: '',
    tipoPrestamo: 'amortizado'
  })

  // Cálculos automáticos
  const [calculatedData, setCalculatedData] = useState({
    montoCuota: 0,
    montoTotal: 0,
    totalIntereses: 0
  })

  useEffect(() => {
    cargarDatos()
    if (isEditing) {
      cargarPrestamo()
    }
  }, [id])

  useEffect(() => {
    calcularPrestamo()
  }, [formData.monto, formData.interes, formData.cuotas, formData.tipoPrestamo, formData.pagoSoloInteres])

  const cargarDatos = async () => {
    try {
      const [clientesRes, cobradoresRes] = await Promise.all([
        clientesAPI.getAll({ page: 1, limit: 1000 }),
        cobradoresAPI.getAll({ page: 1, limit: 1000 })
      ])
      setClientes(clientesRes.data || [])
      setCobradores(cobradoresRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error cargando los datos necesarios')
    }
  }

  const cargarPrestamo = async () => {
    try {
      setLoading(true)
      const response = await prestamosAPI.getById(id!)
      const prestamo = response.data
      setFormData({
        cliente: prestamo.cliente._id,
        monto: prestamo.monto,
        interes: prestamo.interes,
        cuotas: prestamo.cuotas,
        fechaInicio: prestamo.fechaInicio.split('T')[0],
        diasPago: prestamo.diasPago || 7,
        frecuenciaPago: prestamo.frecuenciaPago || 'semanal',
        pagoSoloInteres: prestamo.pagoSoloInteres || false,
        cobrador: prestamo.cobrador?._id || '',
        observaciones: prestamo.observaciones || '',
        tipoPrestamo: prestamo.tipoPrestamo || 'amortizado'
      })
    } catch (error) {
      console.error('Error cargando préstamo:', error)
      toast.error('Error cargando el préstamo')
    } finally {
      setLoading(false)
    }
  }

  const calcularPrestamo = () => {
    const { monto, interes, cuotas, tipoPrestamo, pagoSoloInteres } = formData
    
    if (monto <= 0 || interes < 0 || cuotas <= 0) {
      setCalculatedData({ montoCuota: 0, montoTotal: 0, totalIntereses: 0 })
      return
    }

    let montoCuota = 0
    let montoTotal = 0
    let totalIntereses = 0

    // Si es pago solo de interés, el cálculo es diferente
    if (pagoSoloInteres) {
      const interesPorPeriodo = monto * (interes / 100)
      montoCuota = interesPorPeriodo
      montoTotal = (interesPorPeriodo * cuotas) + monto // Intereses + Capital al final
      totalIntereses = interesPorPeriodo * cuotas
      
      setCalculatedData({
        montoCuota: Math.round(montoCuota * 100) / 100,
        montoTotal: Math.round(montoTotal * 100) / 100,
        totalIntereses: Math.round(totalIntereses * 100) / 100
      })
      return
    }

    switch (tipoPrestamo) {
      case 'amortizado':
        // Sistema amortizado - cuotas fijas
        const tasaMensual = interes / 100
        if (tasaMensual > 0) {
          montoCuota = monto * (tasaMensual * Math.pow(1 + tasaMensual, cuotas)) / 
                      (Math.pow(1 + tasaMensual, cuotas) - 1)
        } else {
          montoCuota = monto / cuotas
        }
        montoTotal = montoCuota * cuotas
        totalIntereses = montoTotal - monto
        break

      case 'capitalizado':
        // Capitalizado - interés sobre saldo pendiente
        montoTotal = monto * (1 + (interes / 100) * cuotas)
        montoCuota = montoTotal / cuotas
        totalIntereses = montoTotal - monto
        break

      case 'capitalizado_fijo':
        // Capitalizado fijo - interés fijo por cuota
        const interesPorCuota = monto * (interes / 100)
        montoCuota = (monto / cuotas) + interesPorCuota
        montoTotal = montoCuota * cuotas
        totalIntereses = interesPorCuota * cuotas
        break

      case 'capitalizado_fijo_cuotas':
        // Capitalizado fijo con cuotas específicas
        const interesTotal = monto * (interes / 100)
        montoTotal = monto + interesTotal
        montoCuota = montoTotal / cuotas
        totalIntereses = interesTotal
        break

      default:
        montoCuota = monto / cuotas
        montoTotal = monto
        totalIntereses = 0
    }

    setCalculatedData({
      montoCuota: Math.round(montoCuota * 100) / 100,
      montoTotal: Math.round(montoTotal * 100) / 100,
      totalIntereses: Math.round(totalIntereses * 100) / 100
    })
  }

  const updateDiasPagoFromFrecuencia = (frecuencia: string) => {
    const diasMap: { [key: string]: number } = {
      'diario': 1,
      'semanal': 7,
      'quincenal': 15,
      'mensual': 30
    }
    return diasMap[frecuencia] || 7
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.cliente || !formData.monto || !formData.cuotas) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const dataToSubmit = {
        ...formData,
        montoCuota: calculatedData.montoCuota,
        montoTotal: calculatedData.montoTotal,
        totalIntereses: calculatedData.totalIntereses
      }

      if (isEditing) {
        // Para edición, usar el método disponible o crear uno nuevo
        await prestamosAPI.create({ ...dataToSubmit, _id: id })
        toast.success('Préstamo actualizado exitosamente')
      } else {
        await prestamosAPI.create(dataToSubmit)
        toast.success('Préstamo creado exitosamente')
      }
      
      navigate('/prestamos')
    } catch (error: any) {
      console.error('Error guardando préstamo:', error)
      toast.error(error.response?.data?.message || 'Error guardando el préstamo')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === 'frecuenciaPago') {
      const newDiasPago = updateDiasPagoFromFrecuencia(value)
      setFormData(prev => ({
        ...prev,
        frecuenciaPago: value,
        diasPago: newDiasPago
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'monto' || name === 'interes' || name === 'cuotas' || name === 'diasPago' 
          ? parseFloat(value) || 0 
          : value
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/prestamos')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Préstamo' : 'Nuevo Préstamo'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Modifica los datos del préstamo' : 'Crea un nuevo préstamo'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario Principal */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Datos del Préstamo
              </h2>

              <div className="space-y-4">
                {/* Tipo de Préstamo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Préstamo *
                  </label>
                  <select
                    name="tipoPrestamo"
                    value={formData.tipoPrestamo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="amortizado">Amortizado (Cuotas fijas)</option>
                    <option value="capitalizado">Capitalizado (Interés sobre saldo)</option>
                    <option value="capitalizado_fijo">Capitalizado Fijo (Interés fijo por cuota)</option>
                    <option value="capitalizado_fijo_cuotas">Capitalizado Fijo con Cuotas</option>
                  </select>
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nombre} - {cliente.cedula}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto del Préstamo *
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Interés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasa de Interés (%) *
                  </label>
                  <input
                    type="number"
                    name="interes"
                    value={formData.interes}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Cuotas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Cuotas *
                  </label>
                  <input
                    type="number"
                    name="cuotas"
                    value={formData.cuotas}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Fecha de Inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Frecuencia de Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frecuencia de Pago *
                  </label>
                  <select
                    name="frecuenciaPago"
                    value={formData.frecuenciaPago}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="diario">Diario (1 día)</option>
                    <option value="semanal">Semanal (7 días)</option>
                    <option value="quincenal">Quincenal (15 días)</option>
                    <option value="mensual">Mensual (30 días)</option>
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    Días entre pagos: {formData.diasPago}
                  </div>
                </div>

                {/* Cobrador */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cobrador Asignado
                  </label>
                  <select
                    name="cobrador"
                    value={formData.cobrador}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin asignar</option>
                    {cobradores.map(cobrador => (
                      <option key={cobrador._id} value={cobrador._id}>
                        {cobrador.nombre} - {cobrador.zona}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notas adicionales sobre el préstamo..."
                  />
                </div>
              </div>
            </div>

            {/* Panel de Cálculos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cálculos Automáticos
              </h2>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Cuota</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${calculatedData.montoCuota.toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Total a Pagar</div>
                  <div className="text-2xl font-bold text-green-900">
                    ${calculatedData.montoTotal.toLocaleString()}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 font-medium">Total Intereses</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    ${calculatedData.totalIntereses.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 font-medium">Capital</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${formData.monto.toLocaleString()}
                  </div>
                </div>

                {/* Información del tipo de préstamo */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Tipo: {formData.tipoPrestamo.replace('_', ' ').toUpperCase()}
                  </h3>
                  <div className="text-xs text-gray-600">
                    {formData.tipoPrestamo === 'amortizado' && 
                      'Cuotas fijas con capital e interés incluido'}
                    {formData.tipoPrestamo === 'capitalizado' && 
                      'Interés calculado sobre saldo pendiente'}
                    {formData.tipoPrestamo === 'capitalizado_fijo' && 
                      'Interés fijo más cuota de capital'}
                    {formData.tipoPrestamo === 'capitalizado_fijo_cuotas' && 
                      'Interés total dividido en cuotas iguales'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/prestamos')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Préstamo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrestamoForm
