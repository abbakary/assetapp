"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Crosshair, Check, Info } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

export default function LocationPicker({ latitude, longitude, onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const defaultCenter: [number, number] = [40.7128, -74.006];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: latitude && longitude ? [latitude, longitude] : defaultCenter,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add click handler
    mapInstanceRef.current.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
      
      // Reverse geocode to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect(lat, lng, address);
        showSuccessMsg();
      } catch {
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        showSuccessMsg();
      }
    });

    // Add initial marker if coordinates exist
    if (latitude && longitude) {
      updateMarker(latitude, longitude);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && latitude && longitude) {
      updateMarker(latitude, longitude);
      mapInstanceRef.current.setView([latitude, longitude], 15);
    }
  }, [latitude, longitude]);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const icon = L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #10b981;
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: move;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    markerRef.current = L.marker([lat, lng], { 
      icon,
      draggable: true 
    }).addTo(mapInstanceRef.current);

    // Handle marker drag
    markerRef.current.on("dragend", async (e: L.DragEndEvent) => {
      const marker = e.target;
      const position = marker.getLatLng();
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
        );
        const data = await response.json();
        const address = data.display_name || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
        onLocationSelect(position.lat, position.lng, address);
        showSuccessMsg();
      } catch {
        onLocationSelect(position.lat, position.lng, `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
        showSuccessMsg();
      }
    });
  };

  const showSuccessMsg = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        
        mapInstanceRef.current.setView([latNum, lngNum], 16);
        updateMarker(latNum, lngNum);
        onLocationSelect(latNum, lngNum, display_name);
        showSuccessMsg();
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          updateMarker(lat, lng);
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          onLocationSelect(lat, lng, data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          showSuccessMsg();
        } catch {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          showSuccessMsg();
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full bg-card/95 backdrop-blur pl-10 pr-4 py-2 rounded-md text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {isSearching ? "..." : "Search"}
        </button>
        <button
          onClick={handleGetCurrentLocation}
          className="bg-card/95 backdrop-blur border border-border p-2 rounded-md hover:bg-secondary"
          title="Get Current Location"
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 shadow-lg">
          <Check className="h-4 w-4" />
          Location selected successfully
        </div>
      )}

      {/* Map */}
      <div ref={mapRef} className="w-full h-[300px] rounded-lg" />

      {/* Instructions */}
      <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Click on the map to select a location, or use the search bar. You can also drag the marker to adjust the position.</span>
      </div>

      <style jsx global>{`
        .leaflet-control-zoom a {
          background: #1a1f2e !important;
          color: #fff !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2d3748 !important;
        }
      `}</style>
    </div>
  );
}
