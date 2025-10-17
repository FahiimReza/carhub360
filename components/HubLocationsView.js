function HubLocationsView() {
    try {
        const [selectedHub, setSelectedHub] = React.useState(null);
        const [userLocation, setUserLocation] = React.useState(null);
        const [nearestHubs, setNearestHubs] = React.useState([]);
        const [isLoading, setIsLoading] = React.useState(false);
        const [error, setError] = React.useState(null);
        const [selectedCity, setSelectedCity] = React.useState('');
        const [directions, setDirections] = React.useState(null);

        const hubLocations = HubLocationsService.getHubLocations();
        
        // Get unique cities for fallback selection
        const cities = [...new Set(hubLocations.map(hub => {
            const cityName = hub.address.split(',').slice(-2, -1)[0]?.trim();
            return cityName || hub.name.split(' ')[1]; // Fallback to hub name
        }))];

        const handleFindMyLocation = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const location = await HubLocationsService.getCurrentLocation();
                setUserLocation(location);
                
                const nearest = await HubLocationsService.findNearestHub(location.lat, location.lng);
                setNearestHubs(nearest);
                
                // Auto-select the nearest hub
                if (nearest.length > 0) {
                    setSelectedHub(nearest[0]);
                }
            } catch (error) {
                console.error('Error getting location:', error);
                setError(error.message || 'Unable to get your location. Please try the city selector below.');
            } finally {
                setIsLoading(false);
            }
        };

        const handleCitySelect = (cityName) => {
            const cityHubs = hubLocations.filter(hub => 
                hub.address.toLowerCase().includes(cityName.toLowerCase()) ||
                hub.name.toLowerCase().includes(cityName.toLowerCase())
            );
            
            if (cityHubs.length > 0) {
                setNearestHubs(cityHubs);
                setSelectedHub(cityHubs[0]);
                setError(null);
            }
        };

        const getDirections = (hub) => {
            if (!userLocation) {
                // Use default Dhaka coordinates if user location not available
                const defaultLocation = { lat: 23.8103, lng: 90.4125 };
                setUserLocation(defaultLocation);
                const generatedDirections = HubLocationsService.generateDirections(defaultLocation, hub);
                setDirections(generatedDirections);
                setSelectedHub(hub);
            } else {
                const generatedDirections = HubLocationsService.generateDirections(userLocation, hub);
                setDirections(generatedDirections);
                setSelectedHub(hub);
            }
        };

        return (
            <div className="min-h-screen bg-[var(--bg-primary)]" data-name="hub-locations-view" data-file="components/HubLocationsView.js">
                <Header />
                
                <div className="container mx-auto px-6 pt-32 pb-8">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 text-shadow">
                            Our Hub Locations
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
                            Find CarHub360 service hubs across Bangladesh. Get directions, contact information, and services available at each location.
                        </p>
                        
                        <button 
                            onClick={handleFindMyLocation}
                            disabled={isLoading}
                            className="btn-primary flex items-center mx-auto gap-2"
                        >
                            <div className="icon-map-pin text-xl text-white"></div>
                            {isLoading ? 'Finding Your Location...' : 'Find My Location'}
                        </button>
                        
                        {error && (
                            <div className="mt-4 p-4 glass-card border-red-500/20 text-red-400 max-w-md mx-auto">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="icon-alert-circle text-xl"></div>
                                    {error}
                                </div>
                                
                                {/* City Selector Fallback */}
                                <div className="border-t border-white/10 pt-3">
                                    <p className="text-sm text-[var(--text-secondary)] mb-2">
                                        Or select your city manually:
                                    </p>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => {
                                            setSelectedCity(e.target.value);
                                            if (e.target.value) {
                                                handleCitySelect(e.target.value);
                                            }
                                        }}
                                        className="w-full p-2 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none text-sm"
                                    >
                                        <option value="">Select a city...</option>
                                        <option value="Dhaka">Dhaka</option>
                                        <option value="Chittagong">Chittagong</option>
                                        <option value="Sylhet">Sylhet</option>
                                        <option value="Cox's Bazar">Cox's Bazar</option>
                                        <option value="Rajshahi">Rajshahi</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Map Section */}
                        <div className="lg:col-span-2">
                            <div className="glass-card p-6">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <div className="icon-map text-xl text-[var(--primary-color)]"></div>
                                    Interactive Map
                                </h2>
                                <LocationsMap 
                                    hubLocations={hubLocations}
                                    selectedHub={selectedHub}
                                    onHubSelect={setSelectedHub}
                                    userLocation={userLocation}
                                />
                            </div>
                        </div>

                        {/* Locations List */}
                        <div className="lg:col-span-1">
                            <LocationsList 
                                hubLocations={nearestHubs.length > 0 ? nearestHubs : hubLocations}
                                selectedHub={selectedHub}
                                onHubSelect={setSelectedHub}
                                showDistance={nearestHubs.length > 0}
                            />
                        </div>
                    </div>

                    {/* Selected Hub Details */}
                    {selectedHub && (
                        <div className="mt-8 glass-card p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-2xl font-bold mb-4 text-[var(--primary-color)]">
                                        {selectedHub.name}
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="icon-map-pin text-xl text-[var(--accent-color)]"></div>
                                            <span>{selectedHub.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="icon-phone text-xl text-[var(--accent-color)]"></div>
                                            <a href={`tel:${selectedHub.phone}`} className="hover:text-[var(--primary-color)] transition-colors">
                                                {selectedHub.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="icon-mail text-xl text-[var(--accent-color)]"></div>
                                            <a href={`mailto:${selectedHub.email}`} className="hover:text-[var(--primary-color)] transition-colors">
                                                {selectedHub.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="icon-clock text-xl text-[var(--accent-color)]"></div>
                                            <span>{selectedHub.workingHours}</span>
                                        </div>
                                        {selectedHub.distance && (
                                            <div className="flex items-center gap-3">
                                                <div className="icon-navigation text-xl text-[var(--success-color)]"></div>
                                                <span className="font-semibold">
                                                    {selectedHub.distance.toFixed(1)} km away
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-lg font-semibold mb-3">Available Services</h4>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedHub.services.map((service, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-full text-sm"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                                        <p><strong>Manager:</strong> {selectedHub.manager}</p>
                                        <p><strong>Established:</strong> {selectedHub.established}</p>
                                    </div>
                                    
                                    <div className="mt-4 flex gap-2">
                                        <button 
                                            onClick={() => getDirections(selectedHub)}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            <div className="icon-navigation text-xl text-white"></div>
                                            Get Directions
                                        </button>
                                        <button 
                                            onClick={() => window.open(HubLocationsService.getGoogleMapsUrl(userLocation, selectedHub), '_blank')}
                                            className="btn-secondary flex items-center justify-center gap-2"
                                        >
                                            <div className="icon-map text-xl"></div>
                                            Google Maps
                                        </button>
                                        <button 
                                            onClick={() => window.open(`tel:${selectedHub.phone}`)}
                                            className="btn-secondary flex items-center justify-center gap-2"
                                        >
                                            <div className="icon-phone text-xl"></div>
                                            Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Turn-by-Turn Directions */}
                    {directions && selectedHub && (
                        <div className="mt-8 glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-[var(--primary-color)]">
                                    Directions to {selectedHub.name}
                                </h3>
                                <button 
                                    onClick={() => setDirections(null)}
                                    className="text-[var(--text-secondary)] hover:text-[var(--primary-color)]"
                                >
                                    <div className="icon-x text-xl"></div>
                                </button>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="glass-card p-4 text-center">
                                    <div className="icon-navigation text-2xl text-[var(--success-color)] mb-2"></div>
                                    <div className="font-semibold">{directions.totalDistance}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">Total Distance</div>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <div className="icon-clock text-2xl text-[var(--accent-color)] mb-2"></div>
                                    <div className="font-semibold">{directions.totalDuration}</div>
                                    <div className="text-sm text-[var(--text-secondary)]">Estimated Time</div>
                                </div>
                                <div className="glass-card p-4 text-center">
                                    <div className="icon-map-pin text-2xl text-[var(--primary-color)] mb-2"></div>
                                    <div className="font-semibold">{directions.steps.length} Steps</div>
                                    <div className="text-sm text-[var(--text-secondary)]">Turn-by-Turn</div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {directions.steps.map((step, index) => (
                                    <div key={index} className="glass-card p-4 flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-bold">
                                            {step.step}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold mb-1">{step.instruction}</div>
                                            <div className="text-sm text-[var(--text-secondary)]">
                                                {step.distance} • {step.duration}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('HubLocationsView component error:', error);
        return null;
    }
}