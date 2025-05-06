import db from '../config/database.js';

// Sensor Model
class Sensor {
  // Create a new sensor
  static async create(sensorData) {
    try {
      // Generar id_sensor automáticamente si no se proporciona
      if (!sensorData.id_sensor) {
        // Formato: TIPO-NUMERO (ej: TEMP-001, HUM-001)
        const tipo = sensorData.tipo.substring(0, 4).toUpperCase();
        const timestamp = Date.now().toString().substring(8); // Últimos dígitos del timestamp
        sensorData.id_sensor = `${tipo}-${timestamp}`;
      }

      const [result] = await db.query(
        `INSERT INTO sensores 
        (tipo, id_sensor, nombre, imagen, unidad_medida, tiempo_escaneo, descripcion, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sensorData.tipo,
          sensorData.id_sensor,
          sensorData.nombre,
          sensorData.imagen,
          sensorData.unidad_medida,
          sensorData.tiempo_escaneo,
          sensorData.descripcion,
          sensorData.estado || 'activo'
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get all sensors
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM sensores');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single sensor by ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM sensores WHERE id_sensor = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update a sensor
  static async update(id, sensorData) {
    try {
      const [result] = await db.query(
        `UPDATE sensores SET 
        tipo = ?, 
        nombre = ?, 
        imagen = ?, 
        unidad_medida = ?, 
        tiempo_escaneo = ?, 
        descripcion = ?, 
        estado = ?
        WHERE id_sensor = ?`,
        [
          sensorData.tipo,
          sensorData.nombre,
          sensorData.imagen,
          sensorData.unidad_medida,
          sensorData.tiempo_escaneo,
          sensorData.descripcion,
          sensorData.estado,
          id
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Update sensor status
  static async updateStatus(id, estado) {
    try {
      const [result] = await db.query(
        'UPDATE sensores SET estado = ? WHERE id_sensor = ?',
        [estado, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get sensor readings
  static async getReadings(sensorId, startDate, endDate) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM lecturas_sensores 
        WHERE id_sensor = ? 
        AND fecha BETWEEN ? AND ?
        ORDER BY fecha ASC`,
        [sensorId, startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Save sensor reading
  static async saveReading(readingData) {
    try {
      const [result] = await db.query(
        `INSERT INTO lecturas_sensores 
        (id_sensor, valor, fecha, unidad_medida)
        VALUES (?, ?, ?, ?)`,
        [
          readingData.id_sensor,
          readingData.valor,
          readingData.fecha || new Date(),
          readingData.unidad_medida
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default Sensor;