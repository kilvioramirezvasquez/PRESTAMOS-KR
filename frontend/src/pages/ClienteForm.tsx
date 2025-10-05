import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { clientesAPI } from '../services/api'
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormCliente {
  cedula: string
  nombre: string
  apodo: string
  foto: string
  telefono: string
  email: string
  direccion: string
  ciudad: string
  departamento: string
  fechaNacimiento: string
  ocupacion: string
  ingresos: number
  referencia1Nombre: string
  referencia1Telefono: string
  referencia2Nombre: string
  referencia2Telefono: string
  observaciones: string
}

const ClienteForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormCliente>({
    cedula: '',
    nombre: '',
    apodo: '',
    foto: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    fechaNacimiento: '',
    ocupacion: '',
    ingresos: 0,
    referencia1Nombre: '',
    referencia1Telefono: '',
    referencia2Nombre: '',
    referencia2Telefono: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isEditing && id) {
      cargarCliente()
    }
  }, [id, isEditing])

  const cargarCliente = async () => {
    try {
      setLoading(true)
      const response = await clientesAPI.getById(id!)
      if (response.success) {
        const cliente = response.data
        setFormData({
          cedula: cliente.cedula || '',
          nombre: cliente.nombre || '',
          apodo: cliente.apodo || '',
          foto: cliente.foto || '',
          telefono: cliente.telefono || '',
          email: cliente.email || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || '',
          departamento: cliente.departamento || '',
          fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : '',
          ocupacion: cliente.ocupacion || '',
          ingresos: cliente.ingresos || 0,
          referencia1Nombre: cliente.referencia1Nombre || '',
          referencia1Telefono: cliente.referencia1Telefono || '',
          referencia2Nombre: cliente.referencia2Nombre || '',
          referencia2Telefono: cliente.referencia2Telefono || '',
          observaciones: cliente.observaciones || ''
        })
      }
    } catch (error) {
      console.error('Error cargando cliente:', error)
      toast.error('Error al cargar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }

    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria'
    } else if (!/^\d{8,11}$/.test(formData.cedula.replace(/\D/g, ''))) {
      newErrors.cedula = 'La cédula debe tener entre 8 y 11 dígitos'
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    } else if (!/^\d{10}$/.test(formData.telefono.replace(/\D/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    }

    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buscarDatosPorCedula = async (cedula: string) => {
    if (!cedula || cedula.length < 8) return;
    
    try {
      const response = await clientesAPI.getByCedula(cedula);
      if (response.success && response.data) {
        const datos = response.data;
        
        // Solo actualizar si hay datos disponibles
        if (datos.nombre) {
          setFormData(prev => ({
            ...prev,
            nombre: datos.nombre,
            foto: datos.foto || prev.foto,
            telefono: datos.telefono || prev.telefono,
            email: datos.email || prev.email,
            direccion: datos.direccion || prev.direccion
          }));
          
          const source = response.source === 'external' ? 'datos externos' : 'base de datos';
          toast.success(`Datos encontrados en ${source}`);
        }
      }
    } catch (error) {
      console.error('Error buscando datos por cédula:', error);
      // No mostrar error ya que puede ser normal no encontrar datos
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cedula = e.target.value.replace(/\D/g, ''); // Solo números
    setFormData(prev => ({ ...prev, cedula }));
    
    // Buscar datos automáticamente cuando la cédula tenga longitud válida
    if (cedula.length >= 8) {
      buscarDatosPorCedula(cedula);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    try {
      setLoading(true)
      let response
      
      if (isEditing) {
        response = await clientesAPI.update(id!, formData)
      } else {
        response = await clientesAPI.create(formData)
      }

      if (response.success) {
        toast.success(isEditing ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente')
        navigate('/clientes')
      }
    } catch (error: any) {
      console.error('Error guardando cliente:', error)
      toast.error(error.response?.data?.message || 'Error al guardar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const formatCedula = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{1,3})(\d{3})(\d{3})/, '$1.$2.$3')
  }

  const formatTelefono = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  const handleInputChange = (field: keyof FormCliente, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/clientes')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualiza la información del cliente' : 'Registra un nuevo cliente en el sistema'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Información Personal</span>
            </CardTitle>
            <CardDescription>
              Datos básicos del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo Cédula primero */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="inline w-4 h-4 mr-2" />
                Cédula * (Se autocompletarán los datos)
              </label>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={handleCedulaChange}
                className={`input-field ${errors.cedula ? 'border-red-500' : ''}`}
                placeholder="Ingrese la cédula para buscar datos automáticamente"
                maxLength={11}
              />
              {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
            </div>

            {/* Foto del cliente */}
            {formData.foto && (
              <div className="flex justify-center">
                <img 
                  src={formData.foto} 
                  alt="Foto del cliente"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                  placeholder="Nombre completo del cliente"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apodo
                </label>
                <input
                  type="text"
                  value={formData.apodo}
                  onChange={(e) => handleInputChange('apodo', e.target.value)}
                  className="input-field"
                  placeholder="Apodo o sobrenombre"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', formatTelefono(e.target.value))}
                  className={`input-field ${errors.telefono ? 'border-red-500' : ''}`}
                  placeholder="300 123 4567"
                  maxLength={12}
                />
                {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="cliente@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ocupación
                </label>
                <input
                  type="text"
                  value={formData.ocupacion}
                  onChange={(e) => handleInputChange('ocupacion', e.target.value)}
                  className="input-field"
                  placeholder="Profesión u ocupación"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos mensuales
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={formData.ingresos || ''}
                onChange={(e) => handleInputChange('ingresos', parseFloat(e.target.value) || 0)}
                className="input-field"
                placeholder="0"
              />
              {formData.ingresos > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(formData.ingresos)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Información de Ubicación</span>
            </CardTitle>
            <CardDescription>
              Dirección y ubicación del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                required
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                className={`input-field ${errors.direccion ? 'border-red-500' : ''}`}
                placeholder="Dirección completa"
              />
              {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className={`input-field ${errors.ciudad ? 'border-red-500' : ''}`}
                  placeholder="Ciudad"
                />
                {errors.ciudad && <p className="text-red-500 text-xs mt-1">{errors.ciudad}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento
                </label>
                <input
                  type="text"
                  value={formData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  className="input-field"
                  placeholder="Departamento"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referencias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Referencias</span>
            </CardTitle>
            <CardDescription>
              Personas de referencia del cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia 1 - Nombre
                </label>
                <input
                  type="text"
                  value={formData.referencia1Nombre}
                  onChange={(e) => handleInputChange('referencia1Nombre', e.target.value)}
                  className="input-field"
                  placeholder="Nombre de la primera referencia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia 1 - Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.referencia1Telefono}
                  onChange={(e) => handleInputChange('referencia1Telefono', formatTelefono(e.target.value))}
                  className="input-field"
                  placeholder="300 123 4567"
                  maxLength={12}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia 2 - Nombre
                </label>
                <input
                  type="text"
                  value={formData.referencia2Nombre}
                  onChange={(e) => handleInputChange('referencia2Nombre', e.target.value)}
                  className="input-field"
                  placeholder="Nombre de la segunda referencia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia 2 - Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.referencia2Telefono}
                  onChange={(e) => handleInputChange('referencia2Telefono', formatTelefono(e.target.value))}
                  className="input-field"
                  placeholder="300 123 4567"
                  maxLength={12}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Observaciones</span>
            </CardTitle>
            <CardDescription>
              Información adicional del cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              rows={4}
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              className="input-field"
              placeholder="Información adicional, notas especiales, historial crediticio, etc."
            />
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/clientes')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isEditing ? 'Actualizar' : 'Crear'} Cliente</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default ClienteForm