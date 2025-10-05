const mongoose = require('mongoose');

async function fixMigratedData() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/prestamos');
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;

        // 1. Arreglar estados nulos de clientes
        console.log('\n📋 Arreglando estados de clientes...');
        const clientesStateResult = await db.collection('clientes').updateMany(
            { estado: null },
            { $set: { estado: 'activo' } }
        );
        console.log(`✅ Estados de clientes actualizados: ${clientesStateResult.modifiedCount}`);

        // 2. Arreglar cédulas duplicadas
        console.log('\n🆔 Arreglando cédulas duplicadas...');
        const duplicateCedulas = await db.collection('clientes').aggregate([
            { $group: { _id: '$cedula', count: { $sum: 1 }, docs: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        for (const duplicate of duplicateCedulas) {
            const docs = duplicate.docs;
            for (let i = 1; i < docs.length; i++) {
                const newCedula = duplicate._id + '_' + i;
                await db.collection('clientes').updateOne(
                    { _id: docs[i] },
                    { $set: { cedula: newCedula } }
                );
            }
        }
        console.log(`✅ Cédulas duplicadas arregladas: ${duplicateCedulas.length}`);

        // 3. Verificar teléfonos vacíos
        console.log('\n📞 Arreglando teléfonos vacíos...');
        const phoneResult = await db.collection('clientes').updateMany(
            { $or: [{ telefono: '' }, { telefono: null }, { telefono: { $exists: false } }] },
            { $set: { telefono: '000-000-0000' } }
        );
        console.log(`✅ Teléfonos vacíos arreglados: ${phoneResult.modifiedCount}`);

        // 4. Arreglar nombres vacíos
        console.log('\n👤 Arreglando nombres vacíos...');
        const nameResult = await db.collection('clientes').updateMany(
            { $or: [{ nombre: '' }, { nombre: null }, { nombre: { $exists: false } }] },
            { $set: { nombre: 'Cliente Sin Nombre' } }
        );
        console.log(`✅ Nombres vacíos arreglados: ${nameResult.modifiedCount}`);

        // 5. Verificar estados de préstamos
        console.log('\n💰 Verificando estados de préstamos...');
        const prestamosWithoutState = await db.collection('prestamos').countDocuments({
            $or: [{ estado: null }, { estado: { $exists: false } }]
        });
        
        if (prestamosWithoutState > 0) {
            await db.collection('prestamos').updateMany(
                { $or: [{ estado: null }, { estado: { $exists: false } }] },
                { $set: { estado: 'activo' } }
            );
            console.log(`✅ Estados de préstamos arreglados: ${prestamosWithoutState}`);
        } else {
            console.log('✅ Estados de préstamos están bien');
        }

        // 6. Verificar estadísticas finales
        console.log('\n📊 Estadísticas finales:');
        const totalClientes = await db.collection('clientes').countDocuments();
        const totalPrestamos = await db.collection('prestamos').countDocuments();
        const totalCobros = await db.collection('cobros').countDocuments();
        
        console.log(`📈 Total Clientes: ${totalClientes}`);
        console.log(`💰 Total Préstamos: ${totalPrestamos}`);
        console.log(`💵 Total Cobros: ${totalCobros}`);

        // 7. Verificar que los datos son válidos para mongoose
        console.log('\n🔍 Verificando validación de datos...');
        const clientesConProblemas = await db.collection('clientes').find({
            $or: [
                { nombre: { $in: ['', null] } },
                { cedula: { $in: ['', null] } },
                { telefono: { $in: ['', null] } },
                { estado: { $nin: ['activo', 'inactivo', 'mora'] } }
            ]
        }).count();
        
        console.log(`⚠️  Clientes con problemas de validación: ${clientesConProblemas}`);

        console.log('\n✅ Limpieza de datos completada!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

fixMigratedData();