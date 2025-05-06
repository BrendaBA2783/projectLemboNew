// cultivoForm.js
// TODO: Implement Cultivo Form module
console.log('cultivoForm.js loaded');

/**
 * Cultivo form module
 */
const CultivoForm = (function() {
  // Private variables
  let cultivoId = null;
  let isEditMode = false;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get cultivo ID from session storage if in edit mode
    cultivoId = sessionStorage.getItem('id');
    isEditMode = sessionStorage.getItem('navAction') === 'edit';
    
    render();
    
    if (isEditMode && cultivoId) {
      loadCultivoData();
    }
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Cultivo' : 'Nuevo Cultivo';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${isEditMode ? 'Editar Cultivo' : 'Nuevo Cultivo'}</h2>
        </div>
        <div class="card-body">
          <form id="cultivo-form">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="tipo" class="form-label">Tipo</label>
                  <select class="form-select" id="tipo" name="tipo" required>
                    <option value="">Seleccione un tipo</option>
                    ${CONFIG.CULTIVO_TIPOS.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="tamano" class="form-label">Tamaño</label>
                  <input type="text" class="form-control" id="tamano" name="tamano" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="ubicacion" class="form-label">Ubicación</label>
                  <input type="text" class="form-control" id="ubicacion" name="ubicacion" required>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="fecha_siembra" class="form-label">Fecha de Siembra</label>
                  <input type="date" class="form-control" id="fecha_siembra" name="fecha_siembra" required>
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
    
    // Add event listeners
    addEventListeners();
  }
  
  // Load cultivo data for editing
  function loadCultivoData() {
    CultivoAPI.getById(cultivoId)
      .then(response => {
        const cultivo = response.data;
        
        // Fill form fields
        document.getElementById('nombre').value = cultivo.nombre;
        document.getElementById('tipo').value = cultivo.tipo;
        document.getElementById('tamano').value = cultivo.tamano;
        document.getElementById('ubicacion').value = cultivo.ubicacion;
        document.getElementById('fecha_siembra').value = cultivo.fecha_siembra;
        document.getElementById('descripcion').value = cultivo.descripcion || '';
        document.getElementById('estado').checked = cultivo.estado === 'activo';
      })
      .catch(error => {
        console.error('Error loading cultivo:', error);
        showToast('Error al cargar los datos del cultivo', 'error');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    const form = document.getElementById('cultivo-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get the last cultivo ID to generate the next one
      let nextId = '001';
      try {
        const response = await CultivoAPI.getAll();
        if (response.data && response.data.length > 0) {
          // Get the last ID and increment it
          const lastId = response.data[response.data.length - 1].id_cultivo;
          if (lastId.startsWith('CULT-')) {
            const lastNumber = parseInt(lastId.split('-')[1]);
            nextId = String(lastNumber + 1).padStart(3, '0');
          }
        }
      } catch (error) {
        console.error('Error getting last cultivo ID:', error);
      }
      
      // Generate unique ID for new cultivo
      const id_cultivo = isEditMode ? cultivoId : `CULT-${nextId}`;
      
      // Get form data
      const formData = {
        nombre: form.nombre.value.trim(),
        tipo: form.tipo.value,
        id_cultivo: id_cultivo,
        tamano: form.tamano.value.trim(),
        ubicacion: form.ubicacion.value.trim(),
        fecha_siembra: form.fecha_siembra.value,
        descripcion: form.descripcion.value.trim(),
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
      
      // Log form data for debugging
      console.log('Enviando datos del cultivo:', formData);
      
      // Save or update cultivo
      const savePromise = isEditMode 
        ? CultivoAPI.update(cultivoId, formData)
        : CultivoAPI.create(formData);
      
      savePromise
        .then(response => {
          showToast(
            `Cultivo ${isEditMode ? 'actualizado' : 'creado'} correctamente`,
            'success'
          );
          
          // Navigate back to list
          navigateToPage('nav-cultivos-list');
        })
        .catch(error => {
          console.error('Error saving cultivo:', error);
          showToast(
            `Error al ${isEditMode ? 'actualizar' : 'crear'} el cultivo: ${error.message}`,
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
    if (!data.nombre || !data.tipo || !data.tamano || !data.ubicacion || !data.fecha_siembra) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return false;
    }
    
    // Validate tipo is selected
    if (data.tipo === '') {
      showToast('Por favor seleccione un tipo de cultivo', 'error');
      return false;
    }
    
    return true;
  }
  
  // Public API
  return {
    init
  };
})();
