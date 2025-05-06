import Insumo from '../models/insumoModel.js';

// Crear un nuevo insumo
export const createInsumo = async (req, res) => {
  try {
    const requiredFields = ['id_insumo', 'nombre', 'tipo', 'unidad_medida', 'cantidad', 'valor_unitario', 'valor_total'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos faltantes',
        missingFields
      });
    }
    const insumoData = {
      id_insumo: req.body.id_insumo.trim(),
      nombre: req.body.nombre.trim(),
      tipo: req.body.tipo.trim(),
      unidad_medida: req.body.unidad_medida.trim(),
      cantidad: parseFloat(req.body.cantidad),
      valor_unitario: parseFloat(req.body.valor_unitario),
      valor_total: parseFloat(req.body.valor_total),
      descripcion: req.body.descripcion ? req.body.descripcion.trim() : null,
      estado: req.body.estado || 'activo'
    };
    const result = await Insumo.create(insumoData);
    res.status(201).json({
      success: true,
      message: 'Insumo creado correctamente',
      data: { id: result.insertId, ...insumoData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear insumo',
      error: error.message
    });
  }
};

// Obtener todos los insumos
export const getAllInsumos = async (req, res) => {
  try {
    const insumos = await Insumo.getAll();
    res.status(200).json({
      success: true,
      count: insumos.length,
      data: insumos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener insumos',
      error: error.message
    });
  }
};

// Obtener un insumo por ID
export const getInsumoById = async (req, res) => {
  try {
    const insumo = await Insumo.getById(req.params.id);
    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      data: insumo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener insumo',
      error: error.message
    });
  }
};

// Actualizar un insumo
export const updateInsumo = async (req, res) => {
  try {
    const insumo = await Insumo.getById(req.params.id);
    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }
    await Insumo.update(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Insumo actualizado correctamente',
      data: { ...insumo, ...req.body }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar insumo',
      error: error.message
    });
  }
};

// Eliminar un insumo
export const deleteInsumo = async (req, res) => {
  try {
    await Insumo.delete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Insumo eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar insumo',
      error: error.message
    });
  }
};

// Cambiar estado de un insumo
export const toggleInsumoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser "activo" o "inactivo"'
      });
    }
    const insumo = await Insumo.getById(id);
    if (!insumo) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }
    await Insumo.updateStatus(id, estado);
    res.status(200).json({
      success: true,
      message: `Insumo ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del insumo',
      error: error.message
    });
  }
};

// Get insumos by cycle
export const getInsumosByCycle = async (req, res) => {
  try {
    const cycleId = req.params.cycleId;
    const insumos = await Insumo.getByCycle(cycleId);
    
    res.status(200).json({
      success: true,
      count: insumos.length,
      data: insumos
    });
  } catch (error) {
    console.error('Error al obtener insumos por ciclo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener insumos por ciclo',
      error: error.message
    });
  }
};