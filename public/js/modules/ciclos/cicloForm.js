// cicloForm.js
// TODO: Implement Ciclo Form module
console.log('cicloForm.js loaded');
// cultivoForm.js
// TODO: Implement Cultivo Form module
console.log('cultivoForm.js loaded');

/**
 * Ciclo form module
 */
const CicloForm = (function() {
  // Private variables
  let cicloId = null;
  let isEditMode = false;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get ciclo ID from session storage if in edit mode
    cicloId = sessionStorage.getItem('id');
    isEditMode = sessionStorage.getItem('navAction') === 'edit';
    
    render();
    
    if (isEditMode && cicloId) {
      loadCicloData();
    }
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Ciclo' : 'Nuevo Ciclo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${isEditMode ? 'Editar Ciclo' : 'Nuevo Ciclo'}</h2>
        </div>
        <div class="card-body">
          <form id="ciclo-form">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="cultivo" class="form-label">Cultivo</label>
                  <select class="form-select" id="cultivo" name="cultivo" required>
                    <option value="">Seleccione un cultivo</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
                  <input type="date" class="form-control" id="fecha_inicio" name="fecha_inicio" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="fecha_fin" class="form-label">Fecha de Fin</label>
                  <input type="date" class="form-control" id="fecha_fin" name="fecha_fin" required>
                </div>
              </div>
            </div>
            
            <div class="form-group mb-3">
              <label for="descripcion" class="form-label">Descripción</label>
              <textarea class="form-control" id="descripcion" name="descripcion" rows="3"></textarea>
            </div>
            
            <div class="form-group mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="estado" name="estado" checked>
                <label class="form-check-label" for="estado">
                  Activo
                </label>
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="history.back()">Cancelar</button>
              <button type="submit" class="btn btn-primary">${isEditMode ? 'Actualizar' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Load cultivos for dropdown
    loadCultivos();
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load cultivos for dropdown
  function loadCultivos() {
    CultivoAPI.getAll()
      .then(response => {
        const cultivos = response.data || [];
        const select = document.getElementById('cultivo');
        
        // Clear existing options except the first one
        select.innerHTML = '<option value="">Seleccione un cultivo</option>';
        
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
  
  // Load ciclo data for editing
  function loadCicloData() {
    CicloAPI.getById(cicloId)
      .then(response => {
        const ciclo = response.data;
        
        // Fill form fields
        document.getElementById('nombre').value = ciclo.nombre;
        document.getElementById('cultivo').value = ciclo.id_cultivo;
        document.getElementById('fecha_inicio').value = ciclo.fecha_inicial;
        document.getElementById('fecha_fin').value = ciclo.fecha_final;
        document.getElementById('descripcion').value = ciclo.descripcion || '';
        document.getElementById('estado').checked = ciclo.estado === 'activo';
      })
      .catch(error => {
        console.error('Error loading ciclo:', error);
        showToast('Error al cargar los datos del ciclo', 'error');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    const form = document.getElementById('ciclo-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get the last ciclo ID to generate the next one
      let nextId = '001';
      try {
        const response = await CicloAPI.getAll();
        if (response.data && response.data.length > 0) {
          const lastId = response.data[response.data.length - 1].id_ciclo;
          if (lastId.startsWith('CICL-')) {
            const lastNumber = parseInt(lastId.split('-')[1]);
            nextId = String(lastNumber + 1).padStart(3, '0');
          }
        }
      } catch (error) {
        console.error('Error getting last ciclo ID:', error);
      }
      
      const id_ciclo = isEditMode ? cicloId : `CICL-${nextId}`;
      
      // Get form data
      const formData = {
        nombre: form.nombre.value.trim(),
        id_cultivo: form.cultivo.value,
        id_ciclo: id_ciclo,
        fecha_inicial: form.fecha_inicio.value,
        fecha_final: form.fecha_fin.value,
        descripcion: form.descripcion.value.trim(),
        novedades: '', // Campo requerido por la base de datos
        estado: form.estado.checked ? 'activo' : 'inactivo'
      };
      
      // Validate form data
      if (!validateForm(formData)) {
        return;
      }
      
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
      
      // Save or update ciclo
      const savePromise = isEditMode 
        ? CicloAPI.update(cicloId, formData)
        : CicloAPI.create(formData);
      
      savePromise
        .then(response => {
          showToast(
            `Ciclo ${isEditMode ? 'actualizado' : 'creado'} correctamente`,
            'success'
          );
          
          // Navigate back to list
          navigateToPage('nav-ciclos-list');
        })
        .catch(error => {
          console.error('Error saving ciclo:', error);
          showToast(
            `Error al ${isEditMode ? 'actualizar' : 'crear'} el ciclo: ${error.message}`,
            'error'
          );
        })
        .finally(() => {
          // Restore button state
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        });
    });
  }
  
  // Validate form data
  function validateForm(data) {
    // Check required fields
    if (!data.nombre || !data.id_cultivo || !data.fecha_inicial || !data.fecha_final) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return false;
    }
    
    // Validate dates
    const startDate = new Date(data.fecha_inicial);
    const endDate = new Date(data.fecha_final);
    
    if (startDate > endDate) {
      showToast('La fecha de inicio no puede ser posterior a la fecha de fin', 'error');
      return false;
    }
    
    return true;
  }
  
  // Public API
  return {
    init
  };
})();

