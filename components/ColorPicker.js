// Advanced Color Picker Component
function ColorPicker({ isVisible, onColorChange, onClose }) {
    const [selectedColor, setSelectedColor] = React.useState('#dc143c');
    const [metallic, setMetallic] = React.useState(0.8);
    const [roughness, setRoughness] = React.useState(0.2);
    const [customColors, setCustomColors] = React.useState([]);

    try {
        const presetColors = [
            '#dc143c', '#f8f8ff', '#2c2c2c', '#0077ff',
            '#ffff00', '#008040', '#ff6b35', '#9b59b6',
            '#e67e22', '#1abc9c', '#34495e', '#95a5a6'
        ];

        const handleColorChange = (color) => {
            setSelectedColor(color);
            const rgb = hexToRgb(color);
            const colorArray = [rgb.r / 255, rgb.g / 255, rgb.b / 255, 1];
            
            if (onColorChange) {
                onColorChange(color);
            }

            // Dispatch event for model viewer with material properties
            window.dispatchEvent(new CustomEvent('carColorChange', {
                detail: { 
                    color: colorArray,
                    metallic,
                    roughness
                }
            }));
        };

        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        };

        const handleMaterialChange = () => {
            handleColorChange(selectedColor); // Re-apply with new material properties
        };

        const addCustomColor = () => {
            if (!customColors.includes(selectedColor)) {
                setCustomColors([...customColors.slice(-7), selectedColor]);
            }
        };

        if (!isVisible) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="glass-card p-6 max-w-sm w-full mx-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-[var(--primary-color)]">Car Paint Studio</h3>
                        <button
                            onClick={onClose}
                            className="icon-x text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        ></button>
                    </div>

                    {/* Color Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Custom Color</label>
                        <div className="flex space-x-2">
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="w-12 h-10 rounded-lg border border-white/20"
                            />
                            <input
                                type="text"
                                value={selectedColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="input-field flex-1 text-sm"
                                placeholder="#ffffff"
                            />
                            <button
                                onClick={addCustomColor}
                                className="btn-secondary px-3"
                                title="Save Color"
                            >
                                <div className="icon-plus text-sm"></div>
                            </button>
                        </div>
                    </div>

                    {/* Preset Colors */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Preset Colors</label>
                        <div className="grid grid-cols-6 gap-2">
                            {presetColors.map((color, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                        selectedColor === color 
                                        ? 'border-[var(--primary-color)] scale-110' 
                                        : 'border-white/20'
                                    }`}
                                    style={{ backgroundColor: color }}
                                ></button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Colors */}
                    {customColors.length > 0 && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Your Colors</label>
                            <div className="grid grid-cols-6 gap-2">
                                {customColors.map((color, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleColorChange(color)}
                                        className="w-8 h-8 rounded-lg border-2 border-white/20 hover:border-[var(--primary-color)] transition-all"
                                        style={{ backgroundColor: color }}
                                    ></button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Material Properties */}
                    <div className="space-y-3">
                        <div>
                            <label className="flex items-center justify-between text-sm font-medium mb-2">
                                Metallic <span>{metallic.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={metallic}
                                onChange={(e) => {
                                    setMetallic(parseFloat(e.target.value));
                                    handleMaterialChange();
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="flex items-center justify-between text-sm font-medium mb-2">
                                Roughness <span>{roughness.toFixed(1)}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={roughness}
                                onChange={(e) => {
                                    setRoughness(parseFloat(e.target.value));
                                    handleMaterialChange();
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Apply Button */}
                    <button
                        onClick={() => {
                            handleColorChange(selectedColor);
                            onClose();
                        }}
                        className="btn-primary w-full mt-4"
                    >
                        Apply Color & Material
                    </button>
                </div>
            </div>
        );
    } catch (error) {
        console.error('ColorPicker component error:', error);
        return null;
    }
}