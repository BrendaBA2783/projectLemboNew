/**
 * Sensor list module
 */
const SensorList = (function() {
  // Private variables
  let currentPage = 1;
  let pageSize = CONFIG.PAGINATION.PAGE_SIZE;
  let totalPages = 1;
  let sensors = [];
  let filteredSensors = [];
  let searchTerm = '';
  let typeFilter = '';
  let stateFilter = '';
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    render();
    loadSensors();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Sensores';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Listado de Sensores</h2>
          <a href="#" id="btn-create-sensor" class="btn btn-primary btn-icon">
            <i class="fas fa-plus"></i> Nuevo Sensor
          </a>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <div class="form-group">
                <label for="search" class="form-label">Buscar:</label>
                <input type="text" id="search" class="form-control" placeholder="Buscar por nombre, ID o tipo...">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="type-filter" class="form-label">Filtrar por tipo:</label>
                <select id="type-filter" class="form-select">
                  <option value="">Todos los tipos</option>
                  ${CONFIG.SENSOR_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="state-filter" class="form-label">Estado:</label>
                <select id="state-filter" class="form-select">
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="col-md-2">
              <div class="form-group">
                <label class="form-label">Exportar:</label>
                <div class="d-flex">
                  <button id="btn-export-excel" class="btn btn-success btn-sm me-2">
                    <i class="fas fa-file-excel"></i> Excel
                  </button>
                  <button id="btn-export-pdf" class="btn btn-danger btn-sm">
                    <i class="fas fa-file-pdf"></i> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>ID Sensor</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Unidad</th>
                  <th>Tiempo Escaneo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="sensors-table-body">
                <tr>
                  <td colspan="7" class="text-center">Cargando sensores...</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div id="pagination-container" class="d-flex justify-content-between align-items-center mt-3">
            <div>
              <select id="page-size" class="form-select form-select-sm" style="width: auto;">
                ${CONFIG.PAGINATION.PAGE_SIZES.map(size => 
                  `<option value="${size}" ${size === pageSize ? 'selected' : ''}>${size} por página</option>`
                ).join('')}
              </select>
            </div>
            <div id="pagination-controls"></div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load sensors from API
  function loadSensors() {
    const sensorTableBody = document.getElementById('sensors-table-body');
    showLoader(sensorTableBody, 'Cargando sensores...');
    
    API.sensors.getAll()
      .then(response => {
        sensors = response.data || [];
        filteredSensors = [...sensors];
        
        // Apply filters
        applyFilters();
      })
      .catch(error => {
        console.error('Error loading sensors:', error);
        sensorTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              <i class="fas fa-exclamation-circle"></i> Error al cargar sensores. Intente nuevamente.
            </td>
          </tr>
        `;
      });
  }
  
  // Render sensor data
  function renderSensors() {
    const sensorTableBody = document.getElementById('sensors-table-body');
    
    if (!filteredSensors.length) {
      sensorTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No se encontraron sensores</td>
        </tr>
      `;
      document.getElementById('pagination-container').style.display = 'none';
      return;
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredSensors.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredSensors.length);
    const paginatedSensors = filteredSensors.slice(startIndex, endIndex);
    
    // Render table rows
    sensorTableBody.innerHTML = paginatedSensors.map(sensor => `
      <tr>
        <td>${sensor.id_sensor}</td>
        <td>${sensor.nombre}</td>
        <td>${sensor.tipo}</td>
        <td>${sensor.unidad_medida}</td>
        <td>${sensor.tiempo_escaneo} ${parseInt(sensor.tiempo_escaneo) <= 60 ? 'segundos' : 'minutos'}</td>
        <td>${createStateBadge(sensor.estado).outerHTML}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-info btn-view" data-id="${sensor.id_sensor}" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${sensor.id_sensor}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-${sensor.estado === 'activo' ? 'warning' : 'success'} btn-toggle" 
            data-id="${sensor.id_sensor}" 
            data-estado="${sensor.estado}"
            title="${sensor.estado === 'activo' ? 'Desactivar' : 'Activar'}">
            <i class="fas fa-${sensor.estado === 'activo' ? 'toggle-off' : 'toggle-on'}"></i>
          </button>
          <button class="btn btn-sm btn-secondary btn-report" data-id="${sensor.id_sensor}" title="Generar reporte">
            <i class="fas fa-chart-line"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    // Render pagination
    renderPagination();
    document.getElementById('pagination-container').style.display = 'flex';
    
    // Add event listeners for action buttons
    addActionButtonListeners();
  }
  
  // Render pagination controls
  function renderPagination() {
    const paginationContainer = document.getElementById('pagination-controls');
    const pagination = createPagination(currentPage, totalPages, (page) => {
      currentPage = page;
      renderSensors();
    });
    
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pagination);
  }
  
  // Add event listeners
  function addEventListeners() {
    // Create sensor button
    const createButton = document.getElementById('btn-create-sensor');
    if (createButton) {
      createButton.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('nav-sensors-create');
      });
    }
    
    // Search input
    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(() => {
        searchTerm = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
      }, CONFIG.DEBOUNCE.SEARCH));
    }
    
    // Type filter
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
      });
    }
    
    // State filter
    const stateFilter = document.getElementById('state-filter');
    if (stateFilter) {
      stateFilter.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
      });
    }
    
    // Page size
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', () => {
        pageSize = parseInt(pageSizeSelect.value);
        currentPage = 1;
        renderSensors();
      });
    }
    
    // Export buttons
    const exportExcelBtn = document.getElementById('btn-export-excel');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    const exportPdfBtn = document.getElementById('btn-export-pdf');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', exportToPdf);
    }
  }
  
  // Add event listeners for action buttons
  function addActionButtonListeners() {
    // View buttons
    document.querySelectorAll('.btn-view').forEach(button => {
      button.addEventListener('click', () => {
        const sensorId = button.getAttribute('data-id');
        viewSensor(sensorId);
      });
    });
    
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const sensorId = button.getAttribute('data-id');
        editSensor(sensorId);
      });
    });
    
    // Toggle state buttons
    document.querySelectorAll('.btn-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const sensorId = button.getAttribute('data-id');
        const currentState = button.getAttribute('data-estado');
        toggleSensorState(sensorId, currentState);
      });
    });
    
    // Report buttons
    document.querySelectorAll('.btn-report').forEach(button => {
      button.addEventListener('click', () => {
        const sensorId = button.getAttribute('data-id');
        generateSensorReport(sensorId);
      });
    });
  }
  
  // Apply filters to sensors
  function applyFilters() {
    const typeFilterValue = document.getElementById('type-filter').value;
    const stateFilterValue = document.getElementById('state-filter').value;
    
    filteredSensors = sensors.filter(sensor => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        sensor.nombre.toLowerCase().includes(searchTerm) ||
        sensor.id_sensor.toLowerCase().includes(searchTerm) ||
        sensor.tipo.toLowerCase().includes(searchTerm);
      
      // Type filter
      const matchesType = typeFilterValue === '' || sensor.tipo === typeFilterValue;
      
      // State filter
      const matchesState = stateFilterValue === '' || sensor.estado === stateFilterValue;
      
      return matchesSearch && matchesType && matchesState;
    });
    
    currentPage = 1;
    renderSensors();
  }
  
  // View sensor details
  function viewSensor(sensorId) {
    // Store sensor ID in session storage
    sessionStorage.setItem('id', sensorId);
    sessionStorage.setItem('navAction', 'view');
    
    // Navigate to sensor detail page
    navigateToPage('nav-sensors-detail');
  }
  
  // Edit sensor
  function editSensor(sensorId) {
    // Store sensor ID in session storage
    sessionStorage.setItem('id', sensorId);
    sessionStorage.setItem('navAction', 'edit');
    
    // Navigate to sensor form page
    navigateToPage('nav-sensors-create');
  }
  
  // Toggle sensor state
  function toggleSensorState(sensorId, currentEstado) {
    const newEstado = currentEstado === 'activo' ? 'inactivo' : 'activo';
    
    API.sensors.getById(sensorId)
      .then(response => {
        if (!response.success || !response.data) {
          throw new Error('No se pudo obtener la información del sensor');
        }

        // Keep all existing data and only update estado
        const sensorData = {
          ...response.data,
          estado: newEstado
        };

        return API.sensors.update(sensorId, sensorData);
      })
      .then(() => {
        showToast(`Sensor ${newEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`, 'success');
        loadSensors(); // Refresh the list
      })
      .catch(error => {
        console.error('Error toggling sensor:', error);
        showToast('Error al cambiar el estado del sensor', 'error');
      });
  }
  
  // Generate sensor report
  function generateSensorReport(sensorId) {
    // Store sensor ID in session storage
    sessionStorage.setItem('id', sensorId);
    sessionStorage.setItem('navAction', 'report');
    
    // Navigate to sensor report page
    navigateToPage('nav-sensors-report');
  }
  
  // Export to Excel
  function exportToExcel() {
    // Define headers for Excel report
    const headers = [
      { header: 'ID Sensor', key: 'id_sensor' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Unidad de Medida', key: 'unidad_medida' },
      { header: 'Tiempo de Escaneo', key: 'tiempo_escaneo' },
      { header: 'Descripción', key: 'descripcion' },
      { header: 'Estado', key: 'estado' },
      { header: 'Fecha Creación', key: 'created_at', type: 'date' }
    ];
    
    // Generate the report
    generateExcelReport(
      filteredSensors,
      headers,
      'Reporte de Sensores',
      `sensores_${formatDate(new Date(), 'YYYY-MM-DD')}`
    );
  }
  
  // Export to PDF
  function exportToPdf() {
    // Define headers for PDF report
    const headers = [
      { header: 'ID Sensor', key: 'id_sensor' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Unidad', key: 'unidad_medida' },
      { header: 'T. Escaneo', key: 'tiempo_escaneo' },
      { header: 'Estado', key: 'estado' }
    ];
    
    // Generate the report
    generatePdfReport(
      filteredSensors,
      headers,
      'Reporte de Sensores',
      `sensores_${formatDate(new Date(), 'YYYY-MM-DD')}`,
      true
    );
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