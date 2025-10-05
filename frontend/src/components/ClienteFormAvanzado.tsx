import React, { useState, useEffect } from 'react';
import { Search, User, Building, FileText, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import consultaOficialService, { DatosOficiales, DatosEmpresa } from '../services/consultaOficial';

interface ClienteFormProps {
  cliente?: any;
  onSubmit: (clienteData: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ConsultaState {
  consultando: boolean;
  datosEncontrados: boolean;
  tipoConsulta: 'cedula' | 'rnc' | 'pasaporte' | null;
  error: string | null;
  datosOficiales: DatosOficiales | DatosEmpresa | null;
}

export default function ClienteFormAvanzado({ cliente, onSubmit, onCancel, isLoading = false }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    cedula: '',
    rnc: '',
    pasaporte: '',
    telefono: '',
    email: '',
    direccion: '',
    fechaNacimiento: '',
    ocupacion: '',
    ingresosMensuales: '',
    estadoCivil: '',
    sexo: '',
    nacionalidad: 'Dominicana',
    tipoCliente: 'personal', // personal | empresa
    // Campos adicionales para empresas
    razonSocial: '',
    nombreComercial: '',
    actividadComercial: '',
    fechaConstitucion: '',
    // Metadatos
    fotoURL: '',
    notas: ''
  });

  const [consulta, setConsulta] = useState<ConsultaState>({
    consultando: false,
    datosEncontrados: false,
    tipoConsulta: null,
    error: null,
    datosOficiales: null
  });

  const [documentoConsulta, setDocumentoConsulta] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'cedula' | 'rnc' | 'pasaporte'>('cedula');

  // Cargar datos del cliente si está editando
  useEffect(() => {
    if (cliente) {
      setFormData({
        ...formData,
        ...cliente,
        ingresosMensuales: cliente.ingresosMensuales?.toString() || '',
      });
    }
  }, [cliente]);

  // Función para consultar datos oficiales
  const consultarDatosOficiales = async () => {
    if (!documentoConsulta.trim()) {
      setConsulta(prev => ({ ...prev, error: 'Ingrese un número de documento' }));
      return;
    }

    setConsulta({
      consultando: true,
      datosEncontrados: false,
      tipoConsulta: tipoDocumento,
      error: null,
      datosOficiales: null
    });

    try {
      let datos: DatosOficiales | DatosEmpresa | null = null;

      switch (tipoDocumento) {
        case 'cedula':
          if (!consultaOficialService.validarCedula(documentoConsulta)) {
            throw new Error('Formato de cédula inválido (debe tener 11 dígitos)');
          }
          datos = await consultaOficialService.consultarCedula(documentoConsulta);
          break;
        case 'rnc':
          if (!consultaOficialService.validarRNC(documentoConsulta)) {
            throw new Error('Formato de RNC inválido');
          }
          datos = await consultaOficialService.consultarRNC(documentoConsulta);
          break;
        case 'pasaporte':
          datos = await consultaOficialService.consultarPasaporte(documentoConsulta);
          break;
      }

      if (datos) {
        // Rellenar formulario con datos encontrados
        if (tipoDocumento === 'rnc' && 'razonSocial' in datos) {
          // Datos de empresa
          setFormData(prev => ({
            ...prev,
            tipoCliente: 'empresa',
            rnc: datos.rnc,
            razonSocial: datos.razonSocial,
            nombreComercial: datos.nombreComercial || '',
            actividadComercial: datos.actividad || '',
            direccion: datos.direccion || prev.direccion,
            telefono: datos.telefono || prev.telefono,
            email: datos.email || prev.email,
            fechaConstitucion: datos.fechaConstitucion || '',
          }));
        } else {
          // Datos de persona
          const datosPersona = datos as DatosOficiales;
          setFormData(prev => ({
            ...prev,
            tipoCliente: 'personal',
            nombre: datosPersona.nombre || prev.nombre,
            apellidos: datosPersona.apellidos || prev.apellidos,
            cedula: tipoDocumento === 'cedula' ? datosPersona.cedula : prev.cedula,
            pasaporte: tipoDocumento === 'pasaporte' ? documentoConsulta : prev.pasaporte,
            fechaNacimiento: datosPersona.fechaNacimiento || prev.fechaNacimiento,
            estadoCivil: datosPersona.estadoCivil || prev.estadoCivil,
            sexo: datosPersona.sexo || prev.sexo,
            nacionalidad: datosPersona.nacionalidad || prev.nacionalidad,
            direccion: datosPersona.direccion || prev.direccion,
            telefono: datosPersona.telefono || prev.telefono,
            email: datosPersona.email || prev.email,
            ocupacion: datosPersona.ocupacion || prev.ocupacion,
            fotoURL: datosPersona.foto || prev.fotoURL,
          }));
        }

        setConsulta(prev => ({
          ...prev,
          consultando: false,
          datosEncontrados: true,
          datosOficiales: datos
        }));
      } else {
        throw new Error('No se encontraron datos para este documento');
      }
    } catch (error: any) {
      setConsulta({
        consultando: false,
        datosEncontrados: false,
        tipoConsulta: null,
        error: error.message || 'Error al consultar los datos',
        datosOficiales: null
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    if (formData.tipoCliente === 'personal' && !formData.apellidos.trim()) {
      alert('Los apellidos son requeridos para personas');
      return;
    }

    if (formData.tipoCliente === 'empresa' && !formData.razonSocial.trim()) {
      alert('La razón social es requerida para empresas');
      return;
    }

    // Preparar datos para envío
    const clienteData = {
      ...formData,
      ingresosMensuales: formData.ingresosMensuales ? parseFloat(formData.ingresosMensuales) : 0,
      // Agregar metadatos de consulta
      datosVerificados: consulta.datosEncontrados,
      fechaVerificacion: consulta.datosEncontrados ? new Date().toISOString() : null,
      fuenteVerificacion: consulta.tipoConsulta || null,
    };

    await onSubmit(clienteData);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6" />
          {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        </h2>
        <p className="text-blue-100 mt-1">
          Complete los datos del cliente. Use la consulta automática para verificar la información oficial.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Sección de Consulta Automática */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-green-600" />
            Consulta Automática de Datos Oficiales
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={consulta.consultando}
              >
                <option value="cedula">Cédula de Identidad</option>
                <option value="rnc">RNC (Empresa)</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento
              </label>
              <input
                type="text"
                value={documentoConsulta}
                onChange={(e) => setDocumentoConsulta(e.target.value)}
                placeholder={
                  tipoDocumento === 'cedula' ? '000-0000000-0' :
                  tipoDocumento === 'rnc' ? '000000000' : 'AB123456'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={consulta.consultando}
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="button"
                onClick={consultarDatosOficiales}
                disabled={consulta.consultando || !documentoConsulta.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {consulta.consultando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Consultar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Estado de la consulta */}
          {consulta.error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{consulta.error}</span>
            </div>
          )}

          {consulta.datosEncontrados && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">
                ¡Datos oficiales encontrados y cargados automáticamente!
              </span>
            </div>
          )}
        </div>

        {/* Tipo de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cliente
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoCliente"
                value="personal"
                checked={formData.tipoCliente === 'personal'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <User className="w-4 h-4 mr-1" />
              Persona Física
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoCliente"
                value="empresa"
                checked={formData.tipoCliente === 'empresa'}
                onChange={handleInputChange}
                className="mr-2"
              />
              <Building className="w-4 h-4 mr-1" />
              Empresa
            </label>
          </div>
        </div>

        {/* Campos dinámicos según tipo de cliente */}
        {formData.tipoCliente === 'personal' ? (
          // Formulario para Persona Física
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula
              </label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleInputChange}
                placeholder="000-0000000-0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pasaporte
              </label>
              <input
                type="text"
                name="pasaporte"
                value={formData.pasaporte}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Civil
              </label>
              <select
                name="estadoCivil"
                value={formData.estadoCivil}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Soltero(a)">Soltero(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viudo(a)">Viudo(a)</option>
                <option value="Unión Libre">Unión Libre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexo
              </label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ocupación
              </label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          // Formulario para Empresa
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RNC *
              </label>
              <input
                type="text"
                name="rnc"
                value={formData.rnc}
                onChange={handleInputChange}
                required
                placeholder="000000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón Social *
              </label>
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial
              </label>
              <input
                type="text"
                name="nombreComercial"
                value={formData.nombreComercial}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actividad Comercial
              </label>
              <input
                type="text"
                name="actividadComercial"
                value={formData.actividadComercial}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Constitución
              </label>
              <input
                type="date"
                name="fechaConstitucion"
                value={formData.fechaConstitucion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Representante Legal
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Nombre del representante"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Información de Contacto */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="(809) 000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Información Financiera */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Financiera</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingresos Mensuales (RD$)
              </label>
              <input
                type="number"
                name="ingresosMensuales"
                value={formData.ingresosMensuales}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Foto (si hay datos oficiales) */}
        {formData.fotoURL && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Foto Oficial
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={formData.fotoURL}
                alt="Foto del cliente"
                className="w-24 h-30 object-cover rounded-lg border-2 border-gray-300"
              />
              <div className="text-sm text-gray-600">
                <p>Foto obtenida de fuentes oficiales</p>
                <p className="text-xs mt-1">
                  Verificada el: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales
          </label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            rows={3}
            placeholder="Información adicional sobre el cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {cliente ? 'Actualizar' : 'Crear'} Cliente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}