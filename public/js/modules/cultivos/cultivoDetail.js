// cultivoDetail.js
// TODO: Implement Cultivo Detail module
console.log('cultivoDetail.js loaded');

/**
 * Cultivo detail module
 */
const CultivoDetail = (function() {
  // Private variables
  let cultivoId = null;
  
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
    
    render();
    loadCultivoData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Detalle del Cultivo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Detalle del Cultivo</h2>
          <div class="d-flex gap-2">
            <button id="btn-edit" class="btn btn-primary btn-icon">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button id="btn-back" class="btn btn-secondary btn-icon">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
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
                <label class="info-label">Tamaño:</label>
                <span id="tamano" class="info-value">-</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-group mb-3">
                <label class="info-label">Fecha de Siembra:</label>
                <span id="fecha_siembra" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Estado:</label>
                <span id="estado" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Fecha de Creación:</label>
                <span id="created_at" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Última Actualización:</label>
                <span id="updated_at" class="info-value">-</span>
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-12">
              <div class="info-group mb-3">
                <label class="info-label">Descripción:</label>
                <div id="descripcion" class="info-value">-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load cultivo data
  function loadCultivoData() {
    // Load cultivo data
    API.cultivos.getById(cultivoId)
      .then(response => {
        const cultivo = response.data;
        
        // Fill info fields
        document.getElementById('id_cultivo').textContent = cultivo.id_cultivo;
        document.getElementById('nombre').textContent = cultivo.nombre;
        document.getElementById('tipo').textContent = cultivo.tipo;
        document.getElementById('tamano').textContent = `${cultivo.tamano} m²`;
        document.getElementById('fecha_siembra').textContent = formatDate(cultivo.fecha_siembra);
        document.getElementById('estado').innerHTML = createStateBadge(cultivo.estado).outerHTML;
        document.getElementById('created_at').textContent = formatDate(cultivo.created_at);
        document.getElementById('updated_at').textContent = formatDate(cultivo.updated_at);
        document.getElementById('descripcion').textContent = cultivo.descripcion || 'Sin descripción';
      })
      .catch(error => {
        console.error('Error loading cultivo:', error);
        showToast('Error al cargar los datos del cultivo', 'error');
        navigateToPage('nav-cultivos');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    // Edit button
    const editButton = document.getElementById('btn-edit');
    if (editButton) {
      editButton.addEventListener('click', () => {
        // Store cultivo ID in session storage
        sessionStorage.setItem('id', cultivoId);
        sessionStorage.setItem('navAction', 'edit');
        
        // Navigate to edit page
        navigateToPage('nav-cultivos-create');
      });
    }
    
    // Back button
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateToPage('nav-cultivos');
      });
    }
  }
  
  // Return public methods
  return {
    init: init
  };
})();
