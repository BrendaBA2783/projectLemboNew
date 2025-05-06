// cultivoList.js
// TODO: Implement Cultivo List module
console.log('cultivoList.js loaded');

/**
 * Cultivo list module
 */
const CultivoList = (function() {
  // Private variables
  let currentPage = 1;
  let pageSize = CONFIG.PAGINATION.PAGE_SIZE;
  let totalPages = 1;
  let cultivos = [];
  let filteredCultivos = [];
  let searchTerm = '';
  let tipoFilter = '';
  let estadoFilter = '';
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    render();
    loadCultivos();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Cultivos';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Listado de Cultivos</h2>
          <a href="#" id="btn-create-cultivo" class="btn btn-primary btn-icon">
            <i class="fas fa-plus"></i> Nuevo Cultivo
          </a>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <div class="form-group">
                <label for="search" class="form-label">Buscar:</label>
                <input type="text" id="search" class="form-control" placeholder="Buscar por nombre o ID...">
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="tipo-filter" class="form-label">Filtrar por tipo:</label>
                <select id="tipo-filter" class="form-select">
                  <option value="">Todos los tipos</option>
                  ${CONFIG.CULTIVO_TIPOS.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="col-md-3">
              <div class="form-group">
                <label for="estado-filter" class="form-label">Estado:</label>
                <select id="estado-filter" class="form-select">
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
                  <th>ID Cultivo</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Tamaño (m²)</th>
                  <th>Fecha Siembra</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="cultivos-table-body">
                <tr>
                  <td colspan="7" class="text-center">Cargando cultivos...</td>
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
  
  // Load cultivos from API
  function loadCultivos() {
    const cultivoTableBody = document.getElementById('cultivos-table-body');
    showLoader(cultivoTableBody, 'Cargando cultivos...');
    
    API.cultivos.getAll()
      .then(response => {
        cultivos = response.data || [];
        filteredCultivos = [...cultivos];
        
        // Apply filters
        applyFilters();
      })
      .catch(error => {
        console.error('Error loading cultivos:', error);
        cultivoTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              <i class="fas fa-exclamation-circle"></i> Error al cargar cultivos. Intente nuevamente.
            </td>
          </tr>
        `;
      });
  }
  
  // Render cultivo data
  function renderCultivos() {
    const cultivoTableBody = document.getElementById('cultivos-table-body');
    
    if (!filteredCultivos.length) {
      cultivoTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No se encontraron cultivos</td>
        </tr>
      `;
      document.getElementById('pagination-container').style.display = 'none';
      return;
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredCultivos.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredCultivos.length);
    const paginatedCultivos = filteredCultivos.slice(startIndex, endIndex);
    
    // Render table rows
    cultivoTableBody.innerHTML = paginatedCultivos.map(cultivo => `
      <tr>
        <td>${cultivo.id_cultivo}</td>
        <td>${cultivo.nombre}</td>
        <td>${cultivo.tipo}</td>
        <td>${cultivo.tamano}</td>
        <td>${cultivo.fecha_siembra ? formatDate(cultivo.fecha_siembra) : '-'}</td>
        <td>${createStateBadge(cultivo.estado).outerHTML}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-info btn-view" data-id="${cultivo.id_cultivo}" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${cultivo.id_cultivo}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-${cultivo.estado === 'activo' ? 'warning' : 'success'} btn-toggle" 
            data-id="${cultivo.id_cultivo}" 
            data-estado="${cultivo.estado}"
            title="${cultivo.estado === 'activo' ? 'Desactivar' : 'Activar'}">
            <i class="fas fa-${cultivo.estado === 'activo' ? 'toggle-off' : 'toggle-on'}"></i>
          </button>
          <button class="btn btn-sm btn-secondary btn-report" data-id="${cultivo.id_cultivo}" title="Generar reporte">
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
      renderCultivos();
    });
    
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pagination);
  }
  
  // Add event listeners
  function addEventListeners() {
    // Create cultivo button
    const createButton = document.getElementById('btn-create-cultivo');
    if (createButton) {
      createButton.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('nav-cultivos-create');
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
    const tipoFilter = document.getElementById('tipo-filter');
    if (tipoFilter) {
      tipoFilter.addEventListener('change', () => {
        currentPage = 1;
        applyFilters();
      });
    }
    
    // State filter
    const estadoFilter = document.getElementById('estado-filter');
    if (estadoFilter) {
      estadoFilter.addEventListener('change', () => {
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
        renderCultivos();
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
        const cultivoId = button.getAttribute('data-id');
        viewCultivo(cultivoId);
      });
    });
    
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const cultivoId = button.getAttribute('data-id');
        editCultivo(cultivoId);
      });
    });
    
    // Toggle state buttons
    document.querySelectorAll('.btn-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const cultivoId = button.getAttribute('data-id');
        const currentState = button.getAttribute('data-estado');
        toggleCultivoState(cultivoId, currentState);
      });
    });
    
    // Report buttons
    document.querySelectorAll('.btn-report').forEach(button => {
      button.addEventListener('click', () => {
        const cultivoId = button.getAttribute('data-id');
        generateCultivoReport(cultivoId);
      });
    });
  }
  
  // Apply filters to cultivos
  function applyFilters() {
    const tipoFilterValue = document.getElementById('tipo-filter').value;
    const estadoFilterValue = document.getElementById('estado-filter').value;
    
    filteredCultivos = cultivos.filter(cultivo => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        cultivo.nombre.toLowerCase().includes(searchTerm) ||
        cultivo.id_cultivo.toLowerCase().includes(searchTerm);
      
      // Type filter
      const matchesType = tipoFilterValue === '' || cultivo.tipo === tipoFilterValue;
      
      // State filter
      const matchesState = estadoFilterValue === '' || cultivo.estado === estadoFilterValue;
      
      return matchesSearch && matchesType && matchesState;
    });
    
    currentPage = 1;
    renderCultivos();
  }
  
  // View cultivo details
  function viewCultivo(cultivoId) {
    // Store cultivo ID in session storage
    sessionStorage.setItem('id', cultivoId);
    sessionStorage.setItem('navAction', 'view');
    
    // Navigate to cultivo detail page
    navigateToPage('nav-cultivos-detail');
  }
  
  // Edit cultivo
  function editCultivo(cultivoId) {
    // Store cultivo ID in session storage
    sessionStorage.setItem('id', cultivoId);
    sessionStorage.setItem('navAction', 'edit');
    
    // Navigate to cultivo form page
    navigateToPage('nav-cultivos-create');
  }
  
  // Toggle cultivo state
  function toggleCultivoState(cultivoId, currentState) {
    const newState = currentState === 'activo' ? 'inactivo' : 'activo';
    const action = newState === 'activo' ? 'activar' : 'desactivar';
    
    confirmDialog(
      `¿Está seguro que desea ${action} el cultivo ${cultivoId}?`,
      () => {
        API.cultivos.toggleStatus(cultivoId, newState)
          .then(response => {
            showToast(`Cultivo ${action}do correctamente`, 'success');
            loadCultivos();
          })
          .catch(error => {
            console.error(`Error al ${action} cultivo:`, error);
            showToast(`Error al ${action} el cultivo`, 'error');
          });
      }
    );
  }
  
  // Generate cultivo report
  function generateCultivoReport(cultivoId) {
    // Store cultivo ID in session storage
    sessionStorage.setItem('id', cultivoId);
    sessionStorage.setItem('navAction', 'report');
    
    // Navigate to cultivo report page
    navigateToPage('nav-cultivos-report');
  }
  
  // Export to Excel
  function exportToExcel() {
    // Define headers for Excel report
    const headers = [
      { header: 'ID Cultivo', key: 'id_cultivo' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Área (m²)', key: 'area' },
      { header: 'Fecha Siembra', key: 'fecha_siembra', type: 'date' },
      { header: 'Descripción', key: 'descripcion' },
      { header: 'Estado', key: 'estado' },
      { header: 'Fecha Creación', key: 'created_at', type: 'date' }
    ];
    
    // Generate the report
    generateExcelReport(
      filteredCultivos,
      headers,
      'Reporte de Cultivos',
      `cultivos_${formatDate(new Date(), 'YYYY-MM-DD')}`
    );
  }
  
  // Export to PDF
  function exportToPdf() {
    // Define headers for PDF report
    const headers = [
      { header: 'ID Cultivo', key: 'id_cultivo' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Área', key: 'area' },
      { header: 'Fecha Siembra', key: 'fecha_siembra' },
      { header: 'Estado', key: 'estado' }
    ];
    
    // Generate the report
    generatePdfReport(
      filteredCultivos,
      headers,
      'Reporte de Cultivos',
      `cultivos_${formatDate(new Date(), 'YYYY-MM-DD')}`,
      true
    );
  }
  
  // Return public methods
  return {
    init: init
  };
})();
