import { Complaint, Hotspot, WasteCategory } from '../types';

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

/**
 * Automatically calculates Frequent Dumping Zones (Hotspots).
 * Identifies clusters of 3 or more approved complaints within ~100m radius.
 */
export function detectHotspots(complaints: Complaint[]): Hotspot[] {
  // Only include approved/active complaints (exclude Pending Approval and Rejected)
  const approved = complaints.filter(
    (c) => c.status === 'Pending' || c.status === 'In Progress' || c.status === 'Resolved'
  );

  const clusters: { centerLat: number; centerLng: number; items: Complaint[] }[] = [];
  const radiusMeters = 100;

  for (const c of approved) {
    let addedToCluster = false;
    for (const cluster of clusters) {
      const dist = haversineDistanceMeters(
        cluster.centerLat,
        cluster.centerLng,
        c.latitude,
        c.longitude
      );

      if (dist <= radiusMeters) {
        cluster.items.push(c);
        // Recalculate centroid
        const totalLat = cluster.items.reduce((sum, item) => sum + item.latitude, 0);
        const totalLng = cluster.items.reduce((sum, item) => sum + item.longitude, 0);
        cluster.centerLat = totalLat / cluster.items.length;
        cluster.centerLng = totalLng / cluster.items.length;
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clusters.push({
        centerLat: c.latitude,
        centerLng: c.longitude,
        items: [c],
      });
    }
  }

  // Filter clusters with >= 3 items
  const hotspots: Hotspot[] = [];
  let index = 1;
  const now = new Date().toISOString();

  for (const cl of clusters) {
    if (cl.items.length >= 3) {
      // Find primary category
      const catCounts: Record<string, number> = {};
      cl.items.forEach((item) => {
        catCounts[item.category] = (catCounts[item.category] || 0) + 1;
      });

      let topCategory: WasteCategory = 'Household Waste';
      let maxCatCount = 0;
      Object.entries(catCounts).forEach(([cat, count]) => {
        if (count > maxCatCount) {
          maxCatCount = count;
          topCategory = cat as WasteCategory;
        }
      });

      // Nearest location name
      const locationName = cl.items[0].locationName || 'Cluster Dumping Area';

      hotspots.push({
        id: `HOT-${String(index++).padStart(3, '0')}`,
        locationName,
        centerLat: cl.centerLat,
        centerLng: cl.centerLng,
        complaintCount: cl.items.length,
        complaintIds: cl.items.map((i) => i.id),
        status: 'Active',
        primaryCategory: topCategory,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return hotspots;
}
