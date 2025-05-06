/**
 * API service for produccion operations
 */
const ProduccionAPI = {
  /**
   * Obtener todas las producciones
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<any>} Respuesta
   */
  async getAll(params = {}) {
    return API.get('/producciones', params);
  },

  /**
   * Obtener una producción por ID
   * @param {string} id - ID de la producción
   * @returns {Promise<any>} Respuesta
   */
  async getById(id) {
    return API.get(`/producciones/${id}`);
  },

  /**
   * Crear una nueva producción
   * @param {Object} data - Datos de la producción
   * @returns {Promise<any>} Respuesta
   */
  async create(data) {
    return API.post('/producciones', data);
  },

  /**
   * Actualizar una producción
   * @param {string} id - ID de la producción
   * @param {Object} data - Datos de la producción
   * @returns {Promise<any>} Respuesta
   */
  async update(id, data) {
    return API.put(`/producciones/${id}`, data);
  },

  /**
   * Eliminar una producción
   * @param {string} id - ID de la producción
   * @returns {Promise<any>} Respuesta
   */
  async delete(id) {
    return API.delete(`/producciones/${id}`);
  },

  /**
   * Cambiar estado de una producción
   * @param {string} id - ID de la producción
   * @param {string} estado - 'activo' o 'inactivo'
   * @returns {Promise<any>} Respuesta
   */
  async updateStatus(id, estado) {
    return API.patch(`/producciones/${id}/estado`, { estado });
  },

  /**
   * Obtener producciones por rango de fechas
   * @param {string} startDate - Fecha de inicio
   * @param {string} endDate - Fecha de fin
   * @returns {Promise<any>} Respuesta
   */
  async getByDateRange(startDate, endDate) {
    return API.get('/producciones/rango', { startDate, endDate });
  },

  /**
   * Registrar uso de insumo
   * @param {Object} data - Datos del uso de insumo
   * @returns {Promise<any>} Respuesta
   */
  async registerInsumoUsage(data) {
    return API.post('/producciones/uso-insumo', data);
  },

  /**
   * Obtener uso de insumos por producción
   * @param {string} id - ID de la producción
   * @returns {Promise<any>} Respuesta
   */
  async getInsumoUsage(id) {
    return API.get(`/producciones/${id}/uso-insumo`);
  }
}; 