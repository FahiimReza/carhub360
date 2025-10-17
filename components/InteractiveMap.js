function InteractiveMap() {
  try {
    const [userLocation, setUserLocation] = React.useState(null);
    const [nearestHub, setNearestHub] = React.useState(null);
    const [locationError, setLocationError] = React.useState('');
    const [map, setMap] = React.useState(null);
    const mapRef = React.useRef(null);

    const hubs = [
      {
        id: 1,
        name: 'United International University',
        lat: 23.7975,
        lng: 90.4222,
        address: 'United City, Madani Ave, Dhaka 1212'
      },
      {
        id: 2,
        name: 'Fashertek Panir Pamp, Rainbow Valley, Notunbazar',
        lat: 23.8223,
        lng: 90.4482,
        address: 'Fashertek, Rainbow Valley, Notunbazar, Dhaka'
      }
    ];

    React.useEffect(() => {
      // Initialize Leaflet map
      if (mapRef.current && !map) {
        const leafletMap = L.map(mapRef.current).setView([23.8103, 90.4125], 12);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(leafletMap);

        // Add hub markers
        hubs.forEach(hub => {
          const marker = L.marker([hub.lat, hub.lng]).addTo(leafletMap);
          marker.bindPopup(`
            <div style="color: #333; font-family: Arial, sans-serif;">
              <h4 style="margin: 0 0 8px 0; color: #00d4ff;">${hub.name}</h4>
              <p style="margin: 0; font-size: 12px;">${hub.address}</p>
            </div>
          `);
          
          if (hub.id === 1) {
            marker.openPopup();
          }
        });

        setMap(leafletMap);

        // Cleanup function
        return () => {
          if (leafletMap) {
            leafletMap.remove();
          }
        };
      }
    }, []);

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const findNearestHub = (userLat, userLng) => {
      let nearest = null;
      let minDistance = Infinity;

      hubs.forEach(hub => {
        const distance = calculateDistance(userLat, userLng, hub.lat, hub.lng);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...hub, distance: distance.toFixed(2) };
        }
      });
      return nearest;
    };

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const location = { lat: userLat, lng: userLng };
          
          setUserLocation(location);
          const nearest = findNearestHub(userLat, userLng);
          setNearestHub(nearest);

          // Add user marker to map
          if (map) {
            const userMarker = L.marker([userLat, userLng], {
              icon: L.divIcon({
                html: '<div style="background: #ff4081; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                iconSize: [20, 20],
                className: 'user-location-marker'
              })
            }).addTo(map);
            
            userMarker.bindPopup('Your Location').openPopup();
            map.setView([userLat, userLng], 13);
          }
        },
        (error) => {
          setLocationError('Unable to retrieve your location. Please allow location access.');
        }
      );
    };

    const openDirections = () => {
      if (nearestHub) {
        const url = userLocation 
          ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${nearestHub.lat},${nearestHub.lng}`
          : `https://www.google.com/maps/search/${encodeURIComponent(nearestHub.name + ' ' + nearestHub.address)}`;
        window.open(url, '_blank');
      }
    };

    return (
      <div className="glass-card p-8" data-name="interactive-map" data-file="components/InteractiveMap.js">
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Our Hub Locations</h3>
        
        <div className="mb-4 flex gap-4 flex-wrap">
          <button
            onClick={getUserLocation}
            className="btn-primary flex items-center gap-2"
          >
            <div className="icon-map-pin text-sm"></div>
            Find My Location
          </button>
          
          {nearestHub && (
            <button
              onClick={openDirections}
              className="btn-secondary flex items-center gap-2"
            >
              <div className="icon-navigation text-sm"></div>
              Get Directions ({nearestHub.distance} km)
            </button>
          )}
        </div>

        {locationError && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {locationError}
          </div>
        )}

        {nearestHub && (
          <div className="bg-[var(--primary-color)]/20 text-[var(--primary-color)] p-3 rounded-lg mb-4 text-sm">
            Nearest hub: <strong>{nearestHub.name}</strong> ({nearestHub.distance} km away)
          </div>
        )}

        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg overflow-hidden border border-white/10"
          style={{ zIndex: 1 }}
        ></div>
        
        <div className="mt-4 text-center">
          <p className="text-[var(--text-secondary)] text-sm">
            Interactive map showing our hub locations • Click markers for more details
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('InteractiveMap component error:', error);
    return null;
  }
}
