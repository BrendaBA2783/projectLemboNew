/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', function() {
  // Initialize navigation
  initNavigation();
  
  // Show dashboard by default
  navigateToPage('nav-dashboard');
  
  // Sidebar toggle (mobile)
  initSidebar();

  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  const sidebarCollapseShow = document.getElementById('sidebarCollapseShow');

  sidebarCollapse.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });

  sidebarCollapseShow.addEventListener('click', () => {
    sidebar.classList.add('active');
  });

  // Dropdown toggle
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = document.getElementById(toggle.getAttribute('href').slice(1));
      submenu.classList.toggle('show');
    });
  });

  // Toggle dropdown menus
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const submenuId = toggle.getAttribute('href').substring(1);
      const submenu = document.getElementById(submenuId);
      
      // Close other open menus
      document.querySelectorAll('.collapse.show').forEach(menu => {
        if (menu.id !== submenuId) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle current menu
      submenu.classList.toggle('show');
      toggle.setAttribute('aria-expanded', 
        submenu.classList.contains('show'));
    });
  });
});

// Initialize navigation
function initNavigation() {
  // Dashboard link
  const dashboardLink = document.getElementById('nav-dashboard');
  dashboardLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-dashboard');
  });
  
  // Sensor links
  const sensorListLink = document.getElementById('nav-sensors-list');
  sensorListLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-sensors-list');
  });
  
  const sensorCreateLink = document.getElementById('nav-sensors-create');
  sensorCreateLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-sensors-create');
  });
  
  // Insumo links
  const insumoListLink = document.getElementById('nav-insumos-list');
  insumoListLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-insumos-list');
  });
  
  const insumoCreateLink = document.getElementById('nav-insumos-create');
  insumoCreateLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-insumos-create');
  });
  
  // Cultivo links
  const cultivoListLink = document.getElementById('nav-cultivos-list');
  cultivoListLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-cultivos-list');
  });
  
  const cultivoCreateLink = document.getElementById('nav-cultivos-create');
  cultivoCreateLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-cultivos-create');
  });
  
  // Ciclo links
  const cicloListLink = document.getElementById('nav-ciclos-list');
  cicloListLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-ciclos-list');
  });
  
  const cicloCreateLink = document.getElementById('nav-ciclos-create');
  cicloCreateLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-ciclos-create');
  });
  
  // Produccion links
  const produccionListLink = document.getElementById('nav-producciones-list');
  produccionListLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-producciones-list');
  });
  
  const produccionCreateLink = document.getElementById('nav-producciones-create');
  produccionCreateLink.addEventListener('click', function(e) {
    e.preventDefault();
    navigateToPage('nav-producciones-create');
  });
  
  // Set up submenu toggles
  const submenuToggles = document.querySelectorAll('.dropdown-toggle');
  submenuToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const submenuId = this.getAttribute('href');
      const submenu = document.querySelector(submenuId);
      
      if (submenu) {
        submenu.classList.toggle('show');
        this.setAttribute('aria-expanded', submenu.classList.contains('show'));
      }
    });
  });
}

// Initialize sidebar
function initSidebar() {
  const sidebarCollapseShow = document.getElementById('sidebarCollapseShow');
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarCollapseShow) {
    sidebarCollapseShow.addEventListener('click', function() {
      sidebar.classList.add('active');
    });
  }
  
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener('click', function() {
      sidebar.classList.remove('active');
    });
  }
}

// Navigate to a page
function navigateToPage(navId) {
  // Update active navigation
  const navLinks = document.querySelectorAll('.nav-item');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.getElementById(navId);
  if (activeLink) {
    activeLink.classList.add('active');
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.remove('active');
    }
    
    // Update page title
    const pageTitleMap = {
      'nav-dashboard': 'Dashboard',
      'nav-sensors-list': 'Sensores',
      'nav-sensors-create': 'Crear Sensor',
      'nav-insumos-list': 'Insumos',
      'nav-insumos-create': 'Crear Insumo',
      'nav-cultivos-list': 'Cultivos',
      'nav-cultivos-create': 'Crear Cultivo',
      'nav-ciclos-list': 'Ciclos de Cultivo',
      'nav-ciclos-create': 'Crear Ciclo de Cultivo',
      'nav-producciones-list': 'Producciones',
      'nav-producciones-create': 'Crear Producción'
    };
    
    document.querySelector('.page-title').textContent = pageTitleMap[navId] || '';
  }
  
  // Load module
  if (navId === 'nav-dashboard') {
    Dashboard.init();
  } else if (navId === 'nav-sensors-list') {
    SensorList.init();
  } else if (navId === 'nav-sensors-create') {
    console.log('Llamando a SensorForm.init() desde navigateToPage');
    SensorForm.init();
  } else if (navId === 'nav-sensors-detail') {
    SensorDetail.init();
  } else if (navId === 'nav-insumos-list') {
    InsumoList.init();
  } else if (navId === 'nav-insumos-create') {
    InsumoForm.init();
  } else if (navId === 'nav-cultivos-list') {
    CultivoList.init();
  } else if (navId === 'nav-cultivos-create') {
    CultivoForm.init();
  } else if (navId === 'nav-cultivos-detail') {
    CultivoDetail.init();
  } else if (navId === 'nav-ciclos-list') {
    CicloList.init();
  } else if (navId === 'nav-ciclos-create') {
    CicloForm.init();
  } else if (navId === 'nav-ciclos-detail') {
    CicloDetail.init();
  } else if (navId === 'nav-producciones-list') {
    ProduccionList.init();
  } else if (navId === 'nav-producciones-create') {
    ProduccionForm.init();
  } else if (navId === 'nav-producciones-detail') {
    ProduccionDetail.init();
  }
  // TODO: Add more modules as they are implemented
}