/**
 * Ciclo API module
 */
const CicloAPI = {
  /**
   * Get all ciclos
   * @returns {Promise} Promise with ciclos data
   */
  getAll: function() {
    return API.get('/ciclos-cultivo');
  },

  /**
   * Get ciclo by ID
   * @param {string} id - Ciclo ID
   * @returns {Promise} Promise with ciclo data
   */
  getById: function(id) {
    return API.get(`/ciclos-cultivo/${id}`);
  },

  /**
   * Create new ciclo
   * @param {Object} data - Ciclo data
   * @returns {Promise} Promise with created ciclo data
   */
  create: function(data) {
    return API.post('/ciclos-cultivo', data);
  },

  /**
   * Update ciclo
   * @param {string} id - Ciclo ID
   * @param {Object} data - Updated ciclo data
   * @returns {Promise} Promise with updated ciclo data
   */
  update: function(id, data) {
    return API.put(`/ciclos-cultivo/${id}`, data);
  },

  /**
   * Delete ciclo
   * @param {string} id - Ciclo ID
   * @returns {Promise} Promise with deletion result
   */
  delete: function(id) {
    return API.delete(`/ciclos-cultivo/${id}`);
  },

  /**
   * Get ciclos by cultivo ID
   * @param {string} cultivoId - Cultivo ID
   * @returns {Promise} Promise with ciclos data
   */
  getByCultivoId: function(cultivoId) {
    return API.get(`/ciclos-cultivo/cultivo/${cultivoId}`);
  }
}; 