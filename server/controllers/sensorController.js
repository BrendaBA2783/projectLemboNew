import Sensor from '../models/sensorModel.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new sensor
export const createSensor = async (req, res) => {
  try {
    // Process image if uploaded
    if (req.file) {
      req.body.imagen = `/uploads/sensors/${req.file.filename}`;
    }

    // Create the sensor
    const result = await Sensor.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Sensor creado correctamente',
      data: { ...req.body }
    });
  } catch (error) {
    console.error('Error al crear sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear sensor',
      error: error.message
    });
  }
};

// Get all sensors
export const getAllSensors = async (req, res) => {
  try {
    const sensors = await Sensor.getAll();
    
    res.status(200).json({
      success: true,
      count: sensors.length,
      data: sensors
    });
  } catch (error) {
    console.error('Error al obtener sensores:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sensores',
      error: error.message
    });
  }
};

// Get a single sensor
export const getSensorById = async (req, res) => {
  try {
    const sensor = await Sensor.getById(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: sensor
    });
  } catch (error) {
    console.error('Error al obtener sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sensor',
      error: error.message
    });
  }
};

// Update a sensor
export const updateSensor = async (req, res) => {
  try {
    // Check if sensor exists
    const sensor = await Sensor.getById(req.params.id);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor no encontrado'
      });
    }
    
    // Process image if uploaded
    if (req.file) {
      // Delete old image if exists
      if (sensor.imagen && sensor.imagen.startsWith('/uploads')) {
        const oldImagePath = path.join(__dirname, '..', sensor.imagen);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      req.body.imagen = `/uploads/sensors/${req.file.filename}`;
    } else {
      // Keep old image
      req.body.imagen = sensor.imagen;
    }
    
    // Update the sensor
    await Sensor.update(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Sensor actualizado correctamente',
      data: { ...sensor, ...req.body }
    });
  } catch (error) {
    console.error('Error al actualizar sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar sensor',
      error: error.message
    });
  }
};

// Toggle sensor status
export const toggleSensorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado || !['activo', 'inactivo'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado debe ser "activo" o "inactivo"'
      });
    }
    
    // Check if sensor exists
    const sensor = await Sensor.getById(id);
    
    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor no encontrado'
      });
    }
    
    // Update the status
    await Sensor.updateStatus(id, estado);
    
    res.status(200).json({
      success: true,
      message: `Sensor ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente`
    });
  } catch (error) {
    console.error('Error al cambiar estado del sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del sensor',
      error: error.message
    });
  }
};

// Save sensor reading
export const saveSensorReading = async (req, res) => {
  try {
    const result = await Sensor.saveReading(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Lectura guardada correctamente',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    console.error('Error al guardar lectura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar lectura',
      error: error.message
    });
  }
};

// Get sensor readings
export const getSensorReadings = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren fechas de inicio y fin'
      });
    }
    
    const readings = await Sensor.getReadings(id, startDate, endDate);
    
    res.status(200).json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error al obtener lecturas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener lecturas',
      error: error.message
    });
  }
};