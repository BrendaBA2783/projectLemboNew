console.log('🔄 Loading configuration...');

/**
 * Application configuration and constants
 */
const CONFIG = {
  // API Base URL
  API_URL: 'http://localhost:5000/api',
  
  // Default pagination settings
  PAGINATION: {
    PAGE_SIZE: 10,
    PAGE_SIZES: [5, 10, 25, 50, 100]
  },
  
  // Toast notification settings
  TOAST: {
    DURATION: 3000, // 3 seconds
    POSITION: 'top-right'
  },
  
  // Debounce times
  DEBOUNCE: {
    SEARCH: 300, // 300ms debounce for search inputs
    FORM: 500 // 500ms debounce for form inputs
  },
  
  // Date format
  DATE_FORMAT: {
    DISPLAY: 'DD/MM/YYYY',
    INPUT: 'YYYY-MM-DD'
  },
  
  // Chart colors
  CHART_COLORS: [
    '#4CAF50', // Primary
    '#FFA000', // Secondary
    '#2196F3', // Blue
    '#F44336', // Red
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FF9800', // Orange
    '#607D8B'  // Blue-gray
  ],
  
  // Default chart options
  DEFAULT_CHART_OPTIONS: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        bodyFont: {
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          size: 12
        },
        titleFont: {
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          size: 14
        }
      }
    }
  },
  
  // Usuario types
  USUARIO_TYPES: [
    'Administrador',
    'Personal de apoyo',
    'Visitante'
  ],

  USUARIO_DOCUMENT_TYPES:[
    'Tarjeta de Identidad (TI)',
    'Cedula de Ciudadania (CC)',
    'Cedula de Extranjeria (CE)',
    'Permiso por Proteccion Temporal (PPT)',
    'Permiso Especial de Permanencia (PEP)'
  ],
  
  // Sensor types
  SENSOR_TYPES: [
    'Temperatura',
    'Humedad',
    'pH',
    'Luz',
    'CO2',
    'Conductividad',
    'Oxígeno disuelto',
    'Presión',
    'Flujo de agua',
    'Nivel de agua',
    'Otro'
  ],
  
  // Insumo types
  INSUMO_TYPES: [
    'Fertilizante',
    'Pesticida',
    'Semilla',
    'Agua',
    'Sustrato',
    'Material de poda',
    'Herramienta',
    'Maquinaria',
    'Otro'
  ],
  
  // Cultivo types
  CULTIVO_TIPOS: [
    'Hortaliza',
    'Fruta',
    'Cereal',
    'Leguminosa',
    'Tubérculo',
    'Planta ornamental',
    'Hierba aromática',
    'Otro'
  ],
  
  // Measurement units
  UNITS: {
    TEMPERATURE: ['°C', '°F', 'K'],
    HUMIDITY: ['%', 'g/m³'],
    PH: ['pH'],
    TIME: ['segundos', 'minutos', 'horas'],
    WEIGHT: ['g', 'kg', 'lb', 'oz', 't'],
    VOLUME: ['ml', 'l', 'gal', 'm³'],
    AREA: ['m²', 'ha', 'km²'],
    LENGTH: ['mm', 'cm', 'm', 'km'],
    PRESSURE: ['Pa', 'kPa', 'bar', 'psi'],
    FLOW: ['l/min', 'm³/h'],
    CONCENTRATION: ['ppm', 'mg/l', '%']
  }
};

console.log('✅ Configuration loaded successfully');
window.CONFIG = CONFIG;