// Configurator Toolbar Component
function ConfiguratorToolbar({ onUndo, onRedo, onSave }) {
    const [isExporting, setIsExporting] = React.useState(false);
    const [showShareModal, setShowShareModal] = React.useState(false);

    try {
        const handleExportImage = async () => {
            setIsExporting(true);
            try {
                const viewer = document.getElementById('carModelViewer');
                if (viewer) {
                    const url = await viewer.toDataURL();
                    const link = document.createElement('a');
                    link.download = `car-config-${Date.now()}.png`;
                    link.href = url;
                    link.click();
                }
            } catch (error) {
                console.error('Export failed:', error);
            } finally {
                setIsExporting(false);
            }
        };

        const handleShare = () => {
            setShowShareModal(true);
        };

        const handleReset = () => {
            if (confirm('Are you sure you want to reset the entire configuration?')) {
                window.location.reload();
            }
        };

        return (
            <>
                <div className="glass-card p-4 flex items-center justify-between">
                    {/* Left Actions */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onUndo}
                            className="btn-secondary"
                            title="Undo Last Action"
                        >
                            <div className="icon-undo text-sm mr-1"></div>
                            Undo
                        </button>
                        <button
                            onClick={onRedo}
                            className="btn-secondary"
                            title="Redo Action"
                        >
                            <div className="icon-redo text-sm mr-1"></div>
                            Redo
                        </button>
                        <button
                            onClick={handleReset}
                            className="btn-secondary text-[var(--warning-color)]"
                            title="Reset Configuration"
                        >
                            <div className="icon-refresh-cw text-sm mr-1"></div>
                            Reset
                        </button>
                    </div>

                    {/* Center Info */}
                    <div className="flex items-center space-x-4">
                        <div className="text-center">
                            <div className="text-xs text-[var(--text-secondary)]">Active Tool</div>
                            <div className="text-sm font-medium">3D Configurator</div>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleExportImage}
                            disabled={isExporting}
                            className="btn-secondary"
                            title="Export as Image"
                        >
                            <div className={`${isExporting ? 'icon-loader animate-spin' : 'icon-camera'} text-sm mr-1`}></div>
                            Export
                        </button>
                        <button
                            onClick={handleShare}
                            className="btn-secondary"
                            title="Share Configuration"
                        >
                            <div className="icon-share text-sm mr-1"></div>
                            Share
                        </button>
                        <button
                            onClick={onSave}
                            className="btn-primary"
                            title="Save Configuration"
                        >
                            <div className="icon-save text-sm mr-1"></div>
                            Save Config
                        </button>
                    </div>
                </div>

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="glass-card p-6 max-w-md w-full mx-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold">Share Configuration</h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="icon-x text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                ></button>
                            </div>
                            <div className="space-y-3">
                                <button className="w-full btn-secondary text-left">
                                    <div className="icon-link text-sm mr-2"></div>
                                    Copy Link
                                </button>
                                <button className="w-full btn-secondary text-left">
                                    <div className="icon-mail text-sm mr-2"></div>
                                    Email Configuration
                                </button>
                                <button className="w-full btn-secondary text-left">
                                    <div className="icon-share-2 text-sm mr-2"></div>
                                    Social Media
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    } catch (error) {
        console.error('ConfiguratorToolbar component error:', error);
        return (
            <div className="glass-card p-4 flex items-center justify-center">
                <span className="text-[var(--text-secondary)]">Toolbar Loading...</span>
            </div>
        );
    }
}