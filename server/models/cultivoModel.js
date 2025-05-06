import db from '../config/database.js';

// Cultivo (Crop) Model
class Cultivo {
  // Create a new crop
  static async create(cultivoData) {
    try {
      const [result] = await db.query(
        `INSERT INTO cultivos 
        (tipo, nombre, id_cultivo, fotografia, tamano, ubicacion, fecha_siembra, descripcion, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cultivoData.tipo,
          cultivoData.nombre,
          cultivoData.id_cultivo,
          cultivoData.fotografia,
          cultivoData.tamano,
          cultivoData.ubicacion,
          cultivoData.fecha_siembra,
          cultivoData.descripcion,
          cultivoData.estado || 'activo'
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get all crops
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM cultivos');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single crop by ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM cultivos WHERE id_cultivo = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update a crop
  static async update(id, cultivoData) {
    try {
      const [result] = await db.query(
        `UPDATE cultivos SET 
        tipo = ?, 
        nombre = ?, 
        fotografia = ?, 
        tamano = ?, 
        ubicacion = ?, 
        fecha_siembra = ?,
        descripcion = ?, 
        estado = ?
        WHERE id_cultivo = ?`,
        [
          cultivoData.tipo,
          cultivoData.nombre,
          cultivoData.fotografia,
          cultivoData.tamano,
          cultivoData.ubicacion,
          cultivoData.fecha_siembra,
          cultivoData.descripcion,
          cultivoData.estado,
          id
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Update crop status
  static async updateStatus(id, estado) {
    try {
      const [result] = await db.query(
        'UPDATE cultivos SET estado = ? WHERE id_cultivo = ?',
        [estado, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Associate sensors with a crop
  static async associateSensor(cultivoId, sensorId) {
    try {
      const [result] = await db.query(
        `INSERT INTO cultivo_sensor 
        (id_cultivo, id_sensor)
        VALUES (?, ?)`,
        [cultivoId, sensorId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Associate insumos with a crop
  static async associateInsumo(cultivoId, insumoId) {
    try {
      const [result] = await db.query(
        `INSERT INTO cultivo_insumo 
        (id_cultivo, id_insumo)
        VALUES (?, ?)`,
        [cultivoId, insumoId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get sensors associated with a crop
  static async getSensors(cultivoId) {
    try {
      const [rows] = await db.query(
        `SELECT s.* FROM sensores s
        JOIN cultivo_sensor cs ON s.id_sensor = cs.id_sensor
        WHERE cs.id_cultivo = ?`,
        [cultivoId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get insumos associated with a crop
  static async getInsumos(cultivoId) {
    try {
      const [rows] = await db.query(
        `SELECT i.* FROM insumos i
        JOIN cultivo_insumo ci ON i.id_insumo = ci.id_insumo
        WHERE ci.id_cultivo = ?`,
        [cultivoId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Cultivo;