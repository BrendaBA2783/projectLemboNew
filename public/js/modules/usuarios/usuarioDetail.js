// usuarioDetail.js
// TODO: Implement Usuarios Detail module
console.log('usuarioDetail.js loaded');

/**
 * Usuario detail module
 */
const UsuarioDetail = (function() {
  // Private variables
  let usuarioId = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get usuarios ID from session storage
    usuarioId = sessionStorage.getItem('id');
    
    if (!usuarioId) {
      showToast('No se ha especificado un usuario', 'error');
      navigateToPage('nav-usuarios');
      return;
    }
    
    render();
    loadUsuariosData();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Detalle del usuario';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Detalle del Usuario</h2>
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
                <label class="info-label">ID Usuario:</label>
                <span id="id_usuario" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Nombre:</label>
                <span id="nombre" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Apellido:</label>
                <span id="apellido" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Tipo de usuario:</label>
                <span id="tipo-usuario" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Tipo de documento:</label>
                <span id="tipo-documento" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Número de documento:</label>
                <span id="numero-documento" class="info-value">-</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-group mb-3">
                <label class="info-label">Estado:</label>
                <span id="estado" class="info-value">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load usuario data
  function loadUsuariosData() {
    // Load usuario data
    API.usuarios.getById(usuarioId)
      .then(response => {
        const usuarios = response.data;
        
        // Fill info fields
        document.getElementById('id_usuario').textContent = usuarios.id_usuario;
        document.getElementById('nombre').textContent = usuarios.nombre;
        document.getElementById('apellido').textContent = usuarios.apellido;
        document.getElementById('tipo-usuario').textContent = usuarios.tipo-usuario;
        document.getElementById('tipo-documento').textContent = usuarios.tipo-documento;
        document.getElementById('numero-documento').textContent = usuarios.numero-documento;
        document.getElementById('estado').innerHTML = createStateBadge(usuarios.estado).outerHTML;
        
      })
      .catch(error => {
        console.error('Error loading usuario:', error);
        showToast('Error al cargar los datos del usuario', 'error');
        navigateToPage('nav-usuarios');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    // Edit button
    const editButton = document.getElementById('btn-edit');
    if (editButton) {
      editButton.addEventListener('click', () => {
        // Store usuario ID in session storage
        sessionStorage.setItem('id', usuarioId);
        sessionStorage.setItem('navAction', 'edit');
        
        // Navigate to edit page
        navigateToPage('nav-usuarios-create');
      });
    }
    
    // Back button
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateToPage('nav-usuarios');
      });
    }
  }
  
  // Return public methods
  return {
    init: init
  };
})();
