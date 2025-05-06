// cicloApi.js
const CicloAPI = (function() {
  const API = {
    get: async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('CicloAPI GET error:', error);
        throw error;
      }
    },
    post: async (url, data) => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('CicloAPI POST error:', error);
        throw error;
      }
    },
    put: async (url, data) => {
      try {
        const response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('CicloAPI PUT error:', error);
        throw error;
      }
    },
    delete: async (url) => {
      try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('CicloAPI DELETE error:', error);
        throw error;
      }
    },
  };

  return {
    async getAll() {
      try {
        const response = await API.get('/ciclos-cultivo');
        return response;
      } catch (error) {
        console.error('CicloAPI getAll error:', error);
        throw error;
      }
    },
    async getById(id) {
      try {
        const response = await API.get(`/ciclos-cultivo/${id}`);
        return response;
      } catch (error) {
        console.error('CicloAPI getById error:', error);
        throw error;
      }
    },
    async create(data) {
      try {
        console.log('Creating ciclo:', data);
        const response = await API.post('/ciclos-cultivo', data);
        if (!response.success) {
          throw new Error(response.message || 'Error creando ciclo');
        }
        return response;
      } catch (error) {
        console.error('CicloAPI create error:', error);
        throw error;
      }
    },
    async update(id, data) {
      try {
        console.log('Updating ciclo:', { id, data });
        const response = await API.put(`/ciclos-cultivo/${id}`, data);
        if (!response.success) {
          throw new Error(response.message || 'Error actualizando ciclo');
        }
        return response;
      } catch (error) {
        console.error('CicloAPI update error:', error);
        throw error;
      }
    },
    async delete(id) {
      try {
        console.log('Deleting ciclo with ID:', id);
        const response = await API.delete(`/ciclos-cultivo/${id}`);
        if (!response.success) {
          throw new Error(response.message || 'Error eliminando ciclo');
        }
        return response;
      } catch (error) {
        console.error('CicloAPI delete error:', error);
        throw error;
      }
    },
  };
})();