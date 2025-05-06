// usuarioForm.js
// TODO: Implement usuario Form module
console.log('usuarioForm.js loaded');

/**
 * Usuario form module
 */
const UsuarioForm = (function() {
  // Private variables
  let usuarioId = null;
  let isEditMode = false;
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Get usuario ID from session storage if in edit mode
    usuarioId = sessionStorage.getItem('id');
    isEditMode = sessionStorage.getItem('navAction') === 'edit';
    
    render();
    
    if (isEditMode && usuarioId) {
      loadUsuariosData();
    }
  }
  
  // Render the page
  function render() {
    // Set page title
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Usuario' : 'Nuevo Usuario';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        </div>
        <div class="card-body">
          <form id="usuario-form">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
                <div class="form-group mb-3">
                  <label for="apellido" class="form-label">Apellido</label>
                  <input type="text" class="form-control" id="apellido" name="apellido" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="tipo-usuario" class="form-label">Tipo Usuario</label>
                  <select class="form-select" id="tipo-usuario" name="tipo-usuario" required>
                    <option value="">Seleccione un tipo</option>
                    ${CONFIG.USUARIO_TYPES.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group mb-3">
                  <label for="tipo-documento" class="form-label">Tipo Documento</label>
                  <select class="form-select" id="tipo-documento" name="tipo-documento" required>
                    <option value="">Seleccione un tipo</option>
                    ${CONFIG.USUARIO_DOCUMENT_TYPES.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
                  </select>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="numero-documento" class="form-label">Número de documento</label>
                  <input type="text" class="form-control" id="numero-documento" name="numero-documento" required>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="numero-contacto" class="form-label">Numero de contacto</label>
                  <input type="text" class="form-control" id="numero-contacto" name="numero-contacto" required>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="email" class="form-label">Correo electrónico</label>
                  <input type="date" class="form-control" id="email" name="email" required>
                </div>
                <div class="form-group mb-3">
                  <label for="confirmacion-email" class="form-label">Confirmación Correo electrónico</label>
                  <input type="date" class="form-control" id="confirmacion-email" name="confirmacion-email" required>
                </div>
              </div>
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
  function loadUsuariosData() {
    UsuariosAPI.getById(usuarioId)
      .then(response => {
        const usuarios = response.data;
        
        // Fill form fields
        document.getElementById('id_usuario').value = usuarios.id_usuario;
        document.getElementById('nombre').value = usuarios.nombre;
        document.getElementById('apellido').value = usuarios.apellido;
        document.getElementById('tipo-usuario').value = usuarios.tipo-usuario;
        document.getElementById('tipo-documento').value = usuarios.tipo-documento;
        document.getElementById('numero-documento').value = usuarios.numero-documento;
        document.getElementById('numero-celular').value = usuarios.numero-celular;
        document.getElementById('email').value = usuarios.email;
        document.getElementById('confirmacion-email').value = usuarios.confirmacion-email;
        document.getElementById('estado').checked = usuarios.estado === 'activo';
      })
      .catch(error => {
        console.error('Error loading usuario:', error);
        showToast('Error al cargar los datos de usuario', 'error');
      });
  }
  
  // Add event listeners
  function addEventListeners() {
    const form = document.getElementById('usuario-form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Get the last cultivo ID to generate the next one
      let nextId = '001';
      try {
        const response = await UsuarioAPI.getAll();
        if (response.data && response.data.length > 0) {
          // Get the last ID and increment it
          const lastId = response.data[response.data.length - 1].id_usuario;
          if (lastId.startsWith('USER-')) {
            const lastNumber = parseInt(lastId.split('-')[1]);
            nextId = String(lastNumber + 1).padStart(3, '0');
          }
        }
      } catch (error) {
        console.error('Error getting last usuario ID:', error);
      }
      
      // Generate unique ID for new usuario
      const id_usuario = isEditMode ? usuarioId : `USER-${nextId}`;
      
      // Get form data
      const formData = {
        nombre: form.nombre.value.trim(),
        apellido: form.apellido.value.trim(),
        tipo-usuario: form.tipo-usuario.value,
        tipo-documento: form.tipo-documento.value,
        numero-dodumento: form.numero-dodumento.value,
        numero-celular: form.numero-celular.value,
        email: form.email.value,
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
