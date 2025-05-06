/**
 * API service for cultivo operations
 */
const CultivoAPI = {
  /**
   * Create a new cultivo
   * @param {Object} data - Cultivo data
   * @returns {Promise<any>} Response data
   */
  async create(data) {
    return API.post('/cultivos', data);
  },

  /**
   * Get all cultivos
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async getAll(params = {}) {
    return API.get('/cultivos', params);
  },

  /**
   * Get a cultivo by ID
   * @param {string} id - Cultivo ID
   * @returns {Promise<any>} Response data
   */
  async getById(id) {
    return API.get(`/cultivos/${id}`);
  },

  /**
   * Update a cultivo
   * @param {string} id - Cultivo ID
   * @param {Object} data - Cultivo data
   * @returns {Promise<any>} Response data
   */
  async update(id, data) {
    return API.put(`/cultivos/${id}`, data);
  },

  /**
   * Delete a cultivo
   * @param {string} id - Cultivo ID
   * @returns {Promise<any>} Response data
   */
  async delete(id) {
    return API.delete(`/cultivos/${id}`);
  }
}; 