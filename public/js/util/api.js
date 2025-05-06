/**
 * API service for making HTTP requests
 */
console.log('🔄 Initializing base API module...');

const API = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, params = {}) {
    try {
      const url = new URL(`${CONFIG.API_URL}${endpoint}`);
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      showToast(`Error al obtener datos: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {boolean} isFormData - Whether data is FormData
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data, isFormData = false) {
    try {
      const options = {
        method: 'POST',
        headers: !isFormData ? { 'Content-Type': 'application/json' } : {},
        body: isFormData ? data : JSON.stringify(data)
      };
      
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      showToast(`Error al enviar datos: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {boolean} isFormData - Whether data is FormData
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data, isFormData = false) {
    try {
      const options = {
        method: 'PUT',
        headers: !isFormData ? { 'Content-Type': 'application/json' } : {},
        body: isFormData ? data : JSON.stringify(data)
      };
      
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PUT Error:', error);
      showToast(`Error al actualizar datos: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @returns {Promise<any>} Response data
   */
  async patch(endpoint, data) {
    try {
      const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
      
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API PATCH Error:', error);
      showToast(`Error al modificar datos: ${error.message}`, 'error');
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint) {
    try {
      const options = {
        method: 'DELETE'
      };
      
      const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API DELETE Error:', error);
      showToast(`Error al eliminar datos: ${error.message}`, 'error');
      throw error;
    }
  },
  
  // API endpoints for specific resources
  
  sensors: {
    getAll: (params) => API.get('/sensores', params),
    getById: (id) => API.get(`/sensores/${id}`),
    create: (data) => API.post('/sensores', data, false), // Regular JSON data
    update: (id, data) => API.put(`/sensores/${id}`, data, false), // Regular JSON data
    toggleStatus: (id, estado) => API.patch(`/sensores/${id}/estado`, { estado }),
    getReadings: (id, startDate, endDate) => API.get(`/sensores/${id}/lecturas`, { startDate, endDate }),
    saveReading: (data) => API.post('/sensores/lecturas', data)
  },
  
  insumos: {
    getAll: (params) => API.get('/insumos', params),
    getById: (id) => API.get(`/insumos/${id}`),
    create: (data) => API.post('/insumos', data),
    update: (id, data) => API.put(`/insumos/${id}`, data),
    toggleStatus: (id, estado) => API.patch(`/insumos/${id}/estado`, { estado }),
    getByCycle: (cycleId) => API.get(`/insumos/ciclo/${cycleId}`)
  },
  
  cultivos: {
    getAll: (params) => API.get('/cultivos', params),
    getById: (id) => API.get(`/cultivos/${id}`),
    create: (data) => API.post('/cultivos', data, true), // FormData for image upload
    update: (id, data) => API.put(`/cultivos/${id}`, data, true), // FormData for image upload
    toggleStatus: (id, estado) => API.patch(`/cultivos/${id}/estado`, { estado }),
    getSensors: (id) => API.get(`/cultivos/${id}/sensores`),
    getInsumos: (id) => API.get(`/cultivos/${id}/insumos`),
    associateSensor: (id, sensorId) => API.post(`/cultivos/${id}/sensores`, { sensorId }),
    associateInsumo: (id, insumoId) => API.post(`/cultivos/${id}/insumos`, { insumoId })
  },
  
  ciclos: {
    getAll: (params) => API.get('/ciclos-cultivo', params),
    getById: (id) => API.get(`/ciclos-cultivo/${id}`),
    create: (data) => API.post('/ciclos-cultivo', data),
    update: (id, data) => API.put(`/ciclos-cultivo/${id}`, data),
    toggleStatus: (id, estado) => API.patch(`/ciclos-cultivo/${id}/estado`, { estado }),
    getByCrop: (cropId) => API.get(`/ciclos-cultivo/cultivo/${cropId}`)
  },
  
  producciones: {
    getAll: (params) => API.get('/producciones', params),
    getById: (id) => API.get(`/producciones/${id}`),
    create: (data) => API.post('/producciones', data),
    update: (id, data) => API.put(`/producciones/${id}`, data),
    toggleStatus: (id, estado) => API.patch(`/producciones/${id}/estado`, { estado }),
    getByDateRange: (startDate, endDate) => API.get('/producciones/rango', { startDate, endDate }),
    registerInsumoUsage: (data) => API.post('/producciones/uso-insumo', data),
    getInsumoUsage: (id) => API.get(`/producciones/${id}/uso-insumo`)
  },
  
  usuarios: {
    getAll: () => API.get('/usuarios'),
    getById: (id) => API.get(`/usuarios/${id}`),
    create: (data) => API.post('/usuarios', data)
  }
};

// Export to global scope
window.API = API;
console.log('✅ Base API module initialized successfully');