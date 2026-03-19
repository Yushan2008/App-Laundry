"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import { MyLocation } from "@mui/icons-material";

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({
  onLocationChange,
  initialLat = -7.9666,
  initialLng = 112.6326,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [locationSet, setLocationSet] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([initialLat, initialLng], 14);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const pinIcon = L.divIcon({
        html: `<div style="background:#3949ab;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        className: "",
      });

      // Klik peta untuk pin lokasi
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true })
            .bindPopup("📍 Lokasi penjemputan Anda")
            .addTo(map);
          markerRef.current.on("dragend", (ev: L.LeafletEvent) => {
            const pos = (ev.target as L.Marker).getLatLng();
            onLocationChange(pos.lat, pos.lng);
          });
        }
        onLocationChange(lat, lng);
        setLocationSet(true);
      });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [initialLat, initialLng]);

  const handleMyLocation = () => {
    if (!navigator.geolocation) { setError("Browser tidak mendukung geolocation"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        import("leaflet").then((L) => {
          mapInstanceRef.current?.setView([lat, lng], 16);
          const pinIcon = L.divIcon({
            html: `<div style="background:#3949ab;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            className: "",
          });
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true })
              .bindPopup("📍 Lokasi Anda")
              .addTo(mapInstanceRef.current!);
          }
          onLocationChange(lat, lng);
          setLocationSet(true);
        });
      },
      () => setError("Gagal mendapatkan lokasi. Izinkan akses lokasi di browser.")
    );
  };

  return (
    <Box>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <Button
        variant="outlined"
        startIcon={<MyLocation />}
        onClick={handleMyLocation}
        size="small"
        sx={{ mb: 1.5 }}
        fullWidth
      >
        Gunakan Lokasi Saya Sekarang
      </Button>

      <Box
        ref={mapRef}
        sx={{ height: 300, width: "100%", borderRadius: 2, overflow: "hidden", cursor: "crosshair" }}
      />

      <Typography variant="caption" color="text.secondary" mt={1} display="block" textAlign="center">
        {locationSet
          ? "✅ Lokasi berhasil dipilih. Klik peta untuk mengubah."
          : "💡 Klik pada peta untuk menentukan lokasi penjemputan"}
      </Typography>
    </Box>
  );
}
