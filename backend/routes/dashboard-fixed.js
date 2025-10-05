const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// Estadísticas generales del dashboard con datos migrados
router.get('/estadisticas', auth, async (req, res, next) => {
    try {
        // USAR CONSULTA DIRECTA PARA OBTENER DATOS MIGRADOS
        const db = mongoose.connection.db;
        
        // Obtener estadísticas directas de las colecciones
        const totalClientes = await db.collection('clientes').countDocuments();
        const totalPrestamos = await db.collection('prestamos').countDocuments();
        
        // Estadísticas de préstamos
        const prestamosStats = await db.collection('prestamos').aggregate([
            {
                $group: {
                    _id: null,
                    totalPrestado: { $sum: '$monto' },
                    totalPendiente: { $sum: '$saldoPendiente' },
                    count: { $sum: 1 },
                    activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
                    pagados: { $sum: { $cond: [{ $eq: ['$estado', 'pagado'] }, 1, 0] } },
                    mora: { $sum: { $cond: [{ $eq: ['$estado', 'mora'] }, 1, 0] } }
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

        const estadisticas = {
            cobros: {
                total: cobrosStats[0]?.total || 0,
                cantidad: cobrosStats[0]?.count || 0
            },
            prestamos: {
                totalPrestado: prestamosStats[0]?.totalPrestado || 0,
                totalPendiente: prestamosStats[0]?.totalPendiente || 0,
                cantidad: totalPrestamos,
                activos: prestamosStats[0]?.activos || 0,
                pagados: prestamosStats[0]?.pagados || 0,
                mora: prestamosStats[0]?.mora || 0
            },
            clientes: {
                total: totalClientes
            },
            cobrosPorDia: []
        };

        res.json({
            success: true,
            data: estadisticas
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas dashboard:', error);
        next(error);
    }
});

module.exports = router;