export const COLORS = {
    gradientStart: '#102044',
    gradientEnd: '#FD9731',
    globeCore: '#000000'
};

// Porty w USA i Kanadzie
export const US_PORTS = [
    { name: "Los Angeles", lat: 33.7361, lng: -118.2920 },
    { name: "Long Beach", lat: 33.7700, lng: -118.1937 },
    { name: "Newark/New York", lat: 40.6895, lng: -74.1745 },
    { name: "Savannah", lat: 32.0809, lng: -81.0912 },
    { name: "Houston", lat: 29.7604, lng: -95.3698 },
    { name: "Seattle", lat: 47.6062, lng: -122.3321 }
];

export const CANADA_PORTS = [
    { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
    { name: "Montreal", lat: 45.5017, lng: -73.5673 },
    { name: "Halifax", lat: 44.6488, lng: -63.5752 }
];

// Polska - cel (Wrocław)
export const POLAND_DEST = { lat: 51.1079, lng: 17.0385 };

// Wszystkie trasy - gradient #102044 → #FD9731
export const ALL_ROUTES = [
    ...US_PORTS.map(port => ({ from: port, to: POLAND_DEST })),
    ...CANADA_PORTS.map(port => ({ from: port, to: POLAND_DEST }))
];