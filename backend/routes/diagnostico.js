const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Endpoint de diagnóstico temporal
router.get('/diagnostico-clientes', auth, async (req, res, next) => {
    try {
        // Conectar directamente a MongoDB
        const { MongoClient } = require('mongodb');
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('prestamos');
        
        // Contar directamente desde MongoDB
        const totalMongoDB = await db.collection('clientes').countDocuments();
        
        // Contar con mongoose
        const Cliente = require('../models/Cliente');
        const totalMongoose = await Cliente.countDocuments();
        
        // Obtener algunos ejemplos con mongoose
        const clientesMongoose = await Cliente.find().limit(5);
        
        // Obtener algunos ejemplos con MongoDB directo
        const clientesMongoDB = await db.collection('clientes').find().limit(5).toArray();
        
        await client.close();
        
        res.json({
            success: true,
            data: {
                totalMongoDB,
                totalMongoose,
                ejemplosMongoose: clientesMongoose.map(c => ({
                    nombre: c.nombre,
                    estado: c.estado,
                    telefono: c.telefono
                })),
                ejemplosMongoDB: clientesMongoDB.map(c => ({
                    nombre: c.nombre,
                    estado: c.estado,
                    telefono: c.telefono
                }))
            }
        });

    } catch (error) {
        console.error('Error en diagnóstico:', error);
        next(error);
    }
});

module.exports = router;