import CicloCultivo from '../models/cicloCultivoModel.js';

// Create a new crop cycle
export const createCicloCultivo = async (req, res) => {
  try {
    const result = await CicloCultivo.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Ciclo de cultivo creado correctamente',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('Error al crear ciclo de cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear ciclo de cultivo',
      error: error.message
    });
  }
};

// Get all crop cycles
export const getAllCiclosCultivo = async (req, res) => {
  try {
    const ciclos = await CicloCultivo.getAll();
    
    res.status(200).json({
      success: true,
      count: ciclos.length,
      data: ciclos
    });
  } catch (error) {
    console.error('Error al obtener ciclos de cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ciclos de cultivo',
      error: error.message
    });
  }
};

// Get a single crop cycle
export const getCicloCultivoById = async (req, res) => {
  try {
    const ciclo = await CicloCultivo.getById(req.params.id);
    
    if (!ciclo) {
      return res.status(404).json({
        success: false,
        message: 'Ciclo de cultivo no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: ciclo
    });
  } catch (error) {
    console.error('Error al obtener ciclo de cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ciclo de cultivo',
      error: error.message
    });
  }
};

// Update a crop cycle
export const updateCicloCultivo = async (req, res) => {
  try {
    const id = req.params.id;
    
    // If only updating estado, use toggleStatus
    if (Object.keys(req.body).length === 1 && 'estado' in req.body) {
      const success = await CicloCultivo.toggleStatus(id, req.body.estado);
      if (success) {
        res.json({ success: true, message: 'Estado actualizado correctamente' });
      } else {
        res.status(404).json({ success: false, message: 'Ciclo de cultivo no encontrado' });
      }
      return;
    }

    // Otherwise proceed with normal update
    const updated = await CicloCultivo.update(id, req.body);
    if (updated) {
      res.json({ success: true, message: 'Ciclo de cultivo actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Ciclo de cultivo no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar ciclo de cultivo:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Toggle crop cycle status
export const toggleCicloCultivoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser "activo" o "inactivo"'
      });
    }
    
    // Check if cycle exists
    const ciclo = await CicloCultivo.getById(id);
    
    if (!ciclo) {
      return res.status(404).json({
        success: false,
        message: 'Ciclo de cultivo no encontrado'
      });
    }
    
    // Update the status
    await CicloCultivo.updateStatus(id, estado);
    
    res.status(200).json({
      success: true,
      message: `Ciclo de cultivo ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado del ciclo de cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del ciclo de cultivo',
      error: error.message
    });
  }
};

// Get cycles by crop
export const getCiclosByCrop = async (req, res) => {
  try {
    const cropId = req.params.cropId;
    const ciclos = await CicloCultivo.getByCrop(cropId);
    
    res.status(200).json({
      success: true,
      count: ciclos.length,
      data: ciclos
    });
  } catch (error) {
    console.error('Error al obtener ciclos por cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ciclos por cultivo',
      error: error.message
    });
  }
};