// Wait for API dependency
console.log('🔄 Starting InsumoAPI initialization...');

(function initInsumoAPI() {
    const waitForAPI = () => {
        return new Promise((resolve, reject) => {
            console.log('👀 Checking for API dependency...');
            
            if (window.API) {
                console.log('✨ API dependency found immediately');
                resolve(window.API);
                return;
            }

            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
                console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts} to find API dependency...`);
                
                if (window.API) {
                    clearInterval(interval);
                    console.log('✨ API dependency found after retries');
                    resolve(window.API);
                    return;
                }

                attempts++;
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.error('❌ API dependency not found after maximum attempts');
                    reject(new Error('API dependency not available'));
                }
            }, 200);
        });
    };

    // Initialize API after dependencies are loaded
    waitForAPI()
        .then(() => {
            console.log('🔄 Creating InsumoAPI instance...');
            
            const InsumoAPI = {
                /**
                 * Crear un nuevo insumo
                 * @param {Object} data - Datos del insumo
                 * @returns {Promise<any>} Respuesta
                 */
                async create(data) {
                    return API.post('/insumos', data);
                },

                /**
                 * Obtener todos los insumos
                 * @param {Object} params - Parámetros de consulta
                 * @returns {Promise<any>} Respuesta
                 */
                async getAll(params = {}) {
                    return API.get('/insumos', params);
                },

                /**
                 * Obtener un insumo por ID
                 * @param {string} id - ID del insumo
                 * @returns {Promise<any>} Respuesta
                 */
                async getById(id) {
                    return API.get(`/insumos/${id}`);
                },

                /**
                 * Actualizar un insumo
                 * @param {string} id - ID del insumo
                 * @param {Object} data - Datos del insumo
                 * @returns {Promise<any>} Respuesta
                 */
                async update(id, data) {
                    return API.put(`/insumos/${id}`, data);
                },

                /**
                 * Eliminar un insumo
                 * @param {string} id - ID del insumo
                 * @returns {Promise<any>} Respuesta
                 */
                async delete(id) {
                    return API.delete(`/insumos/${id}`);
                },

                /**
                 * Cambiar estado de un insumo
                 * @param {string} id - ID del insumo
                 * @param {string} estado - 'activo' o 'inactivo'
                 * @returns {Promise<any>} Respuesta
                 */
                async updateStatus(id, estado) {
                    return API.patch(`/insumos/${id}/status`, { estado });
                },

                /**
                 * Obtener insumos por ciclo
                 * @param {string} cycleId - ID del ciclo
                 * @returns {Promise<any>} Respuesta
                 */
                async getByCycle(cycleId) {
                    return API.get(`/insumos/ciclo/${cycleId}`);
                }
            };

            // Export to global scope
            window.InsumoAPI = InsumoAPI;
            console.log('✅ InsumoAPI initialized successfully and exported to window');
            
            // Dispatch an event to notify modules
            window.dispatchEvent(new Event('insumoApiReady'));
        })
        .catch(error => {
            console.error('❌ Failed to initialize InsumoAPI:', error);
        });
})();