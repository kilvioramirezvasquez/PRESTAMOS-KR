const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/prestamos';

async function corregirDatosMigrados() {
  try {
    console.log('🔧 Corrigiendo datos migrados para ajustarse al esquema...');
    
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    console.log('✅ Conectado a MongoDB\n');
    
    // 1. Corregir préstamos
    console.log('💰 Corrigiendo préstamos...');
    
    // Cambiar clienteId por cliente
    await db.collection('prestamos').updateMany(
      { clienteId: { $exists: true } },
      [
        {
          $set: {
            cliente: '$clienteId'
          }
        },
        {
          $unset: 'clienteId'
        }
      ]
    );
    
    // Corregir estados
    await db.collection('prestamos').updateMany(
      { estado: 'Completado' },
      { $set: { estado: 'pagado' } }
    );
    
    await db.collection('prestamos').updateMany(
      { estado: 'Vencido' },
      { $set: { estado: 'mora' } }
    );
    
    await db.collection('prestamos').updateMany(
      { estado: 'Activo' },
      { $set: { estado: 'activo' } }
    );
    
    // Corregir tipos de préstamo
    await db.collection('prestamos').updateMany(
      { tipoPrestamo: 'Capitalizado' },
      { $set: { tipoPrestamo: 'capitalizado' } }
    );
    
    await db.collection('prestamos').updateMany(
      { tipoPrestamo: 'Amortizado' },
      { $set: { tipoPrestamo: 'amortizado' } }
    );
    
    await db.collection('prestamos').updateMany(
      { tipoPrestamo: 'Capitalizado Fijo' },
      { $set: { tipoPrestamo: 'capitalizado_fijo' } }
    );
    
    await db.collection('prestamos').updateMany(
      { tipoPrestamo: 'Capitalizado Fijo con Cuotas' },
      { $set: { tipoPrestamo: 'capitalizado_fijo_cuotas' } }
    );
    
    // Mapear montoCuota a cuotas (campo requerido)
    await db.collection('prestamos').updateMany(
      { totalCuotas: { $exists: true } },
      [
        {
          $set: {
            cuotas: '$totalCuotas',
            interes: { $ifNull: ['$tasaInteres', 20] } // Valor por defecto
          }
        },
        {
          $unset: ['totalCuotas', 'tasaInteres']
        }
      ]
    );
    
    console.log('✅ Préstamos corregidos');
    
    // 2. Corregir cobros
    console.log('📋 Corrigiendo cobros...');
    
    // Cambiar prestamoId por prestamo y clienteId por cliente
    await db.collection('cobros').updateMany(
      { 
        prestamoId: { $exists: true },
        clienteId: { $exists: true }
      },
      [
        {
          $set: {
            prestamo: '$prestamoId',
            cliente: '$clienteId',
            monto: { $ifNull: ['$montoCobro', '$montoTotal'] },
            fecha: { $ifNull: ['$fechaCobro', '$fechaCreacion'] }
          }
        },
        {
          $unset: ['prestamoId', 'clienteId', 'montoCobro', 'fechaCobro']
        }
      ]
    );
    
    console.log('✅ Cobros corregidos');
    
    // 3. Verificar estadísticas finales
    console.log('\n📊 VERIFICACIÓN FINAL:');
    console.log('='.repeat(40));
    
    const totalClientes = await db.collection('clientes').countDocuments();
    const totalPrestamos = await db.collection('prestamos').countDocuments();
    const totalCobros = await db.collection('cobros').countDocuments();
    
    const prestamosActivos = await db.collection('prestamos').countDocuments({ estado: 'activo' });
    const prestamosMora = await db.collection('prestamos').countDocuments({ estado: 'mora' });
    const prestamosPagados = await db.collection('prestamos').countDocuments({ estado: 'pagado' });
    
    const totalPrestado = await db.collection('prestamos').aggregate([
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]).toArray();
    
    const totalPendiente = await db.collection('prestamos').aggregate([
      { $match: { estado: { $in: ['activo', 'mora'] } } },
      { $group: { _id: null, total: { $sum: '$saldoPendiente' } } }
    ]).toArray();
    
    console.log(`👥 Clientes: ${totalClientes}`);
    console.log(`💰 Préstamos: ${totalPrestamos}`);
    console.log(`   - Activos: ${prestamosActivos}`);
    console.log(`   - En mora: ${prestamosMora}`);
    console.log(`   - Pagados: ${prestamosPagados}`);
    console.log(`📋 Cobros: ${totalCobros}`);
    console.log(`💵 Total prestado: $${totalPrestado[0]?.total?.toLocaleString() || 0}`);
    console.log(`💸 Total pendiente: $${totalPendiente[0]?.total?.toLocaleString() || 0}`);
    
    console.log('\n✅ ¡CORRECCIÓN COMPLETADA!');
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

corregirDatosMigrados().catch(console.error);