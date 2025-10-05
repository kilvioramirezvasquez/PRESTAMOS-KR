const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Modelos
const Cliente = require('../models/Cliente');  
const Prestamo = require('../models/Prestamo');
const Usuario = require('../models/Usuario');
const Cobro = require('../models/Cobro');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/prestasy-kr');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión MongoDB:'));
db.once('open', () => {
    console.log('✅ Conectado a MongoDB');
    iniciarMigration();
});

// Función para leer archivo SQL
function leerArchivoSQL(rutaArchivo) {
    try {
        const contenido = fs.readFileSync(rutaArchivo, 'utf8');
        return contenido;
    } catch (error) {
        console.error('❌ Error al leer archivo SQL:', error);
        return null;
    }
}

// Función para parsear clientes desde SQL
function parseClientesFromSQL(contenidoSQL) {
    const regex = /INSERT INTO `clientes` VALUES (.+);/;
    const match = contenidoSQL.match(regex);
    
    if (!match) {
        console.log('❌ No se encontró INSERT de clientes');
        return [];
    }
    
    const valuesString = match[1];
    console.log('📝 Parseando valores de clientes...');
    
    // Dividir por '),(' para separar registros
    const registros = valuesString.split('),(');
    const clientes = [];
    
    registros.forEach((registro, index) => {
        try {
            // Limpiar el registro
            let cleanRegistro = registro;
            if (index === 0) cleanRegistro = cleanRegistro.replace(/^\(/, ''); // Remover ( inicial
            if (index === registros.length - 1) cleanRegistro = cleanRegistro.replace(/\)$/, ''); // Remover ) final
            
            // Parsear campos con expresión regular más robusta
            const campos = [];
            let campo = '';
            let enComillas = false;
            let escapeNext = false;
            
            for (let i = 0; i < cleanRegistro.length; i++) {
                const char = cleanRegistro[i];
                
                if (escapeNext) {
                    campo += char;
                    escapeNext = false;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    campo += char;
                    continue;
                }
                
                if (char === "'" && !escapeNext) {
                    enComillas = !enComillas;
                    campo += char;
                    continue;
                }
                
                if (char === ',' && !enComillas) {
                    campos.push(campo.trim());
                    campo = '';
                    continue;
                }
                
                campo += char;
            }
            
            // Agregar último campo
            if (campo.trim()) {
                campos.push(campo.trim());
            }
            
            if (campos.length >= 8) { // Mínimo campos necesarios
                // Función para limpiar strings
                const limpiarString = (str) => {
                    if (!str || str === 'null') return '';
                    return str.replace(/^'|'$/g, '').replace(/\\'/g, "'");
                };
                
                const cedula = limpiarString(campos[11]);
                
                // Solo procesar si hay cédula válida
                if (cedula && cedula !== '00000000000' && cedula !== '') {
                    const cliente = {
                        nombre: limpiarString(campos[1]) || 'Sin nombre',
                        email: limpiarString(campos[2]) || `cliente${campos[0]}@email.com`, // Email por defecto
                        telefono: limpiarString(campos[3]) || '',
                        direccion: limpiarString(campos[4]) || '',
                        sucursal: parseInt(campos[5]) || 1201,
                        trabajo: limpiarString(campos[6]) || '',
                        fechaRegistro: new Date(parseInt(campos[7]) * 1000) || new Date(),
                        activo: parseInt(campos[9]) === 1,
                        cedula: cedula,
                        telefono2: limpiarString(campos[12]) || '',
                        referencias: limpiarString(campos[13]) || 'null',
                        clienteId: parseInt(campos[0])
                    };
                    
                    clientes.push(cliente);
                }
            }
        } catch (error) {
            console.error(`❌ Error parseando cliente ${index + 1}:`, error.message);
        }
    });
    
    console.log(`✅ Parseados ${clientes.length} clientes`);
    return clientes;
}

// Función para parsear préstamos desde SQL
function parsePrestamosFromSQL(contenidoSQL) {
    const regex = /INSERT INTO `prestamos` VALUES (.+);/;
    const match = contenidoSQL.match(regex);
    
    if (!match) {
        console.log('❌ No se encontró INSERT de préstamos');
        return [];
    }
    
    const valuesString = match[1];
    console.log('📝 Parseando valores de préstamos...');
    
    // Dividir por '),(' para separar registros
    const registros = valuesString.split('),(');
    const prestamos = [];
    
    registros.forEach((registro, index) => {
        try {
            // Limpiar el registro
            let cleanRegistro = registro;
            if (index === 0) cleanRegistro = cleanRegistro.replace(/^\(/, '');
            if (index === registros.length - 1) cleanRegistro = cleanRegistro.replace(/\)$/, '');
            
            // Parsear campos con expresión regular más robusta
            const campos = [];
            let campo = '';
            let enComillas = false;
            let escapeNext = false;
            
            for (let i = 0; i < cleanRegistro.length; i++) {
                const char = cleanRegistro[i];
                
                if (escapeNext) {
                    campo += char;
                    escapeNext = false;
                    continue;
                }
                
                if (char === '\\') {
                    escapeNext = true;
                    campo += char;
                    continue;
                }
                
                if (char === "'" && !escapeNext) {
                    enComillas = !enComillas;
                    campo += char;
                    continue;
                }
                
                if (char === ',' && !enComillas) {
                    campos.push(campo.trim());
                    campo = '';
                    continue;
                }
                
                campo += char;
            }
            
            // Agregar último campo
            if (campo.trim()) {
                campos.push(campo.trim());
            }
            
            if (campos.length >= 15) { // Mínimo campos necesarios
                // Función para limpiar strings
                const limpiarString = (str) => {
                    if (!str || str === 'null') return '';
                    return str.replace(/^'|'$/g, '').replace(/\\'/g, "'");
                };
                
                const monto = parseFloat(campos[6]) || 0;
                const cuotaDiaria = parseFloat(campos[10]) || 0;
                const dias = parseInt(campos[11]) || 30;
                const interes = parseFloat(campos[17]) || 30;
                
                // Convertir a estructura esperada por el modelo actual
                const cuotas = Math.ceil(dias / 7); // Convertir días a semanas
                const montoCuota = cuotaDiaria * 7; // Cuota semanal
                const saldoPendiente = monto + (monto * interes / 100);
                
                const prestamo = {
                    clienteId: parseInt(campos[1]),
                    monto: monto,
                    interes: interes,
                    cuotas: cuotas,
                    montoCuota: montoCuota,
                    saldoPendiente: saldoPendiente,
                    fechaInicio: new Date(campos[3].replace(/'/g, '')),
                    fechaVencimiento: new Date(campos[4].replace(/'/g, '')),
                    estado: parseInt(campos[7]) === 1 ? 'pagado' : 'activo',
                    tipoPrestamo: parseInt(campos[2]) === 0 ? 'capitalizado' : 'capitalizado_fijo',
                    diasPago: 7, // Semanal por defecto
                    observaciones: limpiarString(campos[9]) || '',
                    prestamosId: parseInt(campos[0])
                };
                
                prestamos.push(prestamo);
            }
        } catch (error) {
            console.error(`❌ Error parseando préstamo ${index + 1}:`, error.message);
        }
    });
    
    console.log(`✅ Parseados ${prestamos.length} préstamos`);
    return prestamos;
}

// Función principal de migración
async function iniciarMigration() {
    try {
        console.log('🚀 Iniciando migración completa de datos...');
        
        // Leer archivo SQL
        const rutaSQL = path.join(__dirname, '../../marcos-prestamos/base-datos/prestamos.sql');
        const contenidoSQL = leerArchivoSQL(rutaSQL);
        
        if (!contenidoSQL) {
            console.error('❌ No se pudo leer el archivo SQL');
            process.exit(1);
        }
        
        console.log('📁 Archivo SQL leído correctamente');
        
        // Limpiar colecciones existentes
        console.log('🧹 Limpiando colecciones existentes...');
        await Cliente.deleteMany({});
        await Prestamo.deleteMany({});
        await Cobro.deleteMany({});
        console.log('✅ Colecciones limpiadas');
        
        // Parsear datos
        const clientesData = parseClientesFromSQL(contenidoSQL);
        const prestamosData = parsePrestamosFromSQL(contenidoSQL);
        
        if (clientesData.length === 0 || prestamosData.length === 0) {
            console.error('❌ No se pudieron parsear los datos');
            process.exit(1);
        }
        
        // Migrar clientes
        console.log('👥 Migrando clientes...');
        const clientesMap = {};
        
        for (const clienteData of clientesData) {
            try {
                const nuevoCliente = new Cliente({
                    nombre: clienteData.nombre,
                    email: clienteData.email,
                    cedula: clienteData.cedula,
                    telefono: clienteData.telefono,
                    telefono2: clienteData.telefono2,
                    direccion: clienteData.direccion,
                    trabajo: clienteData.trabajo,
                    fechaRegistro: clienteData.fechaRegistro,
                    activo: clienteData.activo,
                    referencias: clienteData.referencias !== 'null' ? 
                        (clienteData.referencias.startsWith('[') ? JSON.parse(clienteData.referencias) : []) : []
                });
                
                const clienteGuardado = await nuevoCliente.save();
                clientesMap[clienteData.clienteId] = clienteGuardado._id;
            } catch (error) {
                console.error(`❌ Error guardando cliente ${clienteData.nombre}:`, error.message);
            }
        }
        
        console.log(`✅ ${Object.keys(clientesMap).length} clientes migrados`);
        
        // Migrar préstamos
        console.log('💰 Migrando préstamos...');
        let prestamosMigrados = 0;
        
        for (const prestamoData of prestamosData) {
            try {
                const clienteMongoId = clientesMap[prestamoData.clienteId];
                
                if (!clienteMongoId) {
                    console.warn(`⚠️ Cliente no encontrado para préstamo ${prestamoData.prestamosId}`);
                    continue;
                }
                
                const nuevoPrestamo = new Prestamo({
                    cliente: clienteMongoId,
                    monto: prestamoData.monto,
                    cuotaDiaria: prestamoData.cuotaDiaria,
                    dias: prestamoData.dias,
                    totalAPagar: prestamoData.totalAPagar,
                    fechaInicio: prestamoData.fechaInicio,
                    fechaVencimiento: prestamoData.fechaVencimiento,
                    tasaInteres: prestamoData.tasaInteres,
                    estado: prestamoData.estado,
                    tipo: prestamoData.tipo,
                    notas: prestamoData.notas,
                    codigo: prestamoData.codigo
                });
                
                await nuevoPrestamo.save();
                prestamosMigrados++;
            } catch (error) {
                console.error(`❌ Error guardando préstamo ${prestamoData.prestamosId}:`, error.message);
            }
        }
        
        console.log(`✅ ${prestamosMigrados} préstamos migrados`);
        
        // Crear usuarios por defecto
        console.log('👤 Creando usuarios por defecto...');
        
        const usuarios = [
            {
                usuario: 'admin',
                password: '741741',
                nombre: 'Administrador',
                rol: 'admin',
                activo: true
            },
            {
                usuario: 'miguel',
                password: 'miguel',
                nombre: 'Miguel',
                rol: 'cobrador',
                activo: true
            },
            {
                usuario: 'juan',
                password: 'juan123',
                nombre: 'Juan',
                rol: 'cobrador',
                activo: true
            }
        ];
        
        for (const userData of usuarios) {
            try {
                const usuarioExistente = await Usuario.findOne({ usuario: userData.usuario });
                if (!usuarioExistente) {
                    const hashedPassword = await bcrypt.hash(userData.password, 10);
                    const nuevoUsuario = new Usuario({
                        usuario: userData.usuario,
                        password: hashedPassword,
                        nombre: userData.nombre,
                        rol: userData.rol,
                        activo: userData.activo
                    });
                    await nuevoUsuario.save();
                    console.log(`✅ Usuario ${userData.usuario} creado`);
                }
            } catch (error) {
                console.error(`❌ Error creando usuario ${userData.usuario}:`, error.message);
            }
        }
        
        // Resumen final
        const totalClientes = await Cliente.countDocuments();
        const totalPrestamos = await Prestamo.countDocuments();
        const totalUsuarios = await Usuario.countDocuments();
        
        console.log('\n🎉 MIGRACIÓN COMPLETADA 🎉');
        console.log('==============================');
        console.log(`👥 Clientes migrados: ${totalClientes}`);
        console.log(`💰 Préstamos migrados: ${totalPrestamos}`);
        console.log(`👤 Usuarios creados: ${totalUsuarios}`);
        console.log('==============================');
        
        // Calcular estadísticas
        const prestamosActivos = await Prestamo.countDocuments({ estado: 'activo' });
        const totalMonto = await Prestamo.aggregate([
            { $group: { _id: null, total: { $sum: '$monto' } } }
        ]);
        const totalACobrar = await Prestamo.aggregate([
            { $match: { estado: 'activo' } },
            { $group: { _id: null, total: { $sum: '$totalAPagar' } } }
        ]);
        
        console.log(`📊 Préstamos activos: ${prestamosActivos}`);
        console.log(`💵 Total prestado: $${totalMonto[0]?.total.toLocaleString() || 0}`);
        console.log(`💰 Total a cobrar: $${totalACobrar[0]?.total.toLocaleString() || 0}`);
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
}