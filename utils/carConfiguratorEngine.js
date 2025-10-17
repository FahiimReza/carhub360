// Car Configurator Engine - Handles 3D model operations and configurations
window.CarConfiguratorEngine = {
    // Current configuration state
    currentConfig: {
        baseModel: 'sedan',
        color: '#dc143c',
        metallic: 0.8,
        roughness: 0.2,
        parts: [],
        stats: {
            cost: 25000,
            weight: 3200,
            hp: 200,
            torque: 250,
            efficiency: 28
        }
    },

    // Initialize the configurator
    init() {
        console.log('Car Configurator Engine initialized');
        this.setupEventListeners();
    },

    // Set up event listeners for model interactions
    setupEventListeners() {
        // Listen for color changes
        window.addEventListener('carColorChange', (event) => {
            this.applyColorToModel(event.detail);
        });

        // Listen for model type changes
        window.addEventListener('modelTypeChange', (event) => {
            this.changeBaseModel(event.detail.modelType);
        });
    },

    // Apply color to the current model
    applyColorToModel(colorData) {
        const modelViewer = document.getElementById('carModelViewer');
        if (!modelViewer) return;

        try {
            modelViewer.addEventListener('load', () => {
                const materials = modelViewer.model.materials;
                if (materials && materials.length > 0) {
                    materials.forEach((material) => {
                        if (material.pbrMetallicRoughness) {
                            material.pbrMetallicRoughness.setBaseColorFactor(colorData.color);
                            if (colorData.metallic !== undefined) {
                                material.setMetallicFactor(colorData.metallic);
                            }
                            if (colorData.roughness !== undefined) {
                                material.setRoughnessFactor(colorData.roughness);
                            }
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Failed to apply color to model:', error);
        }
    },

    // Change the base model
    changeBaseModel(modelType) {
        this.currentConfig.baseModel = modelType;
        this.updateStats();
    },

    // Update configuration stats
    updateStats() {
        const baseStats = window.CarPartsCatalog.baseModels[this.currentConfig.baseModel]?.stats || {};
        this.currentConfig.stats = {
            ...this.currentConfig.stats,
            ...baseStats
        };
        
        // Dispatch stats update event
        window.dispatchEvent(new CustomEvent('statsUpdate', {
            detail: this.currentConfig.stats
        }));
    },

    // Add a part to configuration
    addPart(part) {
        this.currentConfig.parts.push(part);
        this.currentConfig.stats.cost += part.price || 0;
        this.currentConfig.stats.weight += part.weight || 0;
        
        if (part.hp) this.currentConfig.stats.hp += part.hp;
        if (part.torque) this.currentConfig.stats.torque += part.torque;
        if (part.efficiency) this.currentConfig.stats.efficiency += part.efficiency;
        
        this.updateStats();
    },

    // Get current configuration
    getConfiguration() {
        return { ...this.currentConfig };
    },

    // Save configuration
    saveConfiguration() {
        const config = this.getConfiguration();
        localStorage.setItem('carConfiguration', JSON.stringify(config));
        return config;
    },

    // Load saved configuration
    loadConfiguration() {
        const saved = localStorage.getItem('carConfiguration');
        if (saved) {
            this.currentConfig = { ...this.currentConfig, ...JSON.parse(saved) };
            this.updateStats();
        }
    }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
    window.CarConfiguratorEngine.init();
}