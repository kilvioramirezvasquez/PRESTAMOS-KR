const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Configuración de conexión a la base de datos del sistema anterior
const oldSystemConfig = {
  host: process.env.OLD_DB_HOST || 'localhost',
  user: process.env.OLD_DB_USER || 'root',
  password: process.env.OLD_DB_PASSWORD || '',
  database: process.env.OLD_DB_NAME || 'prestamos',
  charset: 'utf8mb4'
};

/**
 * Consultar cliente por cédula en el sistema anterior
 */
router.get('/consulta-cedula-local/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    
    // Limpiar formato de cédula
    const cedulaLimpia = cedula.replace(/\D/g, '');
    
    if (!cedulaLimpia || cedulaLimpia.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Formato de cédula inválido'
      });
    }

    // Conectar a la base de datos del sistema anterior
    let connection;
    try {
      connection = await mysql.createConnection(oldSystemConfig);
    } catch (dbError) {
      console.log('No se pudo conectar al sistema anterior, usando datos simulados');
      
      // Si no hay conexión, usar datos simulados basados en cédula
      const datosSimulados = simularDatosCedula(cedulaLimpia);
      return res.json({
        found: !!datosSimulados,
        source: 'simulado',
        ...datosSimulados
      });
    }

    // Buscar cliente por cédula (con diferentes formatos)
    const [rows] = await connection.execute(`
      SELECT 
        id,
        name as nombre,
        cedula,
        telefono,
        tel2,
        direccion,
        email,
        date_reg,
        status,
        nota,
        referencias
      FROM clientes 
      WHERE REPLACE(REPLACE(REPLACE(cedula, '-', ''), ' ', ''), '.', '') LIKE ? 
         OR cedula LIKE ?
         OR cedula LIKE ?
      LIMIT 1
    `, [
      `%${cedulaLimpia}%`,
      `%${cedula}%`,
      `%${cedulaLimpia.substring(0, 3)}-${cedulaLimpia.substring(3, 10)}-${cedulaLimpia.substring(10)}%`
    ]);

    await connection.end();

    if (rows.length > 0) {
      const cliente = rows[0];
      
      // Formatear datos para el frontend
      const datosFormateados = {
        found: true,
        source: 'sistema_anterior',
        id: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula || cedulaLimpia,
        telefono: cliente.telefono || cliente.tel2 || '',
        direccion: cliente.direccion || '',
        email: cliente.email || '',
        notas: cliente.nota || '',
        referencias: cliente.referencias !== 'null' ? cliente.referencias : '',
        fechaRegistro: cliente.date_reg,
        estado: cliente.status === 1 ? 'activo' : 'inactivo'
      };

      res.json(datosFormateados);
    } else {
      // No encontrado en sistema anterior, devolver datos simulados
      const datosSimulados = simularDatosCedula(cedulaLimpia);
      res.json({
        found: !!datosSimulados,
        source: 'simulado',
        ...datosSimulados
      });
    }

  } catch (error) {
    console.error('Error consultando cédula local:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Simular datos basados en cédula cuando no hay conexión a BD anterior
 */
function simularDatosCedula(cedula) {
  if (!cedula || cedula.length < 8) return null;

  const nombres = [
    'Juan Carlos', 'María Elena', 'Pedro Luis', 'Ana Isabel', 'José Miguel',
    'Carmen Rosa', 'Luis Alberto', 'Rosa María', 'Carlos Eduardo', 'Isabel Cristina',
    'Miguel Ángel', 'Patricia Elena', 'Rafael Antonio', 'Gloria Mercedes', 'Francisco Javier'
  ];

  const apellidos = [
    'García López', 'Martínez Pérez', 'Rodríguez González', 'Hernández Díaz', 'López Martínez',
    'González Sánchez', 'Pérez Rodríguez', 'Sánchez Hernández', 'Díaz López', 'Martín García',
    'Jiménez Morales', 'Ruiz Castillo', 'Moreno Silva', 'Muñoz Torres', 'Romero Vargas'
  ];

  const calles = [
    'Calle Principal', 'Avenida Independencia', 'Calle Juan Pablo Duarte', 
    'Avenida 27 de Febrero', 'Calle Máximo Gómez', 'Avenida Abraham Lincoln',
    'Calle José Martí', 'Avenida Winston Churchill', 'Calle Gregorio Luperón'
  ];

  const sectores = [
    'Villa Hermosa', 'Villa Caoba', 'Don Juan', 'Pica Piedra', 'Villa España',
    'San Carlos', 'Quisqueya', 'Villa Pereyra', 'El Tamarindo', 'Villa Real'
  ];

  // Generar índices basados en la cédula para consistencia
  const seed = parseInt(cedula.substring(0, 4)) || 1;
  const nombreIndex = seed % nombres.length;
  const apellidoIndex = (seed * 2) % apellidos.length;
  const calleIndex = seed % calles.length;
  const sectorIndex = (seed * 3) % sectores.length;

  // Generar teléfono basado en cédula
  const telefonos = ['809', '829', '849'];
  const operadora = telefonos[seed % telefonos.length];
  const numero = String(seed).padStart(7, '0').substring(0, 7);

  return {
    nombre: `${nombres[nombreIndex]} ${apellidos[apellidoIndex]}`,
    cedula: formatearCedula(cedula),
    telefono: `${operadora}-${numero.substring(0, 3)}-${numero.substring(3, 7)}`,
    direccion: `${calles[calleIndex]} #${(seed % 99) + 1}, ${sectores[sectorIndex]}`,
    email: '',
    notas: 'Cliente simulado - Verificar datos',
    referencias: '',
    estado: 'activo'
  };
}

/**
 * Formatear cédula al formato estándar XXX-XXXXXXX-X
 */
function formatearCedula(cedula) {
  const limpia = cedula.replace(/\D/g, '');
  if (limpia.length === 11) {
    return `${limpia.substring(0, 3)}-${limpia.substring(3, 10)}-${limpia.substring(10)}`;
  }
  return cedula;
}

module.exports = router;