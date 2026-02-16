import React, { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import L from "leaflet";

interface InteractiveMapProps {
  centerLat: number;
  centerLng: number;
  radiusMiles: number;
  onLocationSelect: (lat: number, lng: number) => void;
  className?: string;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function InteractiveMap({
  centerLat,
  centerLng,
  radiusMiles,
  onLocationSelect,
  className,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 6,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Set bounds to US
    const usBounds = L.latLngBounds(
      L.latLng(24.7433195, -124.7844079), // Southwest
      L.latLng(49.3457868, -66.9513812)   // Northeast
    );
    map.setMaxBounds(usBounds);
    map.fitBounds(usBounds);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Handle map clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    });

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker and circle when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    // Remove existing marker and circle
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Add new marker
    const marker = L.marker([centerLat, centerLng], {
      draggable: true,
    }).addTo(map);

    marker.on('dragend', (e) => {
      const { lat, lng } = (e.target as L.Marker).getLatLng();
      onLocationSelect(lat, lng);
    });

    markerRef.current = marker;

    // Add radius circle
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
    const circle = L.circle([centerLat, centerLng], {
      radius: radiusMeters,
      color: '#8b5cf6',
      fillColor: '#8b5cf6',
      fillOpacity: 0.2,
      weight: 2,
      dashArray: '5, 5',
    }).addTo(map);

    circleRef.current = circle;

    // Center map on location
    map.setView([centerLat, centerLng], map.getZoom());

  }, [centerLat, centerLng, radiusMiles, isMapReady, onLocationSelect]);

  const handleZoomToUS = () => {
    if (mapInstanceRef.current) {
      const usBounds = L.latLngBounds(
        L.latLng(24.7433195, -124.7844079),
        L.latLng(49.3457868, -66.9513812)
      );
      mapInstanceRef.current.fitBounds(usBounds);
    }
  };

  const handleZoomToLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], 8);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-music-purple" />
            Interactive Map
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleZoomToUS}
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
            >
              Zoom to US
            </button>
            <button
              type="button"
              onClick={handleZoomToLocation}
              className="px-3 py-1 bg-music-purple text-white rounded text-sm hover:bg-music-purple/80"
            >
              Zoom to Location
            </button>
          </div>
        </div>
        
        <div className="relative bg-gray-900 rounded border border-gray-600 overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-96"
            style={{ minHeight: '400px' }}
          />
          
          {/* Loading overlay */}
          {!isMapReady && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-music-purple mx-auto mb-2"></div>
                <p>Loading map...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-sm text-gray-400 space-y-1">
          <p className="font-medium">Selected Location: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}</p>
          <p>Geo-restriction Radius: {radiusMiles} miles</p>
          <p className="text-xs text-gray-500">
            Click anywhere on the map or drag the marker to set the geo-restricted location for music access.
          </p>
        </div>
      </div>
    </div>
  );
}