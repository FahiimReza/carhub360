// Configurator Header Component
function ConfiguratorHeader({ onSave, onBaseModelSelect }) {
    const [activeModel, setActiveModel] = React.useState('sedan');

    try {
        const handleModelSelect = (modelType) => {
            setActiveModel(modelType);
            if (onBaseModelSelect) {
                onBaseModelSelect(modelType);
            }
        };

        const carModels = [
            { id: 'sedan', name: 'Sedan', icon: 'icon-car' },
            { id: 'suv', name: 'SUV', icon: 'icon-truck' },
            { id: 'sports', name: 'Sports', icon: 'icon-zap' }
        ];

        return (
            <div className="glass-card p-4 flex items-center justify-between">
                {/* Logo and Title */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="icon-car text-2xl text-[var(--primary-color)]"></div>
                        <div>
                            <h1 className="text-xl font-bold">Car Configurator</h1>
                            <p className="text-xs text-[var(--text-secondary)]">Build Your Dream Car</p>
                        </div>
                    </div>
                </div>

                {/* Model Selection */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-[var(--text-secondary)]">Base Model:</span>
                    {carModels.map(model => (
                        <button
                            key={model.id}
                            onClick={() => handleModelSelect(model.id)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                                activeModel === model.id 
                                ? 'btn-primary' 
                                : 'btn-secondary'
                            }`}
                        >
                            <div className={`${model.icon} text-sm mr-2`}></div>
                            {model.name}
                        </button>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => window.location.href = 'index.html'}
                        className="btn-secondary"
                        title="Back to Home"
                    >
                        <div className="icon-home text-sm mr-2"></div>
                        Home
                    </button>
                    <button 
                        onClick={onSave}
                        className="btn-primary"
                        title="Save Configuration"
                    >
                        <div className="icon-save text-sm mr-2"></div>
                        Save
                    </button>
                </div>
            </div>
        );
    } catch (error) {
        console.error('ConfiguratorHeader component error:', error);
        return (
            <div className="glass-card p-4 flex items-center justify-center">
                <span className="text-[var(--text-secondary)]">Header Loading...</span>
            </div>
        );
    }
}