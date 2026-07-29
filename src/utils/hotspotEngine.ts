import { Complaint, Hotspot, WasteCategory } from '../types';
import { haversineDistanceMeters } from './geo';

const HOTSPOT_RADIUS_METERS = 100; // ~100 meters
const MIN_COMPLAINTS_FOR_HOTSPOT = 3; // Exactly 3 or more complaints

/**
 * Scans a list of complaints and calculates active Hotspots (Frequent Dumping Zones).
 * Groups active complaints within ~100m radius of each other.
 */
export function detectHotspots(complaints: Complaint[]): Hotspot[] {
  // Only consider active/recent complaints (excluding resolved ones if needed, or all complaints)
  const activeComplaints = complaints.filter((c) => c.status !== 'Resolved');
  const processedComplaintIds = new Set<string>();
  const hotspots: Hotspot[] = [];

  for (let i = 0; i < activeComplaints.length; i++) {
    const current = activeComplaints[i];
    if (processedComplaintIds.has(current.id)) continue;

    const cluster: Complaint[] = [current];

    for (let j = i + 1; j < activeComplaints.length; j++) {
      const neighbor = activeComplaints[j];
      if (processedComplaintIds.has(neighbor.id)) continue;

      const dist = haversineDistanceMeters(
        current.latitude,
        current.longitude,
        neighbor.latitude,
        neighbor.longitude
      );

      if (dist <= HOTSPOT_RADIUS_METERS) {
        cluster.push(neighbor);
      }
    }

    if (cluster.length >= MIN_COMPLAINTS_FOR_HOTSPOT) {
      // Mark these complaints as processed for hotspot assignment
      cluster.forEach((c) => processedComplaintIds.add(c.id));

      // Compute centroid latitude & longitude
      const avgLat = cluster.reduce((sum, c) => sum + c.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, c) => sum + c.longitude, 0) / cluster.length;

      // Determine most frequent category
      const categoryCounts: Record<string, number> = {};
      cluster.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });

      let topCategory: WasteCategory = cluster[0].category;
      let maxCount = 0;
      Object.entries(categoryCounts).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat as WasteCategory;
        }
      });

      const hotspotId = `hotspot_${Math.round(avgLat * 10000)}_${Math.round(avgLng * 10000)}`;
      const locationName = cluster[0].locationName || `Zone near ${avgLat.toFixed(4)}, ${avgLng.toFixed(4)}`;

      hotspots.push({
        id: hotspotId,
        centerLat: avgLat,
        centerLng: avgLng,
        locationName,
        complaintIds: cluster.map((c) => c.id),
        complaintCount: cluster.length,
        status: cluster.some((c) => c.status === 'In Progress') ? 'Under Clean-Up' : 'Active',
        primaryCategory: topCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return hotspots;
}
