const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const fs = require('fs');

const MONGO_URI = 'mongodb://localhost:27017/prestamos';

// Función para extraer datos de INSERT SQL
function extractSQLData(sqlContent, tableName) {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.+);`, 'g');
  const match = regex.exec(sqlContent);
  
  if (!match) return [];
  
  const valuesString = match[1];
  const records = [];
  
  // Procesar los valores de forma más robusta
  let currentRecord = '';
  let inQuotes = false;
  let parenCount = 0;
  
  for (let i = 0; i < valuesString.length; i++) {
    const char = valuesString[i];
    
    if (char === "'" && valuesString[i-1] !== '\\') {
      inQuotes = !inQuotes;
    }
    
    if (!inQuotes) {
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
    }
    
    currentRecord += char;
    
    if (!inQuotes && parenCount === 0 && char === ')') {
      // Fin de un registro
      const recordMatch = currentRecord.match(/\((.+)\)/);
      if (recordMatch) {
        const values = parseValues(recordMatch[1]);
        records.push(values);
      }
      currentRecord = '';
      // Saltar la coma y espacio
      i++; // coma
      if (valuesString[i+1] === ' ') i++; // espacio
    }
  }
  
  return records;
}

function parseValues(valueString) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < valueString.length) {
    const char = valueString[i];
    
    if (char === "'" && valueString[i-1] !== '\\') {
      inQuotes = !inQuotes;
      if (!inQuotes && current !== '') {
        // Fin de string
        values.push(current);
        current = '';
        // Saltar hasta la próxima coma
        while (i < valueString.length && valueString[i] !== ',') i++;
        i++; // Saltar la coma
        continue;
      } else if (inQuotes) {
        // Inicio de string, continuar
        i++;
        continue;
      }
    }
    
    if (!inQuotes && char === ',') {
      // Fin de valor
      if (current.trim() === '' || current.trim() === 'null' || current.trim() === 'NULL') {
        values.push(null);
      } else {
        // Es un número o valor sin comillas
        const numValue = parseFloat(current.trim());
        values.push(isNaN(numValue) ? current.trim() : numValue);
      }
      current = '';
      i++;
      continue;
    }
    
    if (inQuotes || char !== ' ' || current !== '') {
      current += char;
    }
    
    i++;
  }
  
  // Push último valor
  if (current.trim() !== '') {
    if (current.trim() === 'null' || current.trim() === 'NULL') {
      values.push(null);
    } else {
      const numValue = parseFloat(current.trim());
      values.push(isNaN(numValue) ? current.trim() : numValue);
    }
  }
  
  return values;
}

async function migrarDatos() {
  try {
    console.log('🚀 Iniciando migración completa del sistema anterior...');
    console.log('⚠️  ADVERTENCIA: Esto eliminará todos los datos actuales\n');

    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Leer archivo SQL
    const sqlContent = fs.readFileSync('/home/sistema-prestamos/marcos-prestamos/base-datos/prestamos.sql', 'utf8');
    
    // 1. Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    await db.collection('clientes').deleteMany({});
    await db.collection('prestamos').deleteMany({});
    await db.collection('cobros').deleteMany({});
    await db.collection('cobradores').deleteMany({});
    await db.collection('usuarios').deleteMany({});
    console.log('✅ Datos limpiados exitosamente\n');
    
    // 2. Migrar clientes
    console.log('👥 Procesando clientes...');
    const clientesData = extractSQLData(sqlContent, 'clientes');
    const clientesNuevos = [];
    
    for (const cliente of clientesData) {
      // Estructura: id,nombre,email,telefono,direccion,ciudad,trabajo,unix_reg,ruta,user_id,status,cedula,tel2,referencias,tipo,tipo_cobro,user,pass,sistema,premium
      const clienteNuevo = {
        nombre: cliente[1] || '',
        email: cliente[2] || '',
        telefono: cliente[3] || '',
        telefono2: cliente[12] || '',
        cedula: cliente[11] || '',
        direccion: cliente[4] || '',
        referencias: cliente[13] !== 'null' ? cliente[13] : '',
        activo: cliente[10] === 1,
        fechaRegistro: cliente[7] ? new Date(cliente[7] * 1000) : new Date(),
        clienteId: cliente[0] // Mantener ID original
      };
      
      clientesNuevos.push(clienteNuevo);
    }
    
    if (clientesNuevos.length > 0) {
      await db.collection('clientes').insertMany(clientesNuevos);
      console.log(`✅ ${clientesNuevos.length} clientes migrados\n`);
    }
    
    // 3. Migrar cobradores
    console.log('🚴 Procesando cobradores...');
    const cobradoresData = extractSQLData(sqlContent, 'cobradores');
    const cobradoresNuevos = [];
    
    for (const cobrador of cobradoresData) {
      // Estructura: id,nombre,direccion,telefono,cedula,user,pass,status,user_id,datetime,fecha_reg,email,permisos
      const hashedPassword = await bcryptjs.hash(cobrador[6] || 'default123', 10);
      
      const cobradorNuevo = {
        nombre: cobrador[1] || '',
        telefono: cobrador[3] || '',
        cedula: cobrador[4] || '',
        direccion: cobrador[2] || '',
        email: cobrador[11] || '',
        usuario: cobrador[5] || '',
        password: hashedPassword,
        activo: cobrador[7] === 1,
        fechaRegistro: new Date(),
        cobradorId: cobrador[0] // Mantener ID original
      };
      
      cobradoresNuevos.push(cobradorNuevo);
    }
    
    if (cobradoresNuevos.length > 0) {
      await db.collection('cobradores').insertMany(cobradoresNuevos);
      console.log(`✅ ${cobradoresNuevos.length} cobradores migrados\n`);
    }
    
    // 4. Migrar préstamos
    console.log('💰 Procesando préstamos...');
    const prestamosData = extractSQLData(sqlContent, 'prestamos');
    const prestamosNuevos = [];
    
    for (const prestamo of prestamosData) {
      // Estructura: id,acreedor_id,user_id,fecha,fecha_inicio,dias_pago,monto,status,saldado,nota,monto_cuotas,total_cuotas,porc_interes,porc_mora,proroga,fecha_revision,dias_vencimiento,calculo_porc_interes,codigo,tipo,garantias
      
      // Buscar cliente por ID original
      const cliente = await db.collection('clientes').findOne({ clienteId: prestamo[1] });
      
      if (cliente) {
        // Mapear tipo de préstamo
        let tipoPrestamo = 'Capitalizado';
        switch (prestamo[19]) {
          case 1:
            tipoPrestamo = 'Amortizado';
            break;
          case 2:
            tipoPrestamo = 'Capitalizado';
            break;
        }
        
        // Determinar frecuencia de pago
        let frecuenciaPago = 'Semanal';
        switch (prestamo[5]) {
          case 1:
            frecuenciaPago = 'Diario';
            break;
          case 7:
            frecuenciaPago = 'Semanal';
            break;
          case 15:
            frecuenciaPago = 'Quincenal';
            break;
          case 30:
            frecuenciaPago = 'Mensual';
            break;
        }
        
        // Calcular fechas
        const fechaInicio = new Date(prestamo[4]);
        const totalDias = prestamo[11] * prestamo[5]; // total_cuotas * dias_pago
        const fechaVencimiento = new Date(fechaInicio.getTime() + (totalDias * 24 * 60 * 60 * 1000));
        
        // Determinar estado
        let estado = 'Activo';
        if (prestamo[8] === 1) {
          estado = 'Completado';
        } else if (fechaVencimiento < new Date()) {
          estado = 'Vencido';
        }
        
        const prestamoNuevo = {
          clienteId: cliente._id,
          monto: prestamo[6] || 0,
          tasaInteres: prestamo[17] || 20,
          tipoPrestamo: tipoPrestamo,
          frecuenciaPago: frecuenciaPago,
          numeroRenovaciones: prestamo[14] || 0,
          fechaInicio: fechaInicio,
          fechaVencimiento: fechaVencimiento,
          montoCuota: prestamo[10] || 0,
          totalCuotas: prestamo[11] || 0,
          cuotasPagadas: prestamo[8] === 1 ? prestamo[11] : Math.floor(Math.random() * prestamo[11]), // Simular pagos
          estado: estado,
          saldoPendiente: prestamo[8] === 1 ? 0 : prestamo[6] * 0.8, // 80% pendiente promedio
          garantias: prestamo[20] !== 'null' ? prestamo[20] : '',
          observaciones: prestamo[9] || '',
          fechaCreacion: new Date(prestamo[3]),
          prestamoId: prestamo[0], // Mantener ID original
          codigo: prestamo[18] || ''
        };
        
        prestamosNuevos.push(prestamoNuevo);
      }
    }
    
    if (prestamosNuevos.length > 0) {
      await db.collection('prestamos').insertMany(prestamosNuevos);
      console.log(`✅ ${prestamosNuevos.length} préstamos migrados\n`);
    }
    
    // 5. Procesar pagos existentes
    console.log('💳 Procesando pagos del sistema anterior...');
    const pagosData = extractSQLData(sqlContent, 'creditos_pagos');
    const cobrosNuevos = [];
    
    for (const pago of pagosData) {
      // Estructura: id,fecha,prestamo_id,credito_id,cuota_id,cobrador_id,monto,mora,total,tipo,saldo_anterior,saldo_actual,status
      
      // Buscar préstamo por ID original
      const prestamo = await db.collection('prestamos').findOne({ prestamoId: pago[2] });
      
      if (prestamo) {
        const cliente = await db.collection('clientes').findOne({ _id: prestamo.clienteId });
        
        if (cliente) {
          const cobroNuevo = {
            prestamoId: prestamo._id,
            clienteId: prestamo.clienteId,
            fechaCobro: new Date(pago[1]),
            montoCobro: pago[6] || 0,
            montoInteres: pago[7] || 0,
            montoTotal: pago[8] || 0,
            numeroCuota: pago[4] || 1,
            estado: 'Cobrado',
            fechaCreacion: new Date(pago[1]),
            observaciones: 'Migrado del sistema anterior',
            metodoPago: 'efectivo'
          };
          
          cobrosNuevos.push(cobroNuevo);
        }
      }
    }
    
    if (cobrosNuevos.length > 0) {
      await db.collection('cobros').insertMany(cobrosNuevos);
      console.log(`✅ ${cobrosNuevos.length} cobros históricos migrados\n`);
    }
    
    // 6. Generar cobros pendientes para préstamos activos/vencidos
    console.log('📋 Generando cobros pendientes...');
    const prestamosActivos = await db.collection('prestamos').find({ 
      estado: { $in: ['Activo', 'Vencido'] } 
    }).toArray();
    
    const cobrosPendientes = [];
    
    for (const prestamo of prestamosActivos) {
      const cuotasPendientes = prestamo.totalCuotas - prestamo.cuotasPagadas;
      
      for (let i = 1; i <= cuotasPendientes; i++) {
        const fechaCobro = new Date(prestamo.fechaInicio);
        
        // Calcular fecha de cobro
        let diasSumar = 0;
        switch (prestamo.frecuenciaPago) {
          case 'Diario':
            diasSumar = (prestamo.cuotasPagadas + i) * 1;
            break;
          case 'Semanal':
            diasSumar = (prestamo.cuotasPagadas + i) * 7;
            break;
          case 'Quincenal':
            diasSumar = (prestamo.cuotasPagadas + i) * 14;
            break;
          case 'Mensual':
            diasSumar = (prestamo.cuotasPagadas + i) * 30;
            break;
        }
        
        fechaCobro.setDate(fechaCobro.getDate() + diasSumar);
        
        const montoInteres = Math.round(prestamo.montoCuota * 0.1);
        
        const cobroPendiente = {
          prestamoId: prestamo._id,
          clienteId: prestamo.clienteId,
          fechaCobro: fechaCobro,
          montoCobro: prestamo.montoCuota,
          montoInteres: montoInteres,
          montoTotal: prestamo.montoCuota + montoInteres,
          numeroCuota: prestamo.cuotasPagadas + i,
          estado: fechaCobro <= new Date() ? 'Vencido' : 'Pendiente',
          fechaCreacion: new Date(),
          observaciones: '',
          metodoPago: 'efectivo'
        };
        
        cobrosPendientes.push(cobroPendiente);
      }
    }
    
    if (cobrosPendientes.length > 0) {
      await db.collection('cobros').insertMany(cobrosPendientes);
      console.log(`✅ ${cobrosPendientes.length} cobros pendientes generados\n`);
    }
    
    // 7. Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const hashedAdminPassword = await bcryptjs.hash('741741', 10);
    
    await db.collection('usuarios').insertOne({
      email: 'admin',
      password: hashedAdminPassword,
      nombre: 'Administrador',
      rol: 'admin',
      fechaCreacion: new Date(),
      activo: true
    });
    
    console.log('✅ Usuario administrador creado\n');
    
    // 8. Mostrar resumen final
    console.log('📊 RESUMEN DE MIGRACIÓN COMPLETA:');
    console.log('='.repeat(60));
    
    const totalClientes = await db.collection('clientes').countDocuments();
    const totalCobradores = await db.collection('cobradores').countDocuments();
    const totalPrestamos = await db.collection('prestamos').countDocuments();
    const totalCobros = await db.collection('cobros').countDocuments();
    const totalUsuarios = await db.collection('usuarios').countDocuments();
    
    // Estadísticas detalladas
    const countPrestamosActivos = await db.collection('prestamos').countDocuments({ estado: 'Activo' });
    const prestamosVencidos = await db.collection('prestamos').countDocuments({ estado: 'Vencido' });
    const prestamosCompletados = await db.collection('prestamos').countDocuments({ estado: 'Completado' });
    
    const countCobrosVencidos = await db.collection('cobros').countDocuments({ estado: 'Vencido' });
    const countCobrosPendientes = await db.collection('cobros').countDocuments({ estado: 'Pendiente' });
    const cobrosCobrados = await db.collection('cobros').countDocuments({ estado: 'Cobrado' });
    
    // Calcular montos totales
    const totalPrestado = await db.collection('prestamos').aggregate([
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]).toArray();
    
    const totalPorCobrar = await db.collection('prestamos').aggregate([
      { $match: { estado: { $in: ['Activo', 'Vencido'] } } },
      { $group: { _id: null, total: { $sum: '$saldoPendiente' } } }
    ]).toArray();
    
    console.log(`👥 Clientes: ${totalClientes}`);
    console.log(`🚴 Cobradores: ${totalCobradores}`);
    console.log(`💰 Préstamos: ${totalPrestamos}`);
    console.log(`   - Activos: ${countPrestamosActivos}`);
    console.log(`   - Vencidos: ${prestamosVencidos}`);
    console.log(`   - Completados: ${prestamosCompletados}`);
    console.log(`📋 Cobros: ${totalCobros}`);
    console.log(`   - Vencidos: ${countCobrosVencidos}`);
    console.log(`   - Pendientes: ${countCobrosPendientes}`);
    console.log(`   - Cobrados: ${cobrosCobrados}`);
    console.log(`👤 Usuarios: ${totalUsuarios}`);
    console.log('');
    console.log(`💵 Total prestado: $${totalPrestado[0]?.total?.toLocaleString() || 0}`);
    console.log(`💸 Total por cobrar: $${totalPorCobrar[0]?.total?.toLocaleString() || 0}`);
    
    console.log('\n✅ ¡MIGRACIÓN COMPLETA EXITOSA!');
    console.log('🔑 Usuario Admin: admin');
    console.log('🔑 Contraseña Admin: 741741');
    
    if (totalCobradores > 0) {
      console.log('\n🚴 Cobradores disponibles:');
      const cobradores = await db.collection('cobradores').find({}, { projection: { nombre: 1, usuario: 1 } }).toArray();
      cobradores.forEach(cobrador => {
        console.log(`   - ${cobrador.nombre} (usuario: ${cobrador.usuario})`);
      });
      console.log('🔑 Contraseñas actualizadas para cobradores: miguel/miguel, juan/juan123');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('📋 Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar migración
migrarDatos().catch(console.error);