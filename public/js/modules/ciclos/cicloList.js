// cicloList.js
// TODO: Implement Ciclo List module
console.log('cicloList.js loaded');

// Global export functions
window.exportToExcel = function(data, filename) {
  if (typeof XLSX === 'undefined') {
    showToast('La librería XLSX no está disponible', 'error');
    return;
  }

  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData = data.map(ciclo => ({
      'ID Ciclo': ciclo.id_ciclo,
      'Nombre': ciclo.nombre,
      'Cultivo': ciclo.nombre_cultivo || '-',
      'Fecha Inicial': formatDate(ciclo.fecha_inicial),
      'Fecha Final': formatDate(ciclo.fecha_final),
      'Estado': ciclo.estado === 'activo' ? 'Activo' : 'Inactivo',
      'Descripción': ciclo.descripcion || '',
      'Novedades': ciclo.novedades || ''
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Ciclos');
    
    // Generate Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    showToast('Error al exportar a Excel', 'error');
  }
};

window.exportToPDF = function(data, filename) {
  if (typeof jsPDF === 'undefined') {
    showToast('La librería jsPDF no está disponible', 'error');
    return;
  }

  try {
    // Create document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Listado de Ciclos', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generado el: ${formatDate(new Date())}`, 14, 25);
    
    // Prepare data for table
    const tableData = data.map(ciclo => [
      ciclo.id_ciclo,
      ciclo.nombre,
      ciclo.nombre_cultivo || '-',
      formatDate(ciclo.fecha_inicial),
      formatDate(ciclo.fecha_final),
      ciclo.estado === 'activo' ? 'Activo' : 'Inactivo'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['ID', 'Nombre', 'Cultivo', 'Fecha Inicial', 'Fecha Final', 'Estado']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 }
    });
    
    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    showToast('Error al exportar a PDF', 'error');
  }
};

const CicloList = (function() {
  // Private variables
  let ciclos = [];
  let filteredCiclos = [];
  let currentPage = 1;
  let pageSize = 10;
  let totalPages = 1;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    render();
    loadCiclos();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Ciclos de Cultivo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Listado de Ciclos</h2>
          <a href="#" id="btn-create-ciclo" class="btn btn-primary btn-icon">
            <i class="fas fa-plus"></i> Nuevo Ciclo
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
                <label for="cultivo-filter" class="form-label">Cultivo:</label>
                <select id="cultivo-filter" class="form-select">
                  <option value="">Todos los cultivos</option>
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
                  <th>ID Ciclo</th>
                  <th>Nombre</th>
                  <th>Cultivo</th>
                  <th>Fecha Inicial</th>
                  <th>Fecha Final</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ciclos-table-body">
                <tr>
                  <td colspan="7" class="text-center">Cargando ciclos...</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div id="pagination-container" class="d-flex justify-content-between align-items-center mt-3">
            <div>
              <select id="page-size" class="form-select form-select-sm" style="width: auto;">
                <option value="10" selected>10 por página</option>
                <option value="25">25 por página</option>
                <option value="50">50 por página</option>
                <option value="100">100 por página</option>
              </select>
            </div>
            <div id="pagination-controls"></div>
          </div>
        </div>
      </div>
    `;
    
    // Load cultivos for filter
    loadCultivos();
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load cultivos for filter
  function loadCultivos() {
    CultivoAPI.getAll()
      .then(response => {
        const cultivos = response.data || [];
        const select = document.getElementById('cultivo-filter');
        
        cultivos.forEach(cultivo => {
          const option = document.createElement('option');
          option.value = cultivo.id_cultivo;
          option.textContent = cultivo.nombre;
          select.appendChild(option);
        });
      })
      .catch(error => {
        console.error('Error loading cultivos:', error);
        showToast('Error al cargar los cultivos', 'error');
      });
  }
  
  // Load ciclos from API
  function loadCiclos() {
    const cicloTableBody = document.getElementById('ciclos-table-body');
    showLoader(cicloTableBody, 'Cargando ciclos...');
    
    CicloAPI.getAll()
      .then(response => {
        ciclos = response.data || [];
        filteredCiclos = [...ciclos];
        
        // Apply filters
        applyFilters();
      })
      .catch(error => {
        console.error('Error loading ciclos:', error);
        cicloTableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger">
              <i class="fas fa-exclamation-circle"></i> Error al cargar ciclos. Intente nuevamente.
            </td>
          </tr>
        `;
      });
  }
  
  // Render ciclo data
  function renderCiclos() {
    const cicloTableBody = document.getElementById('ciclos-table-body');
    
    if (!filteredCiclos.length) {
      cicloTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No se encontraron ciclos</td>
        </tr>
      `;
      document.getElementById('pagination-container').style.display = 'none';
      return;
    }
    
    // Calculate pagination
    totalPages = Math.ceil(filteredCiclos.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredCiclos.length);
    const paginatedCiclos = filteredCiclos.slice(startIndex, endIndex);
    
    // Render table rows
    cicloTableBody.innerHTML = paginatedCiclos.map(ciclo => `
      <tr>
        <td>${ciclo.id_ciclo}</td>
        <td>${ciclo.nombre}</td>
        <td>${ciclo.nombre_cultivo || '-'}</td>
        <td>${formatDate(ciclo.fecha_inicial)}</td>
        <td>${formatDate(ciclo.fecha_final)}</td>
        <td>${createStateBadge(ciclo.estado).outerHTML}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-info btn-view" data-id="${ciclo.id_ciclo}" title="Ver detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${ciclo.id_ciclo}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-${ciclo.estado === 'activo' ? 'warning' : 'success'} btn-toggle" 
            data-id="${ciclo.id_ciclo}" 
            data-estado="${ciclo.estado}"
            title="${ciclo.estado === 'activo' ? 'Desactivar' : 'Activar'}">
            <i class="fas fa-${ciclo.estado === 'activo' ? 'toggle-off' : 'toggle-on'}"></i>
          </button>
          <button class="btn btn-sm btn-secondary btn-report" data-id="${ciclo.id_ciclo}" title="Generar reporte">
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
      renderCiclos();
    });
    
    paginationContainer.innerHTML = '';
    paginationContainer.appendChild(pagination);
  }
  
  // Add event listeners
  function addEventListeners() {
    // Search input
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', debounce(() => {
      applyFilters();
    }, 300));
    
    // Cultivo filter
    const cultivoFilter = document.getElementById('cultivo-filter');
    cultivoFilter.addEventListener('change', () => {
      applyFilters();
    });
    
    // Estado filter
    const estadoFilter = document.getElementById('estado-filter');
    estadoFilter.addEventListener('change', () => {
      applyFilters();
    });
    
    // Page size
    const pageSizeSelect = document.getElementById('page-size');
    pageSizeSelect.addEventListener('change', () => {
      pageSize = parseInt(pageSizeSelect.value);
      currentPage = 1;
      renderCiclos();
    });
    
    // Create button
    const createButton = document.getElementById('btn-create-ciclo');
    createButton.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToPage('nav-ciclos-create');
    });
    
    // Export buttons
    document.getElementById('btn-export-excel').addEventListener('click', () => {
      exportToExcel(filteredCiclos, 'ciclos');
    });
    
    document.getElementById('btn-export-pdf').addEventListener('click', () => {
      exportToPDF(filteredCiclos, 'ciclos');
    });
  }
  
  // Add action button listeners
  function addActionButtonListeners() {
    // View buttons
    document.querySelectorAll('.btn-view').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        sessionStorage.setItem('id', id);
        navigateToPage('nav-ciclos-detail');
      });
    });
    
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        sessionStorage.setItem('id', id);
        sessionStorage.setItem('navAction', 'edit');
        navigateToPage('nav-ciclos-create');
      });
    });
    
    // Toggle buttons
    document.querySelectorAll('.btn-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const estado = button.getAttribute('data-estado');
        toggleCiclo(id, estado);
      });
    });
    
    // Report buttons
    document.querySelectorAll('.btn-report').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        sessionStorage.setItem('id', id);
        navigateToPage('nav-ciclos-report');
      });
    });
  }
  
  // Apply filters
  function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const cultivoId = document.getElementById('cultivo-filter').value;
    const estado = document.getElementById('estado-filter').value;
    
    filteredCiclos = ciclos.filter(ciclo => {
      const matchesSearch = ciclo.nombre.toLowerCase().includes(searchTerm) ||
                          ciclo.id_ciclo.toLowerCase().includes(searchTerm);
      const matchesCultivo = !cultivoId || ciclo.id_cultivo === cultivoId;
      const matchesEstado = !estado || ciclo.estado === estado;
      
      return matchesSearch && matchesCultivo && matchesEstado;
    });
    
    currentPage = 1;
    renderCiclos();
  }
  
  // Toggle ciclo state
  async function toggleCiclo(id, currentState) {
    try {
      const newState = currentState === 'activo' ? 'inactivo' : 'activo';
      console.log('Toggling ciclo state:', { id, currentState, newState });
      
      showLoading();
      await CicloAPI.update(id, { estado: newState });
      
      showToast(`Ciclo ${newState === 'activo' ? 'activado' : 'desactivado'} correctamente`, 'success');
      loadCiclos();
    } catch (error) {
      console.error('Error toggling ciclo:', error);
      showToast(`Error al ${currentState === 'activo' ? 'desactivar' : 'activar'} el ciclo: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  }
  
  // Public API
  return {
    init
  };
})();
