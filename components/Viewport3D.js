// Full Car Configurator with Three.js, Full Screen Model Scaling, Easy Mouse Controls, and Original Textures
function Viewport3D() {
    const containerRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showWelcome, setShowWelcome] = React.useState(true);
    const [currentModel, setCurrentModel] = React.useState('1975_porsche');
    const [selectedColor, setSelectedColor] = React.useState([1, 1, 1, 1]); // Default neutral
    const [metallic, setMetallic] = React.useState(0.5);
    const [roughness, setRoughness] = React.useState(0.5);
    const [showSidebar, setShowSidebar] = React.useState(false);
    const sceneRef = React.useRef(null);
    const rendererRef = React.useRef(null);
    const cameraRef = React.useRef(null);
    const controlsRef = React.useRef(null);
    const modelRef = React.useRef(null);
    const fileInputRef = React.useRef(null);
    const ambientLightRef = React.useRef(null);
    const keyLightRef = React.useRef(null);
    const fillLightRef = React.useRef(null);

    const [lightingPreset, setLightingPreset] = React.useState('Studio');
    const [ambientIntensity, setAmbientIntensity] = React.useState(0.8);
    const [keyIntensity, setKeyIntensity] = React.useState(2.0);

    // Dynamic models from uploaded assets
    const availableModels = [
        { key: '1975_porsche', name: '1975 Porsche 911 Turbo', path: '/assets/models/1975_porsche/scene.gltf' },
        { key: '2010_porsche_918_spyder', name: '2010 Porsche 918 Spyder', path: '/assets/models/2010_porsche_918_spyder/scene.gltf' },
        { key: '2013__porsche_917_living_legend_concept', name: '2013 Porsche 917 Living Legend Concept', path: '/assets/models/2013__porsche_917_living_legend_concept/scene.gltf' },
        { key: 'porsche_911', name: 'Porsche 911', path: '/assets/models/porsche_911/scene.gltf' },
        { key: '2015_mazda_rx-vision_concept', name: '2015 Mazda RX-Vision Concept', path: '/assets/models/2015_mazda_rx-vision_concept/scene.gltf' },
        { key: 'a8_bugatti_vision_gran_turismo', name: 'Bugatti Vision Gran Turismo', path: '/assets/models/a8_bugatti_vision_gran_turismo/scene.gltf' },
        { key: 'corvette_stingray', name: 'Corvette Stingray', path: '/assets/models/corvette_stingray/scene.gltf' },
        { key: 'lamborgini_terzo', name: 'Lamborghini Terzo Millennio', path: '/assets/models/lamborgini_terzo/scene.gltf' },
        { key: 'mazda_furai', name: 'Mazda Furai', path: '/assets/models/mazda_furai/scene.gltf' }
    ];

    // Lighting presets
    const lightingPresets = [
        { name: 'Studio', ambient: 0.8, key: 2.0, fill: 1.0 },
        { name: 'Outdoor', ambient: 0.6, key: 1.5, fill: 0.8 },
        { name: 'Dramatic', ambient: 0.3, key: 3.0, fill: 0.5 },
        { name: 'Night', ambient: 0.2, key: 1.0, fill: 0.3 }
    ];

    const colorPresets = [
        { name: 'Metallic Red', color: [0.8, 0.1, 0.1, 1], hex: '#dc143c' },
        { name: 'Pearl White', color: [1, 1, 1, 1], hex: '#ffffff' },
        { name: 'Carbon Black', color: [0.1, 0.1, 0.1, 1], hex: '#1a1a1a' },
        { name: 'Electric Blue', color: [0.1, 0.3, 0.8, 1], hex: '#1e3a8a' },
        { name: 'Racing Yellow', color: [1, 0.8, 0.1, 1], hex: '#facc15' },
        { name: 'Forest Green', color: [0.1, 0.5, 0.2, 1], hex: '#15803d' }
    ];

    // Handle file upload for custom GLTF/GLB
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.gltf') || file.name.endsWith('.glb'))) {
            const url = URL.createObjectURL(file);
            const folderName = file.name.replace(/\.(gltf|glb)$/, '');
            const newModel = { 
                key: folderName, 
                name: file.name, 
                path: url 
            };
            setCurrentModel(folderName);
            loadModel(url);
            console.log('Loaded custom model:', newModel);
        }
    };

    const loadModel = (path) => {
        if (modelRef.current) {
            if (sceneRef.current) sceneRef.current.remove(modelRef.current);
        }
        const loader = new THREE.GLTFLoader();
        loader.load(
            path,
            (gltf) => {
                const model = gltf.scene;
                modelRef.current = model;
                fitCameraToModel(model);

                // Preserve original materials and textures - only adjust PBR properties
                model.traverse((node) => {
                    if (node.isMesh) {
                        node.castShadow = true;
                        node.receiveShadow = true;
                        if (node.material && (node.material.isMeshStandardMaterial || node.material.isMeshPhysicalMaterial)) {
                            node.material.metalness = metallic;
                            node.material.roughness = roughness;
                        }
                    }
                });
                if (sceneRef.current) sceneRef.current.add(model);

                // Apply color after load
                updateMaterials(selectedColor);

                setIsLoading(false);
            },
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('GLTF load error:', error);
                setIsLoading(false);
            }
        );
    };

    const fitCameraToModel = React.useCallback((model) => {
      if (!model || !cameraRef.current || !controlsRef.current) return;

      // Reset position
      model.position.set(0, 0, 0);

      // Compute bounding box
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      model.position.sub(center);

      //const maxDim = Math.max(size.x, size.y, size.z);
      const maxDim = Math.max(size.x, size.y, size.z);

      // Scale model to make it larger
      const targetMaxDim = 20; // Desired max dimension after scaling
      const scaleFactor = targetMaxDim / maxDim;
      model.scale.setScalar(scaleFactor);

      const fov = cameraRef.current.fov * (Math.PI / 180);

      // Calculate optimal camera distance based on scaled size
      const scaledMaxDim = maxDim * scaleFactor;
      const fitDistance = scaledMaxDim / (2 * Math.tan(fov / 2)) * 0.5; // Even closer!

      // Position camera for better view (lower angle)
      cameraRef.current.position.set(fitDistance * 0.5, fitDistance * 0.3, fitDistance);
      cameraRef.current.lookAt(0, 0, 0);

      const controls = controlsRef.current;
      controls.target.set(0, 0, 0);
      controls.minDistance = scaledMaxDim * 0.1; // Allow closer zoom
      controls.maxDistance = scaledMaxDim * 4;  // Allow farther zoom
      controls.update();
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            setTimeout(() => setShowWelcome(false), 2000);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const updateMaterials = (colorArray) => {
        if (modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child.isMesh && child.material && (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial)) {
                    const material = child.material;
                    // Apply color tint only to paint/body materials
                    if (material.name && (material.name.toLowerCase().includes('paint') || material.name.toLowerCase().includes('body') || material.name.toLowerCase().includes('exterior'))) {
                        material.color.setRGB(colorArray[0], colorArray[1], colorArray[2]);
                    }
                    material.metalness = metallic;
                    material.roughness = roughness;
                    material.needsUpdate = true;
                }
            });
        }
    };

    React.useEffect(() => {
        updateMaterials(selectedColor);
    }, [metallic, roughness, selectedColor]);

    React.useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111); // Darker background for high contrast
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
        cameraRef.current = camera;
        cameraRef.current.position.set(0, 2, 8);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio); // Full high-res for 2K monitors
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High-quality shadows
        rendererRef.current = renderer;

        const controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
        controlsRef.current = controls;
        controlsRef.current.target.set(0, 1, 0);

        // Dynamic lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        ambientLightRef.current = ambientLight;
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, keyIntensity);
        keyLight.position.set(5, 10, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 4096; // Higher res shadows
        keyLight.shadow.mapSize.height = 4096;
        keyLight.shadow.bias = -0.0001;
        keyLightRef.current = keyLight;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
        fillLight.position.set(-5, 5, -5);
        fillLightRef.current = fillLight;
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
        backLight.position.set(0, -5, 5);
        scene.add(backLight);

        // Load initial model
        const initialPath = availableModels.find(m => m.key === currentModel)?.path;
        if (initialPath) {
            loadModel(initialPath);
        }

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (rendererRef.current) rendererRef.current.dispose();
            if (sceneRef.current) {
                sceneRef.current.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            }
        };
    }, [currentModel]);

    // Update lighting when intensities change
    React.useEffect(() => {
        if (ambientLightRef.current) {
            ambientLightRef.current.intensity = ambientIntensity;
        }
        if (keyLightRef.current) {
            keyLightRef.current.intensity = keyIntensity;
        }
    }, [ambientIntensity, keyIntensity]);

    // Apply lighting preset
    const applyLightingPreset = (presetName) => {
        const preset = lightingPresets.find(p => p.name === presetName);
        if (preset) {
            setAmbientIntensity(preset.ambient);
            setKeyIntensity(preset.key);
            setLightingPreset(presetName);
        }
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color.color);
        updateMaterials(color.color);
        window.dispatchEvent(new CustomEvent('carColorChange', { detail: { color: color.color, hex: color.hex } }));
    };

    const handleModelSelect = (key) => {
        setCurrentModel(key);
        setIsLoading(true);
        const path = availableModels.find(m => m.key === key)?.path;
        if (path) {
            loadModel(path);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Remove welcome screen for direct viewing

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
            {/* Full Screen Toggle Button */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="fixed top-4 left-4 z-50 p-3 rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-black/90 transition-all lg:hidden"
            >
                <i className="icon-menu text-lg"></i>
            </button>

            {/* Overlay Sidebar - Full Screen Overlay */}
            {showSidebar && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex">
                    <aside className="w-full h-full lg:w-80 bg-gradient-to-b from-gray-900/95 via-gray-800/80 to-gray-900/90 backdrop-blur-xl border-r border-white/10 overflow-y-auto relative shadow-2xl shadow-black/50">
                        <div className="p-4 sticky top-0 bg-gradient-to-b from-black/95 to-transparent z-10 relative">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-xl font-bold text-white drop-shadow-lg">Car Viewer</h1>
                                <button
                                    onClick={() => setShowSidebar(false)}
                                    className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hover:scale-110 shadow-md"
                                >
                                    <i className="icon-x text-lg"></i>
                                </button>
                            </div>
                            <p className="text-sm text-gray-300 mb-4 drop-shadow-sm">Explore 3D Car Models</p>
                        </div>
        
                        {/* Model Selection */}
                        <section className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-white mb-3">Select Model</h3>
                            <div className="space-y-2 mb-4">
                                {availableModels.map((model) => (
                                    <button
                                        key={model.key}
                                        onClick={() => {
                                            handleModelSelect(model.key);
                                            setShowSidebar(false);
                                        }}
                                        className={`w-full p-3 rounded-lg text-left transition-all ${currentModel === model.key ? 'bg-[var(--primary-color)] text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                    >
                                        {model.name}
                                    </button>
                                ))}
                            </div>
                        </section>
        
                        {/* Basic Color Selection */}
                        <section className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-white mb-3">Exterior Color</h3>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {colorPresets.map((preset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            handleColorSelect(preset);
                                            setShowSidebar(false);
                                        }}
                                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor[0] === preset.color[0] && selectedColor[1] === preset.color[1] && selectedColor[2] === preset.color[2] ? 'border-[var(--primary-color)] ring-2 ring-[var(--primary-color)]/30 scale-110' : 'border-gray-600 hover:scale-105'}`}
                                        style={{ backgroundColor: preset.hex }}
                                        title={preset.name}
                                    >
                                        {selectedColor[0] === preset.color[0] && selectedColor[1] === preset.color[1] && selectedColor[2] === preset.color[2] ? '✓' : ''}
                                    </button>
                                ))}
                            </div>
                        </section>
        
                        {/* Lighting Controls */}
                        <section className="p-4 border-t border-white/10">
                            <h3 className="text-sm font-semibold text-white mb-3">Lighting</h3>
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300 block mb-1">Preset</label>
                                    <select
                                        value={lightingPreset}
                                        onChange={(e) => applyLightingPreset(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-white/20 focus:border-[var(--primary-color)] text-sm"
                                    >
                                        {lightingPresets.map((preset) => (
                                            <option key={preset.name} value={preset.name}>{preset.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-300 block mb-1">Ambient</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={ambientIntensity}
                                        onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Low</span>
                                        <span>High</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-300 block mb-1">Key Light</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        value={keyIntensity}
                                        onChange={(e) => setKeyIntensity(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>Soft</span>
                                        <span>Intense</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            )}

            {/* Desktop Overlay Toggle - Small button for overlay */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="fixed top-4 left-4 z-50 p-3 rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-black/90 transition-all lg:block lg:z-[60]"
                title="Toggle Settings"
            >
                <i className="icon-settings text-lg"></i>
            </button>

            {/* True Full-Screen Viewport */}
            <main className={`fixed inset-0 z-0 transition-all duration-300 ${showSidebar ? 'lg:ml-80' : ''}`}>
                <div className="absolute inset-0">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                            <div className="text-center p-8">
                                <div className="animate-spin w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full mb-4 mx-auto"></div>
                                <h3 className="text-lg font-semibold text-white">Loading 3D Model</h3>
                                <p className="text-gray-300 text-sm">High-resolution car model loading...</p>
                            </div>
                        </div>
                    )}
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-grab active:cursor-grabbing"
                        style={{ width: '100vw', height: '100vh' }}
                    />
                </div>

                {/* Simple Bottom Controls for Mobile/Desktop */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-30">
                    <button
                        onClick={() => {
                            if (controlsRef.current) {
                                controlsRef.current.autoRotate = !controlsRef.current.autoRotate;
                            }
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        {controlsRef.current?.autoRotate ? 'Stop Rotate' : 'Auto Rotate'}
                    </button>
                    <button
                        onClick={() => {
                            if (modelRef.current && cameraRef.current && controlsRef.current) {
                              fitCameraToModel(modelRef.current);
                              controlsRef.current.autoRotate = true;
                              controlsRef.current.update();
                            }
                          }}
                        className="px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]/80 transition-all text-sm"
                    >
                        Reset View
                    </button>
                    <button
                        onClick={() => {
                            if (rendererRef.current) {
                                const dataURL = rendererRef.current.domElement.toDataURL('image/png');
                                const link = document.createElement('a');
                                link.download = `car-model-${currentModel}-${Date.now()}.png`;
                                link.href = dataURL;
                                link.click();
                            }
                        }}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all text-sm"
                    >
                        Screenshot
                    </button>
                </div>

                {/* Mobile Sidebar Toggle */}
                {!showSidebar && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="fixed top-4 left-4 z-40 p-3 rounded-full bg-black/80 text-white hover:bg-black/90 lg:hidden"
                    >
                        <i className="icon-menu"></i>
                    </button>
                )}
            </main>
        </div>
    );
}
