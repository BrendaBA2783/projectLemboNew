import Cultivo from '../models/cultivoModel.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new cultivo
export const createCultivo = async (req, res) => {
  try {
    console.log('Datos recibidos del cliente:', req.body);
    
    // Validate required fields
    const requiredFields = ['nombre', 'tipo', 'tamano', 'ubicacion', 'id_cultivo'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Campos faltantes:', missingFields);
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos faltantes',
        missingFields
      });
    }
    
    // Validate field types
    if (typeof req.body.nombre !== 'string' || 
        typeof req.body.tipo !== 'string' || 
        typeof req.body.tamano !== 'string' || 
        typeof req.body.ubicacion !== 'string' ||
        typeof req.body.id_cultivo !== 'string') {
      console.log('Tipos de datos inválidos:', {
        nombre: typeof req.body.nombre,
        tipo: typeof req.body.tipo,
        tamano: typeof req.body.tamano,
        ubicacion: typeof req.body.ubicacion,
        id_cultivo: typeof req.body.id_cultivo
      });
      return res.status(400).json({
        success: false,
        message: 'Tipos de datos inválidos'
      });
    }
    
    // Process image if uploaded
    if (req.file) {
      req.body.fotografia = `/uploads/cultivos/${req.file.filename}`;
    }
    
    // Ensure all required fields are present
    const cultivoData = {
      nombre: req.body.nombre.trim(),
      tipo: req.body.tipo.trim(),
      id_cultivo: req.body.id_cultivo.trim(),
      tamano: req.body.tamano.trim(),
      ubicacion: req.body.ubicacion.trim(),
      fecha_siembra: req.body.fecha_siembra,
      descripcion: req.body.descripcion ? req.body.descripcion.trim() : null,
      estado: req.body.estado || 'activo',
      fotografia: req.body.fotografia || null
    };
    
    // Log the data being sent to the database
    console.log('Datos del cultivo a guardar:', cultivoData);
    
    // Create the cultivo
    const result = await Cultivo.create(cultivoData);
    
    res.status(201).json({
      success: true,
      message: 'Cultivo creado correctamente',
      data: { id: result.insertId, ...cultivoData }
    });
  } catch (error) {
    console.error('Error al crear cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear cultivo',
      error: error.message,
      sql: error.sql
    });
  }
};

// Get all cultivos
export const getAllCultivos = async (req, res) => {
  try {
    const cultivos = await Cultivo.getAll();
    
    res.status(200).json({
      success: true,
      count: cultivos.length,
      data: cultivos
    });
  } catch (error) {
    console.error('Error al obtener cultivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cultivos',
      error: error.message
    });
  }
};

// Get a single cultivo
export const getCultivoById = async (req, res) => {
  try {
    const cultivo = await Cultivo.getById(req.params.id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: cultivo
    });
  } catch (error) {
    console.error('Error al obtener cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cultivo',
      error: error.message
    });
  }
};

// Update a cultivo
export const updateCultivo = async (req, res) => {
  try {
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(req.params.id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Process image if uploaded
    if (req.file) {
      // Delete old image if exists
      if (cultivo.fotografia && cultivo.fotografia.startsWith('/uploads')) {
        const oldImagePath = path.join(__dirname, '..', cultivo.fotografia);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      req.body.fotografia = `/uploads/cultivos/${req.file.filename}`;
    } else {
      // Keep old image
      req.body.fotografia = cultivo.fotografia;
    }
    
    // Update the cultivo
    await Cultivo.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Cultivo actualizado correctamente',
      data: { ...cultivo, ...req.body }
    });
  } catch (error) {
    console.error('Error al actualizar cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cultivo',
      error: error.message
    });
  }
};

// Toggle cultivo status
export const toggleCultivoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser "activo" o "inactivo"'
      });
    }
    
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Update the status
    await Cultivo.updateStatus(id, estado);
    
    res.status(200).json({
      success: true,
      message: `Cultivo ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado del cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del cultivo',
      error: error.message
    });
  }
};

// Get sensors associated with a cultivo
export const getSensors = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Get sensors
    const sensors = await Cultivo.getSensors(id);
    
    res.status(200).json({
      success: true,
      count: sensors.length,
      data: sensors
    });
  } catch (error) {
    console.error('Error al obtener sensores del cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sensores del cultivo',
      error: error.message
    });
  }
};

// Get insumos associated with a cultivo
export const getInsumos = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Get insumos
    const insumos = await Cultivo.getInsumos(id);
    
    res.status(200).json({
      success: true,
      count: insumos.length,
      data: insumos
    });
  } catch (error) {
    console.error('Error al obtener insumos del cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener insumos del cultivo',
      error: error.message
    });
  }
};

// Associate sensor with a cultivo
export const associateSensor = async (req, res) => {
  try {
    const { id } = req.params;
    const { sensorId } = req.body;
    
    if (!sensorId) {
      return res.status(400).json({
        success: false,
        message: 'ID de sensor requerido'
      });
    }
    
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Associate sensor
    await Cultivo.associateSensor(id, sensorId);
    
    res.status(200).json({
      success: true,
      message: 'Sensor asociado correctamente al cultivo'
    });
  } catch (error) {
    console.error('Error al asociar sensor al cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asociar sensor al cultivo',
      error: error.message
    });
  }
};

// Associate insumo with a cultivo
export const associateInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { insumoId } = req.body;
    
    if (!insumoId) {
      return res.status(400).json({
        success: false,
        message: 'ID de insumo requerido'
      });
    }
    
    // Check if cultivo exists
    const cultivo = await Cultivo.getById(id);
    
    if (!cultivo) {
      return res.status(404).json({
        success: false,
        message: 'Cultivo no encontrado'
      });
    }
    
    // Associate insumo
    await Cultivo.associateInsumo(id, insumoId);
    
    res.status(200).json({
      success: true,
      message: 'Insumo asociado correctamente al cultivo'
    });
  } catch (error) {
    console.error('Error al asociar insumo al cultivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asociar insumo al cultivo',
      error: error.message
    });
  }
};