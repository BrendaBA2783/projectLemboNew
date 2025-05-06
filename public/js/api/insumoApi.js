// insumoApi.js

class InsumoAPI {
  static async getAll() {
    const response = await api.get('/insumos');
    return response.data;
  }

  static async getById(id) {
    const response = await api.get(`/insumos/${id}`);
    return response.data;
  }

  static async create(data) {
    const response = await api.post('/insumos', data);
    return response.data;
  }

  static async update(id, data) {
    const response = await api.put(`/insumos/${id}`, data);
    return response.data;
  }

  static async delete(id) {
    const response = await api.delete(`/insumos/${id}`);
    return response.data;
  }

  static async toggleState(id, newState) {
    const response = await api.post(`/insumos/${id}/toggle`, {
      estado: newState
    });
    return response.data;
  }
}