/**
 * Sensor form module
 */
console.log('sensorForm.js loaded');

const SensorForm = (function() {
  // Private variables
  let isEditMode = false;
  let currentSensorId = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    console.log('SensorForm.init() llamado');
    if (!contentContainer) {
      alert('No se encontró el contenedor main-content');
      return;
    }
    
    // Check if we are in edit mode
    const navAction = sessionStorage.getItem('navAction');
    isEditMode = navAction === 'edit';
    
    if (isEditMode) {
      currentSensorId = sessionStorage.getItem('id');
      sessionStorage.removeItem('navAction');
      sessionStorage.removeItem('id');
    }
    
    render();
    
    // Wait for DOM to be fully rendered
    setTimeout(() => {
      addEventListeners();
      
      if (isEditMode && currentSensorId) {
        loadSensorData(currentSensorId);
      }
    }, 0);
  }
  
  // Render the page
  function render() {
    console.log('SensorForm.render() llamado');
    if (!contentContainer) {
      alert('No se encontró el contenedor main-content');
      return;
    }
    // Set page title and header based on mode
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Sensor' : 'Crear Sensor';
    
    // Add ExcelJS library
    const excelScript = document.createElement('script');
    excelScript.src = 'https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js';
    document.head.appendChild(excelScript);
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2>${isEditMode ? 'Editar Sensor' : 'Crear Nuevo Sensor'}</h2>
          <button type="button" class="btn btn-success" id="export-excel">
            <i class="fas fa-file-excel"></i> Exportar Excel
          </button>
        </div>
        <div class="card-body">
          <form id="sensor-form">
            <div class="form-group mb-3">
              <label for="nombre" class="form-label">Nombre</label>
              <input type="text" class="form-control" id="nombre" name="nombre" required>
            </div>
            <div class="form-group mb-3">
              <label for="tipo" class="form-label">Tipo</label>
              <select class="form-select" id="tipo" name="tipo" required>
                <option value="">Seleccione un tipo</option>
                ${CONFIG.SENSOR_TYPES.map(tipo => 
                  `<option value="${tipo}">${tipo}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group mb-3">
              <label for="unidad_medida" class="form-label">Unidad de Medida</label>
              <input type="text" class="form-control" id="unidad_medida" name="unidad_medida" required>
            </div>
            <div class="form-group mb-3">
              <label for="tiempo_escaneo" class="form-label">Tiempo de Escaneo (segundos)</label>
              <input type="number" class="form-control" id="tiempo_escaneo" name="tiempo_escaneo" required>
            </div>
            <div class="form-group mb-3">
              <label for="descripcion" class="form-label">Descripción</label>
              <textarea class="form-control" id="descripcion" name="descripcion" rows="2"></textarea>
            </div>
            <div class="form-group mb-3">
              <label for="estado" class="form-label">Estado</label>
              <select id="estado" name="estado" class="form-select">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="history.back()">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEditMode ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }
  
  // Add event listeners
  function addEventListeners() {
    const form = document.getElementById('sensor-form');
    const estadoSwitch = document.getElementById('estado');
    const exportButton = document.getElementById('export-excel');
    
    const validationRules = {
      tipo: {
        required: true
      },
      nombre: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      unidad_medida: {
        required: true,
        maxLength: 20
      },
      tiempo_escaneo: {
        required: true,
        min: 1
      },
      descripcion: {
        required: true,
        minLength: 10
      },
      estado: {
        required: true
      }
    };
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm('sensor-form', validationRules)) {
          handleFormSubmit(form);
        }
      });
    }

    if (estadoSwitch && isEditMode) {
      estadoSwitch.addEventListener('change', (e) => {
        const newEstado = e.target.checked ? 'activo' : 'inactivo';
        estadoSwitch.disabled = true;

        API.sensors.update(currentSensorId, { estado: newEstado })
          .then(response => {
            if (response.success) {
              showToast(`Sensor ${newEstado}`, 'success');
            } else {
              estadoSwitch.checked = !estadoSwitch.checked;
              showToast('Error al cambiar estado: ' + response.message, 'error');
            }
          })
          .catch(error => {
            console.error('Error changing sensor state:', error);
            estadoSwitch.checked = !estadoSwitch.checked;
            showToast('Error al cambiar estado del sensor', 'error');
          })
          .finally(() => {
            estadoSwitch.disabled = false;
          });
      });
    }

    // Add export button listener
    if (exportButton) {
        exportButton.addEventListener('click', async () => {
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sensor Data');
                
                // Add headers
                worksheet.columns = [
                    { header: 'Nombre', key: 'nombre' },
                    { header: 'Tipo', key: 'tipo' },
                    { header: 'Unidad de Medida', key: 'unidad_medida' },
                    { header: 'Tiempo Escaneo', key: 'tiempo_escaneo' },
                    { header: 'Estado', key: 'estado' },
                    { header: 'Descripción', key: 'descripcion' }
                ];
                
                // Get form data
                const formData = new FormData(document.getElementById('sensor-form'));
                const sensorData = Object.fromEntries(formData.entries());
                worksheet.addRow(sensorData);
                
                // Generate and download file
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `sensor_${Date.now()}.xlsx`;
                a.click();
                window.URL.revokeObjectURL(url);
                
                showToast('Reporte Excel generado correctamente', 'success');
            } catch (error) {
                console.error('Error generating Excel:', error);
                showToast('Error al generar reporte Excel', 'error');
            }
        });
    }
  }
  
  // Load sensor data for editing
  function loadSensorData(sensorId) {
    console.log('Loading sensor data for ID:', sensorId);
    
    API.sensors.getById(sensorId)
      .then(response => {
        if (!response.success || !response.data) {
          throw new Error('Failed to load sensor data');
        }
        
        const sensor = response.data;
        console.log('Sensor data received:', sensor);
        
        const form = document.getElementById('sensor-form');
        if (!form) throw new Error('Form element not found');
        
        // Populate form fields directly
        const fields = ['nombre', 'tipo', 'unidad_medida', 'tiempo_escaneo', 'descripcion', 'estado'];
        let errorField = null;
        
        fields.forEach(field => {
          const element = document.getElementById(field);
          if (!element) {
            errorField = field;
            return;
          }
          if (sensor[field] !== undefined) {
            element.value = sensor[field];
          }
        });
        
        if (errorField) {
          throw new Error(`Field ${errorField} not found in form`);
        }
        
        console.log('Form populated successfully');
      })
      .catch(error => {
        console.error('Error loading sensor:', error);
        showToast('Error al cargar datos del sensor: ' + error.message, 'error');
      });
  }

  // Handle form submission
  function handleFormSubmit(form) {
    // Create FormData object and convert it to a regular object
    const formData = new FormData(form);
    const sensorData = {
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      unidad_medida: formData.get('unidad_medida'),
      tiempo_escaneo: formData.get('tiempo_escaneo'),
      descripcion: formData.get('descripcion'),
      estado: formData.get('estado')
    };
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    
    const promise = isEditMode 
      ? API.sensors.update(currentSensorId, sensorData)
      : API.sensors.create(sensorData);

    promise
      .then(response => {
        if (response.success) {
          showToast(isEditMode ? 'Sensor actualizado correctamente' : 'Sensor creado correctamente', 'success');
          if (!isEditMode) {
            form.reset();
          }
          navigateTo('nav-sensors-list');
        } else {
          showToast(`Error al ${isEditMode ? 'actualizar' : 'crear'} sensor: ${response.message}`, 'error');
        }
      })
      .catch(error => {
        console.error(`Error ${isEditMode ? 'updating' : 'creating'} sensor:`, error);
        showToast(`Error al ${isEditMode ? 'actualizar' : 'crear'} sensor`, 'error');
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = isEditMode ? 'Actualizar' : 'Guardar';
      });
  }
  
  // Navigate to a different page
  function navigateTo(navItemId, action, params = {}) {
    // Simulate a click on the navigation item
    const navItem = document.getElementById(navItemId);
    if (navItem) {
      // Store navigation parameters in session storage if needed
      if (action) {
        sessionStorage.setItem('navAction', action);
      }
      
      // Store any additional parameters
      for (const key in params) {
        sessionStorage.setItem(key, params[key]);
      }
      
      navItem.click();
    }
  }
  
  // Return public methods
  return {
    init: init
  };
})();