const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

async function debugClientes() {
    try {
        // Conexión directa MongoDB
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('prestamos');
        
        console.log('=== MONGODB DIRECTO ===');
        const totalMongoDB = await db.collection('clientes').countDocuments();
        console.log('Total clientes MongoDB:', totalMongoDB);
        
        // Obtener los primeros 10 para ver su estructura
        const samples = await db.collection('clientes').find().limit(10).toArray();
        console.log('Muestra de clientes (campos):');
        samples.forEach((cliente, i) => {
            console.log(`Cliente ${i+1}:`, Object.keys(cliente));
        });
        
        await client.close();
        
        // Conexión Mongoose
        console.log('\n=== MONGOOSE ===');
        await mongoose.connect('mongodb://localhost:27017/prestamos');
        
        // Definir modelo simplificado
        const ClienteSchema = new mongoose.Schema({
            nombre: String,
            cedula: String,
            telefono: String,
            email: String,
            direccion: String,
            referencias: String,
            estado: String
        }, { strict: false });
        
        const Cliente = mongoose.model('Cliente', ClienteSchema, 'clientes');
        
        const totalMongoose = await Cliente.countDocuments();
        console.log('Total clientes Mongoose:', totalMongoose);
        
        // Probar con diferentes consultas
        const conEstado = await Cliente.countDocuments({ estado: { $exists: true } });
        console.log('Con estado:', conEstado);
        
        const sinEstado = await Cliente.countDocuments({ estado: { $exists: false } });
        console.log('Sin estado:', sinEstado);
        
        const estadoActivo = await Cliente.countDocuments({ estado: 'activo' });
        console.log('Estado activo:', estadoActivo);
        
        // Verificar validación
        const clientesValidos = await Cliente.find().limit(50);
        console.log('Clientes encontrados por mongoose:', clientesValidos.length);
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

debugClientes();