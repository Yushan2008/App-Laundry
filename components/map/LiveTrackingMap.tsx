"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Box, Chip, Typography, Alert } from "@mui/material";
import { DirectionsBike, AccessTime, MyLocation } from "@mui/icons-material";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";

interface LiveTrackingMapProps {
  customerLat: number;
  customerLng: number;
  sellerLat?: number;
  sellerLng?: number;
  mode?: "customer" | "seller";
  height?: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

export default function LiveTrackingMap({
  customerLat,
  customerLng,
  sellerLat,
  sellerLng,
  mode = "customer",
  height = 380,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const sellerMarkerRef = useRef<Marker | null>(null);
  const routePolylineRef = useRef<Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeError, setRouteError] = useState(false);

  // Fetch route dari OSRM (free routing API, pakai jalan nyata seperti Google Maps)
  const fetchRoute = useCallback(
    async (L: typeof import("leaflet"), fromLat: number, fromLng: number) => {
      if (!mapInstanceRef.current) return;
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const data = await res.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );

          // Hapus rute lama
          routePolylineRef.current?.remove();

          // Gambar rute baru sebagai polyline biru di atas jalan
          routePolylineRef.current = L.polyline(coords, {
            color: "#4f46e5",
            weight: 6,
            opacity: 0.85,
          }).addTo(mapInstanceRef.current!);

          // Fit map ke rute + padding
          mapInstanceRef.current!.fitBounds(routePolylineRef.current.getBounds(), {
            padding: [50, 50],
          });

          const dist = (route.distance / 1000).toFixed(1);
          const dur = Math.round(route.duration / 60);
          setRouteInfo({ distance: `${dist} km`, duration: `~${dur} menit` });
          setRouteError(false);
        }
      } catch {
        // Fallback: tampilkan garis lurus jika OSRM tidak tersedia
        setRouteError(true);
        routePolylineRef.current?.remove();
        routePolylineRef.current = L.polyline(
          [[fromLat, fromLng], [customerLat, customerLng]],
          { color: "#4f46e5", weight: 4, opacity: 0.6, dashArray: "8, 8" }
        ).addTo(mapInstanceRef.current!);

        mapInstanceRef.current!.fitBounds(
          L.latLngBounds([fromLat, fromLng], [customerLat, customerLng]),
          { padding: [50, 50] }
        );
      }
    },
    [customerLat, customerLng]
  );

  // Initialize peta
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      // Fix icon default Leaflet
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: false,
      }).setView([customerLat, customerLng], 15);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

      // Marker pelanggan (rumah, biru tua)
      const customerIcon = L.divIcon({
        html: `
          <div style="
            background: #1e40af;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 3px solid white;
            box-shadow: 0 3px 14px rgba(30,64,175,0.6);
          ">🏠</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: "",
      });
      L.marker([customerLat, customerLng], { icon: customerIcon })
        .bindPopup("<b>📍 Lokasi Pelanggan</b>")
        .addTo(map);

      // Marker seller jika posisi sudah diketahui
      if (sellerLat !== undefined && sellerLng !== undefined) {
        const sellerIcon = L.divIcon({
          html: `
            <div style="
              background: #059669;
              color: white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              border: 3px solid white;
              box-shadow: 0 3px 14px rgba(5,150,105,0.6);
            ">🛵</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: "",
        });
        sellerMarkerRef.current = L.marker([sellerLat, sellerLng], { icon: sellerIcon })
          .bindPopup("<b>🛵 Posisi Seller</b><br>Sedang menuju lokasi Anda")
          .addTo(map);

        fetchRoute(L, sellerLat, sellerLng);
      }
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      sellerMarkerRef.current = null;
      routePolylineRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerLat, customerLng]);

  // Update posisi seller secara real-time + perbarui rute
  useEffect(() => {
    if (sellerLat === undefined || sellerLng === undefined) return;
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapInstanceRef.current) return;

      const sellerIcon = L.divIcon({
        html: `
          <div style="
            background: #059669;
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 3px solid white;
            box-shadow: 0 3px 14px rgba(5,150,105,0.6);
          ">🛵</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        className: "",
      });

      if (sellerMarkerRef.current) {
        // Pindahkan marker seller ke posisi baru
        sellerMarkerRef.current.setLatLng([sellerLat, sellerLng]);
      } else {
        // Buat marker seller pertama kali
        sellerMarkerRef.current = L.marker([sellerLat, sellerLng], { icon: sellerIcon })
          .bindPopup("<b>🛵 Posisi Seller</b><br>Sedang menuju lokasi Anda")
          .addTo(mapInstanceRef.current!);
      }

      // Perbarui rute di peta (re-fetch dari OSRM)
      fetchRoute(L, sellerLat, sellerLng);
    });
  }, [sellerLat, sellerLng, fetchRoute]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Info jarak & estimasi waktu */}
      {routeInfo && (
        <Box sx={{ display: "flex", gap: 1, px: 2, pb: 1.5, flexWrap: "wrap" }}>
          <Chip
            size="small"
            icon={<DirectionsBike sx={{ fontSize: 14 }} />}
            label={routeInfo.distance}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: 12 }}
          />
          <Chip
            size="small"
            icon={<AccessTime sx={{ fontSize: 14 }} />}
            label={routeInfo.duration}
            color="secondary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: 12 }}
          />
          <Chip
            size="small"
            icon={<MyLocation sx={{ fontSize: 14 }} />}
            label="Live"
            color="success"
            sx={{ fontWeight: 700, fontSize: 12 }}
          />
        </Box>
      )}

      {/* Info rute tidak tersedia */}
      {routeError && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Rute ditampilkan sebagai garis lurus (koneksi routing tidak tersedia)
          </Typography>
        </Box>
      )}

      {/* Peta Leaflet */}
      <Box
        ref={mapRef}
        sx={{
          height,
          width: "100%",
          "& .leaflet-container": { borderRadius: mode === "customer" ? "0 0 12px 12px" : "12px" },
        }}
      />

      {/* Alert jika seller belum share lokasi */}
      {sellerLat === undefined && (
        <Alert severity="info" sx={{ mx: 2, mb: 2, borderRadius: 2 }} icon={<MyLocation />}>
          {mode === "customer"
            ? "Menunggu seller membagikan lokasi GPS..."
            : "Aktifkan GPS untuk mulai berbagi lokasi ke pelanggan"}
        </Alert>
      )}
    </>
  );
}
