// Utility to check and load icons with fallback
class IconLoader {
    static checkLucideIcons() {
        try {
            // Check if Lucide icons are loaded
            const testElement = document.createElement('div');
            testElement.className = 'icon-car';
            document.body.appendChild(testElement);
            
            // Check if the icon is visible (has content)
            const styles = window.getComputedStyle(testElement, ':before');
            const hasContent = styles.getPropertyValue('content') && styles.getPropertyValue('content') !== 'none';
            
            document.body.removeChild(testElement);
            
            if (hasContent) {
                console.log('✅ Lucide icons loaded successfully');
                return true;
            } else {
                console.warn('⚠️ Lucide icons not loaded properly, using fallback SVGs');
                this.loadFallbackIcons();
                return false;
            }
        } catch (error) {
            console.error('❌ Error checking Lucide icons:', error);
            this.loadFallbackIcons();
            return false;
        }
    }
    
    static loadFallbackIcons() {
        // Add a class to the body to indicate fallback icons are being used
        document.body.classList.add('fallback-icons');
        
        // Create a style element to hide Lucide icons and show fallback SVGs
        const style = document.createElement('style');
        style.textContent = `
            .fallback-icons .icon-car,
            .fallback-icons .icon-user,
            .fallback-icons .icon-log-out,
            .fallback-icons .icon-menu,
            .fallback-icons .icon-x {
                display: none !important;
            }
            
            .fallback-icons .icon-car + svg,
            .fallback-icons .icon-user + svg,
            .fallback-icons .icon-log-out + svg,
            .fallback-icons .icon-menu + svg,
            .fallback-icons .icon-x + svg {
                display: block !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    static init() {
        // Check icons when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkLucideIcons());
        } else {
            this.checkLucideIcons();
        }
    }
}

// Initialize icon loader
IconLoader.init();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconLoader;
}