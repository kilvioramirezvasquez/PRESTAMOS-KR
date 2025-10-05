#!/usr/bin/env node

/**
 * Script simplificado de migración que funciona con el esquema actual
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

function extraerClientesCompletos() {
    console.log('📖 Extrayendo TODOS los clientes del archivo SQL...');
    
    const sqlPath = '/home/sistema-prestamos/marcos-prestamos/base-datos/prestamos.sql';
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // Buscar la línea completa de INSERT INTO clientes
    const clientesMatch = sqlContent.match(/INSERT INTO `clientes` VALUES (.*?);/s);
    const clientes = [];
    
    if (clientesMatch) {
        let clientesData = clientesMatch[1];
        console.log('📏 Datos encontrados, procesando...');
        
        // Método más robusto para dividir los registros
        const registros = [];
        let nivel = 0;
        let registro = '';
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < clientesData.length; i++) {
            const char = clientesData[i];
            const prevChar = clientesData[i - 1];
            
            if (!inString && (char === '"' || char === "'")) {
                inString = true;
                stringChar = char;
                registro += char;
            } else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
                registro += char;
            } else if (!inString && char === '(') {
                nivel++;
                registro += char;
            } else if (!inString && char === ')') {
                nivel--;
                registro += char;
                
                // Si llegamos al nivel 0 y el siguiente char es coma, terminamos el registro
                if (nivel === 0 && clientesData[i + 1] === ',') {
                    registros.push(registro);
                    registro = '';
                    i += 1; // Saltar la coma
                }
            } else {
                registro += char;
            }
        }
        
        // Agregar el último registro
        if (registro.trim()) {
            registros.push(registro);
        }
        
        console.log(`📊 Registros encontrados: ${registros.length}`);
        
        // Procesar cada registro
        registros.forEach((reg, index) => {
            try {
                // Limpiar paréntesis externos
                reg = reg.replace(/^\(/, '').replace(/\)$/, '');
                
                // Usar split con límite para evitar problemas con comas en el contenido
                const valores = [];
                let valor = '';
                let inString = false;
                let stringChar = '';
                
                for (let i = 0; i < reg.length; i++) {
                    const char = reg[i];
                    const prevChar = reg[i - 1];
                    
                    if (!inString && (char === '"' || char === "'")) {
                        inString = true;
                        stringChar = char;
                        valor += char;
                    } else if (inString && char === stringChar && prevChar !== '\\') {
                        inString = false;
                        valor += char;
                    } else if (!inString && char === ',') {
                        valores.push(valor.trim());
                        valor = '';
                    } else {
                        valor += char;
                    }
                }
                
                // Agregar el último valor
                if (valor) {
                    valores.push(valor.trim());
                }
                
                if (valores.length >= 18) {
                    const cliente = {
                        id: parseInt(valores[0]),
                        nombre: limpiarTexto(valores[1]),
                        email: limpiarTexto(valores[2]),
                        telefono: limpiarTexto(valores[3]),
                        direccion: limpiarTexto(valores[4]),
                        ciudad: parseInt(valores[5]) || 1201,
                        nota: limpiarTexto(valores[6]),
                        fecha_registro: parseInt(valores[7]),
                        cedula: limpiarTexto(valores[11]),
                        telefono2: limpiarTexto(valores[12]),
                        status: parseInt(valores[9])
                    };
                    
                    // Solo agregar clientes válidos
                    if (cliente.nombre && cliente.cedula && cliente.telefono) {
                        clientes.push(cliente);
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Error procesando registro ${index + 1}:`, error.message);
            }
        });
    }
    
    console.log(`✅ Total clientes extraídos: ${clientes.length}`);
    return clientes;
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
    console.log('\n👤 Verificando usuarios base...');
    
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

    const usuariosCreados = [];
    
    for (const userData of usuarios) {
        let usuario = await Usuario.findOne({ email: userData.email });
        if (!usuario) {
            usuario = new Usuario(userData);
            await usuario.save();
            console.log(`✅ Usuario creado: ${userData.nombre}`);
        } else {
            console.log(`⚠️  Usuario ya existe: ${userData.nombre}`);
        }
        usuariosCreados.push(usuario);
    }
    
    return usuariosCreados;
}

async function migrarClientesCompletos(clientes, usuarioAdmin) {
    console.log('\n👥 Migrando TODOS los clientes...');
    
    let contador = 0;
    let saltados = 0;
    
    for (const oldCliente of clientes) {
        try {
            const existeCliente = await Cliente.findOne({ 
                $or: [
                    { cedula: oldCliente.cedula },
                    { telefono: oldCliente.telefono }
                ]
            });
            
            if (!existeCliente) {
                const nuevoCliente = new Cliente({
                    nombre: oldCliente.nombre,
                    cedula: oldCliente.cedula,
                    telefono: oldCliente.telefono,
                    email: oldCliente.email || `cliente${oldCliente.id}@demo.com`,
                    direccion: oldCliente.direccion || 'Dirección no especificada',
                    activo: oldCliente.status === 1
                });

                await nuevoCliente.save();
                contador++;
                
                if (contador % 20 === 0) {
                    console.log(`📈 Progreso: ${contador} clientes migrados...`);
                }
            } else {
                saltados++;
            }
        } catch (error) {
            console.warn(`⚠️  Error migrando cliente ${oldCliente.nombre}:`, error.message);
            saltados++;
        }
    }
    
    console.log(`✅ Clientes migrados: ${contador}`);
    console.log(`⚠️  Clientes saltados: ${saltados}`);
    
    return contador;
}

async function crearPrestamosDemo() {
    console.log('\n💰 Creando préstamos de demostración...');
    
    const clientes = await Cliente.find().limit(10);
    const usuarioAdmin = await Usuario.findOne({ rol: 'admin' });
    const cobrador = await Usuario.findOne({ rol: 'cobrador' });
    
    const prestamosDemo = [];
    
    for (let i = 0; i < Math.min(clientes.length, 5); i++) {
        const cliente = clientes[i];
        
        const existePrestamo = await Prestamo.findOne({ cliente: cliente._id });
        
        if (!existePrestamo) {
            const prestamo = new Prestamo({
                cliente: cliente._id,
                monto: (i + 1) * 10000, // 10k, 20k, 30k, etc.
                interes: 30,
                cuotas: 10 + (i * 2), // 10, 12, 14, etc.
                montoCuota: ((i + 1) * 10000 * 1.3) / (10 + (i * 2)), // Monto + interés / cuotas
                estado: i % 3 === 0 ? 'pagado' : (i % 3 === 1 ? 'activo' : 'mora'),
                cobrador: cobrador._id
            });
            
            await prestamo.save();
            prestamosDemo.push(prestamo);
            console.log(`✅ Préstamo demo creado para ${cliente.nombre}: $${prestamo.monto.toLocaleString()}`);
        }
    }
    
    return prestamosDemo.length;
}

async function mostrarResumenFinal() {
    console.log('\n📊 RESUMEN FINAL DE MIGRACIÓN');
    console.log('==============================');
    
    const stats = {
        usuarios: await Usuario.countDocuments(),
        clientes: await Cliente.countDocuments(),
        prestamos: await Prestamo.countDocuments()
    };
    
    console.log(`👤 Usuarios: ${stats.usuarios}`);
    console.log(`👥 Clientes: ${stats.clientes}`);
    console.log(`💰 Préstamos: ${stats.prestamos}`);
    
    // Mostrar algunos ejemplos
    const clienteEjemplo = await Cliente.findOne();
    const prestamoEjemplo = await Prestamo.findOne().populate('cliente', 'nombre');
    
    if (clienteEjemplo) {
        console.log('\n👤 Ejemplo de cliente migrado:');
        console.log(`   Nombre: ${clienteEjemplo.nombre}`);
        console.log(`   Teléfono: ${clienteEjemplo.telefono}`);
        console.log(`   Cédula: ${clienteEjemplo.cedula}`);
    }
    
    if (prestamoEjemplo) {
        console.log('\n💰 Ejemplo de préstamo:');
        console.log(`   Cliente: ${prestamoEjemplo.cliente.nombre}`);
        console.log(`   Monto: $${prestamoEjemplo.monto.toLocaleString()}`);
        console.log(`   Cuotas: ${prestamoEjemplo.cuotas}`);
        console.log(`   Estado: ${prestamoEjemplo.estado}`);
    }
    
    return stats;
}

async function main() {
    console.log('🚀 MIGRACIÓN SIMPLIFICADA DEL SISTEMA VIEJO');
    console.log('============================================');
    
    try {
        await conectarBD();
        
        // 1. Extraer todos los clientes del SQL
        const clientes = extraerClientesCompletos();
        
        // 2. Crear usuarios base
        const usuarios = await crearUsuariosBase();
        const usuarioAdmin = usuarios.find(u => u.rol === 'admin');
        
        // 3. Migrar todos los clientes
        const clientesMigrados = await migrarClientesCompletos(clientes, usuarioAdmin);
        
        // 4. Crear algunos préstamos demo
        const prestamosCreados = await crearPrestamosDemo();
        
        // 5. Mostrar resumen final
        const stats = await mostrarResumenFinal();
        
        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('\n🔐 Credenciales de acceso:');
        console.log('   Admin: admin@demo.com / admin123');
        console.log('   Cobrador Juan: juan@demo.com / 1234');
        console.log('   Cobrador Miguel: miguel@demo.com / 1234');
        
        console.log(`\n📊 Datos migrados:`);
        console.log(`   👥 ${clientesMigrados} clientes del sistema viejo`);
        console.log(`   💰 ${prestamosCreados} préstamos de demostración`);
        console.log(`   📈 Total en sistema: ${stats.clientes} clientes, ${stats.prestamos} préstamos`);
        
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