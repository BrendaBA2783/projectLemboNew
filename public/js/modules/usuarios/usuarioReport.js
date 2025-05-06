// cultivoReport.js
// TODO: Implement Cultivo Report module
console.log('cultivoReport.js loaded');

/**
 * Cultivo report module
 */
const CultivoReport = (function() {
  // Private variables
  let cultivoId = null;
  let startDate = null;
  let endDate = null;
  let chart = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get cultivo ID from session storage
    cultivoId = sessionStorage.getItem('id');
    
    if (!cultivoId) {
      showToast('No se ha especificado un cultivo', 'error');
      navigateToPage('nav-cultivos');
      return;
    }
    
    // Set default date range (last 7 days)
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    render();
    loadCultivoData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Reporte de Cultivo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Reporte de Cultivo</h2>
          <div class="d-flex gap-2">
            <button id="btn-back" class="btn btn-secondary btn-icon">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="form-group">
                <label for="start-date" class="form-label">Fecha Inicio:</label>
                <input type="date" class="form-control" id="start-date">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="end-date" class="form-label">Fecha Fin:</label>
                <input type="date" class="form-control" id="end-date">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label class="form-label">&nbsp;</label>
                <button id="btn-apply-filters" class="btn btn-primary w-100">
                  <i class="fas fa-filter"></i> Aplicar Filtros
                </button>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h3>Información del Cultivo</h3>
                </div>
                <div class="card-body">
                  <div class="info-group mb-3">
                    <label class="info-label">ID Cultivo:</label>
                    <span id="id_cultivo" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Nombre:</label>
                    <span id="nombre" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Tipo:</label>
                    <span id="tipo" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Área:</label>
                    <span id="area" class="info-value">-</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h3>Estadísticas</h3>
                </div>
                <div class="card-body">
                  <div class="info-group mb-3">
                    <label class="info-label">Promedio de Temperatura:</label>
                    <span id="avg-temp" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Promedio de Humedad:</label>
                    <span id="avg-hum" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Promedio de Luz:</label>
                    <span id="avg-light" class="info-value">-</span>
                  </div>
                  <div class="info-group mb-3">
                    <label class="info-label">Promedio de pH:</label>
                    <span id="avg-ph" class="info-value">-</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h3>Gráfico de Sensores</h3>
                </div>
                <div class="card-body">
                  <canvas id="sensors-chart"></canvas>
                </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h3>Registros de Sensores</h3>
                  <div class="d-flex gap-2">
                    <button id="btn-export-excel" class="btn btn-success btn-sm">
                      <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                    <button id="btn-export-pdf" class="btn btn-danger btn-sm">
                      <i class="fas fa-file-pdf"></i> Exportar PDF
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>ID Sensor</th>
                          <th>Nombre</th>
                          <th>Tipo</th>
                          <th>Valor</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody id="sensors-data">
                        <tr>
                          <td colspan="5" class="text-center">Cargando datos...</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Set default dates
    document.getElementById('start-date').value = formatDateForInput(startDate);
    document.getElementById('end-date').value = formatDateForInput(endDate);
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load cultivo data
  function loadCultivoData() {
    // Show loading state
    showLoader(contentContainer, 'Cargando datos del cultivo...');
    
    // Load cultivo data
    API.cultivos.getById(cultivoId)
      .then(response => {
        const cultivo = response.data;
        
        // Fill info fields
        document.getElementById('id_cultivo').textContent = cultivo.id_cultivo;
        document.getElementById('nombre').textContent = cultivo.nombre;
        document.getElementById('tipo').textContent = cultivo.tipo;
        document.getElementById('area').textContent = `${cultivo.area} m²`;
        
        // Load sensors data
        loadSensorsData();
      })
      .catch(error => {
        console.error('Error loading cultivo:', error);
        showToast('Error al cargar los datos del cultivo', 'error');
        navigateToPage('nav-cultivos');
      });
  }
  
  // Load sensors data
  function loadSensorsData() {
    API.cultivos.getSensorsReport(cultivoId, {
      start_date: formatDateForAPI(startDate),
      end_date: formatDateForAPI(endDate)
    })
      .then(response => {
        const data = response.data || {};
        const sensorsData = data.sensors_data || [];
        const statistics = data.statistics || {};
        
        // Update statistics
        document.getElementById('avg-temp').textContent = statistics.avg_temperature 
          ? `${statistics.avg_temperature}°C` 
          : '-';
        document.getElementById('avg-hum').textContent = statistics.avg_humidity 
          ? `${statistics.avg_humidity}%` 
          : '-';
        document.getElementById('avg-light').textContent = statistics.avg_light 
          ? `${statistics.avg_light} lux` 
          : '-';
        document.getElementById('avg-ph').textContent = statistics.avg_ph 
          ? statistics.avg_ph 
          : '-';
        
        // Update table
        const tbody = document.getElementById('sensors-data');
        if (!sensorsData.length) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" class="text-center">No hay registros en el período seleccionado</td>
            </tr>
          `;
        } else {
          tbody.innerHTML = sensorsData.map(record => `
            <tr>
              <td>${record.id_sensor}</td>
              <td>${record.nombre_sensor}</td>
              <td>${record.tipo_sensor}</td>
              <td>${record.valor} ${record.unidad_medida}</td>
              <td>${formatDate(record.fecha_registro)}</td>
            </tr>
          `).join('');
        }
        
        // Update chart
        updateChart(sensorsData);
      })
      .catch(error => {
        console.error('Error loading sensors data:', error);
        showToast('Error al cargar los datos de los sensores', 'error');
      });
  }
  
  // Update chart
  function updateChart(data) {
    // Group data by sensor type
    const groupedData = {};
    data.forEach(record => {
      if (!groupedData[record.tipo_sensor]) {
        groupedData[record.tipo_sensor] = [];
      }
      groupedData[record.tipo_sensor].push({
        x: new Date(record.fecha_registro),
        y: parseFloat(record.valor)
      });
    });
    
    // Prepare chart data
    const datasets = Object.entries(groupedData).map(([type, values]) => ({
      label: type,
      data: values,
      borderColor: getRandomColor(),
      fill: false
    }));
    
    // Destroy existing chart if any
    if (chart) {
      chart.destroy();
    }
    
    // Create new chart
    const ctx = document.getElementById('sensors-chart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Valor'
            }
          }
        }
      }
    });
  }
  
  // Add event listeners
  function addEventListeners() {
    // Back button
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateToPage('nav-cultivos');
      });
    }
    
    // Apply filters button
    const applyFiltersButton = document.getElementById('btn-apply-filters');
    if (applyFiltersButton) {
      applyFiltersButton.addEventListener('click', () => {
        const startDateInput = document.getElementById('start-date');
        const endDateInput = document.getElementById('end-date');
        
        startDate = new Date(startDateInput.value);
        endDate = new Date(endDateInput.value);
        
        if (startDate > endDate) {
          showToast('La fecha de inicio no puede ser mayor a la fecha de fin', 'error');
          return;
        }
        
        loadSensorsData();
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
  
  // Export to Excel
  function exportToExcel() {
    // Define headers for Excel report
    const headers = [
      { header: 'ID Sensor', key: 'id_sensor' },
      { header: 'Nombre', key: 'nombre_sensor' },
      { header: 'Tipo', key: 'tipo_sensor' },
      { header: 'Valor', key: 'valor' },
      { header: 'Unidad', key: 'unidad_medida' },
      { header: 'Fecha', key: 'fecha_registro', type: 'date' }
    ];
    
    // Get current data
    const rows = Array.from(document.querySelectorAll('#sensors-data tr')).map(row => {
      const cells = row.cells;
      return {
        id_sensor: cells[0].textContent,
        nombre_sensor: cells[1].textContent,
        tipo_sensor: cells[2].textContent,
        valor: cells[3].textContent.split(' ')[0],
        unidad_medida: cells[3].textContent.split(' ')[1],
        fecha_registro: cells[4].textContent
      };
    });
    
    // Generate the report
    generateExcelReport(
      rows,
      headers,
      'Reporte de Sensores del Cultivo',
      `cultivo_${cultivoId}_sensores_${formatDate(new Date(), 'YYYY-MM-DD')}`
    );
  }
  
  // Export to PDF
  function exportToPdf() {
    // Define headers for PDF report
    const headers = [
      { header: 'ID Sensor', key: 'id_sensor' },
      { header: 'Nombre', key: 'nombre_sensor' },
      { header: 'Tipo', key: 'tipo_sensor' },
      { header: 'Valor', key: 'valor' },
      { header: 'Fecha', key: 'fecha_registro' }
    ];
    
    // Get current data
    const rows = Array.from(document.querySelectorAll('#sensors-data tr')).map(row => {
      const cells = row.cells;
      return {
        id_sensor: cells[0].textContent,
        nombre_sensor: cells[1].textContent,
        tipo_sensor: cells[2].textContent,
        valor: cells[3].textContent,
        fecha_registro: cells[4].textContent
      };
    });
    
    // Generate the report
    generatePdfReport(
      rows,
      headers,
      'Reporte de Sensores del Cultivo',
      `cultivo_${cultivoId}_sensores_${formatDate(new Date(), 'YYYY-MM-DD')}`,
      true
    );
  }
  
  // Return public methods
  return {
    init: init
  };
})();
