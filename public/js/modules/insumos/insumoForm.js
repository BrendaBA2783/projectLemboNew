// insumoForm.js
// TODO: Implement Insumo Form module
console.log('insumoForm.js loaded');

const InsumoForm = (function() {
  let insumoId = null;
  let isEditMode = false;
  const contentContainer = document.getElementById('main-content');

  function init() {
    insumoId = sessionStorage.getItem('id');
    isEditMode = sessionStorage.getItem('navAction') === 'edit';
    render();
    if (isEditMode && insumoId) {
      loadInsumoData();
    } else if (!isEditMode) {
      generateNextId();
    }
  }

  function render() {
    document.querySelector('.page-title').textContent = isEditMode ? 'Editar Insumo' : 'Nuevo Insumo';
    contentContainer.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>${isEditMode ? 'Editar Insumo' : 'Nuevo Insumo'}</h2>
        </div>
        <div class="card-body">
          <form id="insumo-form">
            <div class="row">
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="id_insumo" class="form-label">ID Insumo</label>
                  <input type="text" class="form-control" id="id_insumo" name="id_insumo" readonly required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="nombre" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="tipo" class="form-label">Tipo</label>
                  <input type="text" class="form-control" id="tipo" name="tipo" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="unidad_medida" class="form-label">Unidad de Medida</label>
                  <input type="text" class="form-control" id="unidad_medida" name="unidad_medida" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="cantidad" class="form-label">Cantidad</label>
                  <input type="number" class="form-control" id="cantidad" name="cantidad" min="0" step="any" required>
                </div>
              </div>
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="valor_unitario" class="form-label">Valor Unitario</label>
                  <input type="number" class="form-control" id="valor_unitario" name="valor_unitario" min="0" step="any" required>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-4">
                <div class="form-group mb-3">
                  <label for="valor_total" class="form-label">Valor Total</label>
                  <input type="number" class="form-control" id="valor_total" name="valor_total" readonly>
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-group mb-3">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <textarea class="form-control" id="descripcion" name="descripcion" rows="2"></textarea>
                </div>
              </div>
            </div>
            <div class="form-group mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="estado" name="estado" checked>
                <label class="form-check-label" for="estado">Activo</label>
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
    addEventListeners();
  }

  function generateNextId() {
    // Obtener el último ID y generar el siguiente en formato INS-XXX
    InsumoAPI.getAll().then(response => {
      const insumos = response.data || [];
      let nextId = '001';
      if (insumos.length > 0) {
        const last = insumos[insumos.length - 1].id_insumo;
        if (last && last.startsWith('INS-')) {
          const lastNumber = parseInt(last.split('-')[1]);
          nextId = String(lastNumber + 1).padStart(3, '0');
        }
      }
      document.getElementById('id_insumo').value = `INS-${nextId}`;
    });
  }

  function loadInsumoData() {
    InsumoAPI.getById(insumoId)
      .then(response => {
        const insumo = response.data;
        document.getElementById('id_insumo').value = insumo.id_insumo;
        document.getElementById('nombre').value = insumo.nombre;
        document.getElementById('tipo').value = insumo.tipo;
        document.getElementById('unidad_medida').value = insumo.unidad_medida;
        document.getElementById('cantidad').value = insumo.cantidad;
        document.getElementById('valor_unitario').value = insumo.valor_unitario;
        document.getElementById('valor_total').value = insumo.valor_total;
        document.getElementById('descripcion').value = insumo.descripcion || '';
        document.getElementById('estado').checked = insumo.estado === 'activo';
      })
      .catch(() => {
        showToast('Error al cargar los datos del insumo', 'error');
      });
  }

  function addEventListeners() {
    const form = document.getElementById('insumo-form');
    const cantidadInput = document.getElementById('cantidad');
    const valorUnitarioInput = document.getElementById('valor_unitario');
    cantidadInput.addEventListener('input', updateValorTotal);
    valorUnitarioInput.addEventListener('input', updateValorTotal);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = {
        id_insumo: form.id_insumo.value.trim(),
        nombre: form.nombre.value.trim(),
        tipo: form.tipo.value.trim(),
        unidad_medida: form.unidad_medida.value.trim(),
        cantidad: parseFloat(form.cantidad.value),
        valor_unitario: parseFloat(form.valor_unitario.value),
        valor_total: parseFloat(form.valor_total.value),
        descripcion: form.descripcion.value.trim(),
        estado: form.estado.checked ? 'activo' : 'inactivo'
      };
      if (!validateForm(formData)) return;
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
      const savePromise = isEditMode
        ? InsumoAPI.update(insumoId, formData)
        : InsumoAPI.create(formData);
      savePromise
        .then(() => {
          showToast(`Insumo ${isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
          navigateToPage('nav-insumos-list');
        })
        .catch(() => {
          showToast(`Error al ${isEditMode ? 'actualizar' : 'crear'} el insumo`, 'error');
        })
        .finally(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        });
    });
  }

  function updateValorTotal() {
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const valorUnitario = parseFloat(document.getElementById('valor_unitario').value) || 0;
    document.getElementById('valor_total').value = (cantidad * valorUnitario).toFixed(2);
  }

  function validateForm(data) {
    if (!data.id_insumo || !data.nombre || !data.tipo || !data.unidad_medida || isNaN(data.cantidad) || isNaN(data.valor_unitario)) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return false;
    }
    return true;
  }

  return { init };
})();
