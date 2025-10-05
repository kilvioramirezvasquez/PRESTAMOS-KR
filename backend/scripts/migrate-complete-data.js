const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Modelos
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Prestamo = require('../models/Prestamo');
const Cobro = require('../models/Cobro');

// Configuración
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sistema-prestamos';
const OLD_DATA_PATH = '/home/sistema-prestamos/marcos-prestamos/base-datos';

async function extractSQLData(filePath, tableName) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]+;`, 'g');
        const matches = content.match(insertRegex) || [];
        
        const data = [];
        matches.forEach(match => {
            // Extraer los valores entre paréntesis
            const valuesRegex = /VALUES\s*\((.*?)\);/g;
            let valuesMatch;
            while ((valuesMatch = valuesRegex.exec(match)) !== null) {
                const valuesStr = valuesMatch[1];
                // Parsear los valores (simplificado)
                const values = parseValues(valuesStr);
                data.push(values);
            }
        });
        
        return data;
    } catch (error) {
        console.log(`⚠️  No se pudo leer la tabla ${tableName}:`, error.message);
        return [];
    }
}

function parseValues(valuesStr) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        
        if (!inQuotes && (char === "'" || char === '"')) {
            inQuotes = true;
            quoteChar = char;
        } else if (inQuotes && char === quoteChar) {
            // Verificar si es escape
            if (valuesStr[i + 1] === quoteChar) {
                current += char;
                i++; // Saltar el siguiente
            } else {
                inQuotes = false;
                quoteChar = '';
            }
        } else if (!inQuotes && char === ',') {
            values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^['"]|['"]$/g, ''));
            current = '';
        } else {
            current += char;
        }
    }
    
    // Agregar el último valor
    if (current.trim()) {
        values.push(current.trim() === 'NULL' ? null : current.trim().replace(/^['"]|['"]$/g, ''));
    }
    
    return values;
}

async function migrateAllData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // 1. MIGRAR CLIENTES
        console.log('\n📋 Migrando Clientes...');
        const clientesData = await extractSQLData(path.join(OLD_DATA_PATH, 'prestamosDatos.sql'), 'clientes');
        
        let clientesMigrados = 0;
        for (const clienteRow of clientesData) {
            try {
                const [id, nombre, apellido, cedula, telefono, email, direccion, fecha, status] = clienteRow;
                
                const clienteExiste = await Cliente.findOne({ cedula: cedula });
                if (!clienteExiste && cedula && nombre) {
                    await Cliente.create({
                        nombre: `${nombre} ${apellido || ''}`.trim(),
                        cedula: cedula,
                        telefono: telefono || '',
                        email: email || '',
                        direccion: direccion || '',
                        activo: status === '1',
                        fechaRegistro: fecha ? new Date(fecha) : new Date()
                    });
                    clientesMigrados++;
                }
            } catch (error) {
                console.log(`⚠️  Error migrando cliente:`, error.message);
            }
        }
        console.log(`✅ ${clientesMigrados} clientes migrados`);

        // 2. MIGRAR COBRADORES
        console.log('\n👥 Migrando Cobradores...');
        const cobradoresData = await extractSQLData(path.join(OLD_DATA_PATH, 'prestamosDatos.sql'), 'cobradores');
        
        let cobradoresMigrados = 0;
        for (const cobradorRow of cobradoresData) {
            try {
                const [id, nombre, telefono, email, direccion, comision, fecha, status] = cobradorRow;
                
                const cobradorExiste = await Usuario.findOne({ email: email });
                if (!cobradorExiste && email && nombre) {
                    const hashedPassword = await bcrypt.hash('123456', 12);
                    await Usuario.create({
                        nombre: nombre,
                        email: email,
                        password: hashedPassword,
                        rol: 'cobrador',
                        telefono: telefono || '',
                        direccion: direccion || '',
                        comision: parseFloat(comision) || 10,
                        activo: status === '1'
                    });
                    cobradoresMigrados++;
                }
            } catch (error) {
                console.log(`⚠️  Error migrando cobrador:`, error.message);
            }
        }
        console.log(`✅ ${cobradoresMigrados} cobradores migrados`);

        // 3. MIGRAR PRÉSTAMOS
        console.log('\n💰 Migrando Préstamos...');
        const prestamosData = await extractSQLData(path.join(OLD_DATA_PATH, 'prestamosDatos.sql'), 'prestamos');
        
        let prestamosMigrados = 0;
        for (const prestamoRow of prestamosData) {
            try {
                const [id, cliente_id, monto, interes, plazo, fecha_inicio, fecha_fin, estado, cobrador_id, notas] = prestamoRow;
                
                // Buscar cliente por ID original (aproximado)
                const clientes = await Cliente.find().limit(100);
                const cliente = clientes[Math.min(parseInt(cliente_id) - 1, clientes.length - 1)];
                
                if (cliente && monto) {
                    const montoNumero = parseFloat(monto);
                    const interesNumero = parseFloat(interes) || 10;
                    const plazoNumero = parseInt(plazo) || 30;
                    
                    const montoCuota = (montoNumero * (1 + interesNumero / 100)) / plazoNumero;
                    
                    await Prestamo.create({
                        cliente: cliente._id,
                        monto: montoNumero,
                        interes: interesNumero,
                        plazo: plazoNumero,
                        montoCuota: montoCuota,
                        montoTotal: montoNumero * (1 + interesNumero / 100),
                        fechaInicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
                        fechaVencimiento: fecha_fin ? new Date(fecha_fin) : new Date(Date.now() + plazoNumero * 24 * 60 * 60 * 1000),
                        estado: estado === '1' ? 'activo' : 'completado',
                        notas: notas || '',
                        cuotasPagadas: 0
                    });
                    prestamosMigrados++;
                }
            } catch (error) {
                console.log(`⚠️  Error migrando préstamo:`, error.message);
            }
        }
        console.log(`✅ ${prestamosMigrados} préstamos migrados`);

        // 4. MIGRAR PAGOS/COBROS
        console.log('\n💳 Migrando Pagos...');
        const pagosData = await extractSQLData(path.join(OLD_DATA_PATH, 'prestamosDatos.sql'), 'pagos');
        
        let pagosMigrados = 0;
        for (const pagoRow of pagosData) {
            try {
                const [id, prestamo_id, monto, fecha, tipo, notas, usuario_id] = pagoRow;
                
                // Buscar préstamo aproximado
                const prestamos = await Prestamo.find();
                const prestamo = prestamos[Math.min(parseInt(prestamo_id) - 1, prestamos.length - 1)];
                
                if (prestamo && monto) {
                    await Cobro.create({
                        prestamo: prestamo._id,
                        cliente: prestamo.cliente,
                        monto: parseFloat(monto),
                        fecha: fecha ? new Date(fecha) : new Date(),
                        tipo: tipo || 'cuota',
                        notas: notas || '',
                        estado: 'completado'
                    });
                    pagosMigrados++;
                }
            } catch (error) {
                console.log(`⚠️  Error migrando pago:`, error.message);
            }
        }
        console.log(`✅ ${pagosMigrados} pagos migrados`);

        // 5. ESTADÍSTICAS FINALES
        console.log('\n📊 ESTADÍSTICAS FINALES:');
        const totalClientes = await Cliente.countDocuments();
        const totalPrestamos = await Prestamo.countDocuments();
        const totalCobros = await Cobro.countDocuments();
        const totalUsuarios = await Usuario.countDocuments();
        
        console.log(`👥 Total Clientes: ${totalClientes}`);
        console.log(`💰 Total Préstamos: ${totalPrestamos}`);
        console.log(`💳 Total Cobros: ${totalCobros}`);
        console.log(`🔐 Total Usuarios: ${totalUsuarios}`);
        
        console.log('\n🎉 MIGRACIÓN COMPLETA EXITOSA!');

    } catch (error) {
        console.error('❌ Error en migración:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Ejecutar migración
console.log('🚀 Iniciando migración completa de datos...');
migrateAllData();