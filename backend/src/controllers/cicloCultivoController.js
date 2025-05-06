const CicloCultivo = require('../models/cicloCultivo');

// Obtener todos los ciclos de cultivo
exports.getAllCiclos = async (req, res) => {
    try {
        const ciclos = await CicloCultivo.find()
            .populate('id_cultivo')
            .populate('insumos_utilizados.id_insumo')
            .populate('sensores_asignados');
        res.json(ciclos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un ciclo de cultivo por ID
exports.getCicloById = async (req, res) => {
    try {
        const ciclo = await CicloCultivo.findOne({ id_ciclo: req.params.id })
            .populate('id_cultivo')
            .populate('insumos_utilizados.id_insumo')
            .populate('sensores_asignados');
        
        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo de cultivo no encontrado' });
        }
        res.json(ciclo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo ciclo de cultivo
exports.createCiclo = async (req, res) => {
    try {
        const ciclo = new CicloCultivo(req.body);
        await ciclo.save();
        res.status(201).json(ciclo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar un ciclo de cultivo
exports.updateCiclo = async (req, res) => {
    try {
        const ciclo = await CicloCultivo.findOneAndUpdate(
            { id_ciclo: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo de cultivo no encontrado' });
        }
        res.json(ciclo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un ciclo de cultivo
exports.deleteCiclo = async (req, res) => {
    try {
        const ciclo = await CicloCultivo.findOneAndDelete({ id_ciclo: req.params.id });
        
        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo de cultivo no encontrado' });
        }
        res.json({ message: 'Ciclo de cultivo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener ciclos por estado
exports.getCiclosByEstado = async (req, res) => {
    try {
        const ciclos = await CicloCultivo.find({ estado: req.params.estado })
            .populate('id_cultivo')
            .populate('insumos_utilizados.id_insumo')
            .populate('sensores_asignados');
        res.json(ciclos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agregar insumo a un ciclo
exports.addInsumo = async (req, res) => {
    try {
        const ciclo = await CicloCultivo.findOne({ id_ciclo: req.params.id });
        
        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo de cultivo no encontrado' });
        }

        ciclo.insumos_utilizados.push(req.body);
        await ciclo.save();
        res.json(ciclo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Asignar sensor a un ciclo
exports.addSensor = async (req, res) => {
    try {
        const ciclo = await CicloCultivo.findOne({ id_ciclo: req.params.id });
        
        if (!ciclo) {
            return res.status(404).json({ message: 'Ciclo de cultivo no encontrado' });
        }

        if (!ciclo.sensores_asignados.includes(req.body.id_sensor)) {
            ciclo.sensores_asignados.push(req.body.id_sensor);
            await ciclo.save();
        }
        
        res.json(ciclo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 