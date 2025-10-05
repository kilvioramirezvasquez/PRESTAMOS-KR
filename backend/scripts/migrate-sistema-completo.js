const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Modelos
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Prestamo = require('../models/Prestamo');
const Cobro = require('../models/Cobro');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';

async function parseClientesFromSQL() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar la línea de INSERT de clientes
    const clientesMatch = content.match(/INSERT INTO `clientes`[^;]+;/s);
    if (!clientesMatch) return [];
    
    const clientesData = clientesMatch[0];
    
    // Extraer todos los valores entre paréntesis
    const valuesRegex = /\(([^)]+)\)/g;
    const clientes = [];
    let match;
    
    while ((match = valuesRegex.exec(clientesData)) !== null) {
        const values = match[1].split(',').map(v => {
            v = v.trim();
            if (v === 'NULL' || v === 'null') return null;
            if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
            return v;
        });
        
        if (values.length >= 18) {
            const [id, name, email, telefono, direccion, ciudad, nota, date_reg, user_id, status, ruta, cedula, tel2, referencias, cobrador_id, acceso, user, pass] = values;
            
            clientes.push({
                id: parseInt(id),
                name,
                email,
                telefono,
                direccion,
                cedula,
                tel2,
                status: status === '1'
            });
        }
    }
    
    return clientes;
}

async function parsePrestamosFromSQL() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    const prestamosMatch = content.match(/INSERT INTO `prestamos`[^;]+;/s);
    if (!prestamosMatch) return [];
    
    const prestamosData = prestamosMatch[0];
    const valuesRegex = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    const prestamos = [];
    let match;
    
    while ((match = valuesRegex.exec(prestamosData)) !== null) {
        const values = match[1].split(',').map(v => {
            v = v.trim();
            if (v === 'NULL' || v === 'null') return null;
            if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
            return v;
        });
        
        if (values.length >= 21) {
            const [id, user_id, acreedor_id, fecha, fecha_inic, dias_pago, total, status, saldado, nota, monto_cuotas, total_cuotas, porc_interes, porc_mora, proroga, fecha_revision, dias_vencimiento, calculo_porc_interes, cod, type, garantias] = values;
            
            prestamos.push({
                id: parseInt(id),
                user_id: parseInt(user_id),
                total: parseFloat(total),
                monto_cuotas: parseFloat(monto_cuotas),
                total_cuotas: parseInt(total_cuotas),
                porc_interes: parseFloat(calculo_porc_interes) || 20,
                fecha_inic,
                dias_pago: parseInt(dias_pago),
                saldado: saldado === '1',
                nota
            });
        }
    }
    
    return prestamos;
}

async function parsePagosFromSQL() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    const pagosMatch = content.match(/INSERT INTO `creditos_pagos`[^;]+;/s);
    if (!pagosMatch) return [];
    
    const pagosData = pagosMatch[0];
    const valuesRegex = /\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
    const pagos = [];
    let match;
    
    while ((match = valuesRegex.exec(pagosData)) !== null) {
        const values = match[1].split(',').map(v => {
            v = v.trim();
            if (v === 'NULL' || v === 'null') return null;
            if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
            return v;
        });
        
        if (values.length >= 13) {
            const [id, fecha, prestamo_id, credito_id, user_id, num_cuota, pago_cuota, pago_interes, pago_total, tipo, bal_anterior, bal_final, cobrador_id] = values;
            
            pagos.push({
                id: parseInt(id),
                prestamo_id: parseInt(prestamo_id),
                fecha,
                pago_total: parseFloat(pago_total),
                num_cuota: parseInt(num_cuota),
                tipo
            });
        }
    }
    
    return pagos;
}

async function migrateCompleteSystem() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Crear cobrador por defecto si no existe
        let cobradorMigracion = await Usuario.findOne({ email: 'migracion@sistema.com' });
        if (!cobradorMigracion) {
            const hashedPassword = await bcrypt.hash('123456', 12);
            cobradorMigracion = await Usuario.create({
                nombre: 'Cobrador Migración',
                email: 'migracion@sistema.com',
                password: hashedPassword,
                rol: 'cobrador',
                telefono: '000-000-0000',
                activo: true
            });
            console.log('✅ Cobrador de migración creado');
        }
        
        // Limpiar datos anteriores (opcional)
        // await Cliente.deleteMany({});
        // await Prestamo.deleteMany({});
        // await Cobro.deleteMany({});
        
        // 1. MIGRAR CLIENTES
        console.log('\n📋 Migrando Clientes del sistema viejo...');
        const clientesViejos = await parseClientesFromSQL();
        console.log(`📊 Encontrados ${clientesViejos.length} clientes en el sistema viejo`);
        
        let clientesMigrados = 0;
        const clientesMap = new Map(); // Para mapear IDs viejos a nuevos
        
        for (const clienteViejo of clientesViejos) {
            try {
                if (!clienteViejo.name || !clienteViejo.cedula) continue;
                
                const clienteExiste = await Cliente.findOne({ cedula: clienteViejo.cedula });
                if (!clienteExiste) {
                    const nuevoCliente = await Cliente.create({
                        nombre: clienteViejo.name,
                        cedula: clienteViejo.cedula,
                        telefono: clienteViejo.telefono || clienteViejo.tel2 || '',
                        email: clienteViejo.email || '',
                        direccion: clienteViejo.direccion || '',
                        activo: clienteViejo.status,
                        fechaRegistro: new Date()
                    });
                    
                    clientesMap.set(clienteViejo.id, nuevoCliente._id);
                    clientesMigrados++;
                    console.log(`   ✅ ${clienteViejo.name} (${clienteViejo.cedula})`);
                } else {
                    clientesMap.set(clienteViejo.id, clienteExiste._id);
                }
            } catch (error) {
                console.log(`   ⚠️  Error con cliente ${clienteViejo.name}:`, error.message);
            }
        }
        console.log(`✅ ${clientesMigrados} clientes nuevos migrados`);
        
        // 2. MIGRAR PRÉSTAMOS
        console.log('\n💰 Migrando Préstamos...');
        const prestamosViejos = await parsePrestamosFromSQL();
        console.log(`📊 Encontrados ${prestamosViejos.length} préstamos en el sistema viejo`);
        
        let prestamosMigrados = 0;
        const prestamosMap = new Map();
        
        for (const prestamoViejo of prestamosViejos) {
            try {
                const clienteId = clientesMap.get(prestamoViejo.user_id);
                if (!clienteId) continue;
                
                const monto = prestamoViejo.total;
                const interes = prestamoViejo.porc_interes;
                const plazo = prestamoViejo.total_cuotas;
                const montoCuota = prestamoViejo.monto_cuotas;
                
                const nuevoPrestamo = await Prestamo.create({
                    cliente: clienteId,
                    monto: monto,
                    interes: interes,
                    cuotas: plazo, // Usar 'cuotas' en lugar de 'plazo'
                    montoCuota: montoCuota,
                    fechaInicio: prestamoViejo.fecha_inic ? new Date(prestamoViejo.fecha_inic) : new Date(),
                    estado: prestamoViejo.saldado ? 'pagado' : 'activo' // 'pagado' en lugar de 'completado'
                });
                
                prestamosMap.set(prestamoViejo.id, nuevoPrestamo._id);
                prestamosMigrados++;
                console.log(`   ✅ Préstamo $${monto} - ${plazo} cuotas`);
            } catch (error) {
                console.log(`   ⚠️  Error con préstamo:`, error.message);
            }
        }
        console.log(`✅ ${prestamosMigrados} préstamos migrados`);
        
        // 3. MIGRAR PAGOS
        console.log('\n💳 Migrando Pagos/Cobros...');
        const pagosViejos = await parsePagosFromSQL();
        console.log(`📊 Encontrados ${pagosViejos.length} pagos en el sistema viejo`);
        
        // Obtener un cobrador por defecto para los pagos migrados
        const cobradorDefault = await Usuario.findOne({ rol: 'cobrador' });
        if (!cobradorDefault) {
            console.log('⚠️  No hay cobradores disponibles, saltando migración de pagos');
            return;
        }
        
        let pagosMigrados = 0;
        
        for (const pagoViejo of pagosViejos) {
            try {
                const prestamoId = prestamosMap.get(pagoViejo.prestamo_id);
                if (!prestamoId) continue;
                
                const prestamo = await Prestamo.findById(prestamoId);
                if (!prestamo) continue;
                
                await Cobro.create({
                    prestamo: prestamoId,
                    cliente: prestamo.cliente,
                    cobrador: cobradorDefault._id,
                    monto: pagoViejo.pago_total,
                    fecha: pagoViejo.fecha ? new Date(pagoViejo.fecha) : new Date(),
                    metodoPago: 'efectivo',
                    notas: `Migrado del sistema viejo - Cuota #${pagoViejo.num_cuota}`
                });
                
                // Actualizar saldo pendiente del préstamo
                await Prestamo.findByIdAndUpdate(prestamoId, {
                    $inc: { saldoPendiente: -pagoViejo.pago_total }
                });
                
                pagosMigrados++;
                console.log(`   ✅ Pago $${pagoViejo.pago_total} - Cuota #${pagoViejo.num_cuota}`);
            } catch (error) {
                console.log(`   ⚠️  Error con pago:`, error.message);
            }
        }
        console.log(`✅ ${pagosMigrados} pagos migrados`);
        
        // 4. ESTADÍSTICAS FINALES
        console.log('\n📊 ESTADÍSTICAS FINALES:');
        const totalClientes = await Cliente.countDocuments();
        const totalPrestamos = await Prestamo.countDocuments();
        const totalCobros = await Cobro.countDocuments();
        const totalUsuarios = await Usuario.countDocuments();
        
        const montoTotalPrestamos = await Prestamo.aggregate([
            { $group: { _id: null, total: { $sum: '$monto' } } }
        ]);
        
        const montoTotalCobros = await Cobro.aggregate([
            { $group: { _id: null, total: { $sum: '$monto' } } }
        ]);
        
        console.log(`👥 Total Clientes: ${totalClientes}`);
        console.log(`💰 Total Préstamos: ${totalPrestamos}`);
        console.log(`💳 Total Cobros: ${totalCobros}`);
        console.log(`🔐 Total Usuarios: ${totalUsuarios}`);
        console.log(`💵 Monto Total Prestado: $${montoTotalPrestamos[0]?.total || 0}`);
        console.log(`💸 Monto Total Cobrado: $${montoTotalCobros[0]?.total || 0}`);
        
        console.log('\n🎉 ¡MIGRACIÓN COMPLETA EXITOSA!');
        console.log('📈 El sistema ahora tiene todos los datos históricos del sistema anterior');
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

console.log('🚀 Iniciando migración completa del sistema de préstamos...');
migrateCompleteSystem();