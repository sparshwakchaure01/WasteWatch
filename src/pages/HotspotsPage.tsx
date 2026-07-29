import React from 'react';
import { useApp } from '../context/AppContext';
import { MapWidget } from '../components/MapWidget';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatCoordinates } from '../utils/geo';
import { AlertOctagon, ShieldAlert, MapPin, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

export const HotspotsPage: React.FC = () => {
  const { hotspots, complaints, viewComplaintDetails } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#22223B] text-white p-6 sm:p-8 rounded-3xl border border-[#4A4E69] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-950/80 px-3 py-1 rounded-full border border-rose-800">
              Unique Automated Detection Feature
            </span>
            <span className="text-xs text-stone-300 font-mono">
              Proximity Radius: ~100 Metres
            </span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Frequent Dumping Zones
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Automated cluster engine monitors coordinate distance using Haversine comparison. When <strong>3 or more complaints</strong> occur within approximately <strong>100 metres</strong>, a Frequent Dumping Zone is generated automatically.
          </p>
        </div>

        <div className="bg-[#4A4E69]/40 p-4 rounded-2xl border border-[#9A8C98]/30 text-center shrink-0">
          <div className="text-3xl font-extrabold text-rose-400">{hotspots.length}</div>
          <div className="text-xs font-bold text-stone-200 mt-0.5">Active Hotspots</div>
        </div>
      </div>

      {/* Map Overview */}
      <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-sm font-bold text-[#22223B]">
              Hotspots Spatial GIS Map
            </h3>
            <p className="text-xs text-[#4A4E69]">
              Red circles represent 100-meter cluster radius around frequent dumping centroids.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            No AI - Deterministic Geo Math
          </span>
        </div>

        <MapWidget
          complaints={complaints}
          hotspots={hotspots}
          height="380px"
          onComplaintClick={viewComplaintDetails}
        />
      </div>

      {/* Hotspots List */}
      <div className="space-y-4">
        <h3 className="font-heading text-base font-bold text-[#22223B]">
          Detected Dumping Clusters ({hotspots.length})
        </h3>

        {hotspots.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#9A8C98]/20 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-[#22223B]">No Frequent Dumping Zones Detected</h4>
            <p className="text-xs text-[#4A4E69]">
              There are currently no clusters with ≥ 3 complaints within a 100m radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotspots.map((spot) => {
              // Find matching complaints in this cluster
              const clusterComplaints = complaints.filter((c) =>
                spot.complaintIds.includes(c.id)
              );

              return (
                <div
                  key={spot.id}
                  className="bg-white rounded-3xl border border-rose-200/80 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        {spot.id}
                      </span>
                      <span className="text-xs font-bold text-white bg-rose-600 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>{spot.complaintCount} Reports Clustered</span>
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-[#22223B] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{spot.locationName}</span>
                    </h4>

                    <div className="p-3 bg-stone-50 rounded-2xl text-xs space-y-1">
                      <div className="text-[10px] font-bold text-[#4A4E69] uppercase">
                        Centroid Coordinates & Category
                      </div>
                      <div className="font-mono text-[#22223B] font-bold">
                        {formatCoordinates(spot.centerLat, spot.centerLng)}
                      </div>
                      <div className="pt-1">
                        <CategoryBadge category={spot.primaryCategory} />
                      </div>
                    </div>

                    {/* Linked Complaints List */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#22223B]">Clustered Complaints:</div>
                      <div className="space-y-1.5">
                        {clusterComplaints.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => viewComplaintDetails(c.id)}
                            className="p-2 rounded-xl bg-stone-50 hover:bg-[#F2E9E4] text-xs flex items-center justify-between cursor-pointer border border-stone-200"
                          >
                            <span className="font-mono font-semibold text-[#22223B]">#{c.id}</span>
                            <span className="text-[#4A4E69] truncate max-w-[180px]">
                              {c.category}
                            </span>
                            <span className="text-[10px] font-bold text-stone-600">{c.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <span>Detected On: {new Date(spot.createdAt).toLocaleDateString()}</span>
                    <span className="text-rose-700 font-bold">Municipal Priority Zone</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
