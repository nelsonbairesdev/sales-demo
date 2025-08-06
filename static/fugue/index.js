// Initialize the configurator
const configurator = new HoneycombConfigurator();

// Initialize enhanced animation system
const flowAnimationManager = new FlowAnimationManager();

// Initialize configuration manager
const configurationManager = new ConfigurationManager();

// Initialize tooltips after DOM is loaded
initTooltips();

// Initialize drawer event listeners when DOM is ready
function initializeDrawerControls() {
  // Global Settings button
  const globalSettingsBtn = document.getElementById('globalSettingsBtn');
  if (globalSettingsBtn) {
    globalSettingsBtn.addEventListener('click', () => openDrawer('globalSettingsDrawer'));
  }

  // Export Share button
  const exportShareBtn = document.getElementById('exportShareBtn');
  if (exportShareBtn) {
    exportShareBtn.addEventListener('click', () => openDrawer('exportShareDrawer'));
  }

  // Close drawers when clicking overlay
  document.querySelectorAll('.drawer-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
      const drawer = this.closest('.drawer');
      if (drawer) {
        closeDrawer(drawer.id);
      }
    });
  });

  // Close drawers with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const openDrawers = document.querySelectorAll('.drawer:not(.hidden)');
      openDrawers.forEach(drawer => closeDrawer(drawer.id));
    }
  });

  // Update speed control to use dropdown
  const speedDropdown = document.getElementById('animationSpeedSelect');
  if (speedDropdown) {
    speedDropdown.addEventListener('change', function() {
      const speed = parseFloat(this.value);
      if (typeof flowAnimationManager !== 'undefined' && flowAnimationManager) {
        flowAnimationManager.animationSpeed = speed;
        localStorage.setItem('animation-speed', speed);
      }
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDrawerControls);
} else {
  // DOM is already loaded
  initializeDrawerControls();
}

// Mobile sidebar toggle functionality
document.getElementById('sidebarToggle').addEventListener('click', () => {
  const sidebar = document.getElementById('leftSidebar');
  const isOpen = sidebar.classList.contains('open');

  if (isOpen) {
    sidebar.classList.remove('open');
  } else {
    sidebar.classList.add('open');
  }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('leftSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  if (window.innerWidth < 768 && // Only on mobile
    !sidebar.contains(e.target) &&
    !sidebarToggle.contains(e.target) &&
    sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
});

// Drawer Management Functions
function openDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (drawer) {
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeDrawer(drawerId) {
  const drawer = document.getElementById(drawerId);
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }
}