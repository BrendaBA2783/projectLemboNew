/**
 * Dashboard module
 */
const Dashboard = (function() {
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Charts
  let sensorChart = null;
  let cultivoChart = null;
  let insumoChart = null;
  
  // Initialize the module
  function init() {
    render();
    loadDashboardData();
  }
  
  // Render the dashboard
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Dashboard';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-primary">
            <i class="fas fa-microchip"></i>
          </div>
          <div class="stat-info">
            <h3 id="sensorCount">...</h3>
            <p>Sensores</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon bg-success">
            <i class="fas fa-seedling"></i>
          </div>
          <div class="stat-info">
            <h3 id="cultivoCount">...</h3>
            <p>Cultivos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #FFA000; color: white;">
            <i class="fas fa-boxes"></i>
          </div>
          <div class="stat-info">
            <h3 id="insumoCount">...</h3>
            <p>Insumos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon" style="background-color: #9C27B0; color: white;">
            <i class="fas fa-industry"></i>
          </div>
          <div class="stat-info">
            <h3 id="produccionCount">...</h3>
            <p>Producciones</p>
          </div>
        </div>
      </div>
      
      <div class="charts-row">
        <div class="chart-container">
          <div class="chart-header">
            <h3>Lecturas Recientes de Sensores</h3>
            <div class="chart-actions">
              <button id="btnRefreshSensorData" class="btn btn-sm btn-light">
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
          <div id="sensorChartContainer" style="height: 300px;">
            <div class="loader-container">
              <div class="loader"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-header">
            <h3>Distribución de Cultivos</h3>
          </div>
          <div id="cultivoChartContainer" style="height: 300px;">
            <div class="loader-container">
              <div class="loader"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="charts-row">
        <div class="chart-container">
          <div class="chart-header">
            <h3>Inversión en Insumos</h3>
          </div>
          <div id="insumoChartContainer" style="height: 300px;">
            <div class="loader-container">
              <div class="loader"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        </div>
        
        <div class="chart-container">
          <div class="chart-header">
            <h3>Producciones Activas</h3>
          </div>
          <div id="produccionChartContainer" style="height: 300px;">
            <div class="loader-container">
              <div class="loader"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Add event listeners
  function addEventListeners() {
    // Refresh sensor data button
    const refreshSensorBtn = document.getElementById('btnRefreshSensorData');
    if (refreshSensorBtn) {
      refreshSensorBtn.addEventListener('click', loadSensorData);
    }
  }
  
  // Load all dashboard data
  function loadDashboardData() {
    loadCounts();
    loadSensorData();
    loadCultivoData();
    loadInsumoData();
    loadProduccionData();
  }
  
  // Load counts
  function loadCounts() {
    // Load sensor count
    API.sensors.getAll()
      .then(response => {
        if (response.success) {
          document.getElementById('sensorCount').textContent = response.count || 0;
        }
      })
      .catch(error => {
        console.error('Error loading sensor count:', error);
        document.getElementById('sensorCount').textContent = 'Error';
      });
    
    // Load cultivo count
    API.cultivos.getAll()
      .then(response => {
        if (response.success) {
          document.getElementById('cultivoCount').textContent = response.count || 0;
        }
      })
      .catch(error => {
        console.error('Error loading cultivo count:', error);
        document.getElementById('cultivoCount').textContent = 'Error';
      });
    
    // Load insumo count
    API.insumos.getAll()
      .then(response => {
        if (response.success) {
          document.getElementById('insumoCount').textContent = response.count || 0;
        }
      })
      .catch(error => {
        console.error('Error loading insumo count:', error);
        document.getElementById('insumoCount').textContent = 'Error';
      });
    
    // Load produccion count
    API.producciones.getAll()
      .then(response => {
        if (response && response.success !== false) {
          document.getElementById('produccionCount').textContent = response.count || response.data?.length || 0;
        } else {
          throw new Error('Invalid response from server');
        }
      })
      .catch(error => {
        console.error('Error loading produccion count:', error);
        document.getElementById('produccionCount').textContent = 'Error';
      });
  }
  
  // Load sensor data
  function loadSensorData() {
    const container = document.getElementById('sensorChartContainer');
    showLoader(container, 'Cargando datos de sensores...');
    
    // Simulate sensor data
    const mockSensors = [
      { id_sensor: 'TEMP001', nombre: 'Sensor Temperatura', tipo: 'temperatura', unidad_medida: '°C', estado: 'activo' },
      { id_sensor: 'HUM001', nombre: 'Sensor Humedad', tipo: 'humedad', unidad_medida: '%', estado: 'activo' },
      { id_sensor: 'LUX001', nombre: 'Sensor Luz', tipo: 'luminosidad', unidad_medida: 'lux', estado: 'activo' }
    ];

    // Generate mock readings for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const mockReadings = mockSensors.map(sensor => {
      const readings = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Generate random values based on sensor type
        let value;
        switch (sensor.tipo) {
          case 'temperatura':
            value = 20 + Math.random() * 10; // temperatura entre 20-30°C
            break;
          case 'humedad':
            value = 60 + Math.random() * 20; // humedad entre 60-80%
            break;
          case 'luminosidad':
            value = 1000 + Math.random() * 2000; // luminosidad entre 1000-3000 lux
            break;
        }

        readings.push({
          fecha: new Date(currentDate),
          valor: value.toFixed(2)
        });

        // Avanzar 3 horas
        currentDate.setHours(currentDate.getHours() + 3);
      }

      return {
        success: true,
        data: readings
      };
    });

    // Process the mock data just like real API responses
    const datasets = [];
    mockReadings.forEach((result, index) => {
      if (result.success && result.data && result.data.length > 0) {
        const sensor = mockSensors[index];
        const readings = result.data;
        
        datasets.push({
          label: `${sensor.nombre} (${sensor.unidad_medida})`,
          data: readings.map(r => ({
            x: new Date(r.fecha),
            y: parseFloat(r.valor)
          })),
          borderColor: CONFIG.CHART_COLORS[index],
          backgroundColor: `${CONFIG.CHART_COLORS[index]}22`,
          borderWidth: 2,
          tension: 0.4,
          fill: false
        });
      }
    });

    hideLoader(container);
    if (datasets.length === 0) {
      container.innerHTML = '<p class="text-center">No hay lecturas para mostrar</p>';
      return;
    }
    
    renderSensorChart(datasets);
  }
  
  // Load cultivo data
  function loadCultivoData() {
    const container = document.getElementById('cultivoChartContainer');
    showLoader(container, 'Cargando datos de cultivos...');
    
    API.cultivos.getAll()
      .then(response => {
        hideLoader(container);
        
        if (!response.success || !response.data || response.data.length === 0) {
          container.innerHTML = '<p class="text-center">No hay cultivos para mostrar</p>';
          return;
        }
        
        const cultivos = response.data;
        
        // Group by type
        const cultivosByType = {};
        cultivos.forEach(cultivo => {
          if (!cultivosByType[cultivo.tipo]) {
            cultivosByType[cultivo.tipo] = 0;
          }
          cultivosByType[cultivo.tipo]++;
        });
        
        // Prepare chart data
        const labels = Object.keys(cultivosByType);
        const data = Object.values(cultivosByType);
        
        renderCultivoChart(labels, data);
      })
      .catch(error => {
        hideLoader(container);
        console.error('Error loading cultivos:', error);
        container.innerHTML = '<p class="text-center text-danger">Error al cargar datos</p>';
      });
  }
  
  // Load insumo data
  function loadInsumoData() {
    const container = document.getElementById('insumoChartContainer');
    showLoader(container, 'Cargando datos de insumos...');
    
    API.insumos.getAll()
      .then(response => {
        hideLoader(container);
        
        if (!response.success || !response.data || response.data.length === 0) {
          container.innerHTML = '<p class="text-center">No hay insumos para mostrar</p>';
          return;
        }
        
        const insumos = response.data;
        
        // Group by type
        const insumosByType = {};
        insumos.forEach(insumo => {
          if (!insumosByType[insumo.tipo]) {
            insumosByType[insumo.tipo] = 0;
          }
          insumosByType[insumo.tipo] += parseFloat(insumo.valor_total) || 0;
        });
        
        // Prepare chart data
        const labels = Object.keys(insumosByType);
        const data = Object.values(insumosByType);
        
        renderInsumoChart(labels, data);
      })
      .catch(error => {
        hideLoader(container);
        console.error('Error loading insumos:', error);
        container.innerHTML = '<p class="text-center text-danger">Error al cargar datos</p>';
      });
  }
  
  // Load produccion data
  function loadProduccionData() {
    const container = document.getElementById('produccionChartContainer');
    showLoader(container, 'Cargando datos de producciones...');
    
    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    API.producciones.getByDateRange(startDate, endDate)
      .then(response => {
        hideLoader(container);
        
        if (!response.success || !response.data || !Array.isArray(response.data)) {
          console.error('Respuesta inválida:', response);
          container.innerHTML = '<p class="text-center text-danger">Error: Respuesta inválida del servidor</p>';
          return;
        }
        
        const producciones = response.data;
        
        if (producciones.length === 0) {
          container.innerHTML = `
            <div class="text-center">
              <p class="text-muted mb-3">No hay producciones activas para mostrar</p>
              <button class="btn btn-primary" onclick="navigateToPage('nav-producciones-create')">
                <i class="fas fa-plus"></i> Crear Nueva Producción
              </button>
            </div>`;
          return;
        }
        
        // Count active productions and sum investments by month
        const productionsByMonth = Array(12).fill(0);
        const investmentByMonth = Array(12).fill(0);
        
        producciones.forEach(prod => {
          const startDate = new Date(prod.fecha_inicio);
          const month = startDate.getMonth();
          productionsByMonth[month]++;
          investmentByMonth[month] += parseFloat(prod.inversion) || 0;
        });
        
        // Prepare chart data
        const labels = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        renderProduccionChart(labels, productionsByMonth, investmentByMonth);
      })
      .catch(error => {
        hideLoader(container);
        console.error('Error loading producciones:', error);
        container.innerHTML = '<p class="text-center text-danger">Error al cargar los datos</p>';
      });
  }

  // Render sensor chart
  function renderSensorChart(datasets) {
    const container = document.getElementById('sensorChartContainer');
    
    // Clear container
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    
    // Destroy previous chart if exists
    if (sensorChart) {
      sensorChart.destroy();
    }
    
    // Create new chart
    sensorChart = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: datasets
      },
      options: {
        ...CONFIG.DEFAULT_CHART_OPTIONS,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'dd/MM'
              }
            },
            title: {
              display: true,
              text: 'Fecha'
            }
          },
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Valor'
            }
          }
        }
      }
    });
  }
  
  // Render cultivo chart
  function renderCultivoChart(labels, data) {
    const container = document.getElementById('cultivoChartContainer');
    
    // Clear container
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    
    // Destroy previous chart if exists
    if (cultivoChart) {
      cultivoChart.destroy();
    }
    
    // Create new chart
    cultivoChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: CONFIG.CHART_COLORS.slice(0, labels.length),
          borderWidth: 1
        }]
      },
      options: CONFIG.DEFAULT_CHART_OPTIONS
    });
  }
  
  // Render insumo chart
  function renderInsumoChart(labels, data) {
    const container = document.getElementById('insumoChartContainer');
    
    // Clear container
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    
    // Destroy previous chart if exists
    if (insumoChart) {
      insumoChart.destroy();
    }
    
    // Create new chart
    insumoChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valor Total',
          data: data,
          backgroundColor: CONFIG.CHART_COLORS.slice(0, labels.length),
          borderWidth: 1
        }]
      },
      options: {
        ...CONFIG.DEFAULT_CHART_OPTIONS,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor Total (COP)'
            }
          }
        }
      }
    });
  }
  
  // Render produccion chart
  function renderProduccionChart(labels, productionsData, investmentData) {
    const container = document.getElementById('produccionChartContainer');
    
    // Clear container
    container.innerHTML = '<canvas></canvas>';
    const canvas = container.querySelector('canvas');
    
    // Create new chart
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Producciones Activas',
            data: productionsData,
            backgroundColor: CONFIG.CHART_COLORS[3],
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Inversión Total (COP)',
            data: investmentData,
            backgroundColor: CONFIG.CHART_COLORS[4],
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...CONFIG.DEFAULT_CHART_OPTIONS,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad de Producciones'
            },
            ticks: {
              stepSize: 1
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Inversión (COP)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }
  
  // Return public methods
  return {
    init: init
  };
})();