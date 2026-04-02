"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Asset, AssetStatus } from "@/lib/types";

interface AssetMapProps {
  assets: Asset[];
  onAssetClick?: (asset: Asset) => void;
  center?: [number, number];
  zoom?: number;
  selectedAsset?: Asset | null;
}

const statusColors: Record<AssetStatus, string> = {
  planned: "#3b82f6",
  active: "#10b981",
  "under-maintenance": "#f59e0b",
  decommissioned: "#ea580c",
  disposed: "#dc2626",
};

export default function AssetMap({ assets, onAssetClick, center = [40.7128, -74.006], zoom = 13, selectedAsset }: AssetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    // Add dark-themed tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    markersMapRef.current.clear();

    // Add markers for each asset
    assets.forEach((asset) => {
      if (asset.latitude && asset.longitude) {
        const color = statusColors[asset.status];

        // Create custom icon
        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 24px;
              height: 24px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
              display: flex;
              align-items: center;
              justify-content: center;
            "></div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([asset.latitude, asset.longitude], { icon }).addTo(mapInstanceRef.current!);

        // Add popup
        marker.bindPopup(`
          <div style="
            background: #1a1f2e;
            color: #fff;
            padding: 12px;
            border-radius: 8px;
            min-width: 200px;
          ">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #4dd4ac;">${asset.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">ID: ${asset.id}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Type: ${asset.type}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Location: ${asset.location}</p>
            <p style="margin: 0; font-size: 12px;">
              <span style="
                background: ${color};
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
              ">${asset.status.replace("-", " ").toUpperCase()}</span>
            </p>
          </div>
        `, {
          className: "dark-popup",
        });

        if (onAssetClick) {
          marker.on("click", () => onAssetClick(asset));
        }

        markersRef.current.push(marker);
        markersMapRef.current.set(asset.id, marker);
      }
    });
  }, [assets, onAssetClick]);

  // Focus on selected asset
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedAsset) return;

    if (selectedAsset.latitude && selectedAsset.longitude) {
      mapInstanceRef.current.setView([selectedAsset.latitude, selectedAsset.longitude], 16, {
        animate: true,
        duration: 0.5,
      });

      // Open the popup for the selected asset
      const marker = markersMapRef.current.get(selectedAsset.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedAsset]);

  return (
    <>
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-popup-tip {
          background: #1a1f2e;
        }
        .leaflet-control-zoom a {
          background: #1a1f2e !important;
          color: #fff !important;
          border-color: #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2d3748 !important;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
    </>
  );
}
