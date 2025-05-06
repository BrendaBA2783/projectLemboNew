// produccionList.js
// TODO: Implement Produccion List module
console.log('produccionList.js loaded');

const ProduccionList = (function() {
  // Private variables
  let producciones = [];
  let filteredProducciones = []; // Add this line to track filtered results
  let searchTerm = '';
  let filters = {
    estado: 'todos',
    fecha_inicio: '',
    fecha_fin: ''
  };
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    render();
    loadProducciones();
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Producciones';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card mb-4">
        <div class="card-header">
          <h2>Resumen de Inversiones</h2>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <div class="card bg-primary text-white">
                <div class="card-body">
                  <h5 class="card-title">Inversión Total</h5>
                  <h3 id="total-inversion">$0.00</h3>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-success text-white">
                <div class="card-body">
                  <h5 class="card-title">Inversión Activa</h5>
                  <h3 id="inversion-activa">$0.00</h3>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="card bg-warning text-white">
                <div class="card-body">
                  <h5 class="card-title">Inversión Inactiva</h5>
                  <h3 id="inversion-inactiva">$0.00</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2>Lista de Producciones</h2>
          <div>
            <button class="btn btn-success me-2" onclick="navigateToPage('nav-producciones-create')">
              <i class="fas fa-plus"></i> Nueva Producción
            </button>
            <button class="btn btn-primary me-2" onclick="ProduccionList.exportProduccionesToExcel()">
              <i class="fas fa-file-excel"></i> Exportar Excel
            </button>
            <button class="btn btn-danger" onclick="ProduccionList.exportProduccionesToPDF()">
              <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text"><i class="fas fa-search"></i></span>
                <input type="text" class="form-control" id="search-input" placeholder="Buscar por nombre o ID...">
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select" id="estado-filter">
                <option value="todos">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div class="col-md-2">
              <input type="date" class="form-control" id="fecha-inicio-filter" placeholder="Fecha inicio">
            </div>
            <div class="col-md-3">
              <input type="date" class="form-control" id="fecha-fin-filter" placeholder="Fecha fin">
            </div>
          </div>
          
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Cultivo</th>
                  <th>Ciclo</th>
                  <th>Inversión</th>
                  <th>Meta</th>
                  <th>Fecha Inicio</th>
                  <th>Fecha Fin</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="producciones-table-body">
                <tr>
                  <td colspan="10" class="text-center">Cargando producciones...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load producciones from API
  async function loadProducciones() {
    try {
      const response = await API.producciones.getAll();
      console.log('Respuesta de la API:', response);
      producciones = Array.isArray(response.data) ? response.data : [];
      console.log('Producciones cargadas:', producciones);
      filteredProducciones = [...producciones];
      renderProduccionesTable();
      updateInvestmentSummary();
    } catch (error) {
      console.error('Error loading producciones:', error);
      showToast('Error al cargar las producciones', 'error');
    }
  }
  
  // Render producciones table
  function renderProduccionesTable() {
    const tbody = document.getElementById('producciones-table-body');
    console.log('Renderizando tabla con producciones:', filteredProducciones);
    
    if (filteredProducciones.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center">No se encontraron producciones</td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = filteredProducciones.map(produccion => {
      console.log('Procesando producción:', produccion);
      return `
        <tr>
          <td>${produccion.id_produccion || ''}</td>
          <td>${produccion.nombre || ''}</td>
          <td>${produccion.id_cultivo || ''}</td>
          <td>${produccion.nombre_ciclo || produccion.id_ciclo_cultivo || ''}</td>
          <td>$${(parseFloat(produccion.inversion) || 0).toFixed(2)}</td>
          <td>${(parseFloat(produccion.meta) || 0).toFixed(2)}</td>
          <td>${formatDate(produccion.fecha_inicio)}</td>
          <td>${formatDate(produccion.fecha_fin)}</td>
          <td>
            <span class="badge ${produccion.estado === 'activo' ? 'bg-success' : 'bg-danger'}">
              ${produccion.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </span>
          </td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-info" onclick="viewProduccion('${produccion.id_produccion}')">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-warning" onclick="editProduccion('${produccion.id_produccion}')">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduccion('${produccion.id_produccion}')">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn btn-sm ${produccion.estado === 'activo' ? 'btn-secondary' : 'btn-success'}" 
                      onclick="toggleProduccionStatus('${produccion.id_produccion}')">
                <i class="fas ${produccion.estado === 'activo' ? 'fa-pause' : 'fa-play'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  // Add event listeners
  function addEventListeners() {
    const searchInput = document.getElementById('search-input');
    const estadoFilter = document.getElementById('estado-filter');
    const fechaInicioFilter = document.getElementById('fecha-inicio-filter');
    const fechaFinFilter = document.getElementById('fecha-fin-filter');
    
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      applyFilters();
    });
    
    estadoFilter.addEventListener('change', (e) => {
      filters.estado = e.target.value;
      applyFilters();
    });
    
    fechaInicioFilter.addEventListener('change', (e) => {
      filters.fecha_inicio = e.target.value;
      applyFilters();
    });
    
    fechaFinFilter.addEventListener('change', (e) => {
      filters.fecha_fin = e.target.value;
      applyFilters();
    });
  }
  
  // Apply filters
  function applyFilters() {
    filteredProducciones = producciones.filter(produccion => {
      // Search term filter
      const matchesSearch = searchTerm === '' || 
        produccion.nombre.toLowerCase().includes(searchTerm) ||
        produccion.id_produccion.toLowerCase().includes(searchTerm);
      
      // Estado filter
      const matchesEstado = filters.estado === 'todos' || 
        produccion.estado === filters.estado;
      
      // Date range filter
      const fechaInicio = new Date(produccion.fecha_inicio);
      const matchesFechaInicio = !filters.fecha_inicio || 
        fechaInicio >= new Date(filters.fecha_inicio);
      const matchesFechaFin = !filters.fecha_fin || 
        fechaInicio <= new Date(filters.fecha_fin);
      
      return matchesSearch && matchesEstado && matchesFechaInicio && matchesFechaFin;
    });
    
    renderProduccionesTable();
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }
  
  // Update investment summary
  function updateInvestmentSummary() {
    try {
      console.log('Actualizando resumen de inversiones...');
      console.log('Producciones disponibles:', producciones.length);

      const totalInversion = producciones.reduce((sum, prod) => {
        const inversion = parseFloat(prod.inversion) || 0;
        console.log(`Producción ${prod.id_produccion}: inversión = ${inversion}`);
        return sum + inversion;
      }, 0);

      const inversionActiva = producciones
        .filter(prod => prod.estado === 'activo')
        .reduce((sum, prod) => {
          const inversion = parseFloat(prod.inversion) || 0;
          console.log(`Producción activa ${prod.id_produccion}: inversión = ${inversion}`);
          return sum + inversion;
        }, 0);

      const inversionInactiva = producciones
        .filter(prod => prod.estado === 'inactivo')
        .reduce((sum, prod) => {
          const inversion = parseFloat(prod.inversion) || 0;
          console.log(`Producción inactiva ${prod.id_produccion}: inversión = ${inversion}`);
          return sum + inversion;
        }, 0);

      console.log('Totales calculados:', {
        total: totalInversion,
        activa: inversionActiva,
        inactiva: inversionInactiva
      });

      // Formatear los valores con 2 decimales y el símbolo de moneda
      document.getElementById('total-inversion').textContent = `$${totalInversion.toFixed(2)}`;
      document.getElementById('inversion-activa').textContent = `$${inversionActiva.toFixed(2)}`;
      document.getElementById('inversion-inactiva').textContent = `$${inversionInactiva.toFixed(2)}`;

      console.log('Resumen de inversiones actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar el resumen de inversiones:', error);
      showToast('Error al actualizar el resumen de inversiones', 'error');
    }
  }

  // Export to Excel function
  function exportProduccionesToExcel() {
    if (!filteredProducciones.length) {
      showToast('No hay datos para exportar', 'warning');
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(filteredProducciones.map(p => ({
      'Nombre': p.nombre,
      'Responsable': p.responsable,
      'Cultivo': p.cultivo,
      'Inversión': p.inversion,
      'Meta': p.meta,
      'Fecha Inicio': p.fecha_inicio,
      'Fecha Fin': p.fecha_fin || 'N/A',
      'Estado': p.estado
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Producciones');
    XLSX.writeFile(workbook, 'producciones.xlsx');
  }

  // Export to PDF function
  function exportProduccionesToPDF() {
    if (!filteredProducciones.length) {
      showToast('No hay datos para exportar', 'warning');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Title styling
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('REPORTE DE PRODUCCIONES', pageWidth/2, 20, { align: 'center' });

    // Table columns and data
    const tableColumn = [
      "Nombre", 
      "Cultivo", 
      "Ciclo", 
      "Inversión", 
      "Meta", 
      "F. Inicio", 
      "Estado"
    ];
    
    const tableRows = filteredProducciones.map(prod => [
      prod.nombre?.toUpperCase() || 'N/A',
      prod.cultivo?.nombre || prod.nombre_cultivo || 'N/A',
      prod.ciclo?.nombre || prod.nombre_ciclo || 'N/A',
      formatCurrency(prod.inversion),
      formatCurrency(prod.meta),
      formatDate(prod.fecha_inicio),
      prod.estado?.toUpperCase() || 'N/A'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 50,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 45 }, // Nombre
        1: { cellWidth: 30 }, // Cultivo
        2: { cellWidth: 25 }, // Ciclo
        3: { cellWidth: 25, halign: 'right' }, // Inversión
        4: { cellWidth: 25, halign: 'right' }, // Meta
        5: { cellWidth: 22, halign: 'center' }, // F. Inicio
        6: { cellWidth: 20, halign: 'center' }  // Estado
      }
    });

    doc.save('reporte-producciones.pdf');
  }

  // Helper function to format currency
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  // Helper function to format dates
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Public API
  return {
    init,
    loadProducciones,
    exportProduccionesToExcel,
    exportProduccionesToPDF
  };
})();

// Global functions for table actions
function viewProduccion(id) {
  console.log('🖱️ Click en botón de visualizar producción');
  console.log('📝 ID de producción recibido:', id);
  
  if (!id) {
    console.error('❌ Error: ID de producción no válido');
    showToast('ID de producción no válido', 'error');
    return;
  }
  
  try {
    console.log('💾 Guardando ID en sessionStorage:', id);
    sessionStorage.setItem('id', id);
    
    console.log('🔄 Navegando a la página de detalle...');
    navigateToPage('nav-producciones-detail');
  } catch (error) {
    console.error('❌ Error al navegar al detalle de producción:', error);
    showToast('Error al abrir el detalle de la producción', 'error');
  }
}

function editProduccion(id) {
  sessionStorage.setItem('id', id);
  sessionStorage.setItem('navAction', 'edit');
  navigateToPage('nav-producciones-create');
}

async function deleteProduccion(id) {
  if (!confirm('¿Está seguro de que desea eliminar esta producción?')) {
    return;
  }
  
  try {
    await API.delete(`/producciones/${id}`);
    showToast('Producción eliminada correctamente', 'success');
    ProduccionList.init();
  } catch (error) {
    console.error('Error deleting produccion:', error);
    showToast('Error al eliminar la producción', 'error');
  }
}

async function toggleProduccionStatus(id) {
  try {
    const produccion = await ProduccionAPI.getById(id);
    const newEstado = produccion.data.estado === 'activo' ? 'inactivo' : 'activo';
    await ProduccionAPI.updateStatus(id, newEstado);
    showToast(`Estado de la producción actualizado a ${newEstado}`, 'success');
    
    // Actualizar la lista y el resumen usando el módulo ProduccionList
    await ProduccionList.loadProducciones();
  } catch (error) {
    console.error('Error toggling produccion status:', error);
    showToast('Error al cambiar el estado de la producción', 'error');
  }
}