import db from '../config/database.js';

// Produccion (Production) Model
class Produccion {
  // Create a new production
  static async create(data) {
    try {
      const { id_produccion, id_responsable, nombre, id_cultivo, id_ciclo_cultivo, inversion, meta, fecha_inicio, fecha_fin, estado } = data;
      const query = `
        INSERT INTO producciones (
          id_produccion, id_responsable, nombre, id_cultivo, id_ciclo_cultivo, inversion, meta, fecha_inicio, fecha_fin, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [id_produccion, id_responsable, nombre, id_cultivo, id_ciclo_cultivo, inversion, meta, fecha_inicio, fecha_fin, estado];
      
      const [result] = await db.query(query, values);
      return result.insertId;
    } catch (error) {
      console.error('Error en Produccion.create:', error);
      throw new Error('Error al crear la producción: ' + error.message);
    }
  }

  // Get all productions
  static async getAll() {
    try {
      const query = `
        SELECT p.*, c.nombre as nombre_ciclo 
        FROM producciones p
        LEFT JOIN ciclos_cultivo c ON p.id_ciclo_cultivo = c.id_ciclo
        ORDER BY p.fecha_inicio DESC
      `;
      
      const [results] = await db.query(query);
      return results;
    } catch (error) {
      console.error('Error en Produccion.getAll:', error);
      throw new Error('Error al obtener las producciones: ' + error.message);
    }
  }

  // Get a single production by ID
  static async getById(id) {
    try {
      const query = `
        SELECT p.*, c.nombre as nombre_ciclo 
        FROM producciones p
        LEFT JOIN ciclos_cultivo c ON p.id_ciclo_cultivo = c.id_ciclo
        WHERE p.id_produccion = ?
      `;
      
      const [results] = await db.query(query, [id]);
      return results[0];
    } catch (error) {
      console.error('Error en Produccion.getById:', error);
      throw new Error('Error al obtener la producción: ' + error.message);
    }
  }

  // Update a production
  static async update(id, data) {
    try {
      const { id_responsable, nombre, id_cultivo, id_ciclo_cultivo, inversion, meta, fecha_inicio, fecha_fin, estado } = data;
      const query = `
        UPDATE producciones 
        SET id_responsable = ?, nombre = ?, id_cultivo = ?, id_ciclo_cultivo = ?, 
            inversion = ?, meta = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?
        WHERE id_produccion = ?
      `;
      const values = [id_responsable, nombre, id_cultivo, id_ciclo_cultivo, inversion, meta, fecha_inicio, fecha_fin, estado, id];
      
      const [result] = await db.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en Produccion.update:', error);
      throw new Error('Error al actualizar la producción: ' + error.message);
    }
  }

  // Delete a production
  static async delete(id) {
    try {
      const query = 'DELETE FROM producciones WHERE id_produccion = ?';
      const [result] = await db.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en Produccion.delete:', error);
      throw new Error('Error al eliminar la producción: ' + error.message);
    }
  }

  // Get productions by cycle ID
  static async getByCicloId(cicloId) {
    try {
      const query = `
        SELECT p.*, c.nombre as nombre_ciclo 
        FROM producciones p
        LEFT JOIN ciclos_cultivo c ON p.id_ciclo_cultivo = c.id_ciclo
        WHERE p.id_ciclo_cultivo = ?
        ORDER BY p.fecha_inicio DESC
      `;
      
      const [results] = await db.query(query, [cicloId]);
      return results;
    } catch (error) {
      console.error('Error en Produccion.getByCicloId:', error);
      throw new Error('Error al obtener las producciones por ciclo: ' + error.message);
    }
  }

  // Update production status
  static async updateStatus(id, estado) {
    try {
      const query = 'UPDATE producciones SET estado = ? WHERE id_produccion = ?';
      const [result] = await db.query(query, [estado, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error en Produccion.updateStatus:', error);
      throw new Error('Error al actualizar el estado de la producción: ' + error.message);
    }
  }

  // Associate sensor with a production
  static async associateSensor(produccionId, sensorId) {
    try {
      const [result] = await db.query(
        `INSERT INTO produccion_sensor 
        (id_produccion, id_sensor)
        VALUES (?, ?)`,
        [produccionId, sensorId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Associate insumo with a production
  static async associateInsumo(produccionId, insumoId, cantidad = null, fecha = null) {
    try {
      const [result] = await db.query(
        `INSERT INTO produccion_insumo 
        (id_produccion, id_insumo, cantidad, fecha_uso)
        VALUES (?, ?, ?, ?)`,
        [produccionId, insumoId, cantidad, fecha || new Date()]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get productions by date range
  static async getByDateRange(startDate, endDate) {
    try {
      const query = `
        SELECT p.*, c.nombre as nombre_ciclo 
        FROM producciones p
        LEFT JOIN ciclos_cultivo c ON p.id_ciclo_cultivo = c.id_ciclo
        WHERE p.fecha_inicio BETWEEN ? AND ?
          AND p.estado = 'activo'
        ORDER BY p.fecha_inicio DESC
      `;
      
      const [results] = await db.query(query, [startDate, endDate]);
      return results;
    } catch (error) {
      console.error('Error en Produccion.getByDateRange:', error);
      throw new Error('Error al obtener las producciones por rango de fechas: ' + error.message);
    }
  }

  // Register insumo usage in a production
  static async registerInsumoUsage(usageData) {
    try {
      const [result] = await db.query(
        `INSERT INTO uso_insumo 
        (id_produccion, id_insumo, cantidad, fecha_uso, id_responsable, valor_unitario, valor_total, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          usageData.id_produccion,
          usageData.id_insumo,
          usageData.cantidad,
          usageData.fecha_uso || new Date(),
          usageData.id_responsable,
          usageData.valor_unitario,
          usageData.valor_total,
          usageData.observaciones
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get insumo usage for a production
  static async getInsumoUsage(produccionId) {
    try {
      const [rows] = await db.query(
        `SELECT ui.*, i.nombre as nombre_insumo, u.nombre as nombre_responsable
        FROM uso_insumo ui
        JOIN insumos i ON ui.id_insumo = i.id_insumo
        JOIN usuarios u ON ui.id_responsable = u.id
        WHERE ui.id_produccion = ?
        ORDER BY ui.fecha_uso DESC`,
        [produccionId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Produccion;