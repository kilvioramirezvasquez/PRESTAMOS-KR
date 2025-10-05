const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true, index: true },
    monto: { type: Number, required: true },
    interes: { type: Number, required: true },
    cuotas: { type: Number, required: true },
    montoCuota: { type: Number, required: true },
    saldoPendiente: { type: Number, index: true },
    fechaInicio: { type: Date, default: Date.now },
    fechaVencimiento: { type: Date }, // Calculada automáticamente
    estado: { type: String, enum: ['activo', 'pagado', 'mora'], default: 'activo', index: true },
    cobrador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', index: true },
    tipoPrestamo: { 
        type: String, 
        enum: ['amortizado', 'capitalizado', 'capitalizado_fijo', 'capitalizado_fijo_cuotas'], 
        default: 'capitalizado',
        index: true 
    },
    diasPago: { type: Number, default: 7 },
    observaciones: { type: String },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Índices compuestos
prestamoSchema.index({ cobrador: 1, estado: 1 });
prestamoSchema.index({ cliente: 1, estado: 1 });
prestamoSchema.index({ fechaVencimiento: 1, estado: 1 });

// Pre-save para calcular fecha de vencimiento
prestamoSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('fechaInicio') || this.isModified('cuotas')) {
        const fechaVencimiento = new Date(this.fechaInicio);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + (this.cuotas * 7)); // Asumiendo pagos semanales
        this.fechaVencimiento = fechaVencimiento;
    }
    
    // Inicializar saldo pendiente si es nuevo
    if (this.isNew && !this.saldoPendiente) {
        this.saldoPendiente = this.monto + (this.monto * this.interes / 100);
    }
    
    next();
});

module.exports = mongoose.model('Prestamo', prestamoSchema);
