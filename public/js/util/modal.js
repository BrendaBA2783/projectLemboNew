/**
 * Modal utility functions
 */
console.log('modal.js loaded');

// Simple modal implementation
const Modal = {
  show: function(title, content, options = {}) {
    // Create modal container if it doesn't exist
    let modalContainer = document.getElementById('modal-container');
    
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modal-container';
      modalContainer.classList.add('modal-container');
      document.body.appendChild(modalContainer);
    }
    
    // Create modal HTML
    const modalHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-dialog ${options.size || ''}">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
        </div>
      </div>
    `;
    
    // Set modal content
    modalContainer.innerHTML = modalHTML;
    
    // Add event listeners
    const closeBtn = modalContainer.querySelector('.close');
    const backdrop = modalContainer.querySelector('.modal-backdrop');
    
    closeBtn.addEventListener('click', Modal.hide);
    backdrop.addEventListener('click', options.backdropDismiss !== false ? Modal.hide : null);
    
    // Show modal
    modalContainer.classList.add('show');
    document.body.classList.add('modal-open');
    
    // Return modal instance
    return {
      hide: Modal.hide,
      getElement: () => modalContainer
    };
  },
  
  hide: function() {
    const modalContainer = document.getElementById('modal-container');
    
    if (modalContainer) {
      modalContainer.classList.remove('show');
      document.body.classList.remove('modal-open');
      
      // Remove modal after animation
      setTimeout(() => {
        modalContainer.innerHTML = '';
      }, 300);
    }
  },
  
  confirm: function(title, message, callback) {
    const content = `<p>${message}</p>`;
    const footer = `
      <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
      <button type="button" class="btn btn-primary" id="modal-confirm-btn">Confirmar</button>
    `;
    
    const modal = Modal.show(title, content, { footer, backdropDismiss: false });
    
    const confirmBtn = document.getElementById('modal-confirm-btn');
    confirmBtn.addEventListener('click', () => {
      Modal.hide();
      if (typeof callback === 'function') {
        callback(true);
      }
    });
    
    const cancelBtn = modal.getElement().querySelector('.btn-secondary');
    cancelBtn.addEventListener('click', () => {
      Modal.hide();
      if (typeof callback === 'function') {
        callback(false);
      }
    });
  },
  
  alert: function(title, message, callback) {
    const content = `<p>${message}</p>`;
    const footer = `<button type="button" class="btn btn-primary" data-dismiss="modal">Aceptar</button>`;
    
    const modal = Modal.show(title, content, { footer });
    
    const acceptBtn = modal.getElement().querySelector('.btn-primary');
    acceptBtn.addEventListener('click', () => {
      Modal.hide();
      if (typeof callback === 'function') {
        callback();
      }
    });
  }
};

// Export to global scope
window.Modal = Modal;
