// insumoList.js
// TODO: Implement Insumo List module
console.log('insumoList.js loaded');

// Global export functions
window.exportInsumosToExcel = function(data, filename) {
  if (typeof XLSX === 'undefined') {
    showToast('La librería XLSX no está disponible', 'error');
    return;
  }

  try {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData = data.map(insumo => ({
      'ID Insumo': insumo.id_insumo,
      'Nombre': insumo.nombre,
      'Tipo': insumo.tipo,
      'Descripción': insumo.descripcion || '',
      'Estado': insumo.estado === 'activo' ? 'Activo' : 'Inactivo'
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Insumos');
    
    // Generate Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    showToast('Error al exportar a Excel', 'error');
  }
};

window.exportInsumosToPDF = function(data, filename) {
  if (typeof jsPDF === 'undefined') {
    showToast('La librería jsPDF no está disponible', 'error');
    return;
  }

  try {
    // Create document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Listado de Insumos', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generado el: ${formatDate(new Date())}`, 14, 25);
    
    // Prepare data for table
    const tableData = data.map(insumo => [
      insumo.id_insumo,
      insumo.nombre,
      insumo.tipo,
      insumo.descripcion || '-',
      insumo.estado === 'activo' ? 'Activo' : 'Inactivo'
    ]);
    
    // Add table
    doc.autoTable({
      head: [['ID', 'Nombre', 'Tipo', 'Descripción', 'Estado']],
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

const InsumoList = (function() {
  let insumos = [];
  let filteredInsumos = [];
  let searchTerm = '';
  let tipoFilter = '';
  let estadoFilter = '';
  const contentContainer = document.getElementById('main-content');

  function init() {
    render();
    loadInsumos();
  }

  function render() {
    document.querySelector('.page-title').textContent = 'Insumos';
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Listado de Insumos</h2>
          <a href="#" id="btn-create-insumo" class="btn btn-primary btn-icon">
            <i class="fas fa-plus"></i> Nuevo Insumo
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
                <label for="tipo-filter" class="form-label">Tipo:</label>
                <select id="tipo-filter" class="form-select">
                  <option value="">Todos los tipos</option>
                  <option value="fertilizante">Fertilizante</option>
                  <option value="pesticida">Pesticida</option>
                  <option value="herramienta">Herramienta</option>
                  <option value="otro">Otro</option>
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
                  <th>ID Insumo</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="insumos-table-body">
                <tr>
                  <td colspan="6" class="text-center">Cargando insumos...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    addEventListeners();
  }

  function loadInsumos() {
    const insumoTableBody = document.getElementById('insumos-table-body');
    insumoTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Cargando insumos...</td></tr>`;
    InsumoAPI.getAll()
      .then(response => {
        insumos = response.data || [];
        filteredInsumos = [...insumos];
        renderInsumos();
      })
      .catch(error => {
        insumoTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar insumos</td></tr>`;
      });
  }

  function renderInsumos() {
    const insumoTableBody = document.getElementById('insumos-table-body');
    if (!filteredInsumos.length) {
      insumoTableBody.innerHTML = `<tr><td colspan="6" class="text-center">No se encontraron insumos</td></tr>`;
      return;
    }
    insumoTableBody.innerHTML = filteredInsumos.map(insumo => `
      <tr>
        <td>${insumo.id_insumo}</td>
        <td>${insumo.nombre}</td>
        <td>${insumo.tipo}</td>
        <td>${insumo.descripcion || '-'}</td>
        <td>${createStateBadge(insumo.estado).outerHTML}</td>
        <td class="table-actions">
          <button class="btn btn-sm btn-info btn-view" data-id="${insumo.id_insumo}" title="Ver detalles"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-primary btn-edit" data-id="${insumo.id_insumo}" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${insumo.id_insumo}" title="Eliminar"><i class="fas fa-trash"></i></button>
          <button class="btn btn-sm btn-${insumo.estado === 'activo' ? 'warning' : 'success'} btn-toggle" data-id="${insumo.id_insumo}" data-estado="${insumo.estado}" title="${insumo.estado === 'activo' ? 'Desactivar' : 'Activar'}"><i class="fas fa-${insumo.estado === 'activo' ? 'toggle-off' : 'toggle-on'}"></i></button>
        </td>
      </tr>
    `).join('');
    addActionButtonListeners();
  }

  function navigateToPage(navItemId) {
    console.log('Attempting to navigate to:', navItemId);
    
    switch(navItemId) {
        case 'nav-insumos-list':
            location.hash = '#/insumos';
            break;
        case 'nav-insumos-create':
            location.hash = '#/insumos/create';
            break;
        case 'nav-insumos-detail':
            location.hash = '#/insumos/detail';
            if (window.InsumoDetail) {
                window.InsumoDetail.init();
            }
            break;
    }
  }

  function addEventListeners() {
    const createButton = document.getElementById('btn-create-insumo');
    if (createButton) {
      createButton.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToPage('nav-insumos-create');
      });
    }

    const searchInput = document.getElementById('search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        applyFilters();
      });
    }

    const tipoFilterElement = document.getElementById('tipo-filter');
    if (tipoFilterElement) {
      tipoFilterElement.addEventListener('change', (e) => {
        tipoFilter = e.target.value;
        console.log('Tipo filter changed to:', tipoFilter);
        applyFilters();
      });
    }

    const estadoFilterElement = document.getElementById('estado-filter');
    if (estadoFilterElement) {
      estadoFilterElement.addEventListener('change', () => {
        estadoFilter = estadoFilterElement.value;
        applyFilters();
      });
    }

    const exportExcelBtn = document.getElementById('btn-export-excel');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', () => {
        exportInsumosToExcel(filteredInsumos, 'insumos');
      });
    }

    const exportPdfBtn = document.getElementById('btn-export-pdf');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => {
        exportInsumosToPDF(filteredInsumos, 'insumos');
      });
    }
  }

  function applyFilters() {
    console.log('Applying filters:', { searchTerm, tipoFilter, estadoFilter });
    filteredInsumos = insumos.filter(insumo => {
      const matchesSearch = searchTerm === '' || 
        insumo.nombre.toLowerCase().includes(searchTerm) ||
        insumo.id_insumo.toString().toLowerCase().includes(searchTerm);
      
      const matchesTipo = tipoFilter === '' || insumo.tipo.toLowerCase() === tipoFilter.toLowerCase();
      const matchesEstado = estadoFilter === '' || insumo.estado === estadoFilter;
      
      return matchesSearch && matchesTipo && matchesEstado;
    });
    
    renderInsumos();
  }

  // Toggle insumo state
  function toggleInsumoState(insumoId, currentState) {
    const newState = currentState === 'activo' ? 'inactivo' : 'activo';
    const action = newState === 'activo' ? 'activar' : 'desactivar';
    
    // Find and disable the toggle button while processing
    const toggleButton = document.querySelector(`.btn-toggle[data-id="${insumoId}"]`);
    if (toggleButton) {
      toggleButton.disabled = true;
      toggleButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    confirmDialog(
      `¿Está seguro que desea ${action} el insumo ${insumoId}?`,
      async () => {
        try {
          // Only update the estado field
          const response = await InsumoAPI.patch(insumoId, { estado: newState });
          
          if (response && response.success) {
            showToast(`Insumo ${action}do correctamente`, 'success');
            await loadInsumos();
          } else {
            throw new Error('La respuesta del servidor no fue exitosa');
          }
        } catch (error) {
          console.error(`Error al ${action} insumo:`, error);
          showToast(`Error al ${action} el insumo: ${error.message || 'Error desconocido'}`, 'error');
          // Reset button state on error
          if (toggleButton) {
            toggleButton.disabled = false;
            toggleButton.innerHTML = `<i class="fas fa-${currentState === 'activo' ? 'toggle-off' : 'toggle-on'}"></i>`;
          }
        }
      }
    );
  }

  function addActionButtonListeners() {
    document.querySelectorAll('.btn-view').forEach(button => {
        button.addEventListener('click', () => {
            const insumoId = button.getAttribute('data-id');
            console.log('View button clicked for insumo:', insumoId);
            
            // Store ID in session
            sessionStorage.setItem('id', insumoId);
            sessionStorage.setItem('navAction', 'view');
            
            // Navigate using hash
            location.hash = '#/insumos/detail';
        });
    });
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const insumoId = button.getAttribute('data-id');
        sessionStorage.setItem('id', insumoId);
        sessionStorage.setItem('navAction', 'edit');
        navigateToPage('nav-insumos-create');
      });
    });
    document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', () => {
        const insumoId = button.getAttribute('data-id');
        confirmDialog('¿Está seguro que desea eliminar este insumo?', () => {
          InsumoAPI.delete(insumoId)
            .then(() => {
              showToast('Insumo eliminado correctamente', 'success');
              loadInsumos();
            })
            .catch(() => showToast('Error al eliminar insumo', 'error'));
        });
      });
    });
    document.querySelectorAll('.btn-toggle').forEach(button => {
      button.addEventListener('click', () => {
        const insumoId = button.getAttribute('data-id');
        const currentState = button.getAttribute('data-estado');
        toggleInsumoState(insumoId, currentState);
      });
    });
  }

  return { init };
})();
