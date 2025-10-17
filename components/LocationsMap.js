function LocationsMap({ hubLocations, selectedHub, onHubSelect, userLocation }) {
    const mapRef = React.useRef(null);
    const mapInstanceRef = React.useRef(null);
    const markersRef = React.useRef([]);

    React.useEffect(() => {
        try {
            // Initialize map
            if (!mapInstanceRef.current && mapRef.current) {
                mapInstanceRef.current = L.map(mapRef.current).setView([23.8103, 90.4125], 7);
                
                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(mapInstanceRef.current);

                // Fix: ensure Leaflet recalculates size after mount
                setTimeout(() => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize(false);
                    }
                }, 0);

                // Fix: invalidate on window resize
                const handleResize = () => {
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize(false);
                    }
                };
                window.addEventListener('resize', handleResize);
                // Store cleanup on the ref for removal later
                mapInstanceRef.current.__handleResize = handleResize;
            }

            // Clear existing markers
            markersRef.current.forEach(marker => {
                mapInstanceRef.current.removeLayer(marker);
            });
            markersRef.current = [];

            // Add hub markers
            hubLocations.forEach(hub => {
                const isSelected = selectedHub && selectedHub.id === hub.id;
                
                // Create custom icon
                const icon = L.divIcon({
                    html: `
                        <div style="
                            background: ${isSelected ? '#ff4081' : '#00d4ff'};
                            border-radius: 50%;
                            width: 30px;
                            height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            font-size: 16px;
                            color: white;
                            font-weight: bold;
                        ">
                            🚗
                        </div>
                    `,
                    className: 'custom-marker',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                const marker = L.marker([hub.lat, hub.lng], { icon })
                    .addTo(mapInstanceRef.current);

                // Create popup content
                const distanceText = hub.distance ? `<br><strong>Distance:</strong> ${hub.distance.toFixed(1)} km` : '';
                const popupContent = `
                    <div style="color: #ffffff; min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; color: #00d4ff; font-size: 16px;">${hub.name}</h3>
                        <p style="margin: 0 0 4px 0; font-size: 14px;">${hub.address}</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Phone:</strong> ${hub.phone}</p>
                        <p style="margin: 0 0 4px 0; font-size: 14px;"><strong>Hours:</strong> ${hub.workingHours}</p>
                        ${distanceText}
                    </div>
                `;

                marker.bindPopup(popupContent, {
                    maxWidth: 300,
                    className: 'custom-popup'
                });

                // Add click event
                marker.on('click', () => {
                    onHubSelect(hub);
                });

                markersRef.current.push(marker);
            });

            // Add user location marker if available
            if (userLocation) {
                const userIcon = L.divIcon({
                    html: `
                        <div style="
                            background: #4caf50;
                            border-radius: 50%;
                            width: 20px;
                            height: 20px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            font-size: 12px;
                            color: white;
                        ">
                            📍
                        </div>
                    `,
                    className: 'user-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .addTo(mapInstanceRef.current)
                    .bindPopup('Your Location');

                markersRef.current.push(userMarker);

                // Center map on user location
                mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 10);
            }

            // Focus on selected hub
            if (selectedHub && mapInstanceRef.current) {
                mapInstanceRef.current.setView([selectedHub.lat, selectedHub.lng], 12);
            }

            // After markers and view changes, ensure tiles/layout are correct
            if (mapInstanceRef.current) {
                setTimeout(() => mapInstanceRef.current && mapInstanceRef.current.invalidateSize(false), 0);
            }

        } catch (error) {
            console.error('LocationsMap error:', error);
        }
    }, [hubLocations, selectedHub, userLocation]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                if (mapInstanceRef.current.__handleResize) {
                    window.removeEventListener('resize', mapInstanceRef.current.__handleResize);
                }
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            ref={mapRef} 
            className="map-container"
            style={{ minHeight: '480px' }}
            data-name="locations-map" 
            data-file="components/LocationsMap.js"
        >
        </div>
    );
}