#!/usr/bin/env node

/**
 * Script mejorado de migración completa del sistema viejo
 * Migra todos los datos del sistema anterior a MongoDB
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Importar modelos del nuevo sistema
const Usuario = require('../backend/models/Usuario');
const Cliente = require('../backend/models/Cliente');
const Prestamo = require('../backend/models/Prestamo');
const Cobro = require('../backend/models/Cobro');

async function conectarBD() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
}

function extraerDatosDeSQL() {
    console.log('📖 Leyendo datos del archivo SQL...');
    
    const sqlPath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamos.sql';
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Extraer datos de clientes con regex mejorada
    const clientesMatch = sqlContent.match(/INSERT INTO `clientes` VALUES (.*?);/s);
    let clientes = [];
    
    if (clientesMatch) {
        const clientesData = clientesMatch[1];
        console.log('📏 Longitud de datos de clientes:', clientesData.length);
        
        // Dividir por '),(' más cuidadosamente
        const registros = clientesData.split(/\),\(/);
        
        registros.forEach((registro, index) => {
            try {
                // Limpiar paréntesis
                registro = registro.replace(/^\(/, '').replace(/\)$/, '');
                
                // Dividir en campos usando una regex más precisa
                const campos = [];
                let campo = '';
                let enComillas = false;
                let tipoComilla = '';
                let nivel = 0;
                
                for (let i = 0; i < registro.length; i++) {
                    const char = registro[i];
                    
                    if (!enComillas && (char === '"' || char === "'")) {
                        enComillas = true;
                        tipoComilla = char;
                        campo += char;
                    } else if (enComillas && char === tipoComilla && registro[i-1] !== '\\') {
                        enComillas = false;
                        campo += char;
                    } else if (!enComillas && char === ',' && nivel === 0) {
                        campos.push(campo.trim());
                        campo = '';
                    } else {
                        campo += char;
                        if (!enComillas) {
                            if (char === '(') nivel++;
                            if (char === ')') nivel--;
                        }
                    }
                }
                
                // Agregar el último campo
                if (campo) {
                    campos.push(campo.trim());
                }
                
                if (campos.length >= 18) {
                    const cliente = {
                        id: parseInt(campos[0]),
                        nombre: limpiarTexto(campos[1]),
                        email: limpiarTexto(campos[2]),
                        telefono: limpiarTexto(campos[3]),
                        direccion: limpiarTexto(campos[4]),
                        ciudad: parseInt(campos[5]) || 1201,
                        nota: limpiarTexto(campos[6]),
                        fecha_registro: parseInt(campos[7]),
                        usuario_id: parseInt(campos[8]),
                        status: parseInt(campos[9]),
                        ruta: parseInt(campos[10]),
                        cedula: limpiarTexto(campos[11]),
                        telefono2: limpiarTexto(campos[12]),
                        referencias: limpiarTexto(campos[13]),
                        cobrador_id: parseInt(campos[14]) || null,
                        acceso: parseInt(campos[15]) || 0,
                        usuario: limpiarTexto(campos[16]),
                        password: limpiarTexto(campos[17])
                    };
                    
                    clientes.push(cliente);
                }
            } catch (error) {
                console.warn(`⚠️  Error procesando cliente ${index}:`, error.message);
            }
        });
    }
    
    // Extraer datos de cobradores
    const cobradoresMatch = sqlContent.match(/INSERT INTO `cobradores` VALUES (.*?);/s);
    let cobradores = [];
    
    if (cobradoresMatch) {
        const cobradoresData = cobradoresMatch[1];
        const registros = cobradoresData.split(/\),\(/);
        
        registros.forEach(registro => {
            registro = registro.replace(/^\(/, '').replace(/\)$/, '');
            const campos = registro.split(',');
            
            if (campos.length >= 13) {
                cobradores.push({
                    id: parseInt(campos[0]),
                    nombre: limpiarTexto(campos[1]),
                    direccion: limpiarTexto(campos[2]),
                    telefono: limpiarTexto(campos[3]),
                    cedula: limpiarTexto(campos[4]),
                    usuario: limpiarTexto(campos[5]),
                    password: limpiarTexto(campos[6]),
                    status: parseInt(campos[7]),
                    usuario_id: parseInt(campos[8]),
                    datetime: parseInt(campos[9]),
                    fecha_registro: limpiarTexto(campos[10]),
                    email: limpiarTexto(campos[11]),
                    permisos: limpiarTexto(campos[12])
                });
            }
        });
    }
    
    // Extraer datos de préstamos
    const prestamosMatch = sqlContent.match(/INSERT INTO `prestamos` VALUES (.*?);/s);
    let prestamos = [];
    
    if (prestamosMatch) {
        const prestamosData = prestamosMatch[1];
        const registros = prestamosData.split(/\),\(/);
        
        registros.forEach(registro => {
            registro = registro.replace(/^\(/, '').replace(/\)$/, '');
            const campos = registro.split(',');
            
            if (campos.length >= 21) {
                prestamos.push({
                    id: parseInt(campos[0]),
                    cliente_id: parseInt(campos[1]),
                    acreedor_id: parseInt(campos[2]),
                    fecha: limpiarTexto(campos[3]),
                    fecha_inicio: limpiarTexto(campos[4]),
                    dias_pago: parseInt(campos[5]),
                    total: parseFloat(campos[6]),
                    status: parseInt(campos[7]),
                    saldado: parseInt(campos[8]),
                    nota: limpiarTexto(campos[9]),
                    monto_cuotas: parseFloat(campos[10]),
                    total_cuotas: parseInt(campos[11]),
                    porc_interes: parseFloat(campos[12]),
                    porc_mora: parseFloat(campos[13]),
                    proroga: parseInt(campos[14]),
                    fecha_revision: limpiarTexto(campos[15]),
                    dias_vencimiento: parseInt(campos[16]),
                    interes_calculado: parseFloat(campos[17]),
                    codigo: limpiarTexto(campos[18]),
                    tipo: parseInt(campos[19]),
                    garantias: limpiarTexto(campos[20])
                });
            }
        });
    }
    
    console.log(`📊 Datos extraídos:`);
    console.log(`   👥 Clientes: ${clientes.length}`);
    console.log(`   🏃 Cobradores: ${cobradores.length}`);
    console.log(`   💰 Préstamos: ${prestamos.length}`);
    
    return { clientes, cobradores, prestamos };
}

function limpiarTexto(texto) {
    if (!texto) return '';
    
    // Remover comillas
    texto = texto.replace(/^['"]|['"]$/g, '');
    
    // Decodificar entidades HTML
    texto = texto.replace(/&aacute;/g, 'á');
    texto = texto.replace(/&eacute;/g, 'é');
    texto = texto.replace(/&iacute;/g, 'í');
    texto = texto.replace(/&oacute;/g, 'ó');
    texto = texto.replace(/&uacute;/g, 'ú');
    texto = texto.replace(/&ntilde;/g, 'ñ');
    
    return texto.trim();
}

async function crearUsuariosBase() {
    console.log('\n👤 Creando usuarios base del sistema...');
    
    const usuarios = [
        {
            nombre: 'Administrador Sistema',
            email: 'admin@demo.com',
            password: await bcrypt.hash('admin123', 10),
            rol: 'admin',
            activo: true
        },
        {
            nombre: 'Cobrador Demo',
            email: 'cobrador@demo.com',
            password: await bcrypt.hash('cobrador123', 10),
            rol: 'cobrador',
            activo: true
        }
    ];

    const usuariosCreados = [];
    
    for (const userData of usuarios) {
        const existeUsuario = await Usuario.findOne({ email: userData.email });
        if (!existeUsuario) {
            const nuevoUsuario = new Usuario(userData);
            await nuevoUsuario.save();
            usuariosCreados.push(nuevoUsuario);
            console.log(`✅ Usuario creado: ${userData.nombre} (${userData.email})`);
        } else {
            usuariosCreados.push(existeUsuario);
            console.log(`⚠️  Usuario ya existe: ${userData.email}`);
        }
    }
    
    return usuariosCreados;
}

async function crearCobradoresDelSistemaViejo(cobradores, usuarioAdmin) {
    console.log('\n🏃 Creando cobradores del sistema viejo...');
    
    const cobradoresCreados = [];
    
    for (const oldCobrador of cobradores) {
        const email = `${oldCobrador.usuario}@demo.com`;
        const existeUsuario = await Usuario.findOne({ email });
        
        if (!existeUsuario) {
            const nuevoCobrador = new Usuario({
                nombre: oldCobrador.nombre,
                email: email,
                password: await bcrypt.hash(oldCobrador.password || '1234', 10),
                rol: 'cobrador',
                telefono: oldCobrador.telefono,
                direccion: oldCobrador.direccion,
                cedula: oldCobrador.cedula,
                activo: oldCobrador.status === 1,
                fechaRegistro: oldCobrador.fecha_registro ? new Date(oldCobrador.fecha_registro) : new Date(),
                creadoPor: usuarioAdmin._id
            });
            
            await nuevoCobrador.save();
            cobradoresCreados.push(nuevoCobrador);
            console.log(`✅ Cobrador creado: ${oldCobrador.nombre} (${email})`);
        } else {
            cobradoresCreados.push(existeUsuario);
            console.log(`⚠️  Cobrador ya existe: ${email}`);
        }
    }
    
    return cobradoresCreados;
}

async function migrarClientes(clientes, usuarioAdmin) {
    console.log('\n👥 Migrando clientes del sistema viejo...');
    
    const clientesMigrados = [];
    let contador = 0;
    
    for (const oldCliente of clientes) {
        try {
            const existeCliente = await Cliente.findOne({ 
                $or: [
                    { cedula: oldCliente.cedula },
                    { telefono: oldCliente.telefono }
                ]
            });
            
            if (!existeCliente && oldCliente.cedula && oldCliente.nombre) {
                // Procesar referencias
                let referencias = [];
                if (oldCliente.referencias && oldCliente.referencias !== 'null') {
                    try {
                        const refsData = JSON.parse(oldCliente.referencias);
                        if (Array.isArray(refsData)) {
                            referencias = refsData.map(ref => ({
                                nombre: ref.name || 'Sin nombre',
                                telefono: ref.tel || '',
                                relacion: ref.tipo || 'Conocido'
                            }));
                        }
                    } catch (e) {
                        // Si no es JSON válido, crear referencia básica
                        referencias = [{
                            nombre: 'Referencia importada',
                            telefono: oldCliente.telefono2 || '',
                            relacion: 'Familiar'
                        }];
                    }
                }
                
                const nuevoCliente = new Cliente({
                    nombre: oldCliente.nombre,
                    cedula: oldCliente.cedula,
                    telefono: oldCliente.telefono,
                    telefono2: oldCliente.telefono2 || '',
                    email: oldCliente.email.trim() || `cliente${oldCliente.id}@demo.com`,
                    direccion: oldCliente.direccion || 'Dirección no especificada',
                    ocupacion: oldCliente.nota || 'No especificada',
                    ingresos: 25000, // Valor por defecto estimado
                    referencias: referencias,
                    notas: `Cliente migrado del sistema anterior - ID original: ${oldCliente.id}`,
                    activo: oldCliente.status === 1,
                    fechaRegistro: new Date(oldCliente.fecha_registro * 1000), // Convertir timestamp
                    creadoPor: usuarioAdmin._id
                });

                await nuevoCliente.save();
                clientesMigrados.push({...nuevoCliente.toObject(), oldId: oldCliente.id});
                contador++;
                
                if (contador % 10 === 0) {
                    console.log(`📈 Progreso: ${contador} clientes migrados...`);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Error migrando cliente ${oldCliente.nombre}:`, error.message);
        }
    }
    
    console.log(`✅ Total clientes migrados: ${contador}`);
    return clientesMigrados;
}

async function migrarPrestamos(prestamos, clientesMigrados, usuarioAdmin) {
    console.log('\n💰 Migrando préstamos del sistema viejo...');
    
    const prestamosMigrados = [];
    let contador = 0;
    
    for (const oldPrestamo of prestamos) {
        try {
            // Buscar cliente correspondiente
            const clienteMigrado = clientesMigrados.find(c => c.oldId === oldPrestamo.cliente_id);
            
            if (!clienteMigrado) {
                console.warn(`⚠️  No se encontró cliente para préstamo ID: ${oldPrestamo.id}`);
                continue;
            }

            const existePrestamo = await Prestamo.findOne({ 
                codigo: oldPrestamo.codigo 
            });
            
            if (!existePrestamo && oldPrestamo.codigo) {
                // Determinar estado del préstamo
                let estado = 'activo';
                if (oldPrestamo.saldado === 1) {
                    estado = 'completado';
                } else if (oldPrestamo.status === 0) {
                    estado = 'vencido';
                }

                // Determinar frecuencia de pago
                let frecuencia = 'semanal';
                if (oldPrestamo.dias_pago === 30) frecuencia = 'mensual';
                else if (oldPrestamo.dias_pago === 15) frecuencia = 'quincenal';
                else if (oldPrestamo.dias_pago === 1) frecuencia = 'diario';

                const nuevoPrestamo = new Prestamo({
                    cliente: clienteMigrado._id,
                    monto: oldPrestamo.total || 0,
                    interes: oldPrestamo.interes_calculado || 30,
                    plazo: oldPrestamo.total_cuotas || 10,
                    frecuenciaPago: frecuencia,
                    fechaInicio: new Date(oldPrestamo.fecha_inicio) || new Date(),
                    fechaVencimiento: new Date(oldPrestamo.fecha) || new Date(),
                    montoCuota: oldPrestamo.monto_cuotas || 0,
                    montoTotal: oldPrestamo.total || 0,
                    estado: estado,
                    codigo: oldPrestamo.codigo,
                    notas: `Préstamo migrado - ID original: ${oldPrestamo.id}. ${oldPrestamo.nota || ''}`,
                    creadoPor: usuarioAdmin._id,
                    fechaCreacion: new Date(oldPrestamo.fecha_inicio) || new Date()
                });

                await nuevoPrestamo.save();
                prestamosMigrados.push(nuevoPrestamo);
                contador++;
                
                if (contador % 10 === 0) {
                    console.log(`📈 Progreso: ${contador} préstamos migrados...`);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Error migrando préstamo ${oldPrestamo.codigo}:`, error.message);
        }
    }
    
    console.log(`✅ Total préstamos migrados: ${contador}`);
    return prestamosMigrados;
}

async function mostrarResumenFinal() {
    console.log('\n📊 RESUMEN FINAL DE MIGRACIÓN');
    console.log('==============================');
    
    const stats = {
        usuarios: await Usuario.countDocuments(),
        clientes: await Cliente.countDocuments(),
        prestamos: await Prestamo.countDocuments(),
        cobros: await Cobro.countDocuments()
    };
    
    console.log(`👤 Usuarios: ${stats.usuarios}`);
    console.log(`👥 Clientes: ${stats.clientes}`);
    console.log(`💰 Préstamos: ${stats.prestamos}`);
    console.log(`💵 Cobros: ${stats.cobros}`);
    
    // Estadísticas adicionales
    const prestamosActivos = await Prestamo.countDocuments({ estado: 'activo' });
    const prestamosCompletados = await Prestamo.countDocuments({ estado: 'completado' });
    const prestamosVencidos = await Prestamo.countDocuments({ estado: 'vencido' });
    
    console.log('\n📈 Estadísticas de préstamos:');
    console.log(`   🟢 Activos: ${prestamosActivos}`);
    console.log(`   ✅ Completados: ${prestamosCompletados}`);
    console.log(`   🔴 Vencidos: ${prestamosVencidos}`);
    
    // Mostrar algunos ejemplos
    const clienteEjemplo = await Cliente.findOne().populate('creadoPor', 'nombre');
    const prestamoEjemplo = await Prestamo.findOne().populate('cliente', 'nombre');
    
    if (clienteEjemplo) {
        console.log('\n👤 Ejemplo de cliente migrado:');
        console.log(`   Nombre: ${clienteEjemplo.nombre}`);
        console.log(`   Teléfono: ${clienteEjemplo.telefono}`);
        console.log(`   Dirección: ${clienteEjemplo.direccion}`);
    }
    
    if (prestamoEjemplo) {
        console.log('\n💰 Ejemplo de préstamo migrado:');
        console.log(`   Código: ${prestamoEjemplo.codigo}`);
        console.log(`   Cliente: ${prestamoEjemplo.cliente.nombre}`);
        console.log(`   Monto: $${prestamoEjemplo.monto.toLocaleString()}`);
        console.log(`   Estado: ${prestamoEjemplo.estado}`);
    }
    
    return stats;
}

async function main() {
    console.log('🚀 INICIANDO MIGRACIÓN COMPLETA DEL SISTEMA VIEJO');
    console.log('==================================================');
    
    try {
        await conectarBD();
        
        // 1. Extraer datos del SQL
        const datos = extraerDatosDeSQL();
        
        // 2. Crear usuarios base
        const usuarios = await crearUsuariosBase();
        const usuarioAdmin = usuarios.find(u => u.rol === 'admin');
        
        // 3. Crear cobradores del sistema viejo
        await crearCobradoresDelSistemaViejo(datos.cobradores, usuarioAdmin);
        
        // 4. Migrar clientes
        const clientesMigrados = await migrarClientes(datos.clientes, usuarioAdmin);
        
        // 5. Migrar préstamos
        await migrarPrestamos(datos.prestamos, clientesMigrados, usuarioAdmin);
        
        // 6. Mostrar resumen final
        const stats = await mostrarResumenFinal();
        
        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('\n🔐 Credenciales de acceso:');
        console.log('   Admin: admin@demo.com / admin123');
        console.log('   Cobrador: cobrador@demo.com / cobrador123');
        
        // Credenciales de cobradores del sistema viejo
        for (const cobrador of datos.cobradores) {
            console.log(`   Cobrador: ${cobrador.usuario}@demo.com / ${cobrador.password || '1234'}`);
        }
        
        console.log(`\n📊 Resumen: ${stats.clientes} clientes y ${stats.prestamos} préstamos migrados`);
        
    } catch (error) {
        console.error('\n❌ ERROR EN LA MIGRACIÓN:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
    main();
}

module.exports = { main };