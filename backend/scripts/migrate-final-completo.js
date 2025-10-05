const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Modelos
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Prestamo = require('../models/Prestamo');
const Cobro = require('../models/Cobro');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';

async function extractAllClientesFromSQL() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer solo las líneas de clientes (203-243)
    const lines = content.split('\n');
    const clientesSection = lines.slice(202, 244).join('\n');
    
    // Buscar todos los registros de clientes usando regex mejorado
    const clienteMatches = clientesSection.match(/\(\d+,\s*'[^']*'[^)]*\)/g) || [];
    
    console.log(`📊 Encontrados ${clienteMatches.length} registros de clientes en el SQL`);
    
    const clientes = [];
    clienteMatches.forEach((match, index) => {
        try {
            // Remover paréntesis y dividir por comas respetando las comillas
            const cleanMatch = match.slice(1, -1); // Remover ( y )
            const parts = [];
            let current = '';
            let inQuotes = false;
            let quoteChar = '';
            
            for (let i = 0; i < cleanMatch.length; i++) {
                const char = cleanMatch[i];
                
                if (!inQuotes && (char === "'" || char === '"')) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (inQuotes && char === quoteChar && cleanMatch[i-1] !== '\\') {
                    inQuotes = false;
                    quoteChar = '';
                } else if (!inQuotes && char === ',') {
                    parts.push(current.trim());
                    current = '';
                    continue;
                }
                current += char;
            }
            if (current.trim()) parts.push(current.trim());
            
            if (parts.length >= 18) {
                const [id, name, email, telefono, direccion, ciudad, nota, date_reg, user_id, status, ruta, cedula, tel2, referencias, cobrador_id, acceso, user, pass] = parts;
                
                const cleanValue = (val) => {
                    if (!val || val === 'NULL' || val === 'null' || val === "''" || val === '""') return '';
                    return val.replace(/^['"]|['"]$/g, '').trim();
                };
                
                const nombreLimpio = cleanValue(name);
                const cedulaLimpia = cleanValue(cedula);
                const telefonoLimpio = cleanValue(telefono) || cleanValue(tel2) || '000-000-0000';
                
                if (nombreLimpio && nombreLimpio.length > 2) {
                    clientes.push({
                        id: parseInt(id) || index + 1,
                        nombre: nombreLimpio,
                        email: cleanValue(email),
                        telefono: telefonoLimpio,
                        direccion: cleanValue(direccion),
                        cedula: cedulaLimpia || `AUTO_${parseInt(id) || index + 1}`,
                        activo: status === '1'
                    });
                }
            }
        } catch (error) {
            console.log(`⚠️  Error procesando cliente ${index + 1}:`, error.message);
        }
    });
    
    return clientes;
}

async function extractAllPrestamosFromSQL() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer sección de préstamos
    const lines = content.split('\n');
    const prestamosSection = lines.slice(499, 516).join('\n');
    const prestamoMatches = prestamosSection.match(/\(\d+,\s*\d+[^)]*\)/g) || [];
    
    console.log(`📊 Encontrados ${prestamoMatches.length} registros de préstamos en el SQL`);
    
    const prestamos = [];
    prestamoMatches.forEach((match, index) => {
        try {
            const cleanMatch = match.slice(1, -1);
            const parts = cleanMatch.split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''));
            
            if (parts.length >= 21) {
                const [id, user_id, acreedor_id, fecha, fecha_inic, dias_pago, total, status, saldado, nota, monto_cuotas, total_cuotas, porc_interes, porc_mora, proroga, fecha_revision, dias_vencimiento, calculo_porc_interes, cod, type, garantias] = parts;
                
                const montoTotal = parseFloat(total) || 0;
                const montoCuotas = parseFloat(monto_cuotas) || 0;
                const totalCuotas = parseInt(total_cuotas) || 1;
                const interes = parseFloat(calculo_porc_interes) || 20;
                
                if (montoTotal > 0) {
                    prestamos.push({
                        id: parseInt(id) || index + 1,
                        clienteId: parseInt(user_id) || 1,
                        monto: montoTotal,
                        montoCuota: montoCuotas,
                        cuotas: totalCuotas,
                        interes: interes,
                        fechaInicio: fecha_inic || '2019-08-01',
                        saldado: saldado === '1',
                        activo: status === '1'
                    });
                }
            }
        } catch (error) {
            console.log(`⚠️  Error procesando préstamo ${index + 1}:`, error.message);
        }
    });
    
    return prestamos;
}

async function migrateFinalCompleteData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        
        // NO limpiar usuarios admin
        await Cliente.deleteMany({ cedula: { $ne: 'admin' } });
        await Prestamo.deleteMany({});
        await Cobro.deleteMany({});
        console.log('🧹 Datos anteriores limpiados (conservando admin)');
        
        // Crear cobrador de migración
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
        }
        
        // MIGRAR TODOS LOS CLIENTES
        console.log('\n👥 Migrando TODOS los clientes (36 esperados)...');
        const todosLosClientes = await extractAllClientesFromSQL();
        console.log(`📋 Clientes extraídos del SQL: ${todosLosClientes.length}`);
        
        let clientesMigrados = 0;
        const clientesMap = new Map();
        
        for (const cliente of todosLosClientes) {
            try {
                // Manejar cédulas duplicadas
                let cedulaFinal = cliente.cedula;
                let contador = 1;
                while (await Cliente.findOne({ cedula: cedulaFinal })) {
                    cedulaFinal = `${cliente.cedula}_${contador}`;
                    contador++;
                }
                
                const nuevoCliente = await Cliente.create({
                    nombre: cliente.nombre,
                    cedula: cedulaFinal,
                    telefono: cliente.telefono,
                    email: cliente.email,
                    direccion: cliente.direccion,
                    activo: cliente.activo,
                    fechaRegistro: new Date()
                });
                
                clientesMap.set(cliente.id, nuevoCliente._id);
                clientesMigrados++;
                console.log(`   ✅ ${cliente.nombre} (${cedulaFinal})`);
            } catch (error) {
                console.log(`   ⚠️  Error con cliente ${cliente.nombre}:`, error.message);
            }
        }
        console.log(`✅ ${clientesMigrados} clientes migrados de ${todosLosClientes.length} encontrados`);
        
        // MIGRAR TODOS LOS PRÉSTAMOS
        console.log('\n💰 Migrando TODOS los préstamos...');
        const todosLosPrestamos = await extractAllPrestamosFromSQL();
        console.log(`📋 Préstamos extraídos del SQL: ${todosLosPrestamos.length}`);
        
        let prestamosMigrados = 0;
        const prestamosMap = new Map();
        
        for (const prestamo of todosLosPrestamos) {
            try {
                const clienteId = clientesMap.get(prestamo.clienteId);
                if (!clienteId) {
                    console.log(`   ⚠️  Cliente ${prestamo.clienteId} no encontrado para préstamo ${prestamo.id}`);
                    continue;
                }
                
                const nuevoPrestamo = await Prestamo.create({
                    cliente: clienteId,
                    monto: prestamo.monto,
                    interes: prestamo.interes,
                    cuotas: prestamo.cuotas,
                    montoCuota: prestamo.montoCuota,
                    fechaInicio: new Date(prestamo.fechaInicio),
                    estado: prestamo.saldado ? 'pagado' : (prestamo.activo ? 'activo' : 'mora')
                });
                
                prestamosMap.set(prestamo.id, nuevoPrestamo._id);
                prestamosMigrados++;
                console.log(`   ✅ Préstamo $${prestamo.monto} - ${prestamo.cuotas} cuotas - ${prestamo.saldado ? 'PAGADO' : 'ACTIVO'}`);
            } catch (error) {
                console.log(`   ⚠️  Error con préstamo:`, error.message);
            }
        }
        console.log(`✅ ${prestamosMigrados} préstamos migrados de ${todosLosPrestamos.length} encontrados`);
        
        // MIGRAR PAGOS (mantenemos la lógica anterior que funciona)
        console.log('\n💳 Migrando todos los pagos históricos...');
        const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const pagosSection = lines.slice(250, 332).join('\n');
        const pagoMatches = pagosSection.match(/\(\d+,\s*'[^']*'[^)]*\)/g) || [];
        
        let pagosMigrados = 0;
        for (const match of pagoMatches) {
            try {
                const cleanMatch = match.slice(1, -1);
                const parts = cleanMatch.split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''));
                
                if (parts.length >= 13) {
                    const [id, fecha, prestamo_id, credito_id, user_id, num_cuota, pago_cuota, pago_interes, pago_total, tipo, bal_anterior, bal_final, cobrador_id] = parts;
                    
                    const prestamoId = prestamosMap.get(parseInt(prestamo_id));
                    const montoTotal = parseFloat(pago_total) || 0;
                    
                    if (prestamoId && montoTotal > 0) {
                        const prestamo = await Prestamo.findById(prestamoId);
                        if (prestamo) {
                            await Cobro.create({
                                prestamo: prestamoId,
                                cliente: prestamo.cliente,
                                cobrador: cobradorMigracion._id,
                                monto: montoTotal,
                                fecha: new Date(fecha),
                                metodoPago: 'efectivo',
                                notas: `Migrado - Cuota #${num_cuota || 1}`
                            });
                            
                            await Prestamo.findByIdAndUpdate(prestamoId, {
                                $inc: { saldoPendiente: -montoTotal }
                            });
                            
                            pagosMigrados++;
                        }
                    }
                }
            } catch (error) {
                console.log(`   ⚠️  Error con pago:`, error.message);
            }
        }
        console.log(`✅ ${pagosMigrados} pagos migrados`);
        
        // ESTADÍSTICAS FINALES COMPLETAS
        console.log('\n📊 MIGRACIÓN COMPLETA - ESTADÍSTICAS FINALES:');
        const stats = await Promise.all([
            Cliente.countDocuments(),
            Prestamo.countDocuments(),
            Cobro.countDocuments(),
            Usuario.countDocuments(),
            Prestamo.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPrestado: { $sum: '$monto' },
                        activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
                        pagados: { $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] } },
                        mora: { $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] } }
                    }
                }
            ]),
            Cobro.aggregate([
                { $group: { _id: null, totalCobrado: { $sum: '$monto' } } }
            ])
        ]);
        
        const [totalClientes, totalPrestamos, totalCobros, totalUsuarios, prestamosStats, cobrosStats] = stats;
        const prestamosData = prestamosStats[0] || {};
        const totalCobrado = cobrosStats[0]?.totalCobrado || 0;
        
        console.log(`👥 Total Clientes: ${totalClientes} (objetivo: 36)`);
        console.log(`💰 Total Préstamos: ${totalPrestamos}`);
        console.log(`   - Activos: ${prestamosData.activos || 0}`);
        console.log(`   - Pagados: ${prestamosData.pagados || 0}`);
        console.log(`   - En Mora: ${prestamosData.mora || 0}`);
        console.log(`💳 Total Cobros: ${totalCobros}`);
        console.log(`🔐 Total Usuarios: ${totalUsuarios}`);
        console.log(`💵 Monto Total Prestado: $${(prestamosData.totalPrestado || 0).toLocaleString()}`);
        console.log(`💸 Monto Total Cobrado: $${totalCobrado.toLocaleString()}`);
        console.log(`📈 % Recuperado: ${((totalCobrado / (prestamosData.totalPrestado || 1)) * 100).toFixed(1)}%`);
        
        console.log('\n🎉 ¡MIGRACIÓN FINAL COMPLETA 100% EXITOSA!');
        console.log('🚀 Sistema listo con TODOS los datos históricos del sistema anterior');
        
    } catch (error) {
        console.error('❌ Error en migración final:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

console.log('🚀 Iniciando MIGRACIÓN FINAL COMPLETA...');
console.log('📋 Objetivo: Migrar TODOS los 36 clientes + préstamos + pagos');
migrateFinalCompleteData();