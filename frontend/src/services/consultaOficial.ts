// Servicio para consulta de datos oficiales (JCE, TSS, etc.)
import axios from 'axios';

// Interfaz para datos oficiales del ciudadano
export interface DatosOficiales {
  cedula: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  lugarNacimiento?: string;
  estadoCivil?: string;
  sexo?: string;
  nacionalidad?: string;
  direccion?: string;
  foto?: string; // URL de la foto
  estado?: 'activo' | 'vencida' | 'suspendida';
  // Datos adicionales
  ocupacion?: string;
  telefono?: string;
  email?: string;
}

// Interfaz para RNC/empresas
export interface DatosEmpresa {
  rnc: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoPersona: string;
  categoria: string;
  regimen: string;
  estado: string;
  fechaConstitucion?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  actividad?: string;
}

class ConsultaOficialService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // En producción, estas credenciales deben estar en variables de entorno
    this.apiKey = process.env.VITE_JCE_API_KEY || 'demo-key';
    this.baseURL = process.env.VITE_CONSULTA_API_URL || 'https://api.consultadatos.do';
  }

    /**
   * Consultar cédula en el sistema local y JCE
   */
  async consultarCedula(cedula: string): Promise<DatosOficiales | null> {
    try {
      // Primero intentar buscar en el sistema local
      const datosLocales = await this.consultarCedulaLocal(cedula);
      if (datosLocales) {
        return datosLocales;
      }

      // Si no se encuentra, simular consulta JCE
      const response = await this.simularConsultaJCE(cedula);
      return response;
    } catch (error) {
      console.error('Error consultando cédula:', error);
      return null;
    }
  }

  /**
   * Consultar cédula en el sistema local (base de datos anterior)
   */
  private async consultarCedulaLocal(cedula: string): Promise<DatosOficiales | null> {
    try {
      const response = await fetch(`/api/consulta-cedula-local/${cedula}`);
      if (response.ok) {
        const data = await response.json();
        if (data.found) {
          return {
            cedula: data.cedula,
            nombre: data.nombre.split(' ')[0] || '',
            apellidos: data.nombre.split(' ').slice(1).join(' ') || '',
            nombreCompleto: data.nombre,
            telefono: data.telefono,
            direccion: data.direccion,
            estado: 'activo'
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error consultando sistema local:', error);
      return null;
    }
  }

  /**
   * Consulta datos por RNC en la DGII
   */
  async consultarRNC(rnc: string): Promise<DatosEmpresa | null> {
    try {
      const rncLimpio = rnc.replace(/\D/g, '');
      
      if (rncLimpio.length !== 9 && rncLimpio.length !== 11) {
        throw new Error('RNC debe tener 9 u 11 dígitos');
      }

      // Simulación de consulta RNC
      const datosEmpresa = await this.simularConsultaRNC(rncLimpio);
      
      return datosEmpresa;
    } catch (error) {
      console.error('Error consultando RNC:', error);
      throw error;
    }
  }

  /**
   * Consulta datos por pasaporte
   */
  async consultarPasaporte(pasaporte: string): Promise<DatosOficiales | null> {
    try {
      // Validar formato de pasaporte dominicano
      if (pasaporte.length < 6 || pasaporte.length > 15) {
        throw new Error('Formato de pasaporte inválido');
      }

      // Simulación de consulta por pasaporte
      const datosPasaporte = await this.simularConsultaPasaporte(pasaporte);
      
      return datosPasaporte;
    } catch (error) {
      console.error('Error consultando pasaporte:', error);
      throw error;
    }
  }

  /**
   * Simulación de consulta a la JCE (para desarrollo)
   */
  private async simularConsultaJCE(cedula: string): Promise<DatosOficiales> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Datos ficticios basados en la cédula
    const nombres = [
      'Juan Carlos', 'María Elena', 'Pedro Antonio', 'Ana Lucía', 'José Manuel',
      'Carmen Rosa', 'Luis Fernando', 'Rosa María', 'Carlos Eduardo', 'Isabel Cristina',
      'Miguel Ángel', 'Patricia Elena', 'Rafael Antonio', 'Mónica Alejandra', 'Diego Sebastián',
      'Kilvio Ramírez', 'Alejandra José', 'Alexander Tavarez', 'Angela Céspedes', 'Bartolo Peguero'
    ];

    const apellidos = [
      'Rodríguez García', 'Martínez López', 'González Pérez', 'Hernández Jiménez', 'Díaz Morales',
      'Sánchez Vargas', 'Ramírez Castro', 'Torres Mendoza', 'Vásquez Ruiz', 'Moreno Silva',
      'Vásquez', 'Félix', 'Rodríguez', 'Batista', 'Chalas', 'Sandoval', 'Peguero', 'Ludger'
    ];

    const ciudades = [
      'Santo Domingo', 'Santiago', 'San Pedro de Macorís', 'La Romana', 'Puerto Plata',
      'San Francisco de Macorís', 'Higüey', 'Moca', 'Baní', 'Azua'
    ];

    // Generar datos basados en la cédula para consistencia
    const seed = parseInt(cedula.substring(0, 3));
    const nombreIndex = seed % nombres.length;
    const apellidoIndex = (seed + 1) % apellidos.length;
    const ciudadIndex = seed % ciudades.length;

    // Generar fecha de nacimiento basada en los primeros dígitos de la cédula
    const año = 1950 + (seed % 50);
    const mes = 1 + (seed % 12);
    const dia = 1 + (seed % 28);

    return {
      cedula: cedula,
      nombre: nombres[nombreIndex].split(' ')[0],
      apellidos: apellidos[apellidoIndex],
      nombreCompleto: `${nombres[nombreIndex]} ${apellidos[apellidoIndex]}`,
      fechaNacimiento: `${año}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`,
      lugarNacimiento: ciudades[ciudadIndex],
      estadoCivil: seed % 2 === 0 ? 'Soltero(a)' : 'Casado(a)',
      sexo: seed % 2 === 0 ? 'M' : 'F',
      nacionalidad: 'Dominicana',
      estado: 'activo',
      foto: `https://picsum.photos/200/250?random=${seed}`, // Foto de ejemplo
    };
  }

  /**
   * Simulación de consulta RNC en DGII
   */
  private async simularConsultaRNC(rnc: string): Promise<DatosEmpresa> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    const empresas = [
      'Inversiones Comerciales S.R.L.', 'Distribuidora Nacional S.A.', 'Servicios Profesionales EIRL',
      'Constructora del Caribe S.A.', 'Tecnología Dominicana S.R.L.', 'Comercializadora Internacional S.A.'
    ];

    const actividades = [
      'Comercio al por mayor', 'Servicios profesionales', 'Construcción',
      'Tecnología e informática', 'Servicios financieros', 'Manufactura'
    ];

    const seed = parseInt(rnc.substring(0, 3));
    const empresaIndex = seed % empresas.length;
    const actividadIndex = seed % actividades.length;

    return {
      rnc: rnc,
      razonSocial: empresas[empresaIndex],
      nombreComercial: empresas[empresaIndex].replace(' S.R.L.', '').replace(' S.A.', '').replace(' EIRL', ''),
      tipoPersona: 'Jurídica',
      categoria: 'Régimen Ordinario',
      regimen: 'Ordinario',
      estado: 'Activo',
      fechaConstitucion: `${2015 + (seed % 8)}-${(seed % 12) + 1}-15`,
      direccion: `Calle ${seed} #${seed + 10}, Santo Domingo`,
      actividad: actividades[actividadIndex]
    };
  }

  /**
   * Simulación de consulta por pasaporte
   */
  private async simularConsultaPasaporte(pasaporte: string): Promise<DatosOficiales> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const nombres = ['Miguel Ángel', 'Isabel María', 'Roberto Carlos', 'Ana Teresa'];
    const apellidos = ['Fernández Gómez', 'Castillo Pérez', 'Morales Díaz', 'Jiménez López'];

    const seed = pasaporte.charCodeAt(0) + pasaporte.charCodeAt(1);
    const nombreIndex = seed % nombres.length;
    const apellidoIndex = seed % apellidos.length;

    return {
      cedula: '', // Los pasaportes no tienen cédula asociada necesariamente
      nombre: nombres[nombreIndex].split(' ')[0],
      apellidos: apellidos[apellidoIndex],
      nombreCompleto: `${nombres[nombreIndex]} ${apellidos[apellidoIndex]}`,
      nacionalidad: 'Dominicana',
      estado: 'activo',
      foto: `https://picsum.photos/200/250?random=${seed}`,
    };
  }

  /**
   * Validar formato de cédula dominicana
   */
  validarCedula(cedula: string): boolean {
    const cedulaLimpia = cedula.replace(/\D/g, '');
    
    if (cedulaLimpia.length !== 11) {
      return false;
    }

    // Algoritmo de validación de cédula dominicana
    const digitos = cedulaLimpia.split('').map(Number);
    const multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      let producto = digitos[i] * multiplicadores[i];
      if (producto > 9) {
        producto = Math.floor(producto / 10) + (producto % 10);
      }
      suma += producto;
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    return digitoVerificador === digitos[10];
  }

  /**
   * Validar formato de RNC dominicano
   */
  validarRNC(rnc: string): boolean {
    const rncLimpio = rnc.replace(/\D/g, '');
    return rncLimpio.length === 9 || rncLimpio.length === 11;
  }
}

export default new ConsultaOficialService();