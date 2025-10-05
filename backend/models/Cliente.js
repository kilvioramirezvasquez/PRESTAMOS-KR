const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: { type: String },
    cedula: { type: String },
    telefono: { type: String },
    email: { type: String },
    direccion: { type: String },
    zona: { type: String },
    cobrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    estado: { type: String, default: 'activo' },
    createdAt: { type: Date },
    updatedAt: { type: Date }
}, {
    timestamps: false,
    strict: false
});

// Índices compuestos para optimizar consultas frecuentes
clienteSchema.index({ cobrador: 1, estado: 1 });
clienteSchema.index({ zona: 1, estado: 1 });
clienteSchema.index({ nombre: 'text', cedula: 'text' }); // Para búsquedas de texto

module.exports = mongoose.model('Cliente', clienteSchema);
