const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // No incluir por defecto en consultas
    rol: { type: String, enum: ['admin', 'cobrador', 'gerente'], default: 'cobrador', index: true },
    zona: { type: String, index: true },
    telefono: { type: String },
    activo: { type: Boolean, default: true, index: true },
    ultimoLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Índices compuestos
usuarioSchema.index({ rol: 1, activo: 1 });
usuarioSchema.index({ zona: 1, rol: 1 });

// Pre-save middleware para hash de contraseña
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12); // Mayor factor de costo
    next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para actualizar último login
usuarioSchema.methods.actualizarUltimoLogin = function() {
    this.ultimoLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('Usuario', usuarioSchema);
