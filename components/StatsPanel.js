// Stats Panel Component with Color Picker
function StatsPanel({ stats, selectedPart, showColorPicker, onColorChange, onColorPickerClose }) {
    const [activeTab, setActiveTab] = React.useState('stats');

    try {
        const colorPresets = [
            { name: 'Metallic Red', color: [0.8, 0.1, 0.1, 1], hex: '#dc143c' },
            { name: 'Pearl White', color: [0.95, 0.95, 1.0, 1], hex: '#f8f8ff' },
            { name: 'Carbon Black', color: [0.17, 0.17, 0.17, 1], hex: '#2c2c2c' },
            { name: 'Electric Blue', color: [0.0, 0.47, 1.0, 1], hex: '#0077ff' },
            { name: 'Racing Yellow', color: [1.0, 1.0, 0.0, 1], hex: '#ffff00' },
            { name: 'Forest Green', color: [0.0, 0.5, 0.25, 1], hex: '#008040' }
        ];

        const handleColorSelect = (colorData) => {
            if (onColorChange) {
                onColorChange(colorData.hex);
                // Dispatch event for model viewer
                window.dispatchEvent(new CustomEvent('carColorChange', {
                    detail: { color: colorData.color }
                }));
            }
        };

        return (
            <div className="panel">
                <div className="mb-4">
                    <div className="flex space-x-2 mb-4">
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'
                            }`}
                        >
                            <div className="icon-bar-chart-2 text-sm mr-1"></div>
                            Stats
                        </button>
                        <button
                            onClick={() => setActiveTab('colors')}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeTab === 'colors' ? 'btn-primary' : 'btn-secondary'
                            }`}
                        >
                            <div className="icon-palette text-sm mr-1"></div>
                            Colors
                        </button>
                    </div>
                </div>

                {/* Stats Tab */}
                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--primary-color)]">Configuration Stats</h3>
                        
                        {/* Cost */}
                        <div className="glass-card p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Total Cost</span>
                                <span className="text-lg font-bold text-[var(--accent-color)]">
                                    ${stats?.cost?.toLocaleString() || '0'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div 
                                    className="bg-[var(--accent-color)] h-2 rounded-full transition-all"
                                    style={{ width: `${Math.min((stats?.cost || 0) / 50000 * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Performance */}
                        <div className="glass-card p-3">
                            <h4 className="font-semibold mb-2">Performance</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Horsepower</span>
                                    <span className="font-bold">{stats?.hp || 0} HP</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Torque</span>
                                    <span className="font-bold">{stats?.torque || 0} lb-ft</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Efficiency</span>
                                    <span className="font-bold">{stats?.efficiency || 0} MPG</span>
                                </div>
                            </div>
                        </div>

                        {/* Weight */}
                        <div className="glass-card p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Weight</span>
                                <span className="font-bold">{stats?.weight || 0} lbs</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Colors Tab */}
                {activeTab === 'colors' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--primary-color)]">Car Colors</h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {colorPresets.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorSelect(color)}
                                    className="glass-card p-3 hover:border-[var(--primary-color)] transition-colors"
                                >
                                    <div 
                                        className="w-full h-8 rounded-lg mb-2"
                                        style={{ backgroundColor: color.hex }}
                                    ></div>
                                    <span className="text-xs font-medium">{color.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Material Properties */}
                        <div className="glass-card p-3">
                            <h4 className="font-semibold mb-3">Material Properties</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm text-[var(--text-secondary)]">Metallic</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1" 
                                        defaultValue="0.8"
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-[var(--text-secondary)]">Roughness</label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.1" 
                                        defaultValue="0.2"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('StatsPanel component error:', error);
        return (
            <div className="panel flex items-center justify-center">
                <span className="text-[var(--text-secondary)]">Stats Loading...</span>
            </div>
        );
    }
}
