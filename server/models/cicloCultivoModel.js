import db from '../config/database.js';

// Ciclo Cultivo (Crop Cycle) Model
class CicloCultivo {
  // Create a new crop cycle
  static async create(cicloData) {
    try {
      const [result] = await db.query(
        `INSERT INTO ciclos_cultivo 
        (id_ciclo, nombre, descripcion, fecha_inicial, fecha_final, novedades, estado, id_cultivo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cicloData.id_ciclo,
          cicloData.nombre,
          cicloData.descripcion,
          cicloData.fecha_inicial,
          cicloData.fecha_final,
          cicloData.novedades,
          cicloData.estado || 'activo',
          cicloData.id_cultivo
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get all crop cycles
  static async getAll() {
    try {
      const [rows] = await db.query(`
        SELECT cc.*, c.nombre as nombre_cultivo 
        FROM ciclos_cultivo cc
        JOIN cultivos c ON cc.id_cultivo = c.id_cultivo
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get a single crop cycle by ID
  static async getById(id) {
    try {
      const [rows] = await db.query(`
        SELECT cc.*, c.nombre as nombre_cultivo 
        FROM ciclos_cultivo cc
        JOIN cultivos c ON cc.id_cultivo = c.id_cultivo
        WHERE cc.id_ciclo = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update a crop cycle
  static async update(id, cicloData) {
    try {
      const [result] = await db.query(
        `UPDATE ciclos_cultivo SET 
        nombre = ?, 
        descripcion = ?, 
        fecha_inicial = ?, 
        fecha_final = ?, 
        novedades = ?, 
        estado = ?,
        id_cultivo = ?
        WHERE id_ciclo = ?`,
        [
          cicloData.nombre,
          cicloData.descripcion,
          cicloData.fecha_inicial,
          cicloData.fecha_final,
          cicloData.novedades,
          cicloData.estado,
          cicloData.id_cultivo,
          id
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Update crop cycle status
  static async updateStatus(id, estado) {
    try {
      const [result] = await db.query(
        'UPDATE ciclos_cultivo SET estado = ? WHERE id_ciclo = ?',
        [estado, id]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Toggle crop cycle status
  static async toggleStatus(id, newState) {
    try {
      const query = `
        UPDATE ciclos_cultivo 
        SET estado = ?
        WHERE id_ciclo = ?
      `;
      const [result] = await db.query(query, [newState, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in toggleStatus:', error);
      throw error;
    }
  }

  // Get cycles by crop ID
  static async getByCrop(cropId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM ciclos_cultivo WHERE id_cultivo = ?',
        [cropId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default CicloCultivo;