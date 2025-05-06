/**
 * API service for usuario operations
 */
const UsuarioAPI = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise<any>} Respuesta
   */
  async getAll() {
    return API.usuarios.getAll();
  },

  /**
   * Obtener un usuario por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<any>} Respuesta
   */
  async getById(id) {
    return API.usuarios.getById(id);
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise<any>} Respuesta
   */
  async create(data) {
    return API.usuarios.create(data);
  },

  /**
   * Actualizar un usuario
   * @param {Object} data - Datos del usuario
   * @returns {Promise<any>} Respuesta
   */
  async update(data) {
    const { id, ...userData } = data;
    return API.put(`/usuarios/${id}`, userData);
  },

  /**
   * Eliminar un usuario
   * @param {string} id - ID del usuario
   * @returns {Promise<any>} Respuesta
   */
  async delete(id) {
    return API.delete(`/usuarios/${id}`);
  }
};

// Export to global scope
window.UsuarioAPI = UsuarioAPI;