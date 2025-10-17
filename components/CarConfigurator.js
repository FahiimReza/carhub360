// Main Car Configurator Component
function CarConfigurator() {
    const [engine, setEngine] = React.useState(null);
    const [selectedCategory, setSelectedCategory] = React.useState('body');
    const [selectedPart, setSelectedPart] = React.useState(null);
    const [showColorPicker, setShowColorPicker] = React.useState(false);
    const [isEngineReady, setIsEngineReady] = React.useState(false);
    const [notification, setNotification] = React.useState(null);
    const [stats, setStats] = React.useState({
        cost: 0, weight: 0, hp: 0, torque: 0, efficiency: 0
    });

    try {
        React.useEffect(() => {
            const initEngine = () => {
                const container = document.getElementById('viewport3d');
                if (container && typeof window.CarConfiguratorEngine !== 'undefined') {
                    try {
                        const newEngine = new window.CarConfiguratorEngine(container);
                        setEngine(newEngine);
                        setIsEngineReady(true);
                        showNotification('3D Engine initialized successfully!', 'success');
                    } catch (error) {
                        console.error('Engine initialization error:', error);
                        showNotification('Failed to initialize 3D engine', 'error');
                    }
                }
            };

            // Try to initialize immediately, then retry if needed
            initEngine();
            const retryTimer = setTimeout(initEngine, 2000);
            
            // Listen for stats updates
            const handleStatsUpdate = (event) => {
                setStats(event.detail);
            };
            
            window.addEventListener('statsUpdated', handleStatsUpdate);
            
            return () => {
                clearTimeout(retryTimer);
                window.removeEventListener('statsUpdated', handleStatsUpdate);
                if (engine) {
                    engine.dispose();
                }
            };
        }, []);

        const showNotification = (message, type = 'info') => {
            setNotification({ message, type });
            setTimeout(() => setNotification(null), 3000);
        };

        const handleBaseModelSelect = (modelType) => {
            if (engine && isEngineReady) {
                engine.loadBaseModel(modelType);
                showNotification(`${modelType.charAt(0).toUpperCase() + modelType.slice(1)} chassis loaded!`, 'success');
            }
        };

        const handlePartAdd = (partData) => {
            if (engine && isEngineReady) {
                engine.addPart(partData);
                showNotification(`${partData.name} added successfully!`, 'success');
            }
        };

        const handlePartSelect = (partId) => {
            setSelectedPart(partId);
            setShowColorPicker(true);
        };

        const handleColorChange = (color) => {
            if (engine && selectedPart) {
                engine.changePartColor(selectedPart, color);
            }
        };

        const handleUndo = () => {
            if (engine) {
                engine.undo();
                showNotification('Action undone', 'info');
            }
        };

        const handleRedo = () => {
            if (engine) {
                engine.redo();
                showNotification('Action redone', 'info');
            }
        };

        const handleSave = () => {
            if (engine) {
                const config = engine.exportConfiguration();
                const configJson = JSON.stringify(config, null, 2);
                const blob = new Blob([configJson], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `car-config-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showNotification('Configuration saved successfully!', 'success');
            }
        };

        return (
            <>
                {/* Notification Toast */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 glass-card p-4 rounded-lg transition-all ${
                        notification.type === 'success' ? 'border-[var(--success-color)]' : 
                        notification.type === 'error' ? 'border-[var(--warning-color)]' : 'border-[var(--primary-color)]'
                    }`}>
                        <div className="flex items-center space-x-2">
                            <div className={`${
                                notification.type === 'success' ? 'icon-check-circle text-[var(--success-color)]' :
                                notification.type === 'error' ? 'icon-alert-circle text-[var(--warning-color)]' :
                                'icon-info text-[var(--primary-color)]'
                            }`}></div>
                            <span className="text-sm">{notification.message}</span>
                        </div>
                    </div>
                )}

                <div className="configurator-grid">
                    <div className="grid-header">
                        <ConfiguratorHeader 
                            onSave={handleSave}
                            onBaseModelSelect={handleBaseModelSelect}
                        />
                    </div>
                    
                    <div className="grid-parts">
                        <PartsLibrary 
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            onPartAdd={handlePartAdd}
                            onPartSelect={handlePartSelect}
                        />
                    </div>
                    
                    <div className="grid-viewport">
                        <Viewport3D />
                    </div>
                    
                    <div className="grid-stats">
                        <StatsPanel 
                            stats={stats}
                            selectedPart={selectedPart}
                            showColorPicker={showColorPicker}
                            onColorChange={handleColorChange}
                            onColorPickerClose={() => setShowColorPicker(false)}
                        />
                    </div>
                    
                    <div className="grid-toolbar">
                        <ConfiguratorToolbar
                            onUndo={handleUndo}
                            onRedo={handleRedo}
                            onSave={handleSave}
                        />
                    </div>
                </div>
            </>
        );
    } catch (error) {
        console.error('CarConfigurator component error:', error);
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-primary)]">
                <div className="glass-card p-8 text-center max-w-md">
                    <div className="icon-alert-triangle text-6xl text-[var(--warning-color)] mb-4"></div>
                    <h2 className="text-2xl font-bold mb-4">Configurator Error</h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        Unable to load the car configurator. Please check your browser compatibility.
                    </p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn-primary w-full"
                        >
                            Retry Loading
                        </button>
                        <button 
                            onClick={() => window.location.href = 'index.html'} 
                            className="btn-secondary w-full"
                        >
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
