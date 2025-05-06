/**
 * Utility functions for the application
 */

/**
 * Format a date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Output format (defaults to CONFIG.DATE_FORMAT.DISPLAY)
 * @returns {string} Formatted date string
 */
function formatDate(date, format = CONFIG.DATE_FORMAT.DISPLAY) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else {
    return `${day}/${month}/${year}`;
  }
}

/**
 * Format currency value
 * @param {number} value - Number to format
 * @param {string} currency - Currency symbol (defaults to COP)
 * @returns {string} Formatted currency string
 */
function formatCurrency(value, currency = 'COP') {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format number with thousand separators
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
function formatNumber(value, decimals = 2) {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Create a debounced function that delays invoking func until after wait milliseconds
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = 'info', duration = CONFIG.TOAST.DURATION) {
  const toastContainer = document.querySelector('.toast-container');
  
  const toast = document.createElement('div');
  toast.className = `alert alert-${type === 'error' ? 'danger' : type}`;
  toast.style.minWidth = '250px';
  toast.style.marginBottom = '10px';
  toast.style.animation = 'fadeIn 0.3s ease';
  toast.innerHTML = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Create a pagination control
 * @param {number} currentPage - Current page
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback for page change
 * @returns {HTMLElement} Pagination element
 */
function createPagination(currentPage, totalPages, onPageChange) {
  const pagination = document.createElement('ul');
  pagination.className = 'pagination';
  
  // Previous button
  const prevItem = document.createElement('li');
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  const prevLink = document.createElement('a');
  prevLink.className = 'page-link';
  prevLink.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
  if (currentPage > 1) {
    prevLink.addEventListener('click', () => onPageChange(currentPage - 1));
  }
  prevItem.appendChild(prevLink);
  pagination.appendChild(prevItem);
  
  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
    
    const pageLink = document.createElement('a');
    pageLink.className = 'page-link';
    pageLink.textContent = i;
    pageLink.addEventListener('click', () => {
      if (i !== currentPage) {
        onPageChange(i);
      }
    });
    
    pageItem.appendChild(pageLink);
    pagination.appendChild(pageItem);
  }
  
  // Next button
  const nextItem = document.createElement('li');
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  const nextLink = document.createElement('a');
  nextLink.className = 'page-link';
  nextLink.innerHTML = 'Siguiente <i class="fas fa-chevron-right"></i>';
  if (currentPage < totalPages) {
    nextLink.addEventListener('click', () => onPageChange(currentPage + 1));
  }
  nextItem.appendChild(nextLink);
  pagination.appendChild(nextItem);
  
  return pagination;
}

/**
 * Show loading spinner
 * @param {HTMLElement} container - Container element for the spinner
 * @param {string} text - Loading text
 */
function showLoader(container, text = 'Cargando...') {
  container.innerHTML = '';
  
  const loaderContainer = document.createElement('div');
  loaderContainer.className = 'loader-container';
  
  const loader = document.createElement('div');
  loader.className = 'loader';
  
  const loadingText = document.createElement('p');
  loadingText.textContent = text;
  loadingText.style.marginLeft = '15px';
  
  loaderContainer.appendChild(loader);
  loaderContainer.appendChild(loadingText);
  
  container.appendChild(loaderContainer);
}

/**
 * Hide loading spinner
 * @param {HTMLElement} container - Container element for the spinner
 */
function hideLoader(container) {
  const loader = container.querySelector('.loader-container');
  if (loader) {
    container.removeChild(loader);
  }
}

/**
 * Creates a state badge element
 * @param {string} state - State value (activo, inactivo)
 * @returns {HTMLElement} Badge element
 */
function createStateBadge(state) {
  const badge = document.createElement('span');
  badge.className = `badge ${state === 'activo' ? 'badge-success' : 'badge-danger'}`;
  badge.textContent = state === 'activo' ? 'Activo' : 'Inactivo';
  return badge;
}

/**
 * Get query string parameters
 * @returns {Object} Object with query parameters
 */
function getQueryParams() {
  const params = {};
  const query = window.location.search.substring(1);
  const pairs = query.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  
  return params;
}

/**
 * Generate a unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Opens a modal for creating/editing a user
 * @param {Object} user - User object for editing (optional)
 */
function openNewUserModal(user = null) {
  const isEdit = !!user;
  const title = isEdit ? 'Editar Usuario' : 'Nuevo Usuario';
  
  const content = `
    <form id="userForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="nombre" name="nombre" required 
          value="${isEdit ? user.nombre : ''}" />
        <div class="invalid-feedback">Por favor ingrese un nombre</div>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" name="email" required
          value="${isEdit ? user.email : ''}" />
        <div class="invalid-feedback">Por favor ingrese un email válido</div>
      </div>
      <div class="mb-3">
        <label for="rol" class="form-label">Rol</label>
        <select class="form-select" id="rol" name="rol" required>
          <option value="">Seleccione un rol</option>
          <option value="admin" ${isEdit && user.rol === 'admin' ? 'selected' : ''}>Administrador</option>
          <option value="user" ${isEdit && user.rol === 'user' ? 'selected' : ''}>Usuario</option>
        </select>
        <div class="invalid-feedback">Por favor seleccione un rol</div>
      </div>
      ${!isEdit ? `
        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <input type="password" class="form-control" id="password" name="password" required />
          <div class="invalid-feedback">Por favor ingrese una contraseña</div>
        </div>
      ` : ''}
    </form>
  `;
  
  const footer = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSaveUser">Guardar</button>
  `;
  
  const modal = Modal.show(title, content, { footer });
  
  // Form validation and submission
  const form = document.getElementById('userForm');
  const saveBtn = document.getElementById('btnSaveUser');
  
  saveBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    
    const formData = new FormData(form);
    const userData = {
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      rol: formData.get('rol'),
      password: formData.get('password')
    };
    
    if (isEdit) {
      userData.id = user.id;
      UsuarioAPI.update(userData)
        .then(() => {
          Modal.hide();
          showToast('Usuario actualizado exitosamente', 'success');
          // Refresh user list if needed
          if (typeof refreshUserList === 'function') {
            refreshUserList();
          }
        })
        .catch(error => {
          console.error('Error al actualizar usuario:', error);
          showToast('Error al actualizar usuario', 'error');
        });
    } else {
      UsuarioAPI.create(userData)
        .then(() => {
          Modal.hide();
          showToast('Usuario creado exitosamente', 'success');
          // Refresh user list if needed
          if (typeof refreshUserList === 'function') {
            refreshUserList();
          }
        })
        .catch(error => {
          console.error('Error al crear usuario:', error);
          showToast('Error al crear usuario', 'error');
        });
    }
  });
}

/**
 * Opens a modal for creating/editing a cultivo
 * @param {Object} cultivo - Cultivo object for editing (optional)
 */
function openNewCultivoModal(cultivo = null) {
  const isEdit = !!cultivo;
  const title = isEdit ? 'Editar Cultivo' : 'Nuevo Cultivo';

  const content = `
    <form id="cultivoForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="nombre" name="nombre" required 
          value="${isEdit ? cultivo.nombre : ''}" />
        <div class="invalid-feedback">Por favor ingrese un nombre</div>
      </div>
      <div class="mb-3">
        <label for="tipo" class="form-label">Tipo</label>
        <select class="form-select" id="tipo" name="tipo" required>
          <option value="">Seleccione un tipo</option>
          ${CONFIG.CULTIVO_TIPOS.map(tipo => 
            `<option value="${tipo}" ${isEdit && cultivo.tipo === tipo ? 'selected' : ''}>${tipo}</option>`
          ).join('')}
        </select>
        <div class="invalid-feedback">Por favor seleccione un tipo</div>
      </div>
      <div class="mb-3">
        <label for="tamano" class="form-label">Tamaño (m²)</label>
        <input type="number" class="form-control" id="tamano" name="tamano" required 
          value="${isEdit ? cultivo.tamano : ''}" />
        <div class="invalid-feedback">Por favor ingrese el tamaño</div>
      </div>
      <div class="mb-3">
        <label for="ubicacion" class="form-label">Ubicación</label>
        <input type="text" class="form-control" id="ubicacion" name="ubicacion" required 
          value="${isEdit ? cultivo.ubicacion : ''}" />
        <div class="invalid-feedback">Por favor ingrese la ubicación</div>
      </div>
      <div class="mb-3">
        <label for="fecha_siembra" class="form-label">Fecha de Siembra</label>
        <input type="date" class="form-control" id="fecha_siembra" name="fecha_siembra" required 
          value="${isEdit ? cultivo.fecha_siembra : ''}" />
        <div class="invalid-feedback">Por favor ingrese la fecha de siembra</div>
      </div>
      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea class="form-control" id="descripcion" name="descripcion" rows="3">${isEdit ? cultivo.descripcion || '' : ''}</textarea>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="estado" name="estado" 
          ${(!isEdit || cultivo.estado === 'activo') ? 'checked' : ''} />
        <label class="form-check-label" for="estado">Activo</label>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSaveCultivo">Guardar</button>
  `;

  const modal = Modal.show(title, content, { footer });

  const form = document.getElementById('cultivoForm');
  const saveBtn = document.getElementById('btnSaveCultivo');

  saveBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Generate unique ID for new cultivo
    let nextId = '001';
    if (!isEdit) {
      try {
        const response = await CultivoAPI.getAll();
        if (response.data && response.data.length > 0) {
          const lastId = response.data[response.data.length - 1].id_cultivo;
          if (lastId.startsWith('CULT-')) {
            const lastNumber = parseInt(lastId.split('-')[1]);
            nextId = String(lastNumber + 1).padStart(3, '0');
          }
        }
      } catch (error) {
        console.error('Error getting last cultivo ID:', error);
      }
    }

    const formData = new FormData(form);
    const cultivoData = {
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      tamano: formData.get('tamano'),
      ubicacion: formData.get('ubicacion'),
      fecha_siembra: formData.get('fecha_siembra'),
      descripcion: formData.get('descripcion'),
      estado: formData.get('estado') ? 'activo' : 'inactivo'
    };

    if (!isEdit) {
      cultivoData.id_cultivo = `CULT-${nextId}`;
    }

    const savePromise = isEdit 
      ? CultivoAPI.update(cultivo.id_cultivo, cultivoData)
      : CultivoAPI.create(cultivoData);

    savePromise
      .then(() => {
        Modal.hide();
        showToast(
          `Cultivo ${isEdit ? 'actualizado' : 'creado'} correctamente`,
          'success'
        );
        // Refresh cultivo list if needed
        if (typeof refreshCultivoList === 'function') {
          refreshCultivoList();
        }
      })
      .catch(error => {
        console.error('Error saving cultivo:', error);
        showToast(
          `Error al ${isEdit ? 'actualizar' : 'crear'} el cultivo: ${error.message}`,
          'error'
        );
      });
  });
}

/**
 * Opens a modal for creating/editing a ciclo
 * @param {Object} ciclo - Ciclo object for editing (optional)
 */
function openNewCicloModal(ciclo = null) {
  const isEdit = !!ciclo;
  const title = isEdit ? 'Editar Ciclo' : 'Nuevo Ciclo';

  const content = `
    <form id="cicloForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="nombre" name="nombre" required 
          value="${isEdit ? ciclo.nombre : ''}" />
        <div class="invalid-feedback">Por favor ingrese un nombre</div>
      </div>
      <div class="mb-3">
        <label for="cultivo" class="form-label">Cultivo</label>
        <select class="form-select" id="cultivo" name="cultivo" required>
          <option value="">Seleccione un cultivo</option>
        </select>
        <div class="invalid-feedback">Por favor seleccione un cultivo</div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="fecha_inicio" class="form-label">Fecha de Inicio</label>
            <input type="date" class="form-control" id="fecha_inicio" name="fecha_inicio" required
              value="${isEdit ? ciclo.fecha_inicial : ''}" />
            <div class="invalid-feedback">Por favor ingrese la fecha de inicio</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="fecha_fin" class="form-label">Fecha de Fin</label>
            <input type="date" class="form-control" id="fecha_fin" name="fecha_fin" required
              value="${isEdit ? ciclo.fecha_final : ''}" />
            <div class="invalid-feedback">Por favor ingrese la fecha de fin</div>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea class="form-control" id="descripcion" name="descripcion" rows="3">${isEdit ? ciclo.descripcion || '' : ''}</textarea>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="estado" name="estado" 
          ${(!isEdit || ciclo.estado === 'activo') ? 'checked' : ''} />
        <label class="form-check-label" for="estado">Activo</label>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSaveCiclo">Guardar</button>
  `;

  const modal = Modal.show(title, content, { footer });

  // Load cultivos for dropdown
  setTimeout(() => {
    CultivoAPI.getAll()
      .then(response => {
        const cultivos = response.data || [];
        const select = document.getElementById('cultivo');
        
        // Mantener solo la opción por defecto
        select.innerHTML = '<option value="">Seleccione un cultivo</option>';
        
        cultivos.forEach(cultivo => {
          const option = document.createElement('option');
          option.value = cultivo.id_cultivo;
          option.textContent = cultivo.nombre;
          select.appendChild(option);
        });

        if (isEdit && ciclo.id_cultivo) {
          select.value = ciclo.id_cultivo;
        }
      })
      .catch(error => {
        console.error('Error loading cultivos:', error);
        showToast('Error al cargar los cultivos', 'error');
      });
  }, 100);

  const form = document.getElementById('cicloForm');
  const saveBtn = document.getElementById('btnSaveCiclo');

  saveBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Generate unique ID for new ciclo
    let nextId = '001';
    if (!isEdit) {
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
    }

    const formData = new FormData(form);
    const cicloData = {
      nombre: formData.get('nombre'),
      id_cultivo: formData.get('cultivo'),
      fecha_inicial: formData.get('fecha_inicio'),
      fecha_final: formData.get('fecha_fin'),
      descripcion: formData.get('descripcion'),
      estado: formData.get('estado') ? 'activo' : 'inactivo',
      novedades: '' // Required by database
    };

    if (!isEdit) {
      cicloData.id_ciclo = `CICL-${nextId}`;
    }

    const savePromise = isEdit 
      ? CicloAPI.update(ciclo.id_ciclo, cicloData)
      : CicloAPI.create(cicloData);

    savePromise
      .then(() => {
        Modal.hide();
        showToast(
          `Ciclo ${isEdit ? 'actualizado' : 'creado'} correctamente`,
          'success'
        );
        // Refresh ciclo list if needed
        if (typeof refreshCicloList === 'function') {
          refreshCicloList();
        }
      })
      .catch(error => {
        console.error('Error saving ciclo:', error);
        showToast(
          `Error al ${isEdit ? 'actualizar' : 'crear'} el ciclo: ${error.message}`,
          'error'
        );
      });
  });
}

/**
 * Opens a modal for creating/editing a sensor
 * @param {Object} sensor - Sensor object for editing (optional)
 */
function openNewSensorModal(sensor = null) {
  const isEdit = !!sensor;
  const title = isEdit ? 'Editar Sensor' : 'Nuevo Sensor';

  const content = `
    <form id="sensorForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="nombre" name="nombre" required 
          value="${isEdit ? sensor.nombre : ''}" />
        <div class="invalid-feedback">Por favor ingrese un nombre</div>
      </div>
      <div class="mb-3">
        <label for="tipo" class="form-label">Tipo</label>
        <select class="form-select" id="tipo" name="tipo" required>
          <option value="">Seleccione un tipo</option>
          ${CONFIG.SENSOR_TYPES.map(tipo => 
            `<option value="${tipo}" ${isEdit && sensor.tipo === tipo ? 'selected' : ''}>${tipo}</option>`
          ).join('')}
        </select>
        <div class="invalid-feedback">Por favor seleccione un tipo</div>
      </div>
      <div class="mb-3">
        <label for="unidad_medida" class="form-label">Unidad de Medida</label>
        <input type="text" class="form-control" id="unidad_medida" name="unidad_medida" required
          value="${isEdit ? sensor.unidad_medida : ''}" />
        <div class="invalid-feedback">Por favor ingrese la unidad de medida</div>
      </div>
      <div class="mb-3">
        <label for="tiempo_escaneo" class="form-label">Tiempo de Escaneo (segundos)</label>
        <input type="number" class="form-control" id="tiempo_escaneo" name="tiempo_escaneo" required
          value="${isEdit ? sensor.tiempo_escaneo : ''}" min="1" />
        <div class="invalid-feedback">Por favor ingrese el tiempo de escaneo</div>
      </div>
      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea class="form-control" id="descripcion" name="descripcion" rows="3">${isEdit ? sensor.descripcion || '' : ''}</textarea>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="estado" name="estado" 
          ${(!isEdit || sensor.estado === 'activo') ? 'checked' : ''} />
        <label class="form-check-label" for="estado">Activo</label>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSaveSensor">Guardar</button>
  `;

  const modal = Modal.show(title, content, { footer });

  const form = document.getElementById('sensorForm');
  const saveBtn = document.getElementById('btnSaveSensor');

  saveBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Generate unique ID for new sensor
    let nextId = '001';
    if (!isEdit) {
      const tipo = form.tipo.value.substring(0, 4).toUpperCase();
      const timestamp = Date.now().toString().substring(8);
      nextId = timestamp;
    }

    const formData = new FormData(form);
    const sensorData = {
      nombre: formData.get('nombre'),
      tipo: formData.get('tipo'),
      unidad_medida: formData.get('unidad_medida'),
      tiempo_escaneo: formData.get('tiempo_escaneo'),
      descripcion: formData.get('descripcion'),
      estado: formData.get('estado') ? 'activo' : 'inactivo'
    };

    if (!isEdit) {
      const tipo = sensorData.tipo.substring(0, 4).toUpperCase();
      sensorData.id_sensor = `${tipo}-${nextId}`;
    }

    const savePromise = isEdit 
      ? API.sensors.update(sensor.id_sensor, sensorData)
      : API.sensors.create(sensorData);

    savePromise
      .then(() => {
        Modal.hide();
        showToast(
          `Sensor ${isEdit ? 'actualizado' : 'creado'} correctamente`,
          'success'
        );
        // Refresh sensor list if needed
        if (typeof refreshSensorList === 'function') {
          refreshSensorList();
        }
      })
      .catch(error => {
        console.error('Error saving sensor:', error);
        showToast(
          `Error al ${isEdit ? 'actualizar' : 'crear'} el sensor: ${error.message}`,
          'error'
        );
      });
  });
}

/**
 * Opens a modal for creating/editing an insumo
 * @param {Object} insumo - Insumo object for editing (optional)
 */
function openNewInsumoModal(insumo = null) {
  const isEdit = !!insumo;
  const title = isEdit ? 'Editar Insumo' : 'Nuevo Insumo';

  const content = `
    <form id="insumoForm" class="needs-validation" novalidate>
      <div class="mb-3">
        <label for="nombre" class="form-label">Nombre</label>
        <input type="text" class="form-control" id="nombre" name="nombre" required 
          value="${isEdit ? insumo.nombre : ''}" />
        <div class="invalid-feedback">Por favor ingrese un nombre</div>
      </div>
      <div class="mb-3">
        <label for="tipo" class="form-label">Tipo</label>
        <select class="form-select" id="tipo" name="tipo" required>
          <option value="">Seleccione un tipo</option>
          <option value="fertilizante" ${isEdit && insumo.tipo === 'fertilizante' ? 'selected' : ''}>Fertilizante</option>
          <option value="pesticida" ${isEdit && insumo.tipo === 'pesticida' ? 'selected' : ''}>Pesticida</option>
          <option value="herramienta" ${isEdit && insumo.tipo === 'herramienta' ? 'selected' : ''}>Herramienta</option>
          <option value="otro" ${isEdit && insumo.tipo === 'otro' ? 'selected' : ''}>Otro</option>
        </select>
        <div class="invalid-feedback">Por favor seleccione un tipo</div>
      </div>
      <div class="mb-3">
        <label for="unidad_medida" class="form-label">Unidad de Medida</label>
        <input type="text" class="form-control" id="unidad_medida" name="unidad_medida" required
          value="${isEdit ? insumo.unidad_medida : ''}" />
        <div class="invalid-feedback">Por favor ingrese la unidad de medida</div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="cantidad" class="form-label">Cantidad</label>
            <input type="number" class="form-control" id="cantidad" name="cantidad" required min="0" step="any"
              value="${isEdit ? insumo.cantidad : ''}" />
            <div class="invalid-feedback">Por favor ingrese la cantidad</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="mb-3">
            <label for="valor_unitario" class="form-label">Valor Unitario</label>
            <input type="number" class="form-control" id="valor_unitario" name="valor_unitario" required min="0" step="any"
              value="${isEdit ? insumo.valor_unitario : ''}" />
            <div class="invalid-feedback">Por favor ingrese el valor unitario</div>
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="valor_total" class="form-label">Valor Total</label>
        <input type="number" class="form-control" id="valor_total" name="valor_total" readonly
          value="${isEdit ? insumo.valor_total : ''}" />
      </div>
      <div class="mb-3">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea class="form-control" id="descripcion" name="descripcion" rows="3">${isEdit ? insumo.descripcion || '' : ''}</textarea>
      </div>
      <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="estado" name="estado" 
          ${(!isEdit || insumo?.estado === 'activo') ? 'checked' : ''} />
        <label class="form-check-label" for="estado">Activo</label>
      </div>
    </form>
  `;

  const footer = `
    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn btn-primary" id="btnSaveInsumo">Guardar</button>
  `;

  const modal = Modal.show(title, content, { footer });

  const form = document.getElementById('insumoForm');
  const saveBtn = document.getElementById('btnSaveInsumo');
  const cantidadInput = document.getElementById('cantidad');
  const valorUnitarioInput = document.getElementById('valor_unitario');
  const valorTotalInput = document.getElementById('valor_total');

  // Calculate valor total when cantidad or valor_unitario change
  function updateValorTotal() {
    const cantidad = parseFloat(cantidadInput.value) || 0;
    const valorUnitario = parseFloat(valorUnitarioInput.value) || 0;
    valorTotalInput.value = (cantidad * valorUnitario).toFixed(2);
  }

  cantidadInput.addEventListener('input', updateValorTotal);
  valorUnitarioInput.addEventListener('input', updateValorTotal);

  saveBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Generate unique ID for new insumo
    let nextId = '001';
    if (!isEdit) {
      try {
        const response = await InsumoAPI.getAll();
        if (response.data && response.data.length > 0) {
          const lastId = response.data[response.data.length - 1].id_insumo;
          if (lastId.startsWith('INS-')) {
            const lastNumber = parseInt(lastId.split('-')[1]);
            nextId = String(lastNumber + 1).padStart(3, '0');
          }
        }
      } catch (error) {
        console.error('Error getting last insumo ID:', error);
      }
    }

    const formData = {
      id_insumo: isEdit ? insumo.id_insumo : `INS-${nextId}`,
      nombre: form.nombre.value.trim(),
      tipo: form.tipo.value,
      unidad_medida: form.unidad_medida.value.trim(),
      cantidad: parseFloat(form.cantidad.value),
      valor_unitario: parseFloat(form.valor_unitario.value),
      valor_total: parseFloat(form.valor_total.value),
      descripcion: form.descripcion.value.trim(),
      estado: form.estado.checked ? 'activo' : 'inactivo'
    };

    const savePromise = isEdit 
      ? InsumoAPI.update(insumo.id_insumo, formData)
      : InsumoAPI.create(formData);

    savePromise
      .then(() => {
        Modal.hide();
        showToast(
          `Insumo ${isEdit ? 'actualizado' : 'creado'} correctamente`,
          'success'
        );
        // Refresh insumo list if needed
        if (typeof refreshInsumoList === 'function') {
          refreshInsumoList();
        }
      })
      .catch(error => {
        console.error('Error saving insumo:', error);
        showToast(
          `Error al ${isEdit ? 'actualizar' : 'crear'} el insumo: ${error.message}`,
          'error'
        );
      });
  });
}

// Make functions available globally
window.openNewUserModal = openNewUserModal;
window.openNewCultivoModal = openNewCultivoModal;
window.openNewCicloModal = openNewCicloModal;
window.openNewSensorModal = openNewSensorModal;
window.openNewInsumoModal = openNewInsumoModal;