// produccionForm.js
// TODO: Implement Produccion Form module
console.log('produccionForm.js loaded');

const ProduccionForm = (function() {
  // Private variables
  let produccionId = null;
  let isEditMode = false;
  let selectedSensors = [];
  let selectedSupplies = [];
  
  // API endpoints
  const API = {
    sensores: '/api/sensores',
    insumos: '/api/insumos',
    ciclos: '/api/ciclos-cultivo',
    cultivos: '/api/cultivos',
    usuarios: '/api/usuarios',
    producciones: {
      base: '/api/producciones',
      create: async (data) => {
        const response = await fetch('/api/producciones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`/api/producciones/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return response.json();
      }
    }
  };
  
  // DOM elements
  const contentContainer = document.getElementById('main-content');
  
  // Initialize the module
  function init() {
    // Add CSS file
    if (!document.querySelector('link[href*="produccion-form.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/css/modules/producciones/produccion-form.css';
      document.head.appendChild(link);
    }

    // Get produccion ID from session storage if in edit mode
    produccionId = sessionStorage.getItem('id');
    isEditMode = sessionStorage.getItem('navAction') === 'edit';
    
    // Limpiar los campos si no estamos en modo edición
    if (!isEditMode) {
      selectedSensors = [];
      selectedSupplies = [];
    }
    
    render();
    
    if (isEditMode && produccionId) {
      loadProduccionData();
    }
  }
  
  // Load responsables for dropdown
  async function loadResponsables() {
    try {
      const response = await fetch('/api/usuarios');
      const { data } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const select = document.getElementById('responsable');
      
      // Clear existing options except first
      select.innerHTML = '<option value="">Seleccione un responsable</option>';

      // Add new options
      data.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.id_usuario || usuario.id; // Handle both formats
        option.textContent = usuario.nombre;
        select.appendChild(option);
      });

      // Set default responsible to current user in create mode
      if (!isEditMode) {
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (currentUser.id_usuario || currentUser.id) {
          select.value = currentUser.id_usuario || currentUser.id;
          console.log('Usuario actual seleccionado:', select.value);
          validateForm();
        }
      }

    } catch (error) {
      console.error('Error loading responsables:', error);
      showToast('Error al cargar los responsables', 'error');
    }
  }

  // Load cultivos for dropdown
  async function loadCultivos() {
    try {
      console.log('=== INICIO loadCultivos ===');
      const response = await fetch(API.cultivos);
      const { data } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const select = document.getElementById('cultivo');
      
      // Clear existing options except first
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add new options
      data.forEach(cultivo => {
        console.log('Agregando cultivo:', {
          id: cultivo.id_cultivo,
          nombre: cultivo.nombre
        });
        const option = document.createElement('option');
        option.value = cultivo.id_cultivo;
        option.textContent = cultivo.nombre;
        select.appendChild(option);
      });

      console.log('✅ Cultivos cargados:', select.options.length - 1);
    } catch (error) {
      console.error('Error loading cultivos:', error);
      showToast('Error al cargar los cultivos', 'error');
    } finally {
      console.log('=== FIN loadCultivos ===');
    }
  }

  // Load ciclos for dropdown based on selected cultivo
  async function loadCiclos() {
    try {
      const cultivoId = document.getElementById('cultivo').value;
      console.log('=== VERIFICACIÓN DE CICLOS ===');
      console.log('Cultivo seleccionado ID:', cultivoId);
      
      if (!cultivoId) {
        console.log('❌ No hay cultivo seleccionado');
        return;
      }
      
      const url = `${API.ciclos}?cultivo_id=${cultivoId}`;
      console.log('URL de la petición:', url);
      
      const response = await fetch(url);
      console.log('Status de la respuesta:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data } = await response.json();
      console.log('Número de ciclos encontrados:', data?.length || 0);
      
      const select = document.getElementById('ciclo');
      
      // Limpiar el select
      select.innerHTML = '<option value="">Seleccione un ciclo</option>';
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('❌ No hay ciclos disponibles para este cultivo');
        showToast('No hay ciclos disponibles para este cultivo', 'warning');
        return;
      }
      
      // Agregar las opciones
      data.forEach(ciclo => {
        console.log('✅ Agregando ciclo:', {
          id: ciclo.id_ciclo,
          nombre: ciclo.nombre
        });
        const option = document.createElement('option');
        option.value = ciclo.id_ciclo;
        option.textContent = ciclo.nombre;
        select.appendChild(option);
      });
      
      console.log('✅ Ciclos cargados exitosamente');
      
      // Si estamos en modo edición y tenemos un ciclo seleccionado, lo establecemos
      if (isEditMode && produccionId) {
        const produccionCiclo = select.dataset.selectedCiclo;
        if (produccionCiclo) {
          select.value = produccionCiclo;
          console.log('✅ Ciclo seleccionado establecido:', produccionCiclo);
        }
      }
      
      // Forzar actualización del select
      select.dispatchEvent(new Event('change'));
      
    } catch (error) {
      console.error('❌ Error al cargar ciclos:', error);
      showToast('Error al cargar los ciclos: ' + error.message, 'error');
    }
  }

  // Load sensores for dropdown
  async function loadSensores() {
    try {
      const response = await fetch(API.sensores);
      const { data } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const select = document.getElementById('sensor-select');
      
      // Clear existing options except first
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add new options
      data.forEach(sensor => {
        const option = document.createElement('option');
        option.value = sensor.id_sensor;
        option.textContent = sensor.nombre;
        select.appendChild(option);
      });

    } catch (error) {
      console.error('Error loading sensores:', error);
      showToast('Error al cargar los sensores', 'error');
    }
  }

  // Load insumos for dropdown
  async function loadInsumos() {
    try {
      const response = await fetch(API.insumos);
      const { data } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      const select = document.getElementById('insumo-select');
      
      // Clear existing options except first
      while (select.options.length > 1) {
        select.remove(1);
      }

      // Add new options
      data.forEach(insumo => {
        const option = document.createElement('option');
        option.value = insumo.id_insumo;
        option.textContent = insumo.nombre;
        select.appendChild(option);
      });

    } catch (error) {
      console.error('Error loading insumos:', error);
      showToast('Error al cargar los insumos', 'error');
    }
  }

  // Render the page
  async function render() {
    // Set page title
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Producción' : 'Nueva Producción';
    
    // Render main content
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${isEditMode ? 'Editar Producción' : 'Nueva Producción'}</h2>
        </div>
        <div class="card-body">
          <form id="produccion-form">
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" required
                         minlength="3" maxlength="100" pattern="[A-Za-zÀ-ÿ\\s-]+">
                  <div class="invalid-feedback">
                    El nombre debe tener entre 3 y 100 caracteres y contener al menos una letra.
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="responsable" class="form-label">Responsable</label>
                  <div class="input-group">
                    <select class="form-select" id="responsable" name="responsable" required>
                      <option value="">Seleccione un responsable</option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" onclick="openNewUserModal()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="cultivo" class="form-label">Cultivo</label>
                  <div class="input-group">
                    <select class="form-select" id="cultivo" name="cultivo" required>
                      <option value="">Seleccione un cultivo</option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" onclick="openNewCultivoModal()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="ciclo" class="form-label">Ciclo de Cultivo</label>
                  <div class="input-group">
                    <select class="form-select" id="ciclo" name="ciclo" required>
                      <option value="">Seleccione un ciclo</option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" onclick="openNewCicloModal()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-12">
                <div class="form-group mb-3">
                  <label class="form-label">Sensores (máximo 3)</label>
                  <div class="input-group">
                    <select class="form-select" id="sensor-select">
                      <option value="">Seleccione un sensor</option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" onclick="openNewSensorModal()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <div id="selected-sensors" class="mt-2">
                    <!-- Selected sensors will be displayed here -->
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-12">
                <div class="form-group mb-3">
                  <label class="form-label">Insumos</label>
                  <div class="input-group">
                    <select class="form-select" id="insumo-select">
                      <option value="">Seleccione un insumo</option>
                    </select>
                    <button type="button" class="btn btn-outline-primary" onclick="openNewInsumoModal()">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <div id="selected-insumos" class="mt-2">
                    <!-- Selected supplies will be displayed here -->
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row">
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="inversion" class="form-label">Inversión</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="inversion" name="inversion" 
                           step="0.01" min="0" readonly value="0.00">
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="form-group mb-3">
                  <label for="meta" class="form-label">Meta</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="meta" name="meta" 
                           step="0.01" min="0" readonly value="0.00">
                  </div>
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
                  <input type="date" class="form-control" id="fecha_fin" name="fecha_fin">
                </div>
              </div>
            </div>
            
            <div class="d-flex justify-content-end gap-2">
              <button type="button" class="btn btn-secondary" onclick="history.back()">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="submit-btn" disabled>${isEditMode ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    try {
      await Promise.all([
        loadResponsables(),
        loadCultivos(),
        loadSensores(),
        loadInsumos()
      ]);
    } catch (error) {
      console.error('Error loading form data:', error);
      showToast('Error al cargar los datos del formulario', 'error');
    }
    
    // Add event listeners
    addEventListeners();
  }
  
  // Get form data
  function getFormData() {
    const form = document.getElementById('produccion-form');
    
    // Reset validation UI
    form.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });

    // Validate individual fields first
    let errors = [];
    
    const nombre = form.nombre.value.trim();
    if (!nombre || nombre.length < 3) {
      form.nombre.classList.add('is-invalid');
      errors.push('El nombre debe tener al menos 3 caracteres');
    }

    const responsable = form.responsable.value;
    if (!responsable) {
      form.responsable.classList.add('is-invalid');
      errors.push('Debe seleccionar un responsable');
    }

    // Parse responsable ID correctly
    const id_responsable = parseInt(responsable);
    if (isNaN(id_responsable)) {
      form.responsable.classList.add('is-invalid');
      errors.push('ID de responsable inválido');
    }

    const cultivo = form.cultivo.value;
    if (!cultivo) {
      form.cultivo.classList.add('is-invalid');
      errors.push('Debe seleccionar un cultivo');
    }

    const ciclo = form.ciclo.value;
    if (!ciclo) {
      form.ciclo.classList.add('is-invalid');
      errors.push('Debe seleccionar un ciclo');
    }

    const fechaInicio = form.fecha_inicio.value;
    if (!fechaInicio) {
      form.fecha_inicio.classList.add('is-invalid');
      errors.push('La fecha de inicio es obligatoria');
    }

    if (selectedSensors.length === 0) {
      document.getElementById('sensor-select').classList.add('is-invalid');
      errors.push('Debe seleccionar al menos un sensor');
    }

    if (selectedSupplies.length === 0) {
      document.getElementById('insumo-select').classList.add('is-invalid');
      errors.push('Debe seleccionar al menos un insumo');
    }

    // If any validation errors, throw them
    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    // If validation passes, return form data
    return {
      nombre,
      id_responsable, // Already parsed as integer
      id_cultivo: cultivo,
      id_ciclo_cultivo: ciclo,
      inversion: parseFloat(form.inversion.value) || 0,
      meta: parseFloat(form.meta.value) || 0,
      fecha_inicio: fechaInicio,
      fecha_fin: form.fecha_fin.value || null,
      estado: 'activo',
      sensores: selectedSensors.map(s => s.id),
      insumos: selectedSupplies.map(s => s.id)
    };
  }

  // Add event listeners
  function addEventListeners() {
    console.log('=== INICIO addEventListeners ===');
    
    const form = document.getElementById('produccion-form');
    const cultivoSelect = document.getElementById('cultivo');
    const sensorSelect = document.getElementById('sensor-select');
    const insumoSelect = document.getElementById('insumo-select');
    const submitBtn = document.getElementById('submit-btn');
    
    console.log('Elementos del formulario encontrados:', {
      form: !!form,
      cultivoSelect: !!cultivoSelect,
      sensorSelect: !!sensorSelect,
      insumoSelect: !!insumoSelect,
      submitBtn: !!submitBtn
    });
    
    // Verificar el valor inicial del select de cultivo
    console.log('Valor inicial del select de cultivo:', cultivoSelect.value);
    console.log('Opciones iniciales en el select de cultivo:', cultivoSelect.options.length);
    
    cultivoSelect.addEventListener('change', (e) => {
      console.log('=== Evento change en cultivoSelect ===');
      console.log('Valor anterior:', e.target.dataset.lastValue || 'ninguno');
      console.log('Valor nuevo:', e.target.value);
      console.log('Texto seleccionado:', e.target.options[e.target.selectedIndex].text);
      
      // Guardar el valor actual para la próxima comparación
      e.target.dataset.lastValue = e.target.value;
      
      loadCiclos();
      validateForm();
    });
    
    sensorSelect.addEventListener('change', () => {
      if (sensorSelect.value) {
        addSensor(sensorSelect.value, sensorSelect.options[sensorSelect.selectedIndex].text);
        sensorSelect.value = '';
      }
    });
    
    insumoSelect.addEventListener('change', () => {
      if (insumoSelect.value) {
        addInsumo(insumoSelect.value, insumoSelect.options[insumoSelect.selectedIndex].text);
        insumoSelect.value = '';
      }
    });
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
      
      try {
        const formData = getFormData();
        console.log('Enviando datos:', formData);
        
        const response = isEditMode 
          ? await API.producciones.update(produccionId, formData)
          : await API.producciones.create(formData);

        console.log('Respuesta del servidor:', response);

        if (!response.success) {
          throw new Error(response.message || 'Error al procesar la solicitud');
        }
        
        showToast(
          `Producción ${isEditMode ? 'actualizada' : 'creada'} correctamente`,
          'success'
        );
        
        // Limpiar sessionStorage si estábamos en modo edición
        if (isEditMode) {
          sessionStorage.removeItem('id');
          sessionStorage.removeItem('navAction');
        }
        
        // Navigate back to list after short delay
        setTimeout(() => {
          navigateToPage('nav-producciones-list');
        }, 1000);

      } catch (error) {
        console.error('Error saving produccion:', error);
        showToast(
          error.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} la producción`,
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isEditMode ? 'Actualizar' : 'Crear';
      }
    });
    
    // Add validation listeners
    form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', validateForm);
      input.addEventListener('input', validateForm);
    });
    
    console.log('=== FIN addEventListeners ===');
  }
  
  // Add sensor to selected sensors
  function addSensor(id, name) {
    if (selectedSensors.length >= 3) {
      showToast('No se pueden agregar más de 3 sensores', 'error');
      return;
    }
    
    if (selectedSensors.some(s => s.id === id)) {
      showToast('Este sensor ya está seleccionado', 'error');
      return;
    }
    
    selectedSensors.push({ id, name });
    updateSelectedSensorsDisplay();
    validateForm();
  }
  
  // Remove sensor from selected sensors
  function removeSensor(id) {
    selectedSensors = selectedSensors.filter(s => s.id !== id);
    updateSelectedSensorsDisplay();
    validateForm();
  }
  
  // Update selected sensors display
  function updateSelectedSensorsDisplay() {
    const container = document.getElementById('selected-sensors');
    container.innerHTML = selectedSensors.map(sensor => `
      <div class="badge bg-primary me-2 mb-2">
        ${sensor.name}
        <button type="button" class="btn-close btn-close-white ms-2" 
                onclick="ProduccionForm.removeSensor('${sensor.id}')"></button>
      </div>
    `).join('');
  }
  
  // Add insumo to selected insumos
  function addInsumo(id, name) {
    if (selectedSupplies.some(s => s.id === id)) {
      showToast('Este insumo ya está seleccionado', 'error');
      return;
    }
    
    selectedSupplies.push({ id, name });
    updateSelectedInsumosDisplay();
    calculateInversion();
    validateForm();
  }
  
  // Remove insumo from selected insumos
  function removeInsumo(id) {
    selectedSupplies = selectedSupplies.filter(s => s.id !== id);
    updateSelectedInsumosDisplay();
    calculateInversion();
    validateForm();
  }
  
  // Update selected insumos display
  function updateSelectedInsumosDisplay() {
    const container = document.getElementById('selected-insumos');
    container.innerHTML = selectedSupplies.map(insumo => `
      <div class="badge bg-primary me-2 mb-2">
        ${insumo.name}
        <button type="button" class="btn-close btn-close-white ms-2" 
                onclick="ProduccionForm.removeInsumo('${insumo.id}')"></button>
      </div>
    `).join('');
  }
  
  // Calculate inversion based on selected insumos
  function calculateInversion() {
    let total = 0;
    
    // Solo calcular si hay insumos seleccionados
    if (selectedSupplies.length > 0) {
      selectedSupplies.forEach(supply => {
        // Aquí deberías obtener el valor unitario del insumo desde la API
        // Por ahora usamos un valor fijo para el ejemplo
        total += 100; // Reemplazar con el valor real del insumo
      });
    }
    
    document.getElementById('inversion').value = total.toFixed(2);
    document.getElementById('meta').value = (total * 1.5).toFixed(2); // Ejemplo: meta es 50% más que la inversión
  }
  
  // Validate form
  function validateForm() {
    const form = document.getElementById('produccion-form');
    const submitBtn = document.getElementById('submit-btn');
    
    // Check required fields
    const requiredFields = ['nombre', 'responsable', 'cultivo', 'ciclo'];
    const hasRequiredFields = requiredFields.every(field => {
      const input = form[field];
      return input && input.value.trim() !== '';
    });
    
    // Check sensors
    const hasSensors = selectedSensors.length > 0;
    
    // Check supplies
    const hasSupplies = selectedSupplies.length > 0;
    
    // Check dates
    const fechaInicio = new Date(form.fecha_inicio.value);
    const fechaFin = form.fecha_fin.value ? new Date(form.fecha_fin.value) : null;
    const validDates = !fechaFin || fechaInicio <= fechaFin;
    
    // Enable/disable submit button
    submitBtn.disabled = !(hasRequiredFields && hasSensors && hasSupplies && validDates);
    
    return submitBtn.disabled === false;
  }
  
  // Load produccion data for editing
  function loadProduccionData() {
    fetch(`${API.producciones.base}/${produccionId}`)
      .then(response => response.json())
      .then(data => {
        const produccion = data.data;
        
        // Fill form fields
        document.getElementById('nombre').value = produccion.nombre;
        document.getElementById('responsable').value = produccion.id_responsable;
        document.getElementById('cultivo').value = produccion.id_cultivo;
        document.getElementById('inversion').value = produccion.inversion;
        document.getElementById('meta').value = produccion.meta;
        document.getElementById('fecha_inicio').value = produccion.fecha_inicio;
        document.getElementById('fecha_fin').value = produccion.fecha_fin || '';
        
        // Guardar el ciclo seleccionado en un data attribute
        const cicloSelect = document.getElementById('ciclo');
        cicloSelect.dataset.selectedCiclo = produccion.id_ciclo_cultivo;
        
        // Load ciclos after cultivo is selected
        loadCiclos();
        
        // Load sensors and supplies
        loadProduccionSensors();
        loadProduccionSupplies();
      })
      .catch(error => {
        console.error('Error loading produccion:', error);
        showToast('Error al cargar los datos de la producción', 'error');
      });
  }
  
  // Load produccion sensors
  function loadProduccionSensors() {
    ProduccionAPI.getSensors(produccionId)
      .then(response => {
        const sensors = response.data || [];
        selectedSensors = sensors.map(s => ({
          id: s.id_sensor,
          name: s.nombre
        }));
        updateSelectedSensorsDisplay();
      })
      .catch(error => {
        console.error('Error loading produccion sensors:', error);
      });
  }
  
  // Load produccion supplies
  function loadProduccionSupplies() {
    ProduccionAPI.getSupplies(produccionId)
      .then(response => {
        const supplies = response.data || [];
        selectedSupplies = supplies.map(s => ({
          id: s.id_insumo,
          name: s.nombre
        }));
        updateSelectedInsumosDisplay();
        calculateInversion();
      })
      .catch(error => {
        console.error('Error loading produccion supplies:', error);
      });
  }
  
  // Public API
  return {
    init,
    removeSensor,
    removeInsumo
  };
})();
