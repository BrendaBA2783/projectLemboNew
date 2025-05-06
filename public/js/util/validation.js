/**
 * Form validation utilities
 */

/**
 * Validate a form field
 * @param {HTMLElement} field - Form field element
 * @param {Object} rules - Validation rules
 * @returns {boolean} Whether the field is valid
 */
function validateField(field, rules) {
  // Get field value
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Check required
  if (rules.required && !value) {
    isValid = false;
    errorMessage = 'Este campo es obligatorio';
  }
  
  // Check min length
  else if (rules.minLength && value.length < rules.minLength) {
    isValid = false;
    errorMessage = `Este campo debe tener al menos ${rules.minLength} caracteres`;
  }
  
  // Check max length
  else if (rules.maxLength && value.length > rules.maxLength) {
    isValid = false;
    errorMessage = `Este campo debe tener máximo ${rules.maxLength} caracteres`;
  }
  
  // Check pattern
  else if (rules.pattern && !rules.pattern.test(value)) {
    isValid = false;
    errorMessage = rules.message || 'Formato inválido';
  }
  
  // Check min value (for number inputs)
  else if (rules.min !== undefined && parseFloat(value) < rules.min) {
    isValid = false;
    errorMessage = `El valor mínimo es ${rules.min}`;
  }
  
  // Check max value (for number inputs)
  else if (rules.max !== undefined && parseFloat(value) > rules.max) {
    isValid = false;
    errorMessage = `El valor máximo es ${rules.max}`;
  }
  
  // Check date validation
  else if (rules.date) {
    const dateValue = new Date(value);
    
    if (isNaN(dateValue.getTime())) {
      isValid = false;
      errorMessage = 'Fecha inválida';
    }
    else if (rules.minDate && dateValue < new Date(rules.minDate)) {
      isValid = false;
      errorMessage = `La fecha debe ser posterior a ${formatDate(rules.minDate)}`;
    }
    else if (rules.maxDate && dateValue > new Date(rules.maxDate)) {
      isValid = false;
      errorMessage = `La fecha debe ser anterior a ${formatDate(rules.maxDate)}`;
    }
  }
  
  // Custom validation
  else if (rules.custom && typeof rules.custom === 'function') {
    const customResult = rules.custom(value);
    if (customResult !== true) {
      isValid = false;
      errorMessage = customResult;
    }
  }
  
  // Show/hide error message
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('invalid-feedback')) {
    errorElement.textContent = errorMessage;
    errorElement.style.display = isValid ? 'none' : 'block';
  }
  
  // Add/remove validation classes
  field.classList.toggle('is-invalid', !isValid);
  
  return isValid;
}

/**
 * Validate a form
 * @param {string} formId - Form ID
 * @param {Object} rules - Validation rules for each field
 * @returns {boolean} Whether the form is valid
 */
function validateForm(formId, rules) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  let isValid = true;
  
  for (const fieldName in rules) {
    const field = form.elements[fieldName];
    if (field) {
      const fieldValid = validateField(field, rules[fieldName]);
      isValid = isValid && fieldValid;
    }
  }
  
  return isValid;
}

/**
 * Set up validation for a form
 * @param {string} formId - Form ID
 * @param {Object} rules - Validation rules for each field
 * @param {Function} onSubmit - Submit handler
 */
function setupFormValidation(formId, rules, onSubmit) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  // Add validation on input events
  for (const fieldName in rules) {
    const field = form.elements[fieldName];
    if (field) {
      // Create error element if it doesn't exist
      let errorElement = field.nextElementSibling;
      if (!errorElement || !errorElement.classList.contains('invalid-feedback')) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        if (field.parentNode) {
          field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
      }
      
      // Add input event listener for live validation
      field.addEventListener('input', debounce(() => {
        validateField(field, rules[fieldName]);
      }, CONFIG.DEBOUNCE.FORM));
      
      // Add blur event listener for validation on field exit
      field.addEventListener('blur', () => {
        validateField(field, rules[fieldName]);
      });
    }
  }
  
  // Add submit event listener
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const isValid = validateForm(formId, rules);
    
    if (isValid && typeof onSubmit === 'function') {
      onSubmit(form);
    } else if (!isValid) {
      showToast('Por favor, corrija los errores en el formulario', 'error');
    }
  });
}

/**
 * Collect form data (including files)
 * @param {string} formId - Form ID
 * @param {boolean} asFormData - Whether to return FormData object (for file uploads)
 * @returns {Object|FormData} Form data
 */
function collectFormData(formId, asFormData = false) {
  const form = document.getElementById(formId);
  if (!form) return null;
  
  if (asFormData) {
    return new FormData(form);
  }
  
  const formData = {};
  const formElements = Array.from(form.elements);
  
  formElements.forEach(element => {
    if (element.name) {
      if (element.type === 'checkbox') {
        formData[element.name] = element.checked;
      } else if (element.type === 'radio') {
        if (element.checked) {
          formData[element.name] = element.value;
        }
      } else if (element.type === 'select-multiple') {
        formData[element.name] = Array.from(element.options)
          .filter(option => option.selected)
          .map(option => option.value);
      } else if (element.type !== 'file' && element.type !== 'submit' && element.type !== 'button') {
        formData[element.name] = element.value;
      }
    }
  });
  
  return formData;
}

/**
 * Populate form fields with data
 * @param {string} formId - Form ID
 * @param {Object} data - Data to populate form with
 */
function populateForm(formId, data) {
  const form = document.getElementById(formId);
  if (!form || !data) return;
  
  const formElements = Array.from(form.elements);
  
  formElements.forEach(element => {
    if (element.name && data[element.name] !== undefined) {
      if (element.type === 'checkbox') {
        element.checked = Boolean(data[element.name]);
      } else if (element.type === 'radio') {
        element.checked = element.value === String(data[element.name]);
      } else if (element.type === 'select-multiple' && Array.isArray(data[element.name])) {
        Array.from(element.options).forEach(option => {
          option.selected = data[element.name].includes(option.value);
        });
      } else if (element.type === 'file') {
        // Can't set file input value directly due to security reasons
        // If there's a preview element, update that instead
        const previewContainer = document.getElementById(`${element.name}Preview`);
        if (previewContainer && data[element.name]) {
          const imgUrl = data[element.name].startsWith('http') 
            ? data[element.name] 
            : `${CONFIG.API_URL}${data[element.name]}`;
          
          previewContainer.innerHTML = `
            <img src="${imgUrl}" alt="Preview" style="max-width: 100%; max-height: 200px;">
          `;
          previewContainer.style.display = 'block';
        }
      } else if (element.type !== 'submit' && element.type !== 'button') {
        // For date inputs, format the date properly
        if (element.type === 'date' && data[element.name]) {
          element.value = formatDate(data[element.name], 'YYYY-MM-DD');
        } else {
          element.value = data[element.name] || '';
        }
      }
    }
  });
}