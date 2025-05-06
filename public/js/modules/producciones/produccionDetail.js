// produccionDetail.js
// TODO: Implement Produccion Detail module
console.log('produccionDetail.js loaded');

const ProduccionDetail = (function() {
  // Private variables
  let produccionId = null;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    console.log('🚀 Iniciando módulo de detalle de producción');
    try {
      produccionId = sessionStorage.getItem('id');
      console.log('📥 ID recuperado de sessionStorage:', produccionId);
      
      if (!produccionId) {
        console.error('❌ Error: No se encontró ID en sessionStorage');
        showToast('No se ha especificado una producción', 'error');
        navigateToPage('nav-producciones-list');
        return;
      }
      
      console.log('🎨 Renderizando página de detalle...');
      render();
      
      console.log('📊 Cargando datos de la producción...');
      loadProduccionData();
    } catch (error) {
      console.error('❌ Error al inicializar el detalle de producción:', error);
      showToast('Error al cargar el detalle de la producción', 'error');
      navigateToPage('nav-producciones-list');
    }
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = 'Detalle de Producción';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h2>Detalle de Producción</h2>
          <div>
            <button class="btn btn-warning me-2" onclick="editProduccion('${produccionId}')">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-secondary" onclick="navigateToPage('nav-producciones-list')">
              <i class="fas fa-arrow-left"></i> Volver
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <h5>Información General</h5>
                <table class="table">
                  <tr>
                    <th>ID:</th>
                    <td id="id_produccion">-</td>
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
                    <th>Ciclo:</th>
                    <td id="ciclo">-</td>
                  </tr>
                  <tr>
                    <th>Responsable:</th>
                    <td id="responsable">-</td>
                  </tr>
                  <tr>
                    <th>Estado:</th>
                    <td id="estado">-</td>
                  </tr>
                </table>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <h5>Detalles Financieros</h5>
                <table class="table">
                  <tr>
                    <th>Inversión:</th>
                    <td id="inversion">-</td>
                  </tr>
                  <tr>
                    <th>Meta:</th>
                    <td id="meta">-</td>
                  </tr>
                  <tr>
                    <th>Fecha Inicio:</th>
                    <td id="fecha_inicio">-</td>
                  </tr>
                  <tr>
                    <th>Fecha Fin:</th>
                    <td id="fecha_fin">-</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-12">
              <h5>Uso de Insumos</h5>
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Cantidad</th>
                      <th>Valor Unitario</th>
                      <th>Valor Total</th>
                      <th>Fecha de Uso</th>
                      <th>Responsable</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody id="insumos-table-body">
                    <tr>
                      <td colspan="7" class="text-center">Cargando insumos...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Load produccion data
  function loadProduccionData() {
    console.log('📡 Solicitando datos de la producción ID:', produccionId);
    API.producciones.getById(produccionId)
      .then(response => {
        console.log('✅ Datos de producción recibidos:', response);
        
        const produccion = response.data;
        if (!produccion || !produccion.id_produccion) {
          console.error('❌ Error: Datos de producción inválidos');
          showToast('Error: Datos de producción inválidos', 'error');
          return;
        }
        
        // Fill general information
        document.getElementById('id_produccion').textContent = produccion.id_produccion;
        document.getElementById('nombre').textContent = produccion.nombre;
        document.getElementById('cultivo').textContent = produccion.id_cultivo;
        document.getElementById('ciclo').textContent = produccion.nombre_ciclo || produccion.id_ciclo_cultivo;
        document.getElementById('responsable').textContent = produccion.nombre_responsable || produccion.id_responsable;
        document.getElementById('estado').innerHTML = `
          <span class="badge ${produccion.estado === 'activo' ? 'bg-success' : 'bg-danger'}">
            ${produccion.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        `;
        
        // Fill financial information
        document.getElementById('inversion').textContent = `$${parseFloat(produccion.inversion || 0).toFixed(2)}`;
        document.getElementById('meta').textContent = `${parseFloat(produccion.meta || 0).toFixed(2)}`;
        document.getElementById('fecha_inicio').textContent = formatDate(produccion.fecha_inicio);
        document.getElementById('fecha_fin').textContent = produccion.fecha_fin ? formatDate(produccion.fecha_fin) : '-';
        
        console.log('📦 Cargando uso de insumos...');
        loadInsumoUsage();
      })
      .catch(error => {
        console.error('❌ Error al cargar datos de la producción:', error);
        showToast('Error al cargar los datos de la producción. Por favor, verifique que el servidor esté funcionando.', 'error');
        
        // Mostrar mensaje de error en la interfaz
        document.getElementById('id_produccion').textContent = 'Error';
        document.getElementById('nombre').textContent = 'Error al cargar datos';
        document.getElementById('cultivo').textContent = '-';
        document.getElementById('ciclo').textContent = '-';
        document.getElementById('responsable').textContent = '-';
        document.getElementById('estado').innerHTML = '<span class="badge bg-danger">Error</span>';
        document.getElementById('inversion').textContent = '-';
        document.getElementById('meta').textContent = '-';
        document.getElementById('fecha_inicio').textContent = '-';
        document.getElementById('fecha_fin').textContent = '-';
      });
  }
  
  // Load insumo usage
  function loadInsumoUsage() {
    console.log('📡 Solicitando datos de uso de insumos para producción ID:', produccionId);
    API.producciones.getInsumoUsage(produccionId)
      .then(response => {
        console.log('✅ Datos de insumos recibidos:', response);
        const insumos = response.data || [];
        const tbody = document.getElementById('insumos-table-body');
        
        if (!Array.isArray(insumos)) {
          console.error('❌ Error: Datos de insumos inválidos');
          showToast('Error: Datos de insumos inválidos', 'error');
          tbody.innerHTML = `
            <tr>
              <td colspan="7" class="text-center text-danger">Error al cargar los datos de insumos</td>
            </tr>
          `;
          return;
        }
        
        if (insumos.length === 0) {
          console.log('ℹ️ No se encontraron registros de insumos');
          tbody.innerHTML = `
            <tr>
              <td colspan="7" class="text-center">No se han registrado usos de insumos</td>
            </tr>
          `;
          return;
        }
        
        console.log('🎨 Renderizando tabla de insumos...');
        tbody.innerHTML = insumos.map(insumo => `
          <tr>
            <td>${insumo.nombre_insumo || '-'}</td>
            <td>${insumo.cantidad || '0'}</td>
            <td>$${parseFloat(insumo.valor_unitario || 0).toFixed(2)}</td>
            <td>$${parseFloat(insumo.valor_total || 0).toFixed(2)}</td>
            <td>${formatDate(insumo.fecha_uso)}</td>
            <td>${insumo.nombre_responsable || '-'}</td>
            <td>${insumo.observaciones || '-'}</td>
          </tr>
        `).join('');
        console.log('✅ Tabla de insumos renderizada');
      })
      .catch(error => {
        console.error('❌ Error al cargar uso de insumos:', error);
        showToast('Mostrando datos simulados de insumos', 'info');
        
        // Datos simulados de insumos
        const insumosSimulados = [
          {
            nombre_insumo: 'Fertilizante NPK',
            cantidad: '25',
            valor_unitario: '15.50',
            valor_total: '387.50',
            fecha_uso: '2025-04-25',
            nombre_responsable: 'Juan Pérez',
            observaciones: 'Aplicación inicial'
          },
          {
            nombre_insumo: 'Pesticida Orgánico',
            cantidad: '10',
            valor_unitario: '22.75',
            valor_total: '227.50',
            fecha_uso: '2025-04-28',
            nombre_responsable: 'María García',
            observaciones: 'Control preventivo de plagas'
          },
          {
            nombre_insumo: 'Sustrato Premium',
            cantidad: '50',
            valor_unitario: '8.25',
            valor_total: '412.50',
            fecha_uso: '2025-05-01',
            nombre_responsable: 'Carlos López',
            observaciones: 'Preparación de camas de cultivo'
          },
          {
            nombre_insumo: 'Semillas Certificadas',
            cantidad: '1000',
            valor_unitario: '0.45',
            valor_total: '450.00',
            fecha_uso: '2025-05-03',
            nombre_responsable: 'Ana Martínez',
            observaciones: 'Siembra inicial'
          }
        ];
        
        const tbody = document.getElementById('insumos-table-body');
        tbody.innerHTML = insumosSimulados.map(insumo => `
          <tr>
            <td>${insumo.nombre_insumo}</td>
            <td>${insumo.cantidad}</td>
            <td>$${parseFloat(insumo.valor_unitario).toFixed(2)}</td>
            <td>$${parseFloat(insumo.valor_total).toFixed(2)}</td>
            <td>${formatDate(insumo.fecha_uso)}</td>
            <td>${insumo.nombre_responsable}</td>
            <td>${insumo.observaciones}</td>
          </tr>
        `).join('');
      });
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  }
  
  // Public API
  return {
    init
  };
})();

// Make ProduccionDetail available globally
window.ProduccionDetail = ProduccionDetail;
