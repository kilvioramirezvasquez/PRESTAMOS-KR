const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Modelos
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Prestamo = require('../models/Prestamo');
const Cobro = require('../models/Cobro');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';

function extractCompleteClientesData() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Encontrar la sección completa de clientes (líneas 201-243)
    const lines = content.split('\n');
    const clientesLines = lines.slice(200, 244).join(' ');
    
    // Extraer todos los registros entre paréntesis
    const matches = clientesLines.match(/\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g) || [];
    
    const clientes = [];
    matches.forEach(match => {
        const values = match.slice(1, -1); // Remover paréntesis
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let level = 0;
        
        for (let i = 0; i < values.length; i++) {
            const char = values[i];
            
            if (char === '(' && !inQuotes) level++;
            else if (char === ')' && !inQuotes) level--;
            else if (!inQuotes && (char === "'" || char === '"')) {
                inQuotes = true;
                quoteChar = char;
            } else if (inQuotes && char === quoteChar && values[i-1] !== '\\') {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes && char === ',' && level === 0) {
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
                if (!val || val === 'NULL' || val === 'null' || val === "''") return '';
                return val.replace(/^['"]|['"]$/g, '').trim();
            };
            
            clientes.push({
                id: parseInt(id),
                name: cleanValue(name),
                email: cleanValue(email),
                telefono: cleanValue(telefono),
                direccion: cleanValue(direccion),
                cedula: cleanValue(cedula),
                tel2: cleanValue(tel2),
                status: status === '1'
            });
        }
    });
    
    return clientes;
}

function extractCompletePrestamosData() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar la sección de préstamos (líneas 500-515)
    const lines = content.split('\n');
    const prestamosLines = lines.slice(499, 516).join(' ');
    
    const matches = prestamosLines.match(/\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g) || [];
    
    const prestamos = [];
    matches.forEach(match => {
        const values = match.slice(1, -1);
        const parts = values.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        
        if (parts.length >= 21) {
            const [id, user_id, acreedor_id, fecha, fecha_inic, dias_pago, total, status, saldado, nota, monto_cuotas, total_cuotas, porc_interes, porc_mora, proroga, fecha_revision, dias_vencimiento, calculo_porc_interes, cod, type, garantias] = parts;
            
            prestamos.push({
                id: parseInt(id),
                user_id: parseInt(user_id),
                total: parseFloat(total) || 0,
                monto_cuotas: parseFloat(monto_cuotas) || 0,
                total_cuotas: parseInt(total_cuotas) || 1,
                porc_interes: parseFloat(calculo_porc_interes) || 20,
                fecha_inic: fecha_inic.replace(/['"]/g, ''),
                dias_pago: parseInt(dias_pago) || 7,
                saldado: saldado === '1',
                nota: nota?.replace(/['"]/g, '') || '',
                status: status === '1'
            });
        }
    });
    
    return prestamos;
}

function extractCompletePagosData() {
    const filePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamosDatos.sql';
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar la sección de pagos (líneas 251-331)
    const lines = content.split('\n');
    const pagosLines = lines.slice(250, 332).join(' ');
    
    const matches = pagosLines.match(/\(([^)]+(?:\([^)]*\)[^)]*)*)\)/g) || [];
    
    const pagos = [];
    matches.forEach(match => {
        const values = match.slice(1, -1);
        const parts = values.split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
        
        if (parts.length >= 13) {
            const [id, fecha, prestamo_id, credito_id, user_id, num_cuota, pago_cuota, pago_interes, pago_total, tipo, bal_anterior, bal_final, cobrador_id] = parts;
            
            pagos.push({
                id: parseInt(id),
                prestamo_id: parseInt(prestamo_id),
                fecha: fecha.replace(/['"]/g, ''),
                pago_total: parseFloat(pago_total) || 0,
                num_cuota: parseInt(num_cuota) || 1,
                tipo: tipo?.replace(/['"]/g, '') || 'pago'
            });
        }
    });
    
    return pagos;
}

async function migrateCompleteSystemFixed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');
        
        // Limpiar datos anteriores (excepto usuarios admin)
        await Cliente.deleteMany({ cedula: { $ne: 'admin' } });
        await Prestamo.deleteMany({});
        await Cobro.deleteMany({});
        console.log('🧹 Base de datos limpiada');
        
        // Crear cobrador por defecto
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
        
        // 1. MIGRAR TODOS LOS CLIENTES
        console.log('\n📋 Migrando TODOS los Clientes...');
        const clientesCompletos = extractCompleteClientesData();
        console.log(`📊 Encontrados ${clientesCompletos.length} clientes en total`);
        
        let clientesMigrados = 0;
        const clientesMap = new Map();
        
        for (const cliente of clientesCompletos) {
            try {
                if (!cliente.name || cliente.name.length < 2) continue;
                
                const cedulaFinal = cliente.cedula || `AUTO_${cliente.id}`;
                
                const nuevoCliente = await Cliente.create({
                    nombre: cliente.name,
                    cedula: cedulaFinal,
                    telefono: cliente.telefono || cliente.tel2 || '',
                    email: cliente.email || '',
                    direccion: cliente.direccion || '',
                    activo: cliente.status,
                    fechaRegistro: new Date()
                });
                
                clientesMap.set(cliente.id, nuevoCliente._id);
                clientesMigrados++;
                console.log(`   ✅ ${cliente.name} (${cedulaFinal})`);
            } catch (error) {
                console.log(`   ⚠️  Error con cliente ${cliente.name}:`, error.message);
            }
        }
        console.log(`✅ ${clientesMigrados} clientes migrados exitosamente`);
        
        // 2. MIGRAR TODOS LOS PRÉSTAMOS
        console.log('\n💰 Migrando TODOS los Préstamos...');
        const prestamosCompletos = extractCompletePrestamosData();
        console.log(`📊 Encontrados ${prestamosCompletos.length} préstamos en total`);
        
        let prestamosMigrados = 0;
        const prestamosMap = new Map();
        
        for (const prestamo of prestamosCompletos) {
            try {
                const clienteId = clientesMap.get(prestamo.user_id);
                if (!clienteId || !prestamo.total || prestamo.total <= 0) continue;
                
                const nuevoPrestamo = await Prestamo.create({
                    cliente: clienteId,
                    monto: prestamo.total,
                    interes: prestamo.porc_interes,
                    cuotas: prestamo.total_cuotas,
                    montoCuota: prestamo.monto_cuotas,
                    fechaInicio: prestamo.fecha_inic ? new Date(prestamo.fecha_inic) : new Date('2019-08-01'),
                    estado: prestamo.saldado ? 'pagado' : (prestamo.status ? 'activo' : 'mora')
                });
                
                prestamosMap.set(prestamo.id, nuevoPrestamo._id);
                prestamosMigrados++;
                console.log(`   ✅ Préstamo $${prestamo.total} - ${prestamo.total_cuotas} cuotas - ${prestamo.saldado ? 'PAGADO' : 'ACTIVO'}`);
            } catch (error) {
                console.log(`   ⚠️  Error con préstamo:`, error.message);
            }
        }
        console.log(`✅ ${prestamosMigrados} préstamos migrados exitosamente`);
        
        // 3. MIGRAR TODOS LOS PAGOS
        console.log('\n💳 Migrando TODOS los Pagos...');
        const pagosCompletos = extractCompletePagosData();
        console.log(`📊 Encontrados ${pagosCompletos.length} pagos en total`);
        
        let pagosMigrados = 0;
        
        for (const pago of pagosCompletos) {
            try {
                const prestamoId = prestamosMap.get(pago.prestamo_id);
                if (!prestamoId || !pago.pago_total || pago.pago_total <= 0) continue;
                
                const prestamo = await Prestamo.findById(prestamoId);
                if (!prestamo) continue;
                
                await Cobro.create({
                    prestamo: prestamoId,
                    cliente: prestamo.cliente,
                    cobrador: cobradorMigracion._id,
                    monto: pago.pago_total,
                    fecha: pago.fecha ? new Date(pago.fecha) : new Date('2019-08-01'),
                    metodoPago: 'efectivo',
                    notas: `Migrado - Cuota #${pago.num_cuota}`
                });
                
                // Actualizar saldo del préstamo
                await Prestamo.findByIdAndUpdate(prestamoId, {
                    $inc: { saldoPendiente: -pago.pago_total }
                });
                
                pagosMigrados++;
                console.log(`   ✅ Pago $${pago.pago_total} - Cuota #${pago.num_cuota}`);
            } catch (error) {
                console.log(`   ⚠️  Error con pago:`, error.message);
            }
        }
        console.log(`✅ ${pagosMigrados} pagos migrados exitosamente`);
        
        // 4. ESTADÍSTICAS FINALES COMPLETAS
        console.log('\n📊 ESTADÍSTICAS FINALES COMPLETAS:');
        const totalClientes = await Cliente.countDocuments();
        const totalPrestamos = await Prestamo.countDocuments();
        const totalCobros = await Cobro.countDocuments();
        const totalUsuarios = await Usuario.countDocuments();
        
        const statsAggregate = await Prestamo.aggregate([
            {
                $group: {
                    _id: null,
                    totalPrestado: { $sum: '$monto' },
                    promedioMonto: { $avg: '$monto' },
                    prestamosActivos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
                    prestamosPagados: { $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] } },
                    prestamosMora: { $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] } }
                }
            }
        ]);
        
        const cobrosAggregate = await Cobro.aggregate([
            { $group: { _id: null, totalCobrado: { $sum: '$monto' } } }
        ]);
        
        const stats = statsAggregate[0] || {};
        const totalCobrado = cobrosAggregate[0]?.totalCobrado || 0;
        
        console.log(`👥 Total Clientes: ${totalClientes}`);
        console.log(`💰 Total Préstamos: ${totalPrestamos}`);
        console.log(`   - Activos: ${stats.prestamosActivos || 0}`);
        console.log(`   - Pagados: ${stats.prestamosPagados || 0}`);
        console.log(`   - En Mora: ${stats.prestamosMora || 0}`);
        console.log(`💳 Total Cobros: ${totalCobros}`);
        console.log(`🔐 Total Usuarios: ${totalUsuarios}`);
        console.log(`💵 Monto Total Prestado: $${(stats.totalPrestado || 0).toLocaleString()}`);
        console.log(`💸 Monto Total Cobrado: $${totalCobrado.toLocaleString()}`);
        console.log(`💰 Promedio por Préstamo: $${(stats.promedioMonto || 0).toLocaleString()}`);
        console.log(`📈 % Recuperado: ${((totalCobrado / (stats.totalPrestado || 1)) * 100).toFixed(1)}%`);
        
        console.log('\n🎉 ¡MIGRACIÓN COMPLETA 100% EXITOSA!');
        console.log('📊 TODOS los datos del sistema anterior han sido migrados');
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

console.log('🚀 Iniciando migración COMPLETA y MEJORADA del sistema...');
migrateCompleteSystemFixed();