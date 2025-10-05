#!/usr/bin/env node

/**
 * Script de migración de datos del sistema viejo de préstamos
 * Convierte datos MySQL del sistema anterior a MongoDB para el nuevo sistema
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Importar modelos del nuevo sistema
const Usuario = require('../backend/models/Usuario');
const Cliente = require('../backend/models/Cliente');
const Prestamo = require('../backend/models/Prestamo');
const Cobro = require('../backend/models/Cobro');

// Datos extraídos del sistema viejo
const oldClientes = [
    {id: 1, name: 'Fermin Enrique Cruz Santana', email: ' ', telefono: '8098340218', direccion: 'Calle Mauricio Baez #47', ciudad: 1201, nota: 'Ebanista', date_reg: 1590437214, user_id: 0, status: 1, ruta: 1, cedula: '02600856443', tel2: '8098340218', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'fermin', pass: '6443'},
    {id: 2, name: 'William De Jesus Rojas Perez', email: '', telefono: '829-843-6456', direccion: 'Calle 1ra. Ens. Maria Rubio', ciudad: 1201, nota: '', date_reg: 1590438727, user_id: 0, status: 1, ruta: 1, cedula: '026-0103365-3', tel2: '829-843-6456', referencias: 'null', cobrador_id: 0, acceso: 0, user: '', pass: ''},
    {id: 3, name: 'Luis Emilio Cordero Santana', email: '', telefono: '829-850-4748', direccion: '', ciudad: 1201, nota: '', date_reg: 1590438984, user_id: 0, status: 1, ruta: 1, cedula: '001-0273050-4', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 0, user: '', pass: ''},
    {id: 4, name: 'Irma Doris Sanchez Cayetano', email: '', telefono: '809-397-5059', direccion: 'Calle 4ta. #75', ciudad: 1201, nota: '', date_reg: 1590439385, user_id: 0, status: 1, ruta: 1, cedula: '026-0055805-6', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 0, user: '', pass: ''},
    {id: 5, name: 'Luis De La Rosa', email: ' ', telefono: '8294222337', direccion: 'Ruta Piedra Linda ', ciudad: 1201, nota: '', date_reg: 1590439859, user_id: 0, status: 1, ruta: 1, cedula: '02601144849', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'luis', pass: '4849'},
    {id: 6, name: 'Isabel Carreras Santana', email: ' ', telefono: '8094130206', direccion: 'Quisqueya Manzana #23', ciudad: 1201, nota: '', date_reg: 1590439999, user_id: 0, status: 1, ruta: 1, cedula: '02700035369', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'Isabel', pass: '5369'},
    {id: 7, name: 'Joan Manuel Baez', email: ' ', telefono: '8296538519', direccion: 'C Santa Rosa #172 Frente al Julio', ciudad: 1201, nota: '', date_reg: 1590440155, user_id: 0, status: 1, ruta: 1, cedula: '02600777235', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'Joan', pass: '7235'},
    {id: 8, name: 'Benito Peguero', email: ' ', telefono: '8294598489', direccion: 'Anacaona Barrio York #22', ciudad: 1201, nota: '', date_reg: 1590440335, user_id: 0, status: 1, ruta: 1, cedula: '02600463075', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'Benito', pass: '3075'},
    {id: 9, name: 'Pascual Yone Ponceano', email: '', telefono: '8299055855', direccion: 'Ave. Libertad Prox. a Jumbo', ciudad: 1201, nota: '', date_reg: 1590440750, user_id: 0, status: 1, ruta: 1, cedula: '02301029399', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'Pascual', pass: '9399'},
    {id: 10, name: 'Rafael Disney Medina Feliz', email: '', telefono: '8292122616', direccion: 'C/ Hidrante #7 carretera', ciudad: 1201, nota: '', date_reg: 1590440972, user_id: 0, status: 1, ruta: 1, cedula: '00104542378', tel2: '', referencias: 'null', cobrador_id: 0, acceso: 1, user: 'Rafael', pass: '2378'}
    // Agregamos más clientes representativos aquí...
];

const oldCobradores = [
    {id: 1, nombre: 'JUAN BATISTA', direccion: '', telefono: '8494051197', cedula: '', user: 'juan', pass: '1234', status: 1, user_id: 1, datetime: 0, fecha_reg: '2020-05-23 01:15:28', email: '', permisos: ''},
    {id: 2, nombre: 'miguel', direccion: 'los alcarrizos', telefono: '8888888888', cedula: '88888888888', user: 'miguel', pass: '1234', status: 1, user_id: 1, datetime: 0, fecha_reg: '2021-06-11 12:44:38', email: '', permisos: ''}
];

const oldPrestamos = [
    {id: 1, user_id: 1, acreedor_id: 0, fecha: '2020-05-25 00:00:00', fecha_inic: '2020-03-11 00:00:00', dias_pago: 7, total: 20000, status: 0, saldado: 1, nota: '', monto_cuotas: 2000, total_cuotas: 13, porc_interes: 0, porc_mora: 0, proroga: 0, fecha_revision: '0000-00-00 00:00:00', dias_vencimiento: 13, calculo_porc_interes: 30.00, cod: 'B71', type: 1, garantias: 'null'},
    {id: 2, user_id: 2, acreedor_id: 0, fecha: '2020-05-25 00:00:00', fecha_inic: '2020-03-11 00:00:00', dias_pago: 7, total: 25400, status: 0, saldado: 1, nota: '', monto_cuotas: 1954, total_cuotas: 13, porc_interes: 0, porc_mora: 0, proroga: 0, fecha_revision: '0000-00-00 00:00:00', dias_vencimiento: 13, calculo_porc_interes: 0.00, cod: 'N52', type: 1, garantias: 'null'}
];

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

async function crearUsuariosBase() {
    console.log('\n📝 Creando usuarios base...');
    
    const usuarios = [
        {
            nombre: 'Administrador Sistema',
            email: 'admin@demo.com',
            password: await bcrypt.hash('admin123', 10),
            rol: 'admin',
            activo: true
        },
        {
            nombre: 'Juan Batista',
            email: 'juan@demo.com',
            password: await bcrypt.hash('1234', 10),
            rol: 'cobrador',
            activo: true
        },
        {
            nombre: 'Miguel Cobrador',
            email: 'miguel@demo.com',
            password: await bcrypt.hash('1234', 10),
            rol: 'cobrador',
            activo: true
        }
    ];

    for (const userData of usuarios) {
        const existeUsuario = await Usuario.findOne({ email: userData.email });
        if (!existeUsuario) {
            const nuevoUsuario = new Usuario(userData);
            await nuevoUsuario.save();
            console.log(`✅ Usuario creado: ${userData.nombre} (${userData.email})`);
        } else {
            console.log(`⚠️  Usuario ya existe: ${userData.email}`);
        }
    }
}

async function migrarClientes() {
    console.log('\n👥 Migrando clientes...');
    
    // Obtener usuario admin para asignar como creador
    const usuarioAdmin = await Usuario.findOne({ rol: 'admin' });
    
    for (const oldCliente of oldClientes) {
        const existeCliente = await Cliente.findOne({ cedula: oldCliente.cedula });
        
        if (!existeCliente) {
            const nuevoCliente = new Cliente({
                nombre: oldCliente.name,
                cedula: oldCliente.cedula,
                telefono: oldCliente.telefono,
                telefono2: oldCliente.tel2 || '',
                email: oldCliente.email.trim() || `cliente${oldCliente.id}@demo.com`,
                direccion: oldCliente.direccion,
                ocupacion: oldCliente.nota || 'No especificada',
                ingresos: 0, // No disponible en sistema viejo
                referencias: oldCliente.referencias !== 'null' ? 
                    [{ nombre: 'Referencia importada', telefono: '', relacion: 'Conocido' }] : [],
                notas: `Cliente migrado del sistema anterior - ID original: ${oldCliente.id}`,
                activo: oldCliente.status === 1,
                fechaRegistro: new Date(oldCliente.date_reg * 1000), // Convertir timestamp
                creadoPor: usuarioAdmin._id
            });

            await nuevoCliente.save();
            console.log(`✅ Cliente migrado: ${oldCliente.name}`);
        } else {
            console.log(`⚠️  Cliente ya existe: ${oldCliente.name}`);
        }
    }
}

async function migrarCobradores() {
    console.log('\n🏃 Actualizando información de cobradores...');
    
    for (const oldCobrador of oldCobradores) {
        const cobrador = await Usuario.findOne({ 
            $or: [
                { email: `${oldCobrador.user}@demo.com` },
                { nombre: { $regex: oldCobrador.nombre, $options: 'i' } }
            ]
        });
        
        if (cobrador) {
            // Actualizar información adicional del cobrador
            cobrador.telefono = oldCobrador.telefono;
            cobrador.direccion = oldCobrador.direccion;
            cobrador.cedula = oldCobrador.cedula;
            cobrador.fechaRegistro = new Date(oldCobrador.fecha_reg);
            
            await cobrador.save();
            console.log(`✅ Información de cobrador actualizada: ${oldCobrador.nombre}`);
        }
    }
}

async function migrarPrestamos() {
    console.log('\n💰 Migrando préstamos...');
    
    const usuarioAdmin = await Usuario.findOne({ rol: 'admin' });
    
    for (const oldPrestamo of oldPrestamos) {
        // Buscar cliente correspondiente
        const cliente = await Cliente.findOne({ 
            $or: [
                { 'notas': { $regex: `ID original: ${oldPrestamo.user_id}` } },
                { cedula: { $exists: true } }
            ]
        }).limit(1);
        
        if (!cliente) {
            console.log(`⚠️  No se encontró cliente para préstamo ID: ${oldPrestamo.id}`);
            continue;
        }

        const existePrestamo = await Prestamo.findOne({ 
            codigo: oldPrestamo.cod 
        });
        
        if (!existePrestamo) {
            // Calcular estado basado en datos viejos
            let estado = 'activo';
            if (oldPrestamo.saldado === 1) {
                estado = 'completado';
            } else if (oldPrestamo.status === 0) {
                estado = 'vencido';
            }

            const nuevoPrestamo = new Prestamo({
                cliente: cliente._id,
                monto: oldPrestamo.total,
                interes: oldPrestamo.calculo_porc_interes || 30,
                plazo: oldPrestamo.total_cuotas,
                frecuenciaPago: 'semanal', // Basado en dias_pago: 7
                fechaInicio: new Date(oldPrestamo.fecha_inic),
                fechaVencimiento: new Date(oldPrestamo.fecha),
                montoCuota: oldPrestamo.monto_cuotas,
                montoTotal: oldPrestamo.total,
                estado: estado,
                codigo: oldPrestamo.cod,
                notas: `Préstamo migrado del sistema anterior - ID original: ${oldPrestamo.id}`,
                creadoPor: usuarioAdmin._id,
                fechaCreacion: new Date(oldPrestamo.fecha_inic)
            });

            await nuevoPrestamo.save();
            console.log(`✅ Préstamo migrado: ${oldPrestamo.cod} - Cliente: ${cliente.nombre}`);
            
            // Crear cobros históricos si el préstamo está completado
            if (estado === 'completado') {
                await crearCobrosHistoricos(nuevoPrestamo, oldPrestamo, usuarioAdmin._id);
            }
        } else {
            console.log(`⚠️  Préstamo ya existe: ${oldPrestamo.cod}`);
        }
    }
}

async function crearCobrosHistoricos(prestamo, oldPrestamo, usuarioId) {
    console.log(`📋 Creando cobros históricos para préstamo: ${prestamo.codigo}`);
    
    const fechaInicio = new Date(prestamo.fechaInicio);
    const montoCuota = prestamo.montoCuota;
    const totalCuotas = prestamo.plazo;
    
    for (let i = 0; i < totalCuotas; i++) {
        const fechaCobro = new Date(fechaInicio);
        fechaCobro.setDate(fechaCobro.getDate() + (i * 7)); // Cobros semanales
        
        const cobro = new Cobro({
            prestamo: prestamo._id,
            cliente: prestamo.cliente,
            monto: montoCuota,
            fecha: fechaCobro,
            estado: 'completado',
            metodoPago: 'efectivo',
            numeroCuota: i + 1,
            notas: `Cobro histórico migrado - Cuota ${i + 1}/${totalCuotas}`,
            cobrador: usuarioId,
            fechaCreacion: fechaCobro
        });
        
        await cobro.save();
    }
    
    console.log(`✅ Creados ${totalCuotas} cobros históricos para préstamo ${prestamo.codigo}`);
}

async function mostrarResumen() {
    console.log('\n📊 RESUMEN DE MIGRACIÓN');
    console.log('========================');
    
    const totalUsuarios = await Usuario.countDocuments();
    const totalClientes = await Cliente.countDocuments();
    const totalPrestamos = await Prestamo.countDocuments();
    const totalCobros = await Cobro.countDocuments();
    
    console.log(`👤 Usuarios: ${totalUsuarios}`);
    console.log(`👥 Clientes: ${totalClientes}`);
    console.log(`💰 Préstamos: ${totalPrestamos}`);
    console.log(`📋 Cobros: ${totalCobros}`);
    
    // Mostrar algunos ejemplos
    console.log('\n🔍 Ejemplos de datos migrados:');
    
    const clienteEjemplo = await Cliente.findOne().populate('creadoPor', 'nombre');
    if (clienteEjemplo) {
        console.log(`\n👤 Cliente: ${clienteEjemplo.nombre}`);
        console.log(`   📞 Teléfono: ${clienteEjemplo.telefono}`);
        console.log(`   🏠 Dirección: ${clienteEjemplo.direccion}`);
        console.log(`   📅 Registro: ${clienteEjemplo.fechaRegistro.toLocaleDateString()}`);
    }
    
    const prestamoEjemplo = await Prestamo.findOne()
        .populate('cliente', 'nombre')
        .populate('creadoPor', 'nombre');
    if (prestamoEjemplo) {
        console.log(`\n💰 Préstamo: ${prestamoEjemplo.codigo}`);
        console.log(`   👤 Cliente: ${prestamoEjemplo.cliente.nombre}`);
        console.log(`   💵 Monto: $${prestamoEjemplo.monto.toLocaleString()}`);
        console.log(`   📊 Estado: ${prestamoEjemplo.estado}`);
        console.log(`   📅 Inicio: ${prestamoEjemplo.fechaInicio.toLocaleDateString()}`);
    }
}

async function main() {
    console.log('🚀 INICIANDO MIGRACIÓN DE DATOS');
    console.log('=================================');
    
    try {
        await conectarBD();
        
        // Ejecutar migración paso a paso
        await crearUsuariosBase();
        await migrarClientes();
        await migrarCobradores();
        await migrarPrestamos();
        
        await mostrarResumen();
        
        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('\n🔐 Credenciales de acceso:');
        console.log('   Admin: admin@demo.com / admin123');
        console.log('   Cobrador: juan@demo.com / 1234');
        console.log('   Cobrador: miguel@demo.com / 1234');
        
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

module.exports = {
    main,
    conectarBD,
    crearUsuariosBase,
    migrarClientes,
    migrarCobradores,
    migrarPrestamos
};