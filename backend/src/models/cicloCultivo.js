const mongoose = require('mongoose');

const cicloCultivoSchema = new mongoose.Schema({
    id_ciclo: {
        type: String,
        required: true,
        unique: true
    },
    id_cultivo: {
        type: String,
        required: true,
        ref: 'Cultivo'
    },
    fecha_inicio: {
        type: Date,
        required: true
    },
    fecha_fin_estimada: {
        type: Date,
        required: true
    },
    fecha_fin_real: {
        type: Date
    },
    estado: {
        type: String,
        enum: ['planificado', 'en_progreso', 'completado', 'cancelado'],
        default: 'planificado'
    },
    area_cultivada: {
        type: Number,
        required: true
    },
    rendimiento_estimado: {
        type: Number,
        required: true
    },
    rendimiento_real: {
        type: Number
    },
    observaciones: {
        type: String
    },
    insumos_utilizados: [{
        id_insumo: {
            type: String,
            ref: 'Insumo'
        },
        cantidad: Number,
        fecha_aplicacion: Date
    }],
    sensores_asignados: [{
        type: String,
        ref: 'Sensor'
    }]
}, {
    timestamps: true
});

// Middleware para generar ID automático antes de guardar
cicloCultivoSchema.pre('save', async function(next) {
    if (!this.id_ciclo) {
        const count = await this.constructor.countDocuments();
        this.id_ciclo = `CIC-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('CicloCultivo', cicloCultivoSchema); 