import Produccion from '../models/produccionModel.js';

class ProduccionController {
  static async create(req, res) {
    try {
      const produccionId = await Produccion.create(req.body);
      res.status(201).json({ success: true, id: produccionId });
    } catch (error) {
      console.error('Error al crear producción:', error);
      res.status(500).json({ success: false, error: 'Error al crear producción' });
    }
  }

  static async getAll(req, res) {
    try {
      const producciones = await Produccion.getAll();
      res.json({ 
        success: true,
        count: producciones.length,
        data: producciones 
      });
    } catch (error) {
      console.error('Error al obtener producciones:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener producciones' 
      });
    }
  }

  static async getById(req, res) {
    try {
      const produccion = await Produccion.getById(req.params.id);
      if (!produccion) {
        return res.status(404).json({ error: 'Producción no encontrada' });
      }
      res.json({ data: produccion });
    } catch (error) {
      console.error('Error al obtener producción:', error);
      res.status(500).json({ error: 'Error al obtener producción' });
    }
  }

  static async update(req, res) {
    try {
      const success = await Produccion.update(req.params.id, req.body);
      if (!success) {
        return res.status(404).json({ error: 'Producción no encontrada' });
      }
      res.json({ message: 'Producción actualizada correctamente' });
    } catch (error) {
      console.error('Error al actualizar producción:', error);
      res.status(500).json({ error: 'Error al actualizar producción' });
    }
  }

  static async delete(req, res) {
    try {
      const success = await Produccion.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Producción no encontrada' });
      }
      res.json({ message: 'Producción eliminada correctamente' });
    } catch (error) {
      console.error('Error al eliminar producción:', error);
      res.status(500).json({ error: 'Error al eliminar producción' });
    }
  }

  static async getByCicloId(req, res) {
    try {
      const producciones = await Produccion.getByCicloId(req.params.cicloId);
      res.json(producciones);
    } catch (error) {
      console.error('Error al obtener producciones por ciclo:', error);
      res.status(500).json({ error: 'Error al obtener producciones por ciclo' });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { estado } = req.body;
      const { id } = req.params;

      if (!estado || !['activo', 'inactivo'].includes(estado)) {
        return res.status(400).json({ 
          success: false,
          message: 'El estado debe ser "activo" o "inactivo"' 
        });
      }

      const success = await Produccion.updateStatus(id, estado);
      if (!success) {
        return res.status(404).json({ 
          success: false,
          message: 'Producción no encontrada' 
        });
      }

      res.json({ 
        success: true,
        message: `Producción ${estado === 'activo' ? 'activada' : 'desactivada'} correctamente` 
      });
    } catch (error) {
      console.error('Error al actualizar estado de producción:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al actualizar estado de producción',
        error: error.message 
      });
    }
  }

  static async getByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ 
          success: false,
          error: 'Se requieren las fechas de inicio y fin' 
        });
      }

      const producciones = await Produccion.getByDateRange(startDate, endDate);
      res.json({
        success: true,
        data: producciones
      });
    } catch (error) {
      console.error('Error al obtener producciones por rango de fechas:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener producciones por rango de fechas' 
      });
    }
  }
}

export default ProduccionController;