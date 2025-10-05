const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Endpoint de debug para verificar qué datos encuentra
router.get('/debug-data', auth, async (req, res, next) => {
    try {
        const db = mongoose.connection.db;
        
        // Información de la conexión
        const dbName = db.databaseName;
        const collections = await db.listCollections().toArray();
        
        // Contar en diferentes colecciones posibles
        const clientesCount = await db.collection('clientes').countDocuments();
        const clientesNames = await db.collection('clientes').find({}).sort({nombre: 1}).limit(5).toArray();
        
        res.json({
            success: true,
            debug: {
                database: dbName,
                collections: collections.map(c => c.name),
                clientesCount: clientesCount,
                firstClientes: clientesNames.map(c => c.nombre),
                mongooseConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
            }
        });

    } catch (error) {
        console.error('Error en debug:', error);
        next(error);
    }
});

module.exports = router;