// api.js
class Api {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error fetching data');
      }
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || 'Error posting data');
      }
      return responseData;
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      console.log('PUT Request:', { endpoint, data });
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('PUT Error Response:', { status: response.status, data: responseData });
        throw new Error(`Error ${response.status}: ${responseData.message || 'Unknown error'}`);
      }

      return responseData;
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Error deleting data');
      }
      return true;
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  }
}

export default Api;