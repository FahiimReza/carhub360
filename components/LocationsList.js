function LocationsList({ hubLocations, selectedHub, onHubSelect, showDistance = false }) {
    try {
        const [searchTerm, setSearchTerm] = React.useState('');
        const [selectedService, setSelectedService] = React.useState('');

        // Get unique services for filter
        const allServices = [...new Set(
            hubLocations.flatMap(hub => hub.services)
        )];

        // Filter locations based on search and service
        const filteredLocations = hubLocations.filter(hub => {
            const matchesSearch = hub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                hub.address.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesService = !selectedService || hub.services.includes(selectedService);
            return matchesSearch && matchesService;
        });

        return (
            <div className="glass-card p-6" data-name="locations-list" data-file="components/LocationsList.js">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <div className="icon-list text-xl text-[var(--primary-color)]"></div>
                    {showDistance ? 'Nearest Locations' : 'All Locations'}
                </h2>

                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--primary-color)] focus:outline-none"
                        />
                        <div className="icon-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] text-lg"></div>
                    </div>

                    <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full p-3 rounded-lg border border-white/20 bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:border-[var(--primary-color)] focus:outline-none"
                    >
                        <option value="">All Services</option>
                        {allServices.map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>

                {/* Locations List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredLocations.length === 0 ? (
                        <div className="text-center py-8 text-[var(--text-secondary)]">
                            <div className="icon-map-pin text-4xl mb-2"></div>
                            <p>No locations found matching your criteria</p>
                        </div>
                    ) : (
                        filteredLocations.map(hub => {
                            const isSelected = selectedHub && selectedHub.id === hub.id;
                            return (
                                <div
                                    key={hub.id}
                                    onClick={() => onHubSelect(hub)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                        isSelected 
                                            ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10' 
                                            : 'border-white/10 hover:border-[var(--primary-color)]/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={`font-semibold ${isSelected ? 'text-[var(--primary-color)]' : ''}`}>
                                            {hub.name}
                                        </h3>
                                        {showDistance && hub.distance && (
                                            <span className="text-sm bg-[var(--success-color)]/20 text-[var(--success-color)] px-2 py-1 rounded-full">
                                                {hub.distance.toFixed(1)} km
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                                        {hub.address}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="icon-clock text-sm text-[var(--accent-color)]"></div>
                                            <span className="text-[var(--text-secondary)]">{hub.workingHours}</span>
                                        </div>
                                        
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`tel:${hub.phone}`);
                                                }}
                                                className="p-2 rounded-full bg-[var(--primary-color)]/20 hover:bg-[var(--primary-color)]/30 transition-colors"
                                                title="Call"
                                            >
                                                <div className="icon-phone text-sm text-[var(--primary-color)]"></div>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}`, '_blank');
                                                }}
                                                className="p-2 rounded-full bg-[var(--accent-color)]/20 hover:bg-[var(--accent-color)]/30 transition-colors"
                                                title="Get Directions"
                                            >
                                                <div className="icon-navigation text-sm text-[var(--accent-color)]"></div>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Services Tags */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {hub.services.slice(0, 3).map((service, idx) => (
                                            <span 
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-white/10 text-[var(--text-secondary)] rounded"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                        {hub.services.length > 3 && (
                                            <span className="text-xs px-2 py-1 bg-white/10 text-[var(--text-secondary)] rounded">
                                                +{hub.services.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('LocationsList component error:', error);
        return null;
    }
}
