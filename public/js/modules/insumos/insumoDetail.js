// insumoDetail.js
console.log('🔄 Loading InsumoDetail module...');

const InsumoDetail = (function() {
  let insumoId = null;
  const contentContainer = document.getElementById('main-content');

  function init() {
    console.group('InsumoDetail Initialization');
    console.log('InsumoDetail.init() called');
    
    insumoId = sessionStorage.getItem('id');
    const navAction = sessionStorage.getItem('navAction');
    console.log('Session data:', { insumoId, navAction });
    
    if (!insumoId) {
      console.warn('No insumo ID found in session');
      showToast('No se ha especificado un insumo', 'error');
      console.log('Redirecting to list...');
      navigateToPage('nav-insumos-list');
      console.groupEnd();
      return;
    }

    console.log('Rendering detail view...');
    render();
    console.log('Loading insumo data...');
    loadInsumoData();
    console.groupEnd();
  }

  function render() {
    document.querySelector('.page-title').textContent = 'Detalle del Insumo';
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Detalle del Insumo</h2>
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
                <label class="info-label">ID Insumo:</label>
                <span id="id_insumo" class="info-value">-</span>
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
                <label class="info-label">Unidad de Medida:</label>
                <span id="unidad_medida" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Cantidad:</label>
                <span id="cantidad" class="info-value">-</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="info-group mb-3">
                <label class="info-label">Valor Unitario:</label>
                <span id="valor_unitario" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Valor Total:</label>
                <span id="valor_total" class="info-value">-</span>
              </div>
              <div class="info-group mb-3">
                <label class="info-label">Estado:</label>
                <span id="estado" class="info-value">-</span>
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
    addEventListeners();
  }

  function loadInsumoData() {
    console.log('🔄 Starting insumo data load process for ID:', insumoId);
    showLoading();
    
    // Check if API is already available
    if (window.InsumoAPI) {
        console.log('✨ InsumoAPI found immediately');
        loadData();
        return;
    }

    console.log('⏳ Waiting for InsumoAPI to be ready...');
    
    // Listen for API ready event
    window.addEventListener('insumoApiReady', () => {
        console.log('✨ Received insumoApiReady event');
        loadData();
    }, { once: true });  // Remove listener after first use

    // Fallback timeout in case event never fires
    setTimeout(() => {
        if (!window.InsumoAPI) {
            console.error('❌ InsumoAPI not available after timeout');
            showToast('Error: No se pudo inicializar el sistema', 'error');
            location.hash = '#/insumos';
        }
    }, 5000);  // 5 second timeout
  }

  function loadData() {
    window.InsumoAPI.getById(insumoId)
        .then(response => {
            if (!response || !response.data) {
                throw new Error('No se recibieron datos del insumo');
            }
            render();
            updateInsumoData(response.data);
        })
        .catch(error => {
            console.error('Error loading insumo:', error);
            showToast(error.message || 'Error al cargar los datos del insumo', 'error');
            location.hash = '#/insumos';
        });
  }

  function showLoading() {
    const cardBody = document.querySelector('.card-body');
    if (cardBody) {
      cardBody.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando datos del insumo...</p>
        </div>
      `;
    }
  }

  function hideLoading() {
    // Will be handled by render/updateInsumoData
  }

  function updateInsumoData(insumo) {
    console.log('Updating UI with insumo data:', insumo);
    try {
      const fields = {
        'id_insumo': insumo.id_insumo || insumo.id || '-',
        'nombre': insumo.nombre || '-',
        'tipo': insumo.tipo || '-',
        'unidad_medida': insumo.unidad_medida || '-',
        'cantidad': insumo.cantidad?.toString() || '0',
        'valor_unitario': `$${parseFloat(insumo.valor_unitario || 0).toFixed(2)}`,
        'valor_total': `$${parseFloat(insumo.valor_total || 0).toFixed(2)}`,
        'estado': insumo.estado || 'inactivo',
        'descripcion': insumo.descripcion || 'Sin descripción'
      };

      Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
          if (id === 'estado') {
            element.innerHTML = createStateBadge(value).outerHTML;
          } else {
            element.textContent = value;
          }
        } else {
          console.warn(`Element not found: ${id}`);
        }
      });
    } catch (error) {
      console.error('Error updating UI:', error);
      showToast('Error al mostrar los datos del insumo', 'error');
    }
  }

  function addEventListeners() {
    const editButton = document.getElementById('btn-edit');
    if (editButton) {
      editButton.addEventListener('click', () => {
        sessionStorage.setItem('id', insumoId);
        sessionStorage.setItem('navAction', 'edit');
        navigateToPage('nav-insumos-create');
      });
    }
    const backButton = document.getElementById('btn-back');
    if (backButton) {
      backButton.addEventListener('click', () => {
        navigateToPage('nav-insumos-list');
      });
    }
  }

  function navigateToPage(navItemId) {
    console.log('Navigating to:', navItemId);
    sessionStorage.removeItem('id');
    sessionStorage.removeItem('navAction');
    
    switch(navItemId) {
        case 'nav-insumos-list':
            location.hash = '#/insumos';
            break;
        case 'nav-insumos-create':
            location.hash = '#/insumos/create';
            break;
        default:
            location.hash = '#/insumos';
    }
  }

  function initialize() {
    console.log('Initializing InsumoDetail module...');
    
    if (location.hash === '#/insumos/detail') {
        const id = sessionStorage.getItem('id');
        const action = sessionStorage.getItem('navAction');
        
        if (id && action === 'view') {
            init();
        } else {
            location.hash = '#/insumos';
        }
    }
  }

  // Modify module exposure
  const module = { 
    init,
    initialize
  };

  window.InsumoDetail = module;

  // Only add hashchange listener, remove DOMContentLoaded
  window.addEventListener('hashchange', initialize);

  // Initialize immediately if we're already on the correct hash
  if (location.hash === '#/insumos/detail') {
    initialize();
  }

  return module;
})();
