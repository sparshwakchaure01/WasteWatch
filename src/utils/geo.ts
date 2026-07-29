/**
 * Calculates the great-circle distance between two points on Earth using the Haversine formula.
 * @returns Distance in meters
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDirection}, ${Math.abs(lng).toFixed(5)}° ${lngDirection}`;
}

/**
 * Returns a human-friendly location string given coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data && data.display_name) {
        // Return a condensed version of address if available
        const addr = data.address;
        if (addr) {
          const parts = [
            addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood,
            addr.city_district || addr.suburb || addr.city || addr.town || addr.village,
            addr.county || addr.state_district || 'Sangamner'
          ].filter(Boolean);
          if (parts.length > 0) return parts.join(', ');
        }
        return data.display_name.split(',').slice(0, 3).join(',');
      }
    }
  } catch (err) {
    console.warn('Geocoding lookup failed, returning default coordinate string:', err);
  }
  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
