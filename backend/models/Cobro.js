const mongoose = require('mongoose');

const cobroSchema = new mongoose.Schema({
    prestamo: { type: mongoose.Schema.Types.ObjectId, ref: 'Prestamo', required: true, index: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    cobrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, index: true },
    monto: { type: Number, required: true, min: 0.01 },
    metodoPago: { type: String, enum: ['efectivo', 'transferencia', 'tarjeta'], default: 'efectivo' },
    recibo: { type: String },
    ubicacion: { 
        lat: { type: Number, min: -90, max: 90 }, 
        lng: { type: Number, min: -180, max: 180 } 
    },
    fecha: { type: Date, default: Date.now, index: true },
    notas: { type: String, maxlength: 500 }
}, {
    timestamps: true
});

// Índices compuestos para consultas frecuentes
cobroSchema.index({ cobrador: 1, fecha: -1 });
cobroSchema.index({ prestamo: 1, fecha: -1 });
cobroSchema.index({ cliente: 1, fecha: -1 });
cobroSchema.index({ fecha: -1, cobrador: 1 }); // Para reportes por período

// Índice geoespacial para ubicaciones
cobroSchema.index({ ubicacion: '2dsphere' });

module.exports = mongoose.model('Cobro', cobroSchema);
