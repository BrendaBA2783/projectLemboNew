/**
 * Sensor report module
 */
const SensorReport = (function() {
  // Private variables
  let currentSensorId = null;
  let sensorData = null;
  let sensorReadings = [];
  
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
      navigateTo('nav-sensors-list');
      return;
    }
    
    render();
    loadSensorData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Reporte de Sensor';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">
          <h2>Reporte de Sensor</h2>
          <div class="d-flex gap-2">
            <button id="btnBack" class="btn btn-light btn-icon">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body" id="sensorInfoContainer">
          <div class="loader-container">
            <div class="loader"></div>
            <p>Cargando datos del sensor...</p>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header">
          <h3>Lecturas del Sensor</h3>
          <div class="d-flex gap-2">
            <button id="btnExportPdf" class="btn btn-danger btn-icon">
              <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
            <button id="btnExportExcel" class="btn btn-success btn-icon">
              <i class="fas fa-file-excel"></i> Exportar Excel
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
          
          <div class="charts-row">
            <div class="chart-container">
              <div class="chart-header">
                <h4>Gráfico de Lecturas</h4>
              </div>
              <div id="readingsChart" style="height: 300px;">
                <div class="text-center p-4">
                  <p>Seleccione un rango de fechas y presione "Cargar Datos"</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-4">
            <h4>Tabla de Lecturas</h4>
            <div class="table-container" id="readingsTableContainer">
              <p class="text-center">Seleccione un rango de fechas y presione "Cargar Datos"</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>Estadísticas</h3>
        </div>
        <div class="card-body">
          <div class="row" id="statsContainer">
            <p class="text-center">Seleccione un rango de fechas y presione "Cargar Datos"</p>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = formatDate(startDate, 'YYYY-MM-DD');
    document.getElementById('endDate').value = formatDate(endDate, 'YYYY-MM-DD');
  }
  
  // Add event listeners
  function addEventListeners() {
    // Back button
    const backButton = document.getElementById('btnBack');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateTo('nav-sensors-list');
      });
    }
    
    // Load readings button
    const loadReadingsButton = document.getElementById('btnLoadReadings');
    if (loadReadingsButton) {
      loadReadingsButton.addEventListener('click', loadSensorReadings);
    }
    
    // Export buttons
    const exportPdfButton = document.getElementById('btnExportPdf');
    if (exportPdfButton) {
      exportPdfButton.addEventListener('click', exportToPdf);
    }
    
    const exportExcelButton = document.getElementById('btnExportExcel');
    if (exportExcelButton) {
      exportExcelButton.addEventListener('click', exportToExcel);
    }
  }
  
  // Load sensor data
  function loadSensorData() {
    API.sensors.getById(currentSensorId)
      .then(response => {
        if (response.success && response.data) {
          sensorData = response.data;
          renderSensorInfo();
        } else {
          showToast('No se pudo cargar la información del sensor', 'error');
        }
      })
      .catch(error => {
        console.error('Error loading sensor data:', error);
        showToast('Error al cargar datos del sensor', 'error');
      });
  }
  
  // Render sensor info
  function renderSensorInfo() {
    const infoContainer = document.getElementById('sensorInfoContainer');
    
    if (!sensorData) {
      infoContainer.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i> No se pudo cargar la información del sensor
        </div>
      `;
      return;
    }
    
    infoContainer.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h4>${sensorData.nombre}</h4>
          <p><strong>ID:</strong> ${sensorData.id_sensor}</p>
          <p><strong>Tipo:</strong> ${sensorData.tipo}</p>
          <p><strong>Unidad de Medida:</strong> ${sensorData.unidad_medida}</p>
          <p><strong>Tiempo de Escaneo:</strong> ${sensorData.tiempo_escaneo} ${parseInt(sensorData.tiempo_escaneo) <= 60 ? 'segundos' : 'minutos'}</p>
          <p><strong>Estado:</strong> ${createStateBadge(sensorData.estado).outerHTML}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Descripción:</strong></p>
          <p>${sensorData.descripcion}</p>
        </div>
      </div>
    `;
  }
  
  // Load sensor readings
  function loadSensorReadings() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const chartContainer = document.getElementById('readingsChart');
    const tableContainer = document.getElementById('readingsTableContainer');
    const statsContainer = document.getElementById('statsContainer');
    
    if (!startDate || !endDate) {
      showToast('Seleccione un rango de fechas válido', 'warning');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      showToast('La fecha de inicio debe ser anterior a la fecha final', 'warning');
      return;
    }
    
    showLoader(chartContainer, 'Cargando lecturas...');
    tableContainer.innerHTML = '<p class="text-center">Cargando datos...</p>';
    statsContainer.innerHTML = '<p class="text-center">Cargando estadísticas...</p>';
    
    API.sensors.getReadings(currentSensorId, startDate, endDate)
      .then(response => {
        hideLoader(chartContainer);
        
        if (response.success && response.data) {
          sensorReadings = response.data;
          
          if (sensorReadings.length === 0) {
            chartContainer.innerHTML = `
              <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No hay lecturas disponibles para el rango de fechas seleccionado
              </div>
            `;
            tableContainer.innerHTML = `
              <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No hay lecturas disponibles para el rango de fechas seleccionado
              </div>
            `;
            statsContainer.innerHTML = `
              <div class="alert alert-info text-center">
                <i class="fas fa-info-circle"></i> No hay lecturas disponibles para el rango de fechas seleccionado
              </div>
            `;
            return;
          }
          
          // Generate chart, table and statistics
          renderReadingsChart();
          renderReadingsTable();
          renderStatistics();
        } else {
          const errorMsg = `
            <div class="alert alert-danger text-center">
              <i class="fas fa-exclamation-circle"></i> Error al cargar las lecturas
            </div>
          `;
          chartContainer.innerHTML = errorMsg;
          tableContainer.innerHTML = errorMsg;
          statsContainer.innerHTML = errorMsg;
        }
      })
      .catch(error => {
        hideLoader(chartContainer);
        console.error('Error loading sensor readings:', error);
        const errorMsg = `
          <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-circle"></i> Error al cargar las lecturas
          </div>
        `;
        chartContainer.innerHTML = errorMsg;
        tableContainer.innerHTML = errorMsg;
        statsContainer.innerHTML = errorMsg;
      });
  }
  
  // Render readings chart
  function renderReadingsChart() {
    generateSensorChart(
      'readingsChart',
      sensorReadings,
      sensorData.nombre,
      sensorData.unidad_medida
    );
  }
  
  // Render readings table
  function renderReadingsTable() {
    const tableContainer = document.getElementById('readingsTableContainer');
    const rows = sensorReadings.map((reading, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${formatDate(reading.fecha)}</td>
        <td>${formatDate(reading.fecha).split(' ')[1]}</td>
        <td>${reading.valor} ${reading.unidad_medida}</td>
      </tr>
    `).join('');
    
    tableContainer.innerHTML = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }
  
  // Render statistics
  function renderStatistics() {
    const statsContainer = document.getElementById('statsContainer');
    
    // Calculate statistics
    const values = sensorReadings.map(r => parseFloat(r.valor));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Group readings by day
    const readingsByDay = {};
    sensorReadings.forEach(reading => {
      const day = reading.fecha.split('T')[0];
      if (!readingsByDay[day]) {
        readingsByDay[day] = [];
      }
      readingsByDay[day].push(parseFloat(reading.valor));
    });
    
    // Calculate daily averages
    const dailyAvgs = Object.keys(readingsByDay).map(day => {
      const values = readingsByDay[day];
      return {
        day,
        avg: values.reduce((a, b) => a + b, 0) / values.length
      };
    });
    
    statsContainer.innerHTML = `
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Estadísticas Generales</h5>
            <table class="table">
              <tbody>
                <tr>
                  <th>Total Lecturas:</th>
                  <td>${sensorReadings.length}</td>
                </tr>
                <tr>
                  <th>Valor Mínimo:</th>
                  <td>${minValue.toFixed(2)} ${sensorData.unidad_medida}</td>
                </tr>
                <tr>
                  <th>Valor Máximo:</th>
                  <td>${maxValue.toFixed(2)} ${sensorData.unidad_medida}</td>
                </tr>
                <tr>
                  <th>Valor Promedio:</th>
                  <td>${avgValue.toFixed(2)} ${sensorData.unidad_medida}</td>
                </tr>
                <tr>
                  <th>Rango de Fechas:</th>
                  <td>${formatDate(sensorReadings[0].fecha)} - ${formatDate(sensorReadings[sensorReadings.length - 1].fecha)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5>Promedios Diarios</h5>
            <div id="dailyAvgChart" style="height: 250px;"></div>
          </div>
        </div>
      </div>
    `;
    
    // Generate daily average chart
    generateBarChart(
      'dailyAvgChart',
      dailyAvgs.map(d => d.avg),
      dailyAvgs.map(d => formatDate(d.day)),
      'Promedio Diario',
      {
        yAxisLabel: sensorData.unidad_medida,
        xAxisLabel: 'Fecha'
      }
    );
  }
  
  // Export to PDF
  function exportToPdf() {
    if (!sensorReadings || sensorReadings.length === 0) {
      showToast('No hay datos para exportar', 'warning');
      return;
    }
    
    // Define headers for PDF report
    const headers = [
      { header: 'Fecha', key: 'fecha', type: 'date' },
      { header: 'Hora', key: 'hora' },
      { header: 'Valor', key: 'valor', type: 'number' },
      { header: 'Unidad', key: 'unidad_medida' }
    ];
    
    // Prepare data
    const data = sensorReadings.map(reading => {
      const date = new Date(reading.fecha);
      return {
        fecha: date,
        hora: date.toTimeString().split(' ')[0],
        valor: reading.valor,
        unidad_medida: reading.unidad_medida
      };
    });
    
    // Generate the report
    generatePdfReport(
      data,
      headers,
      `Reporte de Lecturas - ${sensorData.nombre}`,
      `sensor_${sensorData.id_sensor}_${formatDate(new Date(), 'YYYY-MM-DD')}`,
      true
    );
  }
  
  // Export to Excel
  function exportToExcel() {
    if (!sensorReadings || sensorReadings.length === 0) {
      showToast('No hay datos para exportar', 'warning');
      return;
    }
    
    // Define headers for Excel report
    const headers = [
      { header: 'Fecha', key: 'fecha', type: 'date' },
      { header: 'Hora', key: 'hora' },
      { header: 'Valor', key: 'valor', type: 'number' },
      { header: 'Unidad', key: 'unidad_medida' },
      { header: 'ID Sensor', key: 'id_sensor' }
    ];
    
    // Prepare data
    const data = sensorReadings.map(reading => {
      const date = new Date(reading.fecha);
      return {
        fecha: date,
        hora: date.toTimeString().split(' ')[0],
        valor: reading.valor,
        unidad_medida: reading.unidad_medida,
        id_sensor: reading.id_sensor
      };
    });
    
    // Generate the report
    generateExcelReport(
      data,
      headers,
      `Reporte de Lecturas - ${sensorData.nombre}`,
      `sensor_${sensorData.id_sensor}_${formatDate(new Date(), 'YYYY-MM-DD')}`
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