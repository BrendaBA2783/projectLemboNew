/**
 * Sensor detail module
 */
const SensorDetail = (function() {
  // Private variables
  let currentSensorId = null;
  let sensorData = null;
  let chartInstance = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get sensor ID from session storage
    currentSensorId = sessionStorage.getItem('id');
    
    // Clear session storage
    sessionStorage.removeItem('navAction');
    sessionStorage.removeItem('id');
    
    if (!currentSensorId) {
      showToast('ID de sensor no especificado', 'error');
      navigateToPage('nav-sensors-list');
      return;
    }
    
    render();
    loadSensorData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Detalle del Sensor';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">
          <h2>Detalle del Sensor</h2>
          <div class="d-flex gap-2">
            <button id="btnEdit" class="btn btn-primary btn-icon">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button id="btnBack" class="btn btn-light btn-icon">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body" id="sensorDetailContent">
          <div class="loader-container">
            <div class="loader"></div>
            <p>Cargando datos del sensor...</p>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>Lecturas Recientes</h3>
          <div class="d-flex gap-2">
            <button id="btnViewReport" class="btn btn-secondary btn-icon">
              <i class="fas fa-chart-line"></i> Ver Reporte Completo
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <div class="form-group">
                <label for="startDate" class="form-label">Fecha Inicio:</label>
                <input type="date" id="startDate" class="form-control">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="endDate" class="form-label">Fecha Fin:</label>
                <input type="date" id="endDate" class="form-control">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label">&nbsp;</label>
                <button id="btnLoadReadings" class="btn btn-primary w-100">
                  <i class="fas fa-sync"></i> Cargar Datos
                </button>
              </div>
            </div>
          </div>
          
          <div id="readingsChart" style="height: 300px;">
            <div class="text-center p-4">
              <p>Seleccione un rango de fechas y presione "Cargar Datos"</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
    
    // Set default date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    document.getElementById('startDate').value = formatDate(startDate, 'YYYY-MM-DD');
    document.getElementById('endDate').value = formatDate(endDate, 'YYYY-MM-DD');
  }
  
  // Add event listeners
  function addEventListeners() {
    // Back button
    const backButton = document.getElementById('btnBack');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateToPage('nav-sensors-list');
      });
    }
    
    // Edit button
    const editButton = document.getElementById('btnEdit');
    if (editButton) {
      editButton.addEventListener('click', () => {
        sessionStorage.setItem('navAction', 'edit');
        sessionStorage.setItem('id', currentSensorId);
        navigateToPage('nav-sensors-create');
      });
    }
    
    // View report button
    const viewReportButton = document.getElementById('btnViewReport');
    if (viewReportButton) {
      viewReportButton.addEventListener('click', () => {
        sessionStorage.setItem('navAction', 'report');
        sessionStorage.setItem('id', currentSensorId);
        navigateToPage('nav-sensors-report');
      });
    }
    
    // Load readings button
    const loadReadingsButton = document.getElementById('btnLoadReadings');
    if (loadReadingsButton) {
      loadReadingsButton.addEventListener('click', loadSensorReadings);
    }
  }
  
  // Load sensor data
  function loadSensorData() {
    API.sensors.getById(currentSensorId)
      .then(response => {
        if (response.success && response.data) {
          sensorData = response.data;
          renderSensorDetail();
          
          // Load initial readings
          loadSensorReadings();
        } else {
          showToast('No se pudo cargar la información del sensor', 'error');
        }
      })
      .catch(error => {
        console.error('Error loading sensor data:', error);
        showToast('Error al cargar datos del sensor', 'error');
      });
  }
  
  // Render sensor detail
  function renderSensorDetail() {
    const detailContainer = document.getElementById('sensorDetailContent');
    
    if (!sensorData) {
      detailContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> No se pudo cargar la información del sensor
        </div>
      `;
      return;
    }
    
    detailContainer.innerHTML = `
      <div class="row">
        <div class="col-md-8">
          <table class="table table-striped">
            <tbody>
              <tr>
                <th width="30%">ID Sensor:</th>
                <td>${sensorData.id_sensor}</td>
              </tr>
              <tr>
                <th>Nombre:</th>
                <td>${sensorData.nombre}</td>
              </tr>
              <tr>
                <th>Tipo:</th>
                <td>${sensorData.tipo}</td>
              </tr>
              <tr>
                <th>Unidad de Medida:</th>
                <td>${sensorData.unidad_medida}</td>
              </tr>
              <tr>
                <th>Tiempo de Escaneo:</th>
                <td>${sensorData.tiempo_escaneo} ${parseInt(sensorData.tiempo_escaneo) <= 60 ? 'segundos' : 'minutos'}</td>
              </tr>
              <tr>
                <th>Descripción:</th>
                <td>${sensorData.descripcion}</td>
              </tr>
              <tr>
                <th>Estado:</th>
                <td>${createStateBadge(sensorData.estado).outerHTML}</td>
              </tr>
              <tr>
                <th>Fecha de Creación:</th>
                <td>${formatDate(sensorData.created_at)}</td>
              </tr>
              <tr>
                <th>Última Actualización:</th>
                <td>${formatDate(sensorData.updated_at)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-4 text-center">
          ${sensorData.imagen 
            ? `<img src="${CONFIG.API_URL}${sensorData.imagen}" alt="${sensorData.nombre}" class="img-fluid" style="max-height: 200px;">`
            : `<div class="p-4 bg-light rounded text-center">
                <i class="fas fa-microchip fa-4x text-muted mb-3"></i>
                <p>No hay imagen disponible</p>
              </div>`
          }
        </div>
      </div>
    `;
  }
  
  // Load sensor readings
  function loadSensorReadings() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const chartContainer = document.getElementById('readingsChart');
    
    if (!startDate || !endDate) {
      showToast('Seleccione un rango de fechas válido', 'warning');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      showToast('La fecha de inicio debe ser anterior a la fecha final', 'warning');
      return;
    }
    
    showLoader(chartContainer, 'Cargando lecturas...');
    
    API.sensors.getReadings(currentSensorId, startDate, endDate)
      .then(response => {
        hideLoader(chartContainer);
        
        if (response.success && response.data) {
          const readings = response.data;
          
          if (readings.length === 0) {
            chartContainer.innerHTML = `
              <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No hay lecturas disponibles para el rango de fechas seleccionado
              </div>
            `;
            return;
          }
          
          // Generate chart
          renderReadingsChart(readings);
        } else {
          chartContainer.innerHTML = `
            <div class="alert alert-danger text-center">
              <i class="fas fa-exclamation-circle"></i> Error al cargar las lecturas
            </div>
          `;
        }
      })
      .catch(error => {
        hideLoader(chartContainer);
        console.error('Error loading sensor readings:', error);
        chartContainer.innerHTML = `
          <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-circle"></i> Error al cargar las lecturas
          </div>
        `;
      });
  }
  
  // Render readings chart
  function renderReadingsChart(readings) {
    const chartContainer = document.getElementById('readingsChart');
    chartContainer.innerHTML = '<canvas></canvas>';
    
    generateSensorChart(
      'readingsChart',
      readings,
      sensorData.nombre,
      sensorData.unidad_medida
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