import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { WasteCategory } from '../types';
import { ImageUploader } from '../components/ImageUploader';
import { MapWidget } from '../components/MapWidget';
import { reverseGeocode, formatCoordinates } from '../utils/geo';
import { MapPin, Navigation, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ReportWastePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addComplaint, viewComplaintDetails } = useApp();

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<WasteCategory>('Plastic Waste');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Near AVCOE Main Campus, Sangamner');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 19.5781,
    lng: 74.2085,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-detect GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(newCoords);
        const address = await reverseGeocode(newCoords.lat, newCoords.lng);
        setLocationName(address);
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS location error:', err);
        setIsLocating(false);
        // Fallback to Sangamner default center
        setCoords({ lat: 19.5768, lng: 74.2070 });
        setLocationName('Sangamner Central Market Area');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    handleDetectGPS();
  }, []);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    const addr = await reverseGeocode(lat, lng);
    setLocationName(addr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!photoUrl) {
      setFormError('Please upload a photo evidence of the dumped waste.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please provide a brief description of the waste condition.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const created = addComplaint({
        reporterId: currentUser?.uid || 'user_anon',
        reporterName: currentUser?.fullName || 'Citizen Reporter',
        reporterEmail: currentUser?.email || 'reporter@wastewatch.gov.in',
        reporterPhone: currentUser?.phone || '+919800000000',
        photoUrl,
        latitude: coords.lat,
        longitude: coords.lng,
        locationName: locationName || `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        category,
        description,
      });

      setIsSubmitting(false);
      viewComplaintDetails(created.id);
    }, 600);
  };

  const wasteCategories: WasteCategory[] = [
    'Plastic Waste',
    'Household Waste',
    'Construction Debris',
    'Garden Waste',
    'Electronic Waste',
    'Other',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-1">
        <h2 className="font-heading text-xl font-bold text-[#22223B]">
          Report Illegal Waste Dumping
        </h2>
        <p className="text-xs text-[#4A4E69]">
          Fill in the report details below. Geotagged coordinates and photo evidence will be routed directly to the Sangamner Municipal Sanitation Department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Photo Upload & Category */}
          <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-5">
            <ImageUploader
              selectedImage={photoUrl}
              onImageSelected={(url) => setPhotoUrl(url)}
              onClear={() => setPhotoUrl(null)}
            />

            <div>
              <label className="block text-xs font-semibold text-[#22223B] uppercase tracking-wider mb-2">
                Waste Category *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {wasteCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                      category === cat
                        ? 'bg-[#22223B] text-white border-[#22223B] shadow'
                        : 'bg-[#F2E9E4]/40 text-[#4A4E69] border-[#9A8C98]/20 hover:bg-[#F2E9E4]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#22223B] uppercase tracking-wider mb-1">
                Description & Details *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the waste volume, hazardous items, or landmark references..."
                rows={4}
                className="w-full p-3 text-xs font-medium rounded-2xl border border-stone-300 text-[#22223B] focus:outline-none focus:ring-2 focus:ring-[#22223B]"
                required
              />
            </div>
          </div>

          {/* Right Column: Location & Map Picker */}
          <div className="bg-white p-6 rounded-3xl border border-[#9A8C98]/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#22223B] uppercase tracking-wider">
                Geotagged Location *
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="text-xs font-bold text-[#4A4E69] hover:text-[#22223B] flex items-center gap-1.5 bg-[#F2E9E4] px-2.5 py-1 rounded-full border border-[#9A8C98]/20 transition-colors"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting...' : 'Auto-GPS'}</span>
              </button>
            </div>

            {/* Coordinates Display */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <div className="font-bold text-[#22223B] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="truncate">{locationName}</span>
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                {formatCoordinates(coords.lat, coords.lng)}
              </div>
            </div>

            {/* Interactive OpenStreetMap */}
            <MapWidget
              center={[coords.lat, coords.lng]}
              selectedLocation={coords}
              onLocationSelect={handleLocationSelect}
              isInteractivePicker={true}
              height="280px"
            />
          </div>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 bg-[#22223B] hover:bg-[#333355] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span>Submitting Complaint...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Waste Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
