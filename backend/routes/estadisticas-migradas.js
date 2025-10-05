const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Endpoint temporal para estadísticas con datos migrados - SIN AUTENTICACION PARA DEBUG
router.get('/stats', async (req, res, next) => {
    try {
        // Conectar directamente a la base de datos prestamos
        const { MongoClient } = require('mongodb');
        const client = new MongoClient('mongodb://localhost:27017');
        await client.connect();
        const db = client.db('prestamos');
        
        // Obtener estadísticas directas de las colecciones
        const totalClientes = await db.collection('clientes').countDocuments();
        const totalPrestamos = await db.collection('prestamos').countDocuments();
        const totalCobros = await db.collection('cobros').countDocuments();
        
        // Estadísticas de préstamos
        const prestamosStats = await db.collection('prestamos').aggregate([
            {
                $group: {
                    _id: null,
                    totalPrestado: { $sum: '$monto' },
                    totalPendiente: { $sum: '$saldoPendiente' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const prestamosEstados = await db.collection('prestamos').aggregate([
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        // Estadísticas de cobros
        const cobrosStats = await db.collection('cobros').aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$monto' },
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        const cobrosEstados = await db.collection('cobros').aggregate([
            {
                $group: {
                    _id: '$estado',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        
        // Procesar estados de préstamos
        const estadosPrestamos = prestamosEstados.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        
        // Procesar estados de cobros
        const estadosCobros = cobrosEstados.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
        
        const estadisticas = {
            cobros: {
                total: cobrosStats[0]?.total || 0,
                cantidad: cobrosStats[0]?.count || 0,
                estados: estadosCobros
            },
            prestamos: {
                totalPrestado: prestamosStats[0]?.totalPrestado || 0,
                totalPendiente: prestamosStats[0]?.totalPendiente || 0,
                cantidad: prestamosStats[0]?.count || 0,
                activos: estadosPrestamos.activo || 0,
                pagados: estadosPrestamos.pagado || 0,
                mora: estadosPrestamos.mora || 0,
                estados: estadosPrestamos
            },
            clientes: {
                total: totalClientes
            },
            totales: {
                prestamos: totalPrestamos,
                cobros: totalCobros,
                clientes: totalClientes
            }
        };

        // Formatear respuesta para que coincida con lo que espera el frontend
        const dashboardData = {
            totalClientes: totalClientes,
            totalPrestamos: totalPrestamos,
            montoTotal: prestamosStats[0]?.totalPrestado || 0,
            cobrosHoy: 0, // Se puede calcular si es necesario
            clientesActivos: totalClientes,
            prestamosActivos: prestamosStats[0]?.activos || 0,
            morosidad: prestamosStats[0]?.mora || 0,
            ingresosMes: cobrosStats[0]?.total || 0
        };

        res.json(dashboardData);

        // Cerrar la conexión
        await client.close();

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        next(error);
    }
});

module.exports = router;