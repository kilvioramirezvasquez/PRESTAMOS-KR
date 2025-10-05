#!/usr/bin/env node

/**
 * Extractor de datos completo del sistema viejo
 * Lee los archivos SQL y extrae todos los datos para migración
 */

const fs = require('fs');
const path = require('path');

// Leer archivo SQL con todos los datos
const sqlFilePath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamos.sql';

function extractSQLData(sqlContent) {
    const data = {
        clientes: [],
        cobradores: [],
        prestamos: [],
        cobros: [],
        pagos: []
    };

    try {
        // Extraer clientes
        const clientesMatch = sqlContent.match(/INSERT INTO `clientes` VALUES (.*?);/s);
        if (clientesMatch) {
            const clientesData = clientesMatch[1];
            // Dividir por '),(' para separar registros
            const clientesRecords = clientesData.split('),(');
            
            clientesRecords.forEach((record, index) => {
                // Limpiar paréntesis del primer y último registro
                record = record.replace(/^\(/, '').replace(/\)$/, '');
                
                // Dividir por comas pero respetando comillas
                const values = parseCSVLine(record);
                
                if (values && values.length >= 18) {
                    data.clientes.push({
                        id: parseInt(values[0]),
                        nombre: cleanValue(values[1]),
                        email: cleanValue(values[2]),
                        telefono: cleanValue(values[3]),
                        direccion: cleanValue(values[4]),
                        ciudad: parseInt(values[5]) || 0,
                        nota: cleanValue(values[6]),
                        fecha_registro: parseInt(values[7]),
                        user_id: parseInt(values[8]),
                        status: parseInt(values[9]),
                        ruta: parseInt(values[10]),
                        cedula: cleanValue(values[11]),
                        telefono2: cleanValue(values[12]),
                        referencias: cleanValue(values[13]),
                        cobrador_id: parseInt(values[14]) || null,
                        acceso: parseInt(values[15]) || 0,
                        usuario: cleanValue(values[16]),
                        password: cleanValue(values[17])
                    });
                }
            });
        }

        // Extraer cobradores
        const cobradoresMatch = sqlContent.match(/INSERT INTO `cobradores` VALUES (.*?);/s);
        if (cobradoresMatch) {
            const cobradoresData = cobradoresMatch[1];
            const cobradoresRecords = cobradoresData.split('),(');
            
            cobradoresRecords.forEach(record => {
                record = record.replace(/^\(/, '').replace(/\)$/, '');
                const values = parseCSVLine(record);
                
                if (values && values.length >= 13) {
                    data.cobradores.push({
                        id: parseInt(values[0]),
                        nombre: cleanValue(values[1]),
                        direccion: cleanValue(values[2]),
                        telefono: cleanValue(values[3]),
                        cedula: cleanValue(values[4]),
                        usuario: cleanValue(values[5]),
                        password: cleanValue(values[6]),
                        status: parseInt(values[7]),
                        user_id: parseInt(values[8]),
                        datetime: parseInt(values[9]),
                        fecha_registro: cleanValue(values[10]),
                        email: cleanValue(values[11]),
                        permisos: cleanValue(values[12])
                    });
                }
            });
        }

        // Extraer préstamos
        const prestamosMatch = sqlContent.match(/INSERT INTO `prestamos` VALUES (.*?);/s);
        if (prestamosMatch) {
            const prestamosData = prestamosMatch[1];
            const prestamosRecords = prestamosData.split('),(');
            
            prestamosRecords.forEach(record => {
                record = record.replace(/^\(/, '').replace(/\)$/, '');
                const values = parseCSVLine(record);
                
                if (values && values.length >= 21) {
                    data.prestamos.push({
                        id: parseInt(values[0]),
                        cliente_id: parseInt(values[1]),
                        acreedor_id: parseInt(values[2]),
                        fecha: cleanValue(values[3]),
                        fecha_inicio: cleanValue(values[4]),
                        dias_pago: parseInt(values[5]),
                        total: parseFloat(values[6]),
                        status: parseInt(values[7]),
                        saldado: parseInt(values[8]),
                        nota: cleanValue(values[9]),
                        monto_cuotas: parseFloat(values[10]),
                        total_cuotas: parseInt(values[11]),
                        porc_interes: parseFloat(values[12]),
                        porc_mora: parseFloat(values[13]),
                        proroga: parseInt(values[14]),
                        fecha_revision: cleanValue(values[15]),
                        dias_vencimiento: parseInt(values[16]),
                        interes_calculado: parseFloat(values[17]),
                        codigo: cleanValue(values[18]),
                        tipo: parseInt(values[19]),
                        garantias: cleanValue(values[20])
                    });
                }
            });
        }

        // Extraer pagos/cobros
        const pagosMatch = sqlContent.match(/INSERT INTO `pagos` VALUES (.*?);/s);
        if (pagosMatch) {
            const pagosData = pagosMatch[1];
            const pagosRecords = pagosData.split('),(');
            
            pagosRecords.forEach(record => {
                record = record.replace(/^\(/, '').replace(/\)$/, '');
                const values = parseCSVLine(record);
                
                if (values && values.length >= 8) {
                    data.pagos.push({
                        id: parseInt(values[0]),
                        prestamo_id: parseInt(values[1]),
                        fecha: cleanValue(values[2]),
                        monto: parseFloat(values[3]),
                        cobrador_id: parseInt(values[4]),
                        nota: cleanValue(values[5]),
                        user_id: parseInt(values[6]),
                        datetime: parseInt(values[7])
                    });
                }
            });
        }

        console.log(`📊 Datos extraídos:`);
        console.log(`   👥 Clientes: ${data.clientes.length}`);
        console.log(`   🏃 Cobradores: ${data.cobradores.length}`);
        console.log(`   💰 Préstamos: ${data.prestamos.length}`);
        console.log(`   💵 Pagos: ${data.pagos.length}`);

        return data;

    } catch (error) {
        console.error('❌ Error extrayendo datos SQL:', error);
        return data;
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (!inQuotes && (char === '"' || char === "'")) {
            inQuotes = true;
            quoteChar = char;
        } else if (inQuotes && char === quoteChar) {
            // Verificar si es escape de comilla
            if (line[i + 1] === quoteChar) {
                current += char;
                i++; // Saltar la siguiente comilla
            } else {
                inQuotes = false;
                quoteChar = '';
            }
        } else if (!inQuotes && char === ',') {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    // Agregar el último valor
    if (current) {
        result.push(current.trim());
    }
    
    return result;
}

function cleanValue(value) {
    if (!value) return '';
    
    // Remover comillas
    value = value.replace(/^['"]|['"]$/g, '');
    
    // Decodificar entidades HTML
    value = value.replace(/&aacute;/g, 'á');
    value = value.replace(/&eacute;/g, 'é');
    value = value.replace(/&iacute;/g, 'í');
    value = value.replace(/&oacute;/g, 'ó');
    value = value.replace(/&uacute;/g, 'ú');
    value = value.replace(/&ntilde;/g, 'ñ');
    
    return value.trim();
}

function generateMigrationScript(data) {
    const scriptPath = '/home/sistema-prestamos/scripts/migration-data.js';
    
    const scriptContent = `/**
 * Datos extraídos del sistema viejo para migración
 * Generado automáticamente el ${new Date().toISOString()}
 */

module.exports = {
    clientes: ${JSON.stringify(data.clientes, null, 2)},
    
    cobradores: ${JSON.stringify(data.cobradores, null, 2)},
    
    prestamos: ${JSON.stringify(data.prestamos, null, 2)},
    
    pagos: ${JSON.stringify(data.pagos, null, 2)}
};`;

    fs.writeFileSync(scriptPath, scriptContent);
    console.log(`✅ Archivo de datos generado: ${scriptPath}`);
    
    return scriptPath;
}

function main() {
    console.log('🔍 EXTRAYENDO DATOS DEL SISTEMA VIEJO');
    console.log('====================================');
    
    if (!fs.existsSync(sqlFilePath)) {
        console.error(`❌ No se encontró el archivo SQL: ${sqlFilePath}`);
        return;
    }
    
    console.log(`📖 Leyendo archivo: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    console.log(`📏 Tamaño del archivo: ${Math.round(sqlContent.length / 1024)}KB`);
    
    const extractedData = extractSQLData(sqlContent);
    const dataFilePath = generateMigrationScript(extractedData);
    
    console.log('\n✅ EXTRACCIÓN COMPLETADA');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisar los datos extraídos en:', dataFilePath);
    console.log('2. Ejecutar el script de migración completa');
    console.log('3. Verificar la migración en la base de datos');
}

if (require.main === module) {
    main();
}

module.exports = { extractSQLData, generateMigrationScript };