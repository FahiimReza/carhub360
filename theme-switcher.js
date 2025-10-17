// Ultra Dark Theme Switcher
// The Darkest Ever Theme Implementation

class ThemeSwitcher {
  constructor() {
    this.themes = {
      light: 'light-theme',
      dark: 'dark-theme',
      ultraDark: 'ultra-dark'
    };
    
    this.currentTheme = this.loadTheme();
    this.init();
  }

  init() {
    // Apply saved theme on load
    this.applyTheme(this.currentTheme);
    
    // Create theme toggle button
    this.createThemeToggle();
    
    // Listen for system theme changes
    this.watchSystemTheme();
    
    // Add keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  loadTheme() {
    // Try to load from localStorage
    const savedTheme = localStorage.getItem('carhub360-theme');
    if (savedTheme && Object.values(this.themes).includes(savedTheme)) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.themes.dark;
    }
    
    // Default to light
    return this.themes.light;
  }

  saveTheme(theme) {
    localStorage.setItem('carhub360-theme', theme);
    this.currentTheme = theme;
  }

  applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove(...Object.values(this.themes));
    
    // Apply new theme
    if (theme !== this.themes.light) {
      document.body.classList.add(theme);
    }
    
    // Update theme toggle button
    this.updateToggleButton(theme);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  createThemeToggle() {
    // Check if button already exists
    if (document.querySelector('.theme-toggle')) {
      return;
    }

    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle theme');
    
    // Create the slider element
    const slider = document.createElement('div');
    slider.className = 'theme-toggle-slider';
    
    // Append slider to button
    button.appendChild(slider);
    
    // Add click handler
    button.addEventListener('click', () => this.toggleTheme());
    
    // Add to page
    document.body.appendChild(button);
    
    // Add entrance animation
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1)';
    }, 100);
  }

  getThemeIcon(theme) {
    const icons = {
      [this.themes.light]: '🌞',
      [this.themes.dark]: '🌙',
      [this.themes.ultraDark]: '⚫'
    };
    
    return icons[theme] || '🌞';
  }

  updateToggleButton(theme) {
    const button = document.querySelector('.theme-toggle');
    if (button) {
      // Add switching class for animation
      button.classList.add('switching');
      
      // Remove switching class after animation completes
      setTimeout(() => {
        button.classList.remove('switching');
      }, 600);
    }
  }

  toggleTheme() {
    const themes = Object.values(this.themes);
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    this.applyTheme(nextTheme);
    this.saveTheme(nextTheme);
    
    // Add transition effect
    this.addTransitionEffect();
  }

  addTransitionEffect() {
    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--primary-color);
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
      transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    
    // Animate overlay
    requestAnimationFrame(() => {
      overlay.style.opacity = '0.1';
      setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(overlay);
        }, 300);
      }, 100);
    });
  }

  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('carhub360-theme')) {
          const newTheme = e.matches ? this.themes.dark : this.themes.light;
          this.applyTheme(newTheme);
        }
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + D to toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggleTheme();
      }
      
      // Ctrl/Cmd + Shift + L for light theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.applyTheme(this.themes.light);
        this.saveTheme(this.themes.light);
      }
      
      // Ctrl/Cmd + Shift + N for dark theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        this.applyTheme(this.themes.dark);
        this.saveTheme(this.themes.dark);
      }
      
      // Ctrl/Cmd + Shift + U for ultra dark theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        this.applyTheme(this.themes.ultraDark);
        this.saveTheme(this.themes.ultraDark);
      }
    });
  }

  // Public method to get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Public method to check if dark theme is active
  isDarkTheme() {
    return this.currentTheme === this.themes.dark || this.currentTheme === this.themes.ultraDark;
  }

  // Public method to check if ultra dark theme is active
  isUltraDarkTheme() {
    return this.currentTheme === this.themes.ultraDark;
  }
}

// Initialize theme switcher when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.themeSwitcher = new ThemeSwitcher();
});