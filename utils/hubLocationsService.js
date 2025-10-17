// Hub Locations Service - Manages location data and geolocation functionality
const HubLocationsService = {
    // Sample hub locations across Bangladesh
    getHubLocations() {
        return [
            {
                id: 1,
                name: "CarHub360 Dhaka Central",
                address: "House 45, Road 15, Dhanmondi, Dhaka 1209",
                phone: "+880 1700-111001",
                email: "dhaka@carhub360.com",
                lat: 23.7465,
                lng: 90.3784,
                services: ["Car Rental", "Car Sales", "Service Center", "24/7 Support"],
                workingHours: "24/7 Available",
                manager: "Md. Rahman Sheikh",
                established: "2020"
            },
            {
                id: 2,
                name: "CarHub360 Gulshan Branch",
                address: "Plot 12, Road 108, Gulshan 2, Dhaka 1212",
                phone: "+880 1700-111002",
                email: "gulshan@carhub360.com",
                lat: 23.7808,
                lng: 90.4176,
                services: ["Luxury Car Rental", "Premium Services", "VIP Lounge"],
                workingHours: "6:00 AM - 12:00 AM",
                manager: "Ms. Fatima Khan",
                established: "2021"
            },
            {
                id: 3,
                name: "CarHub360 Chittagong Port",
                address: "CDA Avenue, Nasirabad, Chittagong 4000",
                phone: "+880 1700-111003",
                email: "chittagong@carhub360.com",
                lat: 22.3569,
                lng: 91.7832,
                services: ["Car Rental", "Port Services", "Commercial Vehicles"],
                workingHours: "5:00 AM - 11:00 PM",
                manager: "Md. Karim Ahmed",
                established: "2021"
            },
            {
                id: 4,
                name: "CarHub360 Sylhet Hub",
                address: "Zindabazar, Sylhet 3100",
                phone: "+880 1700-111004",
                email: "sylhet@carhub360.com",
                lat: 24.8949,
                lng: 91.8687,
                services: ["Tourist Packages", "Hill Track Vehicles", "Guide Services"],
                workingHours: "7:00 AM - 10:00 PM",
                manager: "Md. Nasir Uddin",
                established: "2022"
            },
            {
                id: 5,
                name: "CarHub360 Cox's Bazar",
                address: "Hotel Motel Zone, Cox's Bazar 4700",
                phone: "+880 1700-111005",
                email: "coxsbazar@carhub360.com",
                lat: 21.4272,
                lng: 92.0058,
                services: ["Beach Tourism", "Resort Transfers", "Adventure Vehicles"],
                workingHours: "6:00 AM - 11:00 PM",
                manager: "Ms. Rashida Begum",
                established: "2022"
            },
            {
                id: 6,
                name: "CarHub360 Rajshahi Center",
                address: "Saheb Bazar, Rajshahi 6000",
                phone: "+880 1700-111006",
                email: "rajshahi@carhub360.com",
                lat: 24.3636,
                lng: 88.6241,
                services: ["Agricultural Vehicles", "Rural Services", "Maintenance"],
                workingHours: "6:00 AM - 10:00 PM",
                manager: "Md. Abdul Halim",
                established: "2023"
            }
        ];
    },

    // Get user's current location
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser. Please enable location services or manually select a location.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    let errorMessage = 'Unable to get your location. ';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage += 'Location access denied. Please enable location services in your browser settings and try again.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage += 'Location information is unavailable. Please check your GPS or internet connection.';
                            break;
                        case error.TIMEOUT:
                            errorMessage += 'Location request timed out. Please try again or select a location manually.';
                            break;
                        default:
                            errorMessage += 'An unknown error occurred. Please try again or select a location manually.';
                            break;
                    }
                    
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: false, // Changed to false for better compatibility
                    timeout: 15000, // Increased timeout
                    maximumAge: 600000 // 10 minutes
                }
            );
        });
    },

    // Calculate distance between two points (Haversine formula)
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    toRadians(degrees) {
        return degrees * (Math.PI/180);
    },

    // Find nearest hub to user location
    async findNearestHub(userLat, userLng) {
        const hubs = this.getHubLocations();
        const hubsWithDistance = hubs.map(hub => ({
            ...hub,
            distance: this.calculateDistance(userLat, userLng, hub.lat, hub.lng)
        }));

        return hubsWithDistance.sort((a, b) => a.distance - b.distance);
    },

    // Generate turn-by-turn directions
    generateDirections(fromCoords, toHub) {
        const directions = [];
        const distance = this.calculateDistance(
            fromCoords.lat, fromCoords.lng,
            toHub.lat, toHub.lng
        );

        // Generate realistic directions based on hub location
        if (toHub.name.includes("Gulshan")) {
            directions.push(
                { step: 1, instruction: "Head north towards Gulshan Avenue", distance: "0.3 km", duration: "2 min" },
                { step: 2, instruction: "Turn right onto Gulshan Avenue from your current location", distance: "0.8 km", duration: "4 min" },
                { step: 3, instruction: "Continue straight through Gulshan Circle 1", distance: "0.6 km", duration: "3 min" },
                { step: 4, instruction: "Turn left onto Road 108 (towards Gulshan 2)", distance: "0.4 km", duration: "2 min" },
                { step: 5, instruction: "CarHub360 Gulshan Branch will be on your right at Plot 12", distance: "0.1 km", duration: "1 min" }
            );
        } else if (toHub.name.includes("Dhanmondi")) {
            directions.push(
                { step: 1, instruction: "Head south towards Dhanmondi Road 27", distance: "0.5 km", duration: "3 min" },
                { step: 2, instruction: "Turn right onto Dhanmondi Road 27", distance: "0.7 km", duration: "4 min" },
                { step: 3, instruction: "Turn left onto Road 15", distance: "0.3 km", duration: "2 min" },
                { step: 4, instruction: "CarHub360 Dhaka Central will be at House 45 on your left", distance: "0.1 km", duration: "1 min" }
            );
        } else if (toHub.name.includes("Chittagong")) {
            directions.push(
                { step: 1, instruction: "Head towards CDA Avenue", distance: "0.8 km", duration: "5 min" },
                { step: 2, instruction: "Continue on CDA Avenue towards Nasirabad", distance: "1.2 km", duration: "7 min" },
                { step: 3, instruction: "CarHub360 Chittagong Port will be on your right", distance: "0.3 km", duration: "2 min" }
            );
        } else {
            // Generic directions
            directions.push(
                { step: 1, instruction: "Head towards main road", distance: "0.2 km", duration: "1 min" },
                { step: 2, instruction: `Navigate to ${toHub.address.split(',')[0]}`, distance: `${(distance * 0.7).toFixed(1)} km`, duration: `${Math.ceil(distance * 3)} min` },
                { step: 3, instruction: `Arrive at ${toHub.name}`, distance: `${(distance * 0.3).toFixed(1)} km`, duration: `${Math.ceil(distance * 2)} min` }
            );
        }

        return {
            totalDistance: `${distance.toFixed(1)} km`,
            totalDuration: `${Math.ceil(distance * 4)} min`,
            steps: directions
        };
    },

    // Get Google Maps URL for directions
    getGoogleMapsUrl(fromCoords, toHub) {
        if (fromCoords) {
            return `https://www.google.com/maps/dir/${fromCoords.lat},${fromCoords.lng}/${toHub.lat},${toHub.lng}`;
        } else {
            return `https://www.google.com/maps/search/?api=1&query=${toHub.lat},${toHub.lng}`;
        }
    }
};