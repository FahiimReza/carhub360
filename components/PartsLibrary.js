// Parts Library Component
function PartsLibrary({ selectedCategory, onCategoryChange, onPartAdd, onPartSelect }) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [expandedCategory, setExpandedCategory] = React.useState('body');

    try {
        const partCategories = {
            body: {
                name: 'Body & Paint',
                icon: 'icon-palette',
                parts: [
                    { id: 'metallic_red', name: 'Metallic Red Paint', price: 500, color: '#dc143c' },
                    { id: 'pearl_white', name: 'Pearl White Paint', price: 600, color: '#f8f8ff' },
                    { id: 'carbon_black', name: 'Carbon Black Paint', price: 550, color: '#2c2c2c' },
                    { id: 'electric_blue', name: 'Electric Blue Paint', price: 580, color: '#0077ff' }
                ]
            },
            wheels: {
                name: 'Wheels & Tires',
                icon: 'icon-circle',
                parts: [
                    { id: 'sport_rims_18', name: '18" Sport Rims', price: 1200, description: 'Lightweight alloy' },
                    { id: 'luxury_rims_20', name: '20" Luxury Rims', price: 2500, description: 'Premium chrome finish' },
                    { id: 'racing_rims_19', name: '19" Racing Rims', price: 1800, description: 'Track performance' }
                ]
            },
            engine: {
                name: 'Engine & Performance',
                icon: 'icon-cpu',
                parts: [
                    { id: 'turbo_v6', name: 'Turbo V6 Engine', price: 5000, hp: 350, torque: 400 },
                    { id: 'hybrid_system', name: 'Hybrid System', price: 3500, hp: 200, efficiency: 15 },
                    { id: 'v8_performance', name: 'V8 Performance', price: 8000, hp: 500, torque: 600 }
                ]
            },
            exterior: {
                name: 'Exterior Features',
                icon: 'icon-sun',
                parts: [
                    { id: 'led_headlights', name: 'LED Headlights', price: 800, description: 'Adaptive lighting' },
                    { id: 'carbon_spoiler', name: 'Carbon Fiber Spoiler', price: 1500, description: 'Aerodynamic design' },
                    { id: 'chrome_package', name: 'Chrome Package', price: 1200, description: 'Premium accents' }
                ]
            }
        };

        const handlePartAdd = (part) => {
            if (onPartAdd) {
                onPartAdd(part);
            }
        };

        const handlePartSelect = (partId) => {
            if (onPartSelect) {
                onPartSelect(partId);
            }
        };

        const filteredParts = (parts) => {
            return parts.filter(part => 
                part.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        };

        return (
            <div className="panel">
                <div className="mb-4">
                    <h3 className="text-lg font-bold mb-3 text-[var(--primary-color)]">Parts Library</h3>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search parts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                        <div className="icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]"></div>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                    {Object.entries(partCategories).map(([key, category]) => (
                        <div key={key} className="glass-card p-3">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === key ? '' : key)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className={`${category.icon} text-[var(--primary-color)]`}></div>
                                    <span className="font-semibold">{category.name}</span>
                                    <span className="text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded-full">
                                        {filteredParts(category.parts).length}
                                    </span>
                                </div>
                                <div className={`icon-chevron-down transition-transform ${
                                    expandedCategory === key ? 'rotate-180' : ''
                                }`}></div>
                            </button>

                            {expandedCategory === key && (
                                <div className="mt-3 space-y-2">
                                    {filteredParts(category.parts).map(part => (
                                        <div key={part.id} className="part-item">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">{part.name}</h4>
                                                    {part.description && (
                                                        <p className="text-xs text-[var(--text-secondary)]">{part.description}</p>
                                                    )}
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs font-bold text-[var(--accent-color)]">
                                                            ${part.price.toLocaleString()}
                                                        </span>
                                                        {part.hp && (
                                                            <span className="text-xs bg-red-600/20 px-2 py-0.5 rounded">
                                                                {part.hp}HP
                                                            </span>
                                                        )}
                                                        {part.efficiency && (
                                                            <span className="text-xs bg-green-600/20 px-2 py-0.5 rounded">
                                                                +{part.efficiency}MPG
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1 ml-2">
                                                    {part.color && (
                                                        <div 
                                                            className="color-swatch w-6 h-6"
                                                            style={{ backgroundColor: part.color }}
                                                            onClick={() => handlePartSelect(part.id)}
                                                        ></div>
                                                    )}
                                                    <button
                                                        onClick={() => handlePartAdd(part)}
                                                        className="btn-primary text-xs px-2 py-1"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    } catch (error) {
        console.error('PartsLibrary component error:', error);
        return (
            <div className="panel flex items-center justify-center">
                <span className="text-[var(--text-secondary)]">Parts Loading...</span>
            </div>
        );
    }
}