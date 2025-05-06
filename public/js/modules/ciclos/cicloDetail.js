// cicloDetail.js
// TODO: Implement Ciclo Detail module
console.log('cicloDetail.js loaded');

const CicloDetail = (function() {
  // Private variables
  let cicloId = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get ciclo ID from session storage
    cicloId = sessionStorage.getItem('id');
    
    if (!cicloId) {
      showToast('No se ha especificado un ciclo para ver', 'error');
      navigateToPage('nav-ciclos-list');
      return;
    }
    
    render();
    loadCicloData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Detalles del Ciclo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Detalles del Ciclo</h2>
          <div class="d-flex gap-2">
            <button id="btn-edit" class="btn btn-primary btn-icon">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button id="btn-report" class="btn btn-secondary btn-icon">
              <i class="fas fa-chart-line"></i> Reporte
            </button>
            <button id="btn-back" class="btn btn-outline-secondary btn-icon">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="info-group">
                <h4>Información General</h4>
                <table class="table table-borderless">
                  <tr>
                    <th style="width: 150px;">ID Ciclo:</th>
                    <td id="id-ciclo">-</td>
                  </tr>
                  <tr>
                    <th>Nombre:</th>
                    <td id="nombre">-</td>
                  </tr>
                  <tr>
                    <th>Cultivo:</th>
                    <td id="cultivo">-</td>
                  </tr>
                  <tr>
                    <th>Estado:</th>
                    <td id="estado">-</td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-group">
                <h4>Fechas</h4>
                <table class="table table-borderless">
                  <tr>
                    <th style="width: 150px;">Fecha Inicial:</th>
                    <td id="fecha-inicial">-</td>
                  </tr>
                  <tr>
                    <th>Fecha Final:</th>
                    <td id="fecha-final">-</td>
                  </tr>
                  <tr>
                    <th>Duración:</th>
                    <td id="duracion">-</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-12">
              <div class="info-group">
                <h4>Descripción</h4>
                <div id="descripcion" class="p-3 bg-light rounded">-</div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-12">
              <div class="info-group">
                <h4>Novedades</h4>
                <div id="novedades" class="p-3 bg-light rounded">-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load ciclo data
  function loadCicloData() {
    CicloAPI.getById(cicloId)
      .then(response => {
        const ciclo = response.data;
        
        // Fill general information
        document.getElementById('id-ciclo').textContent = ciclo.id_ciclo;
        document.getElementById('nombre').textContent = ciclo.nombre;
        document.getElementById('cultivo').textContent = ciclo.nombre_cultivo || '-';
        document.getElementById('estado').innerHTML = createStateBadge(ciclo.estado).outerHTML;
        
        // Fill dates
        document.getElementById('fecha-inicial').textContent = formatDate(ciclo.fecha_inicial);
        document.getElementById('fecha-final').textContent = formatDate(ciclo.fecha_final);
        
        // Calculate duration
        const startDate = new Date(ciclo.fecha_inicial);
        const endDate = new Date(ciclo.fecha_final);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('duracion').textContent = `${diffDays} días`;
        
        // Fill description and novedades
        document.getElementById('descripcion').textContent = ciclo.descripcion || 'Sin descripción';
        document.getElementById('novedades').textContent = ciclo.novedades || 'Sin novedades';
      })
      .catch(error => {
        console.error('Error loading ciclo:', error);
        showToast('Error al cargar los datos del ciclo', 'error');
        navigateToPage('nav-ciclos-list');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    // Edit button
    document.getElementById('btn-edit').addEventListener('click', () => {
      sessionStorage.setItem('navAction', 'edit');
      navigateToPage('nav-ciclos-create');
    });
    
    // Report button
    document.getElementById('btn-report').addEventListener('click', () => {
      navigateToPage('nav-ciclos-report');
    });
    
    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
      navigateToPage('nav-ciclos-list');
    });
  }
  
  // Public API
  return {
    init
  };
})();
