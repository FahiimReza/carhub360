// Car Parts Catalog - Comprehensive database of car parts and models
window.CarPartsCatalog = {
    // Car Models with fallback to CSS 3D representation
    carModels: {
        sedan: {
            id: 'sedan_base',
            name: 'Executive Sedan',
            url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
            price: 25000,
            weight: 3200,
            stats: { hp: 200, torque: 250, efficiency: 28 }
        },
        suv: {
            id: 'suv_base', 
            name: 'Luxury SUV',
            url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
            price: 35000,
            weight: 4200,
            stats: { hp: 280, torque: 320, efficiency: 22 }
        },
        sports: {
            id: 'sports_base',
            name: 'Sports Coupe',
            url: 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
            price: 45000,
            weight: 2800,
            stats: { hp: 350, torque: 300, efficiency: 20 }
        }
    },

    // Base Model Configurations
    baseModels: {
        sedan: {
            id: 'base_sedan',
            name: 'Executive Sedan',
            price: 25000,
            weight: 3200,
            stats: { hp: 200, torque: 250, efficiency: 28 }
        },
        suv: {
            id: 'base_suv',
            name: 'Luxury SUV', 
            price: 35000,
            weight: 4200,
            stats: { hp: 280, torque: 320, efficiency: 22 }
        },
        sports: {
            id: 'base_sports',
            name: 'Sports Coupe',
            price: 45000,
            weight: 2800,
            stats: { hp: 350, torque: 300, efficiency: 20 }
        }
    },

    // Paint Colors with Realistic Materials
    paintColors: [
        { id: 'metallic_red', name: 'Metallic Red', hex: '#dc143c', metallic: 0.8, roughness: 0.2 },
        { id: 'pearl_white', name: 'Pearl White', hex: '#f8f8ff', metallic: 0.9, roughness: 0.1 },
        { id: 'carbon_black', name: 'Carbon Black', hex: '#2c2c2c', metallic: 0.7, roughness: 0.3 },
        { id: 'electric_blue', name: 'Electric Blue', hex: '#0077ff', metallic: 0.8, roughness: 0.2 },
        { id: 'racing_yellow', name: 'Racing Yellow', hex: '#ffff00', metallic: 0.6, roughness: 0.4 },
        { id: 'forest_green', name: 'Forest Green', hex: '#008040', metallic: 0.7, roughness: 0.3 }
    ],

    // Environment Settings
    environments: {
        showroom: { name: 'Showroom', hdri: 'neutral' },
        outdoor: { name: 'Outdoor', hdri: 'neutral' },
        studio: { name: 'Studio', hdri: 'neutral' }
    }
};

// Export for global access
window.CarPartsCatalog = window.CarPartsCatalog;