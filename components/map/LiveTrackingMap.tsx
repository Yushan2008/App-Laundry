"use client";

import { useEffect, useRef } from "react";
import { Box } from "@mui/material";

interface LiveTrackingMapProps {
  customerLat: number;
  customerLng: number;
  sellerLat?: number;
  sellerLng?: number;
  mode?: "customer" | "seller";
  height?: number;
}

export default function LiveTrackingMap({
  customerLat,
  customerLng,
  sellerLat,
  sellerLng,
  mode = "customer",
  height = 300,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const sellerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import Leaflet (SSR safe)
    import("leaflet").then((L) => {
      // Fix default icon path
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([customerLat, customerLng], 15);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Marker pelanggan (biru)
      const customerIcon = L.divIcon({
        html: `<div style="background:#3949ab;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏠</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        className: "",
      });
      L.marker([customerLat, customerLng], { icon: customerIcon })
        .bindPopup("📍 Lokasi Pelanggan")
        .addTo(map);

      // Marker seller jika tersedia
      if (sellerLat !== undefined && sellerLng !== undefined) {
        const sellerIcon = L.divIcon({
          html: `<div style="background:#00897b;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🛵</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: "",
        });
        const marker = L.marker([sellerLat, sellerLng], { icon: sellerIcon })
          .bindPopup("🛵 Posisi Seller")
          .addTo(map);
        sellerMarkerRef.current = marker;

        // Fit bounds ke kedua marker
        map.fitBounds(
          L.latLngBounds([customerLat, customerLng], [sellerLat, sellerLng]),
          { padding: [40, 40] }
        );
      }
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [customerLat, customerLng]);

  // Update posisi seller secara real-time
  useEffect(() => {
    if (!sellerMarkerRef.current || sellerLat === undefined || sellerLng === undefined) return;
    import("leaflet").then((L) => {
      sellerMarkerRef.current?.setLatLng([sellerLat!, sellerLng!]);
      mapInstanceRef.current?.fitBounds(
        L.latLngBounds([customerLat, customerLng], [sellerLat!, sellerLng!]),
        { padding: [40, 40] }
      );
    });
  }, [sellerLat, sellerLng, customerLat, customerLng]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Box
        ref={mapRef}
        sx={{ height, width: "100%", borderRadius: 2, overflow: "hidden" }}
      />
    </>
  );
}
