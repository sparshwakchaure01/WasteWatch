import React, { useEffect, useRef } from 'react';
import { Complaint, Hotspot } from '../types';
import L from 'leaflet';

interface MapWidgetProps {
  complaints?: Complaint[];
  hotspots?: Hotspot[];
  selectedLocation?: { lat: number; lng: number };
  onLocationSelect?: (lat: number, lng: number) => void;
  onComplaintClick?: (complaintId: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  isInteractivePicker?: boolean;
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  complaints = [],
  hotspots = [],
  selectedLocation,
  onLocationSelect,
  onComplaintClick,
  center = [19.5768, 74.207], // Default Sangamner / AVCOE area
  zoom = 14,
  height = '400px',
  isInteractivePicker = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Custom marker SVG creation
  const createCustomIcon = (type: 'pending' | 'progress' | 'resolved' | 'hotspot') => {
    let color = '#E11D48'; // Default red
    let svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>`;

    if (type === 'pending') color = '#D97706'; // Amber
    if (type === 'progress') color = '#2563EB'; // Blue
    if (type === 'resolved') color = '#059669'; // Emerald
    if (type === 'hotspot') {
      color = '#DC2626'; // Deep Red
    }

    const html = `<div style="color: ${color}; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      ${svgIcon}
    </div>`;

    return L.divIcon({
      html,
      className: 'custom-map-pin',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center[0], center[1]],
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Location picker click listener
      if (isInteractivePicker && onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          onLocationSelect(lat, lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center / Zoom
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center[0], center[1], zoom]);

  // Update Interactive Location Pin Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (selectedLocation) {
      const { lat, lng } = selectedLocation;
      if (!pickerMarkerRef.current) {
        pickerMarkerRef.current = L.marker([lat, lng], {
          draggable: isInteractivePicker,
          icon: createCustomIcon('pending'),
        }).addTo(mapInstanceRef.current);

        if (isInteractivePicker && onLocationSelect) {
          pickerMarkerRef.current.on('dragend', (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onLocationSelect(position.lat, position.lng);
          });
        }
      } else {
        pickerMarkerRef.current.setLatLng([lat, lng]);
      }
    } else if (pickerMarkerRef.current) {
      pickerMarkerRef.current.remove();
      pickerMarkerRef.current = null;
    }
  }, [selectedLocation, isInteractivePicker]);

  // Render Complaints & Hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // Render Hotspots (Frequent Dumping Zones) with prominent circular boundary
    hotspots.forEach((spot) => {
      const circle = L.circle([spot.centerLat, spot.centerLng], {
        color: '#DC2626',
        fillColor: '#EF4444',
        fillOpacity: 0.25,
        radius: 100, // 100 meter radius
      }).addTo(markersGroupRef.current!);

      const marker = L.marker([spot.centerLat, spot.centerLng], {
        icon: createCustomIcon('hotspot'),
      }).addTo(markersGroupRef.current!);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="background: #DC2626; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; display: inline-block; margin-bottom: 4px;">
            Frequent Dumping Zone (${spot.complaintCount} Reports)
          </div>
          <h4 style="margin: 2px 0; font-size: 13px; font-weight: bold;">${spot.locationName}</h4>
          <p style="margin: 2px 0; font-size: 11px; color: #555;">Primary Category: ${spot.primaryCategory}</p>
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    // Render Complaints
    complaints.forEach((cmp) => {
      let iconType: 'pending' | 'progress' | 'resolved' = 'pending';
      if (cmp.status === 'In Progress') iconType = 'progress';
      if (cmp.status === 'Resolved') iconType = 'resolved';

      const marker = L.marker([cmp.latitude, cmp.longitude], {
        icon: createCustomIcon(iconType),
      }).addTo(markersGroupRef.current!);

      const popupHtml = `
        <div style="font-family: sans-serif; max-width: 220px; padding: 4px;">
          <img src="${cmp.photoUrl}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <div style="font-size: 11px; font-weight: bold; color: #22223B;">${cmp.category}</div>
          <div style="font-size: 11px; color: #666; margin: 2px 0;">${cmp.locationName || 'Sangamner'}</div>
          <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: #eee;">${cmp.status}</span>
            <button id="cmp-btn-${cmp.id}" style="font-size: 10px; font-weight: bold; color: #4A4E69; background: #F2E9E4; border: none; padding: 3px 8px; border-radius: 4px; cursor: pointer;">
              View Details &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`cmp-btn-${cmp.id}`);
        if (btn && onComplaintClick) {
          btn.onclick = () => onComplaintClick(cmp.id);
        }
      });
    });
  }, [complaints, hotspots]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#9A8C98]/30 shadow-sm">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      {isInteractivePicker && (
        <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-[#22223B] shadow border border-stone-200">
          📍 Click map or drag pin to choose exact dumping location
        </div>
      )}
    </div>
  );
};
