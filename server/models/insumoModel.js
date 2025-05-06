import db from '../config/database.js';

// Insumo (Input) Model
class Insumo {
  // Crear un nuevo insumo
  static async create(insumoData) {
    try {
      const [result] = await db.query(
        `INSERT INTO insumos (id_insumo, nombre, tipo, unidad_medida, cantidad, valor_unitario, valor_total, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insumoData.id_insumo,
          insumoData.nombre,
          insumoData.tipo,
          insumoData.unidad_medida,
          insumoData.cantidad,
          insumoData.valor_unitario,
          insumoData.valor_total,
          insumoData.descripcion,
          insumoData.estado || 'activo'
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los insumos
  static async getAll() {
    try {
      const [rows] = await db.query('SELECT * FROM insumos');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Obtener un insumo por ID
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM insumos WHERE id_insumo = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un insumo
  static async update(id, insumoData) {
    try {
      const [result] = await db.query(
        `UPDATE insumos SET nombre = ?, tipo = ?, unidad_medida = ?, cantidad = ?, valor_unitario = ?, valor_total = ?, descripcion = ?, estado = ? WHERE id_insumo = ?`,
        [
          insumoData.nombre,
          insumoData.tipo,
          insumoData.unidad_medida,
          insumoData.cantidad,
          insumoData.valor_unitario,
          insumoData.valor_total,
          insumoData.descripcion,
          insumoData.estado,
          id
        ]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un insumo
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM insumos WHERE id_insumo = ?', [id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar estado de un insumo
  static async updateStatus(id, estado) {
    try {
      const [result] = await db.query('UPDATE insumos SET estado = ? WHERE id_insumo = ?', [estado, id]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Associate insumo with a crop cycle
  static async associateWithCycle(insumoId, cicloId, cultivoId) {
    try {
      const [result] = await db.query(
        `INSERT INTO insumo_ciclo 
        (id_insumo, id_ciclo_cultivo, id_cultivo)
        VALUES (?, ?, ?)`,
        [insumoId, cicloId, cultivoId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get insumos by crop cycle
  static async getByCycle(cycleId) {
    try {
      const [rows] = await db.query(
        `SELECT i.* FROM insumos i
        JOIN insumo_ciclo ic ON i.id_insumo = ic.id_insumo
        WHERE ic.id_ciclo_cultivo = ?`,
        [cycleId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Insumo;